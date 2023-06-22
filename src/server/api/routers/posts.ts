import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClients";
import type { Post } from "@prisma/client";

import { mintPostNFT } from "../../../utils/web3";
import { getEnvironment } from "../../../utils/env";

const {CONTRACT_ADDRESS} = getEnvironment();

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorID),
      limit: 100,
    })
  ).map(filterUserForClient);

//users.forEach((user) => user.web3Wallets.forEach((wallet) => console.log("*********************************\n", wallet)))
  
//users.forEach((user) => console.log(user))
//users.forEach((user) => user.web3Wallets.forEach((wallet) => console.log("*********************************\n", wallet.verification)))
  const response = posts.map((post) => {
    const author = users.find((user) => user.id === post.authorID);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });

  return response;
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),

  getChildrenPosts: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          parentID: input.id,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      return addUserDataToPosts(posts);
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorID: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
        parentID: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newAuthorID = ctx.userId;

      const { success } = await ratelimit.limit(newAuthorID);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorID: newAuthorID,
          content: input.content,
          parentID: input.parentID,
        },
      });

      if (!post || post === undefined) throw new Error("Post failed.  Cannot mint Post NFT.")

      const { createdAt, id, content, authorID } = post;
      const user = (
        await clerkClient.users.getUserList()
      ).map(filterUserForClient).find((user) => user.id === authorID)

      if (!user || user === undefined) throw new Error("User could not be found");
      if (!user.username || user.username === undefined) throw new Error("No username for poster.")

      let parentID = post.parentID;

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === undefined) throw new Error("CONTRACT_ADDRESS env variable not defined.")
      if (!parentID || parentID === null) parentID = "";

      console.log(user.address);

      mintPostNFT(user.address, createdAt.getTime(), id, content, user.username, parentID).catch(
        (err: string) => {
          throw new Error(err);
        }
      );

      return post;
    }),
});

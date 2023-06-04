import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { SignedIn } from "@clerk/nextjs";
import { CreatePostWizard } from "~/components/createPostWizard";
import { LoadingPage } from "~/components/loading";

const Feed = (parentID: { id: string }) => {
  const { data, isLoading: postsLoading } =
    api.posts.getChildrenPosts.useQuery(parentID);

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div></div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  api.posts.getChildrenPosts.useQuery({ id });

  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;
  const postData = data;

  return (
    <>
      <Head>
        <title>{`${postData.post.content} - @${postData.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...postData} />
        <div className="border-b border-slate-400 bg-gray-900 p-4">
          <SignedIn>
            <CreatePostWizard parentID={postData.post.id} />
          </SignedIn>
        </div>
        <Feed {...postData.post} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: { trpcState: ssg.dehydrate(), id },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;

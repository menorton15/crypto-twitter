import { type NextPage } from "next";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";

import { api } from "~/utils/api";

import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/createPostWizard";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">
          <div className="flex justify-center">
            <SignedIn>
              {/* Mount the UserButton component */}
              <CreatePostWizard parentID={null} />
              <SignOutButton />
            </SignedIn>
          </div>
          <SignedOut>
            {/* Signed out users get sign in button */}
            <SignInButton />
          </SignedOut>
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;

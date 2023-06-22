import { dark } from "@clerk/themes";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
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
  const { isSignedIn, user, isLoaded: userLoaded } = useUser();
  const [, setIsUsernamePromptVisible] = useState(false);

  useEffect(() => {
    if (isSignedIn && user && !user.publicMetadata.username) {
      setIsUsernamePromptVisible(true);
    }
  }, [isSignedIn, user]);

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if isn't loaded yet
  if (!userLoaded) return <LoadingPage />;

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">
          <div className="flex justify-center">
            <SignedIn>
              {/* Mount the UserButton component */}
              <CreatePostWizard parentID={null} />
              <UserButton showName={true} appearance={{ baseTheme: dark }} />
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

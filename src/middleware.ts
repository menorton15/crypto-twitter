import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
        beforeAuth() {
          console.log("middleware running");
        },
        publicRoutes: ["/", "/:locale/sign-in"]
    }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
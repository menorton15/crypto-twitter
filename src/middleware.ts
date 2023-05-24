import { authMiddleware } from "@clerk/nextjs";
import { Console } from "console";

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
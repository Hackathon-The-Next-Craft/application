import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Solo entrevistadores. Los candidatos entran por joinToken, sin cuenta.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

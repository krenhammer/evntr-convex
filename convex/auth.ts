import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
// import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";


export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password: string) => {
        return true;
        // if (
        //   password.length < 8 ||
        //   !/\d/.test(password) ||
        //   !/[a-z]/.test(password) ||
        //   !/[A-Z]/.test(password)
        // ) {
        //   throw new ConvexError("Invalid password.");
        // }
      },
    }),
    // GitHub,
    Google,
  ],
});


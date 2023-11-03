import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Checks to see if a user is logged in
      // auth?.user safely checks for a user property since it could be undefined
      // !! converts the value to its boolean equivalent - double inverts your possibly undefined user object to true or false
      const isLoggedIn = !!auth?.user;

      // Checks to see if you are on the /dashboard path and allows you to stay if you are logged in
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // automatically redirects you to dashboard if you are logged in - which is where you were trying to go anyway
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

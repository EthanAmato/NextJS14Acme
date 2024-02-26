import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 *
 * Initializing NextAuth.js with the authConfig object and exporting the auth property. 
 * Also using the matcher option from Middleware to specify that it should run on specific paths.
 * The advantage of employing Middleware for this task is that the protected 
 * routes will not even start rendering until the Middleware verifies the authentication, enhancing both 
 * the security and performance of the application.
 * **/

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|logo.png|sw.js).*)']
}

//asdf
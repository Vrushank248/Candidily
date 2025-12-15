// doc ref: https://next-auth.js.org/configuration/initialization#api-routes-pages

import NextAuth from "next-auth";
import { authOptions } from "./options";

/*
we have written all the logic separately in options file.
so that we can conveniently add/remove/modify providers there only.
*/
const handler =NextAuth(authOptions) 

export { handler as GET, handler as POST }
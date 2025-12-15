/* eslint-disable @typescript-eslint/no-explicit-any */

// all the providers are written in this file
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";


export const authOptions: NextAuthOptions = {

    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },


            async authorize(credentials: any): Promise<any> {
                await dbConnect()

                try {
                    const user = await userModel.findOne({
                        // this is the or operator in mongoose. it iterates through the array amd
                        // continues the operation if any one value is found
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    })

                    if (!user) {
                        throw new Error("No user found with this email/username")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Incorrect Password")
                    }

                } catch (err: any) {
                    throw new Error(err)
                }

            }

        })

    ],
    callbacks: {
        /*Now here we want to modify token such that
            it can hold all the attributes of user.
            So that we can extract any data when and where needed.

            But we can't directly modify the user type as it is fixed User type by Next Auth.
            so we use a special file to modify it.
            that is here ---> types/next-auth.d.ts

            Although it will increase the payload size but reduces the calls to DB
        */
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username


            }
            return session
        },
    },
    pages: {
        /* 
        here we can directly use the NexrAuth route with pages.
        The nextAuth automatically provides some most used pages like Signup, signin etc.
        so there is no need to design a separate page for them. NextAuth will handle it itself.

        */

        // we modified default page
        signIn: '/sign-in',
    },

    session: {
        strategy: 'jwt'
    },

    // this is very important part i.e secret key

    secret: process.env.NEXTAUTH_SECRET,


}

// @ts-nocheck
import CredentialsProviders from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const NEXT_AUTH = {
  providers: [
    CredentialsProviders({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials: any) {
        try {
          // Attempt to connect to the database
          await prisma.$connect();

          // Check if the user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error("No user found with this email.");
            return null;
          }

          // Validate the password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            console.error("Invalid password.");
            return null;
          }

          // Return the user's ID and email if everything is valid
          return {
            id: user.id.toString(),
            email: user.email,
          };
        } catch (error) {
          // Log any errors during the authorization process
          console.error("Error during authorization: ", error);
          return null;
        } finally {
          // Ensure the database connection is always closed
          await prisma.$disconnect();
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

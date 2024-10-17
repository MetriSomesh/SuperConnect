import CredentialsProviders from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions, Session } from "next-auth"; // Import necessary types
import { User as NextAuthUser } from "next-auth"; // Import user type

const prisma = new PrismaClient();

export const NEXT_AUTH: NextAuthOptions = {
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
      async authorize(credentials) {
        if (!credentials) {
          console.error("Credentials are undefined.");
          return null; // Handle undefined credentials
        }

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
          } as NextAuthUser; // Type assertion for the user
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
    async session({ session, token }) {
      if (token && token.id && token.email) {
        session.user.id = token.id.toString(); // TypeScript recognizes 'token' as possibly undefined
        session.user.email = token.email?.toString(); // TypeScript recognizes 'token' as possibly undefined
      }
      return session;
    },
    async jwt({ token, user }) {
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

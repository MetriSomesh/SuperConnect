import CredentialsProviders from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { User as NextAuthUser } from "next-auth";

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
          return null;
        }

        try {
          await prisma.$connect();

          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            // New user signup: create the user in the database
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword,
              },
            });
          }

          // Validate password for existing users
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            console.error("Invalid password.");
            return null;
          }

          // Return user ID and email if authorization is successful
          return { id: user.id.toString(), email: user.email } as NextAuthUser;
        } catch (error) {
          console.error("Error during authorization: ", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token && token.id && token.email) {
        session.user.id = token.id.toString();
        session.user.email = token.email?.toString();
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
    async redirect({ url, baseUrl }) {
      // Redirect to /connectaccount after signup
      return url === "/signin" ? `${baseUrl}/connectaccount` : url;
    },
  },
  pages: {
    signIn: "/signin",
    newUser: "/connectaccount",
  },
};
// import { PrismaClient } from "@prisma/client";
// import { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProviders from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { User as NextAuthUser } from "next-auth";

// const prisma = new PrismaClient();

// export const NEXT_AUTH: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: "GOCSPXDAHNT4cL0PJzV7FWwgx5QVS7Keh7",
//     }),
//     // add other providers as needed
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         // Check if user exists in the database
//         let existingUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });

//         // If the user does not exist, create them
//         if (!existingUser) {
//           existingUser = await prisma.user.create({
//             data: {
//               email: user.email,
//               password: user.email,
//               // add any additional fields as needed
//             },
//           });
//         }

//         // Add the user ID to the token for session creation
//         token.id = existingUser.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Attach the user ID to the session for frontend access
//       if (token) {
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       console.log("URL WILL BE: ", url);
//       // Redirect to /connectaccount after signup
//       return url === "/signin" ? `${baseUrl}/connectaccount` : url;
//     },
//   },
//   pages: {
//     signIn: "/signin",
//     newUser: "/connectaccount",
//   },
// };

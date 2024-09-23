import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      // Add accessToken and refreshToken
      accessToken: string;
      refreshToken: string;
    };
  }

  interface User {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }

  interface JWT {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }
}

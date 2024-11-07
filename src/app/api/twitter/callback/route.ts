import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = searchParams.get("twitter_oauth_state");
  const codeVerifier = searchParams.get("twitter_code_verifier");
  const session = await getServerSession(NEXT_AUTH);
  if (state !== storedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing code verifier" },
      { status: 400 }
    );
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        code: code!,
        grant_type: "authorization_code",
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: process.env.TWITTER_CALLBACK_URL!,
        code_verifier: codeVerifier, // Use the code_verifier from cookies
      }),
      {
        auth: {
          username: process.env.TWITTER_CLIENT_ID!,
          password: process.env.TWITTER_CLIENT_SECRET!,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Store access_token and refresh_token in your database
    // You need to identify the user, e.g., by linking the account to an existing user
    // Replace with actual user identification logic
    // await prisma.user.update({
    //   where: { id: "current_user_id" }, // Replace with actual user ID
    //   data: {
    //     twitterAccessToken: access_token,
    //     twitterRefreshToken: refresh_token,
    //   },
    // });

    // await prisma.$connect();

    // const userUpdate = await prisma.user.update({
    //   where: {
    //     email: session?.user?.email || undefined,
    //   },
    //   data: {
    //     accessToken: access_token,
    //     refreshToken: refresh_token,
    //   },
    // });

    // if (userUpdate) {
    //   session.user.accessToken = access_token;
    //   return NextResponse.json({
    //     access_token: access_token,
    //     refresh_token: refresh_token,
    //     session: session,
    //   });
    // }
    if (session?.user?.email) {
      await prisma.$connect();
      // await prisma.user.update({
      //   where: { email: session.user.email },
      //   data: {
      //     accessToken: access_token.toString() || "",
      //     refreshToken: refresh_token.toString() || "",
      //   },
      // });

      const updateUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          accessToken: access_token.toString(),
          refreshToken: refresh_token.toString(),
        },
      });
      if (!updateUser) {
        await prisma.$disconnect();
        return NextResponse.redirect(
          "https://super-connect-iota.vercel.app/unsucessful"
        );
      }

      await prisma.$disconnect();
      // session.user.accessToken = access_token;
      // session.user.refreshToken = refresh_token;

      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/connectaccount"
      );
    } else {
      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/unsucessful"
      );
    }
  } catch (error) {
    console.error("Error in Twitter callback:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Twitter" },
      { status: 500 }
    );
  }
}

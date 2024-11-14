import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/lib/auth";
import crypto from "crypto";
import qs from "querystring";

const prisma = new PrismaClient();

async function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>
) {
  const consumerSecret = process.env.TWITTER_API_SECRET!;
  const tokenSecret = params.oauth_token_secret || "";

  const baseString = [
    method,
    encodeURIComponent(url),
    encodeURIComponent(
      qs.stringify({ ...params }).replace(/%20/g, "+") // format URL parameters
    ),
  ].join("&");

  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  return signature;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const oauth_verifier = searchParams.get("oauth_verifier");
  const oauth_token = searchParams.get("oauth_token");

  // Ensure oauth_token is a string before proceeding
  if (typeof oauth_token !== "string") {
    return NextResponse.json({ error: "Invalid oauth_token" }, { status: 400 });
  }

  const session = await getServerSession(NEXT_AUTH);

  if (!oauth_verifier || !oauth_token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Prepare parameters for token exchange (OAuth 1.0a)
    const oauth_nonce = crypto.randomBytes(32).toString("hex");
    const oauth_timestamp = Math.floor(Date.now() / 1000).toString();
    const oauth_signature_method = "HMAC-SHA1";
    const oauth_version = "1.0";

    const tokenExchangeParams = {
      oauth_consumer_key: process.env.TWITTER_API_KEY!,
      oauth_token: oauth_token, // Now guaranteed to be a string
      oauth_nonce,
      oauth_timestamp,
      oauth_signature_method,
      oauth_version,
      oauth_verifier,
    };

    // Generate OAuth signature
    const signature = await generateOAuthSignature(
      "POST",
      "https://api.twitter.com/oauth/access_token",
      tokenExchangeParams
    );

    // Send request to Twitter API to exchange the request token for an access token
    const response = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      qs.stringify({ ...tokenExchangeParams, oauth_signature: signature }),
      {
        headers: {
          Authorization: `OAuth ${qs.stringify({
            ...tokenExchangeParams,
            oauth_signature: signature,
          })}`,
        },
      }
    );

    const {
      oauth_token: access_token,
      oauth_token_secret,
      //   screen_name,
    } = qs.parse(response.data);

    // const user_id = response.data.user_id.toString();

    // Store tokens in the database for later use
    if (
      typeof access_token !== "string" ||
      typeof oauth_token_secret !== "string"
      //   typeof screen_name !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid access_token" },
        { status: 400 }
      );
    }

    // if (typeof user_id !== "string") {
    //   user_id?.toString();
    // }
    if (session?.user?.email) {
      await prisma.$connect();

      const updateUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          accessToken: access_token.toString(),
          refreshToken: oauth_token_secret.toString(),
          //   twitterUserId: user_id.toString(),
          //   twitterScreenName: screen_name.toString(),
        },
      });

      await prisma.$disconnect();

      if (!updateUser) {
        return NextResponse.redirect(
          "https://super-connect-iota.vercel.app/unsuccessful"
        );
      }

      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/connectaccount"
      );
    } else {
      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/unsuccessful"
      );
    }
  } catch (error) {
    console.error("Error during OAuth 1.0a callback:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Twitter" },
      { status: 500 }
    );
  }
}

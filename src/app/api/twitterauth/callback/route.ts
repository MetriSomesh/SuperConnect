import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import qs from "querystring";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { NEXT_AUTH } from "@/app/lib/auth";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Retrieve the oauth_verifier and oauth_token from the query parameters
  const oauth_verifier = request.nextUrl.searchParams.get("oauth_verifier");
  const oauth_token = request.nextUrl.searchParams.get("oauth_token");
  const session = await getServerSession(NEXT_AUTH);

  // Ensure oauth_verifier and oauth_token are present
  if (!oauth_verifier || !oauth_token) {
    return NextResponse.json(
      { error: "Invalid OAuth token or verifier" },
      { status: 400 }
    );
  }

  const oauth_consumer_key = "YOUR_CONSUMER_KEY";
  const oauth_consumer_secret = "YOUR_CONSUMER_SECRET";
  const oauth_nonce = crypto.randomBytes(32).toString("hex");
  const oauth_timestamp = Math.floor(Date.now() / 1000).toString();
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";

  // Prepare parameters for the OAuth signature for the access token exchange
  const params: Record<string, string> = {
    oauth_consumer_key,
    oauth_token,
    oauth_verifier,
    oauth_nonce,
    oauth_timestamp,
    oauth_signature_method,
    oauth_version,
  };

  // Generate the signature base string for the access token request
  const baseString = [
    "POST", // HTTP method (POST for access token)
    encodeURIComponent("https://api.twitter.com/oauth/access_token"), // The URL
    encodeURIComponent(qs.stringify(params)), // URL parameters
  ].join("&");

  // Generate the OAuth signature
  const signingKey = `${encodeURIComponent(oauth_consumer_secret)}&`; // Token secret will be added here
  const oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  // Add the oauth_signature to the parameters
  params.oauth_signature = oauth_signature;

  try {
    // Make the POST request to obtain the access token
    const response = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      qs.stringify(params),
      {
        headers: {
          Authorization: `OAuth ${qs.stringify(params)}`,
        },
      }
    );

    // Parse the response data
    const parsedResponse = qs.parse(response.data);
    const access_token = parsedResponse.oauth_token?.toString();
    const access_token_secret = parsedResponse.oauth_token_secret?.toString();
    // const user_id = parsedResponse.user_id;
    // const screen_name = parsedResponse.screen_name;

    // Store access token and secret in the database, or return it to the frontend
    if (session?.user?.email) {
      await prisma.$connect();

      const updateUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          accessToken: access_token,
          refreshToken: access_token_secret,
        },
      });

      await prisma.$disconnect();

      if (!updateUser) {
        return NextResponse.redirect(
          "https://super-connect-iota.vercel.app/unsucessful"
        );
      }

      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/connectaccount"
      );
    } else {
      return NextResponse.redirect(
        "https://super-connect-iota.vercel.app/unsucessful"
      );
    }
  } catch (error) {
    console.error("Error during OAuth access token exchange:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}

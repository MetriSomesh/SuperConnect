import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import qs from "querystring";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { NEXT_AUTH } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { oauth_verifier, oauth_token } = await request.json();
  const session = await getServerSession(NEXT_AUTH);

  if (!oauth_verifier || !oauth_token) {
    return NextResponse.json(
      { error: "Invalid OAuth token or verifier" },
      { status: 400 }
    );
  }

  const oauth_consumer_key = "6GUF62tntsp3C3hac2wzL9v94";
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_nonce = crypto.randomBytes(32).toString("hex");
  const oauth_timestamp = Math.floor(Date.now() / 1000).toString();
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";

  const params: Record<string, string> = {
    oauth_consumer_key,
    oauth_token,
    oauth_verifier,
    oauth_nonce,
    oauth_timestamp,
    oauth_signature_method,
    oauth_version,
  };

  const baseString = [
    "POST",
    encodeURIComponent("https://api.twitter.com/oauth/access_token"),
    encodeURIComponent(qs.stringify(params)),
  ].join("&");

  const signingKey = `${encodeURIComponent(oauth_consumer_secret)}&`;

  const oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  params.oauth_signature = oauth_signature;

  try {
    const response = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      qs.stringify({ oauth_verifier }),
      {
        headers: {
          Authorization: `OAuth oauth_consumer_key="${oauth_consumer_key}", oauth_token="${oauth_token}", oauth_signature="${oauth_signature}", oauth_nonce="${oauth_nonce}", oauth_signature_method="${oauth_signature_method}", oauth_timestamp="${oauth_timestamp}", oauth_version="${oauth_version}"`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const parsedResponse = qs.parse(response.data);
    const access_token = parsedResponse.oauth_token?.toString();
    const access_token_secret = parsedResponse.oauth_token_secret?.toString();

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

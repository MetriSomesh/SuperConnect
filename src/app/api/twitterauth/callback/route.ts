import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import qs from "querystring";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { NEXT_AUTH } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const oauth_verifier = request.nextUrl.searchParams.get("oauth_verifier");
  const oauth_token = request.nextUrl.searchParams.get("oauth_token");
  const session = await getServerSession(NEXT_AUTH);

  if (!oauth_verifier || !oauth_token) {
    return NextResponse.json(
      { error: "Invalid OAuth token or verifier" },
      { status: 400 }
    );
  }

  const oauth_consumer_key = process.env.TWITTERAPIKEY!;
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";

  const res = await axios.post(
    "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/api/generateOAuthCreds"
  );

  console.log(
    "THIS IS THE TIME STAMP AND THE NONCE WHICH IS GIVEN BY THE API: ",
    res.data
  );

  const oauth_nonce = res.data.oauth_nonce;
  const oauth_timestamp = res.data.oauth_timestamp;
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

  console.log("SIGNING KEY: ", signingKey);

  const oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  console.log("OAUTH SIGNATURE: ", oauth_signature);
  params.oauth_signature = oauth_signature;

  try {
    const response = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      qs.stringify({ oauth_verifier }),
      {
        headers: {
          Authorization: `OAuth oauth_consumer_key="${oauth_consumer_key}", oauth_token="${oauth_token}", oauth_signature="${params.oauth_signature}", oauth_nonce="${oauth_nonce}", oauth_signature_method="${oauth_signature_method}", oauth_timestamp="${oauth_timestamp}", oauth_version="${oauth_version}"`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const parsedResponse = qs.parse(response.data);
    console.log("ACCESS TOKEN RESPONSE : ", response.data);
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
          "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
        );
      }

      return NextResponse.redirect(
        "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/connectaccount"
      );
    } else {
      return NextResponse.redirect(
        "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
      );
    }
  } catch (error) {
    console.error("Error during OAuth access token exchange:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

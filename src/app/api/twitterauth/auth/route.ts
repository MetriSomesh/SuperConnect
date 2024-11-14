import { NextResponse } from "next/server";
import axios from "axios";
import OAuth from "oauth-1.0a";
import queryString from "query-string";
import crypto from "crypto";

export async function POST() {
  // Use POST instead of GET
  const oauth_consumer_key = "6GUF62tntsp3C3hac2wzL9v94";
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_callback =
    "https://super-connect-iota.vercel.app/api/twitterauth/callback";

  if (!oauth_consumer_key || !oauth_consumer_secret || !oauth_callback) {
    return new NextResponse("Missing required environment variables", {
      status: 500,
    });
  }

  const url = "https://api.twitter.com/oauth/request_token";

  const oauth = new OAuth({
    consumer: {
      key: oauth_consumer_key,
      secret: oauth_consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (base_string, key) =>
      crypto.createHmac("sha1", key).update(base_string).digest("base64"),
  });

  try {
    const oauth_nonce = crypto.randomBytes(16).toString("hex");
    const oauth_timestamp = Math.floor(Date.now() / 1000).toString();

    const request_data = {
      url: url,
      method: "POST",
      data: {
        oauth_callback: oauth_callback,
        oauth_nonce: oauth_nonce,
        oauth_timestamp: oauth_timestamp,
      },
    };

    const authHeader = oauth.toHeader(oauth.authorize(request_data));

    const response = await axios.post(url, null, {
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    const responseData = queryString.parse(response.data);

    if (!responseData.oauth_token || !responseData.oauth_token_secret) {
      throw new Error("Missing OAuth tokens in response");
    }

    const redirectUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${responseData.oauth_token}`;

    return NextResponse.json(
      {
        url: redirectUrl,
        success: true,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error during OAuth request token:", error);

    return NextResponse.json(
      {
        error: "Failed to obtain request token",
        details: error,
        success: false,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import axios from "axios";
import OAuth from "oauth-1.0a";
import queryString from "query-string";
import crypto from "crypto";

export async function GET() {
  // Move sensitive credentials to environment variables
  const oauth_consumer_key = process.env.TWITTERAPIKEY;
  const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
  const oauth_callback =
    "https://super-connect-iota.vercel.app/api/twitterauth/callback";

  if (!oauth_consumer_key || !oauth_consumer_secret || !oauth_callback) {
    console.log("heeloo");
    return new NextResponse("Missing required environment variables", {
      status: 500,
    });
  }

  const url = "https://api.twitter.com/oauth/request_token";

  // Initialize OAuth
  const oauth = new OAuth({
    consumer: {
      key: oauth_consumer_key,
      secret: oauth_consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (base_string, key) => {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });

  const request_data = {
    url: url,
    method: "POST",
    data: {
      oauth_callback: oauth_callback,
    },
  };

  try {
    // Get OAuth authorization header
    const authHeader = oauth.toHeader(
      oauth.authorize(request_data, undefined) // Use undefined instead of empty token object
    );

    const response = await axios.post(url, null, {
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Parse response data
    const responseData = queryString.parse(response.data);

    if (!responseData.oauth_token || !responseData.oauth_token_secret) {
      throw new Error("Missing OAuth tokens in response");
    }

    // Store oauth_token_secret in session or secure storage for later use
    // Note: You'll need this for the callback endpoint

    const redirectUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${responseData.oauth_token}`;

    return NextResponse.json({
      url: redirectUrl,
      success: true,
    });
  } catch (error) {
    console.error("Error during OAuth request token:", error);

    return NextResponse.json(
      {
        error: "Failed to obtain request token",
        details: error,
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

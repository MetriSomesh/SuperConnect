import { NextResponse } from "next/server";
import axios from "axios";
import OAuth from "oauth-1.0a";
import queryString from "query-string";

// Import Node's crypto module
import crypto from "crypto";

export async function GET() {
  const oauth_consumer_key = "6GUF62tntsp3C3hac2wzL9v94";
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_callback =
    "https://super-connect-iota.vercel.app/api/twitterauth/callback";

  const url = "https://api.twitter.com/oauth/request_token";

  // Set up OAuth
  const oauth = new OAuth({
    consumer: {
      key: oauth_consumer_key,
      secret: oauth_consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    // Use crypto's createHmac function to generate the OAuth signature
    hash_function(base_string, key) {
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

  // Generate the OAuth header
  const authHeader = oauth.toHeader(oauth.authorize(request_data));

  try {
    // Make the POST request with axios
    const response = await axios.post(url, null, {
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded", // required for OAuth 1.0a
      },
    });

    // Parse the response to extract oauth_token and oauth_token_secret
    const responseData = queryString.parse(response.data);

    const tmpOauthToken = responseData.oauth_token;
    const tmpOauthTokenSecret = responseData.oauth_token_secret;

    console.log("TWITTER OAUTH TOKEN SECRET: ", tmpOauthTokenSecret);
    console.log("oauth_token: ", tmpOauthToken);

    // Step 2: Redirect the user to Twitter's authorization URL
    // const redirectUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${tmpOauthToken}`;
    return NextResponse.json(tmpOauthToken);
  } catch (error) {
    console.error("Error during OAuth request token:", error);
    return new NextResponse("Failed to obtain request token", { status: 500 });
  }
}

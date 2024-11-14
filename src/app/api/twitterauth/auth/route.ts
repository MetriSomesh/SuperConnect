import { NextResponse } from "next/server";
import axios from "axios";
import queryString from "query-string";

export async function GET() {
  const oauth_consumer_key = "6GUF62tntsp3C3hac2wzL9v94";
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_callback =
    "https://super-connect-iota.vercel.app/api/twitterauth/callback";

  const url = "https://api.twitter.com/oauth/request_token";

  // Twitter OAuth headers
  const authHeader = {
    Authorization: `OAuth oauth_consumer_key="${oauth_consumer_key}", oauth_consumer_secret="${oauth_consumer_secret}", oauth_callback="${oauth_callback}"`,
  };

  try {
    const response = await axios.post(url, null, { headers: authHeader });

    // Parse the response to extract oauth_token and oauth_token_secret
    const responseData = queryString.parse(response.data);

    const tmpOauthToken = responseData.oauth_token;
    const tmpOauthTokenSecret = responseData.oauth_token_secret;

    // Store tmpOauthToken and tmpOauthTokenSecret in your database
    console.log("TWITTER OAUTH TOKEN SECRETE: ", tmpOauthTokenSecret);
    console.log(tmpOauthToken);
    // Step 2: Redirect the user to Twitter's authorization URL
    // const redirectUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${tmpOauthToken}`;
    // return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during OAuth request token:", error);
    return new NextResponse("Failed to obtain request token", { status: 500 });
  }
}

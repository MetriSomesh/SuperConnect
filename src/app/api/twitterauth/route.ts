import { NextRequest, NextResponse } from "next/server";
import OAuth from "oauth";

const oauth = new OAuth.OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  process.env.TWITTER_CONSUMER_KEY!,
  process.env.TWITTER_CONSUMER_SECRET!,
  "1.0A",
  null, // Set to null instead of a callback URL
  "HMAC-SHA1"
);

export async function GET() {
  try {
    const [oauthToken, oauthTokenSecret] = await new Promise<[string, string]>(
      (resolve, reject) => {
        oauth.getOAuthRequestToken(
          {
            oauth_callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twittercallback`,
          },
          (error, oauthToken, oauthTokenSecret) => {
            if (error) {
              reject(error);
            } else {
              resolve([oauthToken, oauthTokenSecret]);
            }
          }
        );
      }
    );

    const response = NextResponse.json({
      url: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
    });

    response.cookies.set("oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error fetching request token:", error);
    return NextResponse.json(
      { error: "Twitter login failed", details: error },
      { status: 500 }
    );
  }
}

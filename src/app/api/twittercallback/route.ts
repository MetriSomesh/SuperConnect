import { NextApiRequest, NextApiResponse } from "next";
import OAuth from "oauth";
import { parseCookies } from "nookies";

const oauth = new OAuth.OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  process.env.TWITTER_CONSUMER_KEY!,
  process.env.TWITTER_CONSUMER_SECRET!,
  "1.0A",
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/callback`,
  "HMAC-SHA1"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { oauth_token, oauth_verifier } = req.query;
  const cookies = parseCookies({ req });
  const oauthTokenSecret = cookies.oauth_token_secret;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: "Invalid Twitter callback" });
  }

  oauth.getOAuthAccessToken(
    oauth_token as string,
    oauthTokenSecret,
    oauth_verifier as string,
    (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (error) {
        console.error("Error fetching access token:", error);
        return res.status(500).json({ error: "Twitter login failed" });
      }

      // Here you can fetch additional user information from Twitter using oauthAccessToken

      // For now, simply return the user info
      return res.status(200).json({
        msg: "Twitter login successful",
        accessToken: oauthAccessToken,
        accessTokenSecret: oauthAccessTokenSecret,
        twitterUser: results,
      });
    }
  );
}

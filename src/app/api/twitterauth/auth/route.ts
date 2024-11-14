import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const state = Math.random().toString(36).substring(7);

  // OAuth 1.0a request token generation (this part is not needed for OAuth 2.0)
  const oauth_nonce = crypto.randomBytes(32).toString("hex");
  const oauth_timestamp = Math.floor(Date.now() / 1000).toString();
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";

  const authUrl = new URL("https://api.twitter.com/oauth/authorize");

  authUrl.searchParams.append(
    "oauth_consumer_key",
    process.env.TWITTER_API_KEY!
  );
  authUrl.searchParams.append("oauth_nonce", oauth_nonce);
  authUrl.searchParams.append("oauth_signature_method", oauth_signature_method);
  authUrl.searchParams.append("oauth_timestamp", oauth_timestamp);
  authUrl.searchParams.append("oauth_version", oauth_version);
  authUrl.searchParams.append("state", state);

  // Append OAuth parameters and prepare the authorization URL
  const response = NextResponse.json(authUrl);

  return response;
}

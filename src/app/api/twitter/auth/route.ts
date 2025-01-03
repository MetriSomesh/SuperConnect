import { NextResponse } from "next/server";
import crypto from "crypto";
export async function GET() {
  const state = Math.random().toString(36).substring(7);

  // Generate code_verifier and code_challenge
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const combinedState = Buffer.from(`${state}:${codeVerifier}`).toString(
    "base64"
  );

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const authUrl = new URL("https://twitter.com/i/oauth2/authorize");

  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", process.env.TWITTER_CLIENT_ID!);
  authUrl.searchParams.append(
    "redirect_uri",
    process.env.TWITTER_CALLBACK_URL!
  );
  authUrl.searchParams.append("twitter_code_verifier", codeVerifier);
  authUrl.searchParams.append("twitter_oauth_state", state);
  authUrl.searchParams.append("scope", "tweet.read users.read offline.access");
  authUrl.searchParams.append("state", combinedState);
  authUrl.searchParams.append("code_challenge", codeChallenge);
  authUrl.searchParams.append("code_challenge_method", "S256");

  const response = NextResponse.json(authUrl);

  // // Set both state and code_verifier in cookies (secure and HTTP-only)
  // // response.cookies.set("twitter_oauth_state", state, {
  // //   httpOnly: true,
  // //   secure: true,
  // //   path: "/",
  // //   sameSite: "none",
  // // });

  // console.log(response.cookies);
  // response.cookies.set("twitter_code_verifier", codeVerifier, {
  //   httpOnly: true,
  //   secure: true,
  //   path: "/",
  //   sameSite: "none",
  // });

  return response;
}

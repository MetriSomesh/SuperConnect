import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import qs from "querystring";

export async function GET() {
  const oauth_consumer_key = "6GUF62tntsp3C3hac2wzL9v94";
  const oauth_consumer_secret =
    "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
  const oauth_nonce = crypto.randomBytes(32).toString("hex");
  const oauth_timestamp = Math.floor(Date.now() / 1000).toString();
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";
  const oauth_callback =
    "https://super-connect-iota.vercel.app/api/twitterauth/callback"; // The URL Twitter will redirect back to after user authorization

  // Prepare parameters for the OAuth signature
  const params: Record<string, string> = {
    oauth_consumer_key,
    oauth_nonce,
    oauth_timestamp,
    oauth_signature_method,
    oauth_version,
    oauth_callback,
  };

  // Generate the signature base string for the request token request
  const baseString = [
    "POST", // HTTP method (POST for request token)
    encodeURIComponent("https://api.twitter.com/oauth/request_token"), // The URL
    encodeURIComponent(qs.stringify(params)), // URL parameters
  ].join("&");

  // Generate the OAuth signature
  const signingKey = `${encodeURIComponent(oauth_consumer_secret)}&`; // Empty token secret for now
  const oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  // Add the oauth_signature to the parameters
  params.oauth_signature = oauth_signature;

  // Format the Authorization header correctly
  const authorizationHeader = `OAuth ${Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`
    )
    .join(", ")}`;

  try {
    // Make the POST request to get the request token
    const response = await axios.post(
      "https://api.twitter.com/oauth/request_token",
      null,
      {
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );

    // Parse the response data to extract oauth_token
    const parsedResponse = qs.parse(response.data);
    const oauth_token = parsedResponse.oauth_token;

    // Redirect the user to Twitter's authorization page
    const authorizationUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;

    return NextResponse.redirect(authorizationUrl); // Redirect to Twitter's authorization page
  } catch (error) {
    console.error("Error during OAuth request token:", error);
    return NextResponse.json(
      { error: "Failed to obtain request token" },
      { status: 500 }
    );
  }
}

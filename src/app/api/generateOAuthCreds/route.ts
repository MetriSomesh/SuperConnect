// app/api/myProfile/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
export async function POST() {
  try {
    const oauth_nonce = crypto.randomBytes(32).toString("hex");
    const oauth_timestamp = Math.floor(Date.now() / 1000).toString();

    return NextResponse.json({
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
    });
  } catch (error) {
    console.error("Error creating OAuthCreds:", error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}

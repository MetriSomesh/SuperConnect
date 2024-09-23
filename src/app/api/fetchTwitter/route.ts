// app/api/myProfile/route.ts
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken } = body;
    const response = await axios.get("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        "user.fields": "description,location",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching user profile:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: "Error fetching user profile",
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

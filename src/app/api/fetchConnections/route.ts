import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic"; // Disable static optimization
export const runtime = "edge"; // Use edge runtime for better performance

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Make the axios request to the external API
    const response = await axios.post(
      "https://api.socialdata.tools/twitter/followers/list",
      { user_id: accountId }, // Send as POST body
      {
        headers: {
          Authorization:
            "Bearer 816|uDVquPB05o55uj8i7zpDuE1yX5fXyLMDuO6COGN218b55c2f",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Return the successful response
    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching Twitter followers:", error);

    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: "Failed to fetch Twitter followers",
          details: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optionally, handle OPTIONS requests for CORS
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  try {
    // Parse the body to get the userId
    const body = await req.json();
    const { userId } = body;

    // Check if userId is provided
    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing userId in the request body",
        },
        { status: 400 }
      );
    }
    await prisma.$connect();
    // Find all account_ids for the specific user's connections
    const connections = await prisma.connections.findMany({
      where: {
        userId: parseInt(userId, 10), // Filter by the userId
      },
      select: {
        id: true,
        account_id: true, // Only select account_id
      },
      take: 10,
    });

    // Extract just the account_id values into an array
    const accountIds = connections.map((connection) => connection.account_id);
    await prisma.$disconnect();
    return NextResponse.json(
      {
        message: "Account IDs retrieved successfully",
        data: accountIds,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await prisma.$disconnect();
    console.error("Error fetching account IDs from connections:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve account IDs",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

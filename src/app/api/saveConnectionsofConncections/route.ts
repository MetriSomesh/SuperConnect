import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, followers, connectionId } = body;

    if (!userId || !followers) {
      return NextResponse.json(
        { error: "User ID or followers data not provided" },
        { status: 400 }
      );
    }

    const connectionsData = followers.map((follower: any) => ({
      userId,
      connectionId: connectionId, // Assuming this is the ID of the connection
    }));

    await prisma.$connect();

    // Create multiple connections in a single query
    const newConnections = await prisma.connectionsOfConnections.createMany({
      data: connectionsData,
      skipDuplicates: true, // Avoid duplicating the same connections
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, newConnections });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error saving connections of connections:", error);
    return NextResponse.json(
      { error: "Error saving connections of connections" },
      { status: 500 }
    );
  }
}

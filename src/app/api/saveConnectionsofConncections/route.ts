import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface Follower {
  id_str: string;
  description: string;
  followers_count: number;
  location: string | null;
  screen_name: string;
  name: string;
}

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

    await prisma.$connect();

    // Create multiple connections in a single query
    const newConnections = await prisma.connectionsOfConnections.createMany({
      data: followers.map((follower: Follower) => ({
        userId,
        connectionId, // Assuming this is the ID of the connection
        followerId: follower.id_str, // Example usage of the follower's id_str
        followerName: follower.name, // Example usage of the follower's name
        followerScreenName: follower.screen_name, // Example usage of the follower's screen_name
      })),
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

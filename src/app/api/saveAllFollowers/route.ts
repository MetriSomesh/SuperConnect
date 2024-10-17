// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, followers } = body;

    if (!userId || !followers) {
      return NextResponse.json(
        { error: "User ID or followers data not provided" },
        { status: 400 }
      );
    }

    // Extract necessary fields from each follower
    const connectionsData = followers.map((follower: any) => ({
      userId, // The ID of the current user
      account_id: follower.id_str,
      descripiton: follower.description,
      followers: follower.followers_count.toString(), // Convert count to string
      location: follower.location,
      username: follower.screen_name,
      name: follower.name,
    }));

    await prisma.$connect();

    // Create multiple connections in a single query
    const newConnections = await prisma.connections.createMany({
      data: connectionsData,
      skipDuplicates: true, // Avoid duplicating the same connections
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, newConnections });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error saving connections:", error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}

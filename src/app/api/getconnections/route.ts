import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient(); // Adjust the import according to your project structure

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }

    const connections = await prisma.connections.findMany({
      where: { userId: Number(userId) },
      include: {
        user: true, // Include related user info if needed
      },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error fetching connections" },
      { status: 500 }
    );
  }
}

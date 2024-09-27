import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      accountId,
      descripiton,
      followers,
      location,
      username,
      name,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }
    await prisma.$connect();
    const newConnections = await prisma.connections.create({
      data: {
        user: { connect: { id: userId } },
        account_id: accountId,
        descripiton: descripiton,
        followers: followers,
        location: location,
        username: username,
        name: name,
      },
    });
    await prisma.$disconnect();
    return NextResponse.json(newConnections);
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error fetching connections" },
      { status: 500 }
    );
  }
}

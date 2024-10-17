// app/api/getConnections/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    await prisma.$connect();
    const connections = await prisma.user.findUnique({
      where: { id: userId },
      include: { Connections: true },
    });
    await prisma.$disconnect();

    return NextResponse.json(connections || []);
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error fetching connections" },
      { status: 500 }
    );
  }
}

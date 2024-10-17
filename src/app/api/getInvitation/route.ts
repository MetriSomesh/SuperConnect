import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Adjust the path to your Prisma client
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.$connect();

    // Fetch invitations where the user is the receiver
    const invitations = await prisma.invitation.findMany({
      where: {
        receiverId: parseInt(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    // If no invitations are found, return a specific message
    if (invitations.length === 0) {
      return NextResponse.json(
        { message: "No invitations found." },
        { status: 200 }
      );
    }

    // Return invitations if they exist
    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

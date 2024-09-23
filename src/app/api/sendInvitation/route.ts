import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  const body = await req.json();
  const { receiverId, senderId } = body;

  if (!receiverId || !senderId) {
    return NextResponse.json(
      { message: "Both IDs is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.$connect();
    const newInvitation = await prisma.invitation.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        status: "pending",
      },
    });
    await prisma.$disconnect();
    return NextResponse.json(
      { message: "Invitation sent successfully", newInvitation },
      { status: 200 }
    );
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

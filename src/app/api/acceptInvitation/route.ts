import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    await prisma.$connect();
    const body = await req.json();
    const { invitationId } = body;

    if (!invitationId) {
      return NextResponse.json(
        { message: "Invitation ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the invitation
    const deletedInvitation = await prisma.invitation.delete({
      where: {
        id: parseInt(invitationId, 10),
      },
    });

    await prisma.$disconnect();
    // Check if the invitation was deleted
    if (deletedInvitation) {
      return NextResponse.json(
        { message: "Invitation accepted and deleted successfully" },
        { status: 200 }
      );
    } else {
      await prisma.$disconnect();
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

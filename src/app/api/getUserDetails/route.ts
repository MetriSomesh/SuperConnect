import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const body = await req.json();
    const { id } = body;
    await prisma.$connect();

    const userDetails = await prisma.user.findUnique({
      where: { id: id },
    });

    if (userDetails) {
      prisma.$disconnect();
      return NextResponse.json({
        username: userDetails.username,
        bio: userDetails.bio,
        interests: userDetails.interests,
        AIDescription: userDetails.AIDescription,
        profilePic: userDetails.profileaPic,
      });
    }
  } catch (error) {
    await prisma.$disconnect();
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
};

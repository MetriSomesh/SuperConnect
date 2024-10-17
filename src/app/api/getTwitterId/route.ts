import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email } = body;
    await prisma.$connect();

    const userWithTwitter = await prisma.user.findUnique({
      where: { email: email },
      include: { twitter: true },
    });

    if (userWithTwitter && userWithTwitter.twitter) {
      await prisma.$disconnect();
      return NextResponse.json({
        twitter_info: userWithTwitter.twitter,
      });
    } else {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Twitter account not found for this user." },
        { status: 404 }
      );
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

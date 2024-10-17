import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email } = body;
    await prisma.$connect();

    const tokens = await prisma.user.findUnique({
      where: { email: email },
    });

    if (tokens) {
      prisma.$disconnect();
      return NextResponse.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

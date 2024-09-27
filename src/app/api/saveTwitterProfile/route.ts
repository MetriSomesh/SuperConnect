// app/api/saveTwitterProfile/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, account_id, username, name, descripiton, location } = body;

    if (!userId || !account_id) {
      return NextResponse.json(
        { error: "User ID or Account ID not provided" },
        { status: 400 }
      );
    }

    await prisma.$connect();
    const twitterProfile = await prisma.twitter.create({
      data: {
        user: { connect: { id: userId } },
        account_id,
        username,
        name,
        descripiton,
        location,
      },
    });
    await prisma.$disconnect();

    return NextResponse.json(twitterProfile);
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error saving Twitter profile:", error);
    return NextResponse.json(
      { error: "Error saving Twitter profile" },
      { status: 500 }
    );
  }
}

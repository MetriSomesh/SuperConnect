import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const body = await req.json();
    const { email, ai_description } = body;

    await prisma.$connect();

    const description = await prisma.user.update({
      where: { email: email },
      data: {
        AIDescription: ai_description,
      },
    });

    await prisma.$disconnect();
    return NextResponse.json({ msg: "Success" }, { status: 200 });
  } catch (error: any) {
    await prisma.$disconnect();

    console.error("Error during request: ", error.message || error);
    return NextResponse.json(
      { msg: "Error processing request", error: error.message || error },
      { status: 500 }
    );
  }
};

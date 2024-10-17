import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
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
    console.log(description);

    await prisma.$disconnect();
    return NextResponse.json({ msg: "Success" }, { status: 200 });
  } catch (error) {
    await prisma.$disconnect();

    console.error("Error during request: ", error);
    return NextResponse.json(
      { msg: "Error processing request", error },
      { status: 500 }
    );
  }
};

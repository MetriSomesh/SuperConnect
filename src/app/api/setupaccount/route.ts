import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { username, interests, bio, email, profileaPic } = body;
  await prisma.$connect();

  try {
    try {
      const getUser = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          username: username,
          bio: bio,
          interests: interests,
          profileaPic: profileaPic,
        },
      });
      await prisma.$disconnect();
      return NextResponse.json(
        {
          msg: "User updated successfully",
          getUser,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          msg: error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    await prisma.$disconnect();
    console.error(error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
};

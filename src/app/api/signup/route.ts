import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { email, password } = body;
  await prisma.$connect();
  //   const existingUser = await prisma.user.findUnique({
  //     where: { email },
  //   });

  //   if (existingUser) {
  //     // await prisma.invitation.deleteMany();
  //     // await prisma.youTuberNotification.deleteMany();
  //     // await prisma.channel.deleteMany();
  //     // await prisma.youTuber.deleteMany();
  //     // await prisma.user.deleteMany();
  //     // await prisma.editor.deleteMany();
  //     // Now delete all records from the User table
  //     // return NextResponse.json(
  //     //   {
  //     //     msg: "Email is already registered",
  //     //   },
  //     //   { status: 400 }
  //     // );
  //     console.log("user already exists");
  //     return NextResponse.json(
  //       {
  //         msg: "User already exists",
  //       },
  //       { status: 202 }
  //     );
  //   }

  try {
    const userPassword = password;
    const finalPass = await bcrypt.hash(userPassword, 10);
    console.log("THE ENCRYPTID Passwordk : ", finalPass);
    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: finalPass,
        },
      });
      await prisma.$disconnect();
      return NextResponse.json(
        {
          msg: "User Created",
          user: newUser,
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

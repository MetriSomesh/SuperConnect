import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get userId
    const body = await req.json();
    const { userId } = body;

    // Check if userId is provided
    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing userId in the request body",
        },
        { status: 400 }
      );
    }
    await prisma.$connect();
    // Find all connections of connections for the provided userId
    const connectionsOfConnections =
      await prisma.connectionsOfConnections.findMany({
        where: {
          userId: parseInt(userId, 10), // Filtering by the provided userId
        },
        include: {
          connection: {
            select: {
              account_id: true,
              username: true,
              name: true,
              descripiton: true,
              followers: true,
            },
          },
        },
      });

    await prisma.$disconnect();
    const formattedConnectionsOfConnections = connectionsOfConnections.map(
      (connectionOfConnection) => ({
        account_id: connectionOfConnection.connection.account_id,
        username: connectionOfConnection.connection.username,
        name: connectionOfConnection.connection.name,
        description: connectionOfConnection.connection.descripiton,
        followers: connectionOfConnection.connection.followers,
      })
    );

    return NextResponse.json(
      {
        message: "Connections of connections retrieved successfully",
        data: formattedConnectionsOfConnections,
      },
      { status: 200 }
    );
  } catch (error) {
    prisma.$disconnect();
    console.error("Error fetching connections of connections:", error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { currentUserId } = await req.json();

    // Validate currentUserId
    if (!currentUserId) {
      return NextResponse.json(
        { message: "Current user ID is required" },
        { status: 400 }
      );
    }

    // Fetch current user's data
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    // Handle case when currentUser is not found
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch potential connections
    const potentialConnections = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
    });

    const recommendations = [];

    for (const user of potentialConnections) {
      const interestsMatch = calculateInterestsMatch(
        currentUser.interests,
        user.interests
      );
      const aiDescriptionMatch = calculateAIDescriptionMatch(
        currentUser.AIDescription || "",
        user.AIDescription || ""
      );
      const matchingPercentage = (interestsMatch + aiDescriptionMatch) / 2;

      console.log(
        `Matching ${user.username}: Interests Match: ${interestsMatch}, AI Description Match: ${aiDescriptionMatch}, Percentage: ${matchingPercentage}`
      );

      if (matchingPercentage >= 0.25) {
        // Check if recommendation already exists for the current user and the recommended user
        const existingRecommendation = await prisma.recommendations.findFirst({
          where: {
            userId: user.id,
            user: { id: currentUserId },
          },
        });

        // Log existing recommendations for debugging
        console.log(
          `Existing Recommendation for User ${user.id}:`,
          existingRecommendation
        );

        if (!existingRecommendation) {
          // Save new recommendation
          const newRecommendation = await prisma.recommendations.create({
            data: {
              userId: user.id, // Store the recommended user's ID
              matchingPercentage,
            },
          });

          console.log(newRecommendation);

          // Fetch the full user details
          const userDetails = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (userDetails?.email != null) {
            recommendations.push({
              userId: userDetails.id,
              username: userDetails.username,
              email: userDetails.email,
              interests: userDetails.interests,
              bio: userDetails.bio,
              profilePic: userDetails.profileaPic,
              AIDescription: userDetails.AIDescription,
              matchingPercentage,
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "Recommendations processed successfully",
        recommendations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing recommendations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateInterestsMatch(interests1: string[], interests2: string[]) {
  const matchCount = interests1.filter((interest) =>
    interests2.includes(interest)
  ).length;
  return matchCount / Math.max(interests1.length, interests2.length);
}

function calculateAIDescriptionMatch(
  description1: string,
  description2: string
) {
  return description1 === description2 ? 1 : 0;
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

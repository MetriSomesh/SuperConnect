import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function recommendConnections(currentUserId: number) {
  // Fetch current user's data
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  // Handle case when currentUser is not found
  if (!currentUser) {
    console.error("User not found");
    return;
  }

  // Continuously check for potential matches in the background
  const runRecommendation = async () => {
    const potentialConnections = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
    });

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

      if (matchingPercentage >= 0.25) {
        // Check if recommendation already exists for the recommended user
        const existingRecommendation = await prisma.recommendations.findFirst({
          where: { userId: user.id }, // Check if a recommendation for this user exists
        });

        if (!existingRecommendation) {
          // Save new recommendation
          await prisma.recommendations.create({
            data: {
              userId: user.id, // Store the recommended user's ID
              matchingPercentage,
            },
          });
        }
      }
    }

    // Continue running in intervals (e.g., every 1 minute)
    setTimeout(runRecommendation, 60000); // 60 seconds
  };

  // Start the loop
  runRecommendation();
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

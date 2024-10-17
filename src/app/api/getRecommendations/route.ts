// import { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { userId } = req.query; // Expecting userId to be passed as a query parameter

//   if (req.method === "GET") {
//     if (!userId || Array.isArray(userId)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }

//     try {
//       // Fetch recommendations for the specified user
//       const recommendations = await prisma.recommendations.findMany({
//         where: { userId: Number(userId) },
//         include: {
//           user: true, // Include user details
//         },
//       });

//       // Map the recommendations to include user info
//       const response = recommendations.map((rec) => ({
//         id: rec.id,
//         matchingPercentage: rec.matchingPercentage,
//         recommendedUser: {
//           id: rec.user.id,
//           email: rec.user.email,
//           username: rec.user.username,
//           profilePic: rec.user.profileaPic,
//           bio: rec.user.bio,
//           interests: rec.user.interests,
//           AIDescription: rec.user.AIDescription,
//           // Include any other fields you want to return
//         },
//       }));

//       return res.status(200).json(response);
//     } catch (error) {
//       console.error("Error fetching recommendations:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   } else {
//     // Handle unsupported methods
//     return res.status(405).json({ error: "Method not allowed" });
//   }
// }

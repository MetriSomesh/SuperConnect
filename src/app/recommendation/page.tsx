"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout"; // Assuming Layout is in the components folder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi"; // Importing an icon from React Icons
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader"; // Using react-spinners ClipLoader
import { getSession } from "next-auth/react"; // For fetching the user session
import axios from "axios"; // Importing axios

// Define the type for a recommendation object
interface RecommendedUser {
  userId: number; // Updated to match your API
  email: string;
  username: string;
  bio: string;
  interests: string[];
  AIDescription: string | null; // This can be null in your API
  profilePic: string | null; // This can be null in your API
}

interface Recommendation {
  matchingPercentage: number;
  recommendedUser: RecommendedUser;
}

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const router = useRouter();

  // Function to fetch recommendations
  const fetchRecommendations = async (userId: number) => {
    try {
      const response = await axios.post("/api/recommendation", {
        currentUserId: userId,
      });

      const recommendationData = response.data.recommendations.map(
        (rec: any) => ({
          matchingPercentage: rec.matchingPercentage,
          recommendedUser: {
            userId: rec.userId,
            email: rec.email,
            username: rec.username,
            bio: rec.bio,
            interests: rec.interests,
            AIDescription: rec.AIDescription,
            profilePic: rec.profilePic,
          },
        })
      );

      setRecommendations(recommendationData);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("An error occurred while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Get the user session and fetch recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);

      // Fetch the session and get userId
      const session = await getSession();
      const userId = session?.user?.id; // Assuming `id` is part of the session

      if (userId) {
        await fetchRecommendations(parseInt(userId));
      } else {
        setError("User session not found.");
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleCardClick = (userId: number) => {
    router.push(`/profile/${userId}`); // Navigate to the user's profile page
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <ClipLoader color="#36d7b7" loading={loading} size={50} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-white">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="recommendation-content p-4">
        <h2 className="text-3xl text-white mb-6 text-center">
          Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card
              key={index}
              className="bg-gray-800 text-white cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => handleCardClick(rec.recommendedUser.userId)}
            >
              <CardHeader className="flex flex-col items-center p-4">
                <div className="flex items-center justify-center w-24 h-24 mb-3 bg-gray-700 rounded-full">
                  <HiUserCircle className="w-16 h-16 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold">
                  {rec.recommendedUser.username}
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  {Math.round(rec.matchingPercentage * 100)}% Match
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="line-clamp-3">{rec.recommendedUser.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default RecommendationPage;

"use client";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { getSession } from "next-auth/react";

// Define interfaces for the user and recommendation
interface RecommendedUser {
  userId: number;
  name: string;
  username: string;
  bio: string;
  followers_count: number;
}

interface Recommendation {
  matchingPercentage: number;
  recommendedUser: RecommendedUser;
}

// Type for API response
interface ConnectionResponse {
  id: number;
  username: string;
  bio: string;
  followers_count: number;
  name: string;
}

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session or hardcoded user
        const session = await getSession();
        const currentUserId: number = parseInt(session?.user?.id || "1");
        setUserId(currentUserId);

        // First, check if there are connections of connections in the DB
        const connectionCheckResponse = await axios.post<ConnectionResponse[]>(
          "/api/getConnectionsofConnections",
          { userId: currentUserId }
        );

        if (connectionCheckResponse.data?.length > 0) {
          // If data exists, map and render the recommendations from the DB
          const recommendationsFromDb = connectionCheckResponse.data.map(
            (connection) => ({
              matchingPercentage: Math.random(), // Dummy matching logic
              recommendedUser: {
                userId: connection.id,
                username: connection.username,
                bio: connection.bio,
                followers_count: connection.followers_count,
                name: connection.name,
              },
            })
          );
          setRecommendations(recommendationsFromDb);
        } else {
          // Fetch account IDs for connections from the API
          const accountIdsResponse = await axios.post<number[]>(
            "/api/getConnectionsAccountId",
            { userId: currentUserId }
          );
          const accountIds = accountIdsResponse.data;

          const newRecommendations: Recommendation[] = [];

          for (const accountId of accountIds) {
            const twitterResponse = await axios.get<any>(
              `https://api.socialdata.tools/twitter/followers/list?user_id=${accountId}`,
              {
                headers: {
                  Authorization: `Bearer YOUR_API_KEY_HERE`, // Use your actual API key
                  Accept: "application/json",
                },
              }
            );

            const followers = twitterResponse.data.users;

            // Save the fetched followers as connections of connections
            await axios.post("/api/saveConnectionsOfConnections", {
              userId: currentUserId,
              followers: followers.map((follower: any) => ({
                connectionId: accountId,
                userId: follower.id,
              })),
            });

            // Add these followers to recommendations list
            followers.forEach((follower: any) => {
              newRecommendations.push({
                matchingPercentage: Math.random(), // Dummy matching logic
                recommendedUser: {
                  userId: follower.id,
                  username: follower.screen_name,
                  bio: follower.description,
                  followers_count: follower.followers_count,
                  name: follower.name,
                },
              });
            });
          }

          setRecommendations(newRecommendations);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to fetch recommendations.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <ClipLoader color="#A688FA" loading={loading} size={50} />
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
                  {rec.recommendedUser.name}
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  @{rec.recommendedUser.username}
                </p>
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

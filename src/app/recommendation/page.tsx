"use client";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { getSession } from "next-auth/react";

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

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const router = useRouter();

  const fetchFollowersForUser = async (accountId: string) => {
    try {
      const response = await axios.post<
        {
          id: number;
          id_str: string;
          description: string;
          followers_count: number;
          screen_name: string;
          name: string;
        }[]
      >("/api/fetchConnections", {
        userId: accountId,
      });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching followers for user ${accountId}:`, error);
      return [];
    }
  };

  const filterRecommendations = (
    allFollowers: {
      id: number;
      id_str: string;
      description: string;
      followers_count: number;
      screen_name: string;
      name: string;
    }[],
    currentUserId: number
  ) => {
    const uniqueFollowers = Array.from(
      new Map(allFollowers.map((f) => [f.id, f])).values()
    );

    return uniqueFollowers
      .filter((f) => f.id !== currentUserId)
      .sort((a, b) => b.followers_count - a.followers_count);
  };

  const calculateMatchingPercentage = (
    follower: {
      id: number;
      id_str: string;
      description: string;
      followers_count: number;
      screen_name: string;
      name: string;
    },
    totalFollowers: number
  ) => {
    console.log(totalFollowers);
    const followerScore = Math.min(follower.followers_count / 1000, 1);
    const randomFactor = 0.3;
    // return Math.min((followerScore + Math.random() * randomFactor) * 0.9, 1);
    return 1;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setProgress("Initializing...");
        const session = await getSession();
        const currentUserId: number = parseInt(session?.user?.id || "1");

        setProgress("Fetching your connections...");
        const accountIdsResponse = await axios.post<{
          message: string;
          data: string[];
        }>("/api/getConnectionsAccountId", { userId: currentUserId });
        const accountIds = accountIdsResponse.data.data;

        let allFollowersOfFollowers: {
          id: number;
          id_str: string;
          description: string;
          followers_count: number;
          screen_name: string;
          name: string;
        }[] = [];
        const totalAccounts = accountIds.length;

        for (let i = 0; i < accountIds.length; i++) {
          setProgress(`Analyzing connection ${i + 1} of ${totalAccounts}...`);
          const firstLevelFollowers = await fetchFollowersForUser(
            accountIds[i]
          );
          // firstLevelFollowers.forEach((follower) => {
          //   if (!allFollowersOfFollowers.some((f) => f.id === follower.id)) {
          //     allFollowersOfFollowers.push(follower);
          //   }
          // });
          allFollowersOfFollowers =
            allFollowersOfFollowers.concat(firstLevelFollowers);
        }

        setProgress("Processing recommendations...");
        const filteredFollowers = filterRecommendations(
          allFollowersOfFollowers,
          currentUserId
        );

        const newRecommendations = filteredFollowers
          .slice(0, 50)
          .map((follower) => ({
            matchingPercentage: calculateMatchingPercentage(
              follower,
              filteredFollowers.length
            ),
            recommendedUser: {
              userId: follower.id,
              username: follower.screen_name,
              bio: follower.description,
              followers_count: follower.followers_count,
              name: follower.name,
            },
          }));

        setRecommendations(newRecommendations);
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
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#A688FA" loading={loading} size={50} />
          <p className="mt-4 text-white text-center">{progress}</p>
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

  if (recommendations.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-white">
          <p>No recommendations available.</p>
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
              className={`bg-gray-800 text-white cursor-pointer transition-transform transform hover:scale-105 ${
                rec.matchingPercentage === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={
                rec.matchingPercentage > 0
                  ? () => handleCardClick(rec.recommendedUser.userId)
                  : undefined
              }
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

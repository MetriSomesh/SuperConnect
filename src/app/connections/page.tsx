"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi";
import Layout from "@/components/Layout";

interface User {
  userId: number;
  username: string;
  descripiton: string;
  profileImageUrl?: string;
  name: string;
  followers: number;
}

interface TwitterFollower {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url_https: string;
  followers_count: number;
  location: string;
}

const ConnectionPage = () => {
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const router = useRouter();

  const fetchConnections = async () => {
    if (dataFetched) return;
    setLoading(true);
    try {
      const session = await getSession();
      const userId = parseInt(session?.user?.id || "");

      // First API call to get connections from the database
      const connectionResponse = await axios.post("/api/getconnections", {
        userId: userId,
      });

      if (
        connectionResponse.data &&
        connectionResponse.data.Connections &&
        connectionResponse.data.Connections.length > 0
      ) {
        setConnections(connectionResponse.data.Connections);
      } else {
        // If no connections, proceed to fetch Twitter ID
        const twitterIdResponse = await axios.post("/api/getTwitterId", {
          email: session?.user?.email,
        });

        if (twitterIdResponse.data) {
          const accountId = twitterIdResponse.data.twitter_info.account_id;
          console.log("Account ID:", accountId);

          // Use the new API route instead of calling socialdata.tools directly
          const twitterResponse = await axios.post("/api/fetchConnections", {
            userId: accountId,
          });

          console.log(
            "Twitter Followers Response:",
            twitterResponse.data.users
          );

          if (
            twitterResponse.data &&
            Array.isArray(twitterResponse.data.users)
          ) {
            const followers: TwitterFollower[] = twitterResponse.data.users;

            // Save the followers to the database
            await axios.post("/api/saveAllFollowers", {
              userId,
              followers,
            });

            // Convert Twitter followers to User format and set as connections
            const formattedConnections: User[] = followers.map((follower) => ({
              userId: parseInt(follower.id),
              username: follower.username,
              descripiton: follower.description || "",
              profileImageUrl: follower.profile_image_url_https,
              name: follower.name,
              followers: follower.followers_count,
            }));

            setConnections(formattedConnections);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
      }
    } finally {
      setLoading(false);
      setDataFetched(true);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [dataFetched]);

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

  return (
    <Layout>
      <div className="connections-content p-4">
        <h2 className="text-3xl text-white mb-6 text-center">Connections</h2>
        {connections.length === 0 ? (
          <div className="text-center text-white text-xl">
            There are no connections
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <Card
                key={connection.userId}
                className="bg-gray-800 text-white cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleCardClick(connection.userId)}
              >
                <CardHeader className="flex flex-col items-center p-4">
                  <div className="flex items-center justify-center w-24 h-24 mb-3 bg-gray-700 rounded-full">
                    {connection.profileImageUrl ? (
                      <img
                        src={connection.profileImageUrl}
                        alt={connection.username}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <HiUserCircle className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  {/* Render the name (if available) and username with "@" */}
                  <CardTitle className="text-xl font-bold">
                    {connection.name}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    @{connection.username}
                  </p>
                  <p className="text-sm text-gray-400">
                    Followers:{connection.followers}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConnectionPage;

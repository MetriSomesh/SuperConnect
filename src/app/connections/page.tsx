"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout"; // Assuming Layout is in the components folder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi"; // Importing an icon from React Icons
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader"; // Using react-spinners ClipLoader
import { getSession } from "next-auth/react"; // For fetching the user session

// Define the type for a user object
interface User {
  userId: number;
  username: string;
  bio: string;
  interests: string[];
  profilePic: string | null;
}

const ConnectionPage = () => {
  const [connections, setConnections] = useState<User[]>([
    {
      userId: 1,
      username: "Sammy",
      bio: "Passionate about technology and innovation. Always exploring new trends in AI and Web Development",
      interests: ["Developer", "Traveller"],
      profilePic: null,
    },
    {
      userId: 2,
      username: "User2",
      bio: "Entrepreneur with a passion for startups and innovation. Always looking for the next big idea",
      interests: ["Developer", "Entrepreneur"],
      profilePic: null,
    },
    // Add more hardcoded users as needed
  ]);

  const router = useRouter();

  const handleCardClick = (userId: number) => {
    router.push(`/profile/${userId}`); // Navigate to the user's profile page
  };

  return (
    <Layout>
      <div className="connections-content p-4">
        <h2 className="text-3xl text-white mb-6 text-center">Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <Card
              key={connection.userId}
              className="bg-gray-800 text-white cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => handleCardClick(connection.userId)}
            >
              <CardHeader className="flex flex-col items-center p-4">
                <div className="flex items-center justify-center w-24 h-24 mb-3 bg-gray-700 rounded-full">
                  <HiUserCircle className="w-16 h-16 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold">
                  {connection.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="line-clamp-3">{connection.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ConnectionPage;

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTwitter, FaUserCircle } from "react-icons/fa"; // Importing user icon
import { Button } from "@/components/ui/button";
import axios from "axios";

interface ProfileData {
  username: string;
  bio: string;
  interests: string[];
  AIDescription: string;
  profilePic: string;
  email: string;
  location?: string;
  twitter?: boolean;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isInvited, setIsInvited] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(params.id);
        const response = await axios.post(`/api/getUserDetails`, { id });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, params.id]);

  const handleConnect = async () => {
    try {
      const response = await axios.post(`/api/sendInvitation`, {
        receiverId: parseInt(params.id),
        senderId: parseInt(session?.user.id || ""),
      });

      if (response.status === 200) {
        setIsInvited(true);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
    }
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-100 bg-[#121212]">
        <p>Loading...</p>
      </div>
    );
  }

  const isFromRecommendation =
    session && parseInt(params.id) !== Number(session.user.id);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-[#121212] text-gray-100 p-10">
        <div className="flex gap-10 mb-10">
          {/* First Card */}
          <Card className="w-8/12 bg-[#1f1f1f] border border-gray-700 p-5">
            <CardHeader className="text-center">
              <CardTitle className="font-bold">
                {profileData.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt="Profile Picture"
                  className="w-32 h-32 border-4 border-[#A688FA] mb-6 rounded-full"
                />
              ) : (
                <FaUserCircle className="w-32 h-32 text-gray-500 mb-6" />
              )}
              <div className="text-center mb-6">
                <span className="font-bold">Connected Accounts</span>
                <div className="flex items-center justify-center mt-2">
                  <FaTwitter className="text-[#1DA1F2] text-2xl" />
                  {profileData.twitter && (
                    <span className="ml-2 text-gray-400">
                      Twitter Connected
                    </span>
                  )}
                </div>
              </div>
              {isFromRecommendation && (
                <div className="flex space-x-4 mt-4">
                  <Button
                    className={`${
                      isInvited ? "bg-green-600" : "bg-[#A688FA]"
                    } hover:bg-secondary`}
                    onClick={handleConnect}
                    disabled={isInvited}
                  >
                    {isInvited ? "Sent" : "Connect"}
                  </Button>
                  <Button className="bg-[#A688FA] hover:bg-secondary">
                    Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Second Card */}
          <Card className="w-full bg-[#1f1f1f] border border-gray-700 p-5">
            <CardHeader>
              <CardTitle className="font-bold">
                {profileData.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-2">Email: {session?.user.email}</p>
              <p className="text-gray-400 mb-4">
                Username: {profileData.username}
              </p>
              <h3 className="font-bold mt-4">Bio</h3>
              <p className="text-gray-400 mb-4">{profileData.bio}</p>
              <h3 className="font-bold mt-4">Interests</h3>
              <div className="flex flex-wrap mt-2">
                {profileData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-gray-700 px-4 py-2 rounded-lg text-sm mr-2 mb-2"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Card */}
        <Card className="w-full mt-10 bg-[#1f1f1f] border border-gray-700 p-5">
          <CardHeader>
            <CardTitle className="font-bold">AI Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">{profileData.AIDescription}</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

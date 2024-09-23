"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout"; // Assuming Layout is in the components folder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiUserCircle } from "react-icons/hi"; // Importing an icon from React Icons
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader"; // Using react-spinners ClipLoader
import { getSession } from "next-auth/react"; // For fetching the user session
import axios from "axios"; // Importing axios

// Define the type for an invitation object
interface Invitation {
  id: number;
  senderId: number;
  senderUsername: string;
  senderBio: string;
}

const InvitationPage = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const router = useRouter();

  // Function to fetch invitations
  const fetchInvitations = async (userId: number) => {
    try {
      const response = await axios.post("/api/getInvitation", {
        userId,
      });

      setInvitations(response.data.invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setError("An error occurred while fetching invitations.");
    } finally {
      setLoading(false);
    }
  };

  // Get the user session and fetch invitations
  useEffect(() => {
    const loadInvitations = async () => {
      setLoading(true);

      const session = await getSession();
      const userId = session?.user?.id; // Assuming `id` is part of the session

      if (userId) {
        await fetchInvitations(parseInt(userId));
      } else {
        setError("User session not found.");
        setLoading(false);
      }
    };

    loadInvitations();
  }, []);

  const handleAccept = async (invitationId: number) => {
    try {
      await axios.post("/api/acceptInvitation", { invitationId });
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleReject = async (invitationId: number) => {
    try {
      await axios.post("/api/acceptInvitation", { invitationId });
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

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
      <div className="invitation-content p-4">
        <h2 className="text-3xl text-white mb-6 text-center">Invitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <Card
              key={inv.id}
              className="bg-gray-800 text-white cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => handleCardClick(inv.senderId)}
            >
              <CardHeader className="flex flex-col items-center p-4">
                <div className="flex items-center justify-center w-24 h-24 mb-3 bg-gray-700 rounded-full">
                  <HiUserCircle className="w-16 h-16 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold">
                  {inv.senderUsername}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="line-clamp-3">{inv.senderBio}</p>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-green-600 px-4 py-2 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(inv.id);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-600 px-4 py-2 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(inv.id);
                    }}
                  >
                    Reject
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default InvitationPage;

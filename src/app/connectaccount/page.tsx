"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTwitter } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function ConnectAccount() {
  const router = useRouter();
  const { data: session } = useSession(); // Get the session data
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState({
    twitter: false,
    facebook: false,
    instagram: false,
  });

  useEffect(() => {
    // Fetch the access token when the component mounts
    const fetchAccessToken = async () => {
      if (session?.user?.email) {
        try {
          const res = await axios.post("/api/getTwitterTokens", {
            email: session.user.email,
          });
          const token = res.data.accessToken;
          if (token) {
            setAccessToken(token);
            await fetchAndSaveTwitterProfile(token); // Fetch and save the Twitter profile
          }
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      }
    };

    fetchAccessToken();
  }, [session]);

  // Function to fetch and save the Twitter profile
  const fetchAndSaveTwitterProfile = async (token: string) => {
    try {
      const res = await axios.post("/api/fetchTwitter", { accessToken: token });
      const twitterData = res.data;

      // Save Twitter data to DB
      await axios.post("/api/saveTwitterProfile", {
        userId: parseInt(session?.user?.id || ""), // Assuming you have access to session user ID
        account_id: twitterData.data.id.toString(),
        username: twitterData.data.username,
        name: twitterData.data.name,
        descripiton: twitterData.data.description,
        location: twitterData.data.location,
      });
      setConnectedAccounts((prev) => ({ ...prev, twitter: true }));
    } catch (error) {
      console.error("Error fetching and saving Twitter profile:", error);
    }
  };
  const handlePostAndNavigate = async (url: string) => {
    // Make the POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Navigate after a successful POST request
      router.push("/dashboard");
    } else {
      console.error("POST request failed");
    }
  };

  const handleConnectTwitter = async () => {
    const res = await axios.post("/api/twitterauth/auth");
    const url = res.data.url;

    if (url) {
      handlePostAndNavigate(url);
    }
  };

  const isAtLeastOneConnected = Object.values(connectedAccounts).some(
    (account) => account === true
  );

  const handleNext = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-gray-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-lg bg-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Connect Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-400 text-center">
            At least one account should be connected.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Connect Twitter</span>
              <Button
                onClick={handleConnectTwitter}
                disabled={!!accessToken} // Disable if accessToken is present
                className={`${
                  accessToken
                    ? "bg-green-600 hover:bg-green-500"
                    : connectedAccounts.twitter
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
              >
                <FaTwitter className="mr-2 text-lg" />
                {accessToken
                  ? "Connected"
                  : connectedAccounts.twitter
                  ? "Connected"
                  : "Connect"}
              </Button>
            </div>

            {/* Add Facebook and Instagram as well */}
          </div>

          <Button
            onClick={handleNext}
            disabled={
              !isAtLeastOneConnected && !(accessToken && accessToken.trim())
            }
            className={`mt-5 w-full ${
              isAtLeastOneConnected || (accessToken && accessToken.trim())
                ? "bg-[#A688FA] hover:bg-secondary"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

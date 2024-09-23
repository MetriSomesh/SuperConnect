"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
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
          }); // Adjust the endpoint accordingly
          setAccessToken(res.data.accessToken);
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      }
    };

    fetchAccessToken();
  }, [session]);

  const handleConnectTwitter = async () => {
    const res = await axios.get("/api/twitter/auth");
    const url = res.data;

    if (url) {
      router.push(url);
    }
  };

  const isAtLeastOneConnected = Object.values(connectedAccounts).some(
    (account) => account === true
  );

  const handleAccountConnect = (
    account: "twitter" | "facebook" | "instagram"
  ) => {
    setConnectedAccounts((prevState) => ({
      ...prevState,
      [account]: !prevState[account],
    }));
  };

  const handleNext = () => {
    if (isAtLeastOneConnected) {
      // Proceed to the next step (handle navigation here, e.g., router.push("/nextpage"))
      console.log("Navigating to the next page");
      router.push("/analyse");
    }
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

            <div className="flex items-center justify-between">
              <span className="text-lg">Connect Facebook</span>
              <Button
                onClick={() => handleAccountConnect("facebook")}
                className={`${
                  connectedAccounts.facebook
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-blue-700 hover:bg-blue-600"
                }`}
              >
                <FaFacebook className="mr-2 text-lg" />
                {connectedAccounts.facebook ? "Connected" : "Connect"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg">Connect Instagram</span>
              <Button
                onClick={() => handleAccountConnect("instagram")}
                className={`${
                  connectedAccounts.instagram
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-pink-500 hover:bg-pink-400"
                }`}
              >
                <FaInstagram className="mr-2 text-lg" />
                {connectedAccounts.instagram ? "Connected" : "Connect"}
              </Button>
            </div>
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

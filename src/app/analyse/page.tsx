"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SequentialApiCalls() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loadingText, setLoadingText] = useState("Getting ready...");
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [error, setError] = useState(false);

  const apiCalls = [
    { text: "Getting Twitter Tokens...", api: "/api/getTwitterTokens" },
    { text: "Fetching Twitter Data...", api: "/api/fetchTwitter" },
    { text: "Analyzing Social Data...", api: "/api/socialAnalysis" },
    { text: "Saving Analysis Data...", api: "/api/saveAnalysis" },
  ];

  const email = session?.user?.email; // Fetch the user's email from the session
  const prompt =
    "Analyze the user's Twitter profile description and suggest improvements.";

  const callApi = async () => {
    try {
      setLoadingText(apiCalls[0].text);

      // Step 1: Get Twitter Tokens
      const tokenResponse = await fetch(apiCalls[0].api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!tokenResponse.ok) throw new Error("Error in Step 1");
      const tokenData = await tokenResponse.json();

      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[0] = true;
        return newSteps;
      });
      setStep(1);

      // Step 2: Fetch Twitter Data
      setLoadingText(apiCalls[1].text);
      const twitterResponse = await fetch(apiCalls[1].api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: tokenData.accessToken }),
      });
      if (!twitterResponse.ok) throw new Error("Error in Step 2");
      const twitterData = await twitterResponse.json();

      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[1] = true;
        return newSteps;
      });
      setStep(2);

      // Step 3: Analyze Social Data
      setLoadingText(apiCalls[2].text);
      const analysisResponse = await fetch(apiCalls[2].api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterDescription: twitterData.description,
          prompt: prompt,
        }),
      });
      if (!analysisResponse.ok) throw new Error("Error in Step 3");
      const analysisData = await analysisResponse.json();

      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[2] = true;
        return newSteps;
      });
      setStep(3);

      // Step 4: Save Analysis
      setLoadingText(apiCalls[3].text);
      const saveResponse = await fetch(apiCalls[3].api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          ai_description: analysisData.analysis,
        }),
      });
      if (!saveResponse.ok) throw new Error("Error in Step 4");

      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[3] = true;
        return newSteps;
      });
      setStep(4);
    } catch (error) {
      console.error("API Error:", error);
      setError(true);
    }
  };

  useEffect(() => {
    // Ensure the session has loaded and email is available before starting the API calls
    if (
      status === "authenticated" &&
      email &&
      step < apiCalls.length &&
      !error
    ) {
      callApi();
    }
  }, [status, email, step, error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-gray-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-lg bg-[#1f1f1f] border border-gray-700 transition-transform transform hover:scale-105">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-[#A688FA]">
            Please Wait
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {error ? (
            <p className="text-sm text-red-400 text-center">
              Something went wrong. Please refresh the page.
            </p>
          ) : completedSteps.every((completed) => completed) ? (
            <p className="text-sm text-gray-400 text-center">Done!</p>
          ) : (
            <p className="text-sm text-gray-400 text-center">{loadingText}</p>
          )}

          {apiCalls.map((apiCall, index) => (
            <div
              key={index}
              className="flex items-center w-full justify-between text-gray-300"
            >
              <div className="flex items-center">
                {index === step && !completedSteps[index] ? (
                  <FaSpinner className="animate-spin text-gray-500 mr-3 text-xl" />
                ) : completedSteps[index] ? (
                  <FaCheckCircle className="text-green-500 mr-3 text-xl" />
                ) : (
                  <div className="text-gray-500 mr-3 text-xl" />
                )}
                <span className="text-lg">{apiCall.text}</span>
              </div>
              {completedSteps[index] && (
                <span className="text-green-500 text-sm">Completed</span>
              )}
            </div>
          ))}

          {completedSteps.every((completed) => completed) && !error && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="mt-5 w-full bg-[#A688FA] hover:bg-secondary transition-colors duration-300"
            >
              Next
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

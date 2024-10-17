"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const handleGoogleSignUp = () => {
  //   signIn("google", { callbackUrl: "/" });
  // };

  // const handleTwitterSignUp = () => {
  //   signIn("twitter", { callbackUrl: "/" });
  // };

  // const handleFacebookSignUp = () => {
  //   signIn("facebook", { callbackUrl: "/" });
  // };

  const handleSignUp = async () => {
    try {
      const newUser = await axios.post("api/signup", {
        email,
        password,
      });

      if (newUser) {
        router.push("/signin");
      }
    } catch (error) {
      console.log("Something went wrong: ", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-gray-100">
      <Card className="w-full max-w-md p-8 space-y-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-1 w-full mb-3"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <Button
            type="submit"
            className="mt-5 mr-2 mb-5 w-full bg-[#A688FA] hover:bg-secondary"
            onClick={handleSignUp}
          >
            Continue
          </Button>
          {/* <div className="mt-5 mx-5 flex items-center justify-center ">
            <Button
              onClick={handleGoogleSignUp}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Continue with
              <FcGoogle className="inline ml-2 text-xl" />
            </Button>
          </div>
          <div className="mt-5 mx-5 flex items-center justify-center">
            <Button
              onClick={handleTwitterSignUp}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Continue with
              <FaXTwitter className="inline ml-2 text-xl" />
            </Button>
          </div>
          <div className="mt-5 mx-5 flex items-center justify-center">
            <Button
              onClick={handleFacebookSignUp}
              className="w-full bg-blue-800 hover:bg-blue-900"
            >
              Continue with
              <FaFacebook className="inline ml-2 text-xl" />
            </Button>
          </div> */}
        </CardContent>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const interestsOptions = [
  { value: "developer", label: "Developer" },
  { value: "entertainment", label: "Entertainment" },
  { value: "movies", label: "Movies" },
  // Add more interests as needed
];

export default function SetupAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [profileaPic, setProfileaPic] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  // Set email when session is available
  useEffect(() => {
    if (session && session.user && session.user.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  // Ensure the session is available
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/signin"); // Redirect to signin if not authenticated
    return null;
  }

  // Form validation
  const validateForm = () => {
    if (!username || !bio || interests.length === 0 || !profileaPic) {
      setError("All fields are mandatory. Please fill in all the fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous error messages
    setError("");

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post("/api/setupaccount", {
        username,
        bio,
        interests,
        email,
        profileaPic,
      });

      if (response.status === 200) {
        router.push("/connectaccount");
        console.log(response);
      }
    } catch (error: any) {
      console.error("Something went wrong: ", error);

      if (error.response && error.response.status === 500) {
        setError("Database connection failed. Please try again later.");
      } else {
        setError("Unable to save changes, please try again.");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/picupload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.imageUrl) {
          setProfileaPic(data.imageUrl.toString());
        } else {
          throw new Error(data.message || "Error uploading image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setError(
          "Image size must be less than 10mb or choose a different image"
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-gray-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Setup Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center mb-5">
            <FaUserCircle className="text-6xl text-gray-500" />
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-3 w-full"
            />
          </div>

          <div>
            <Label htmlFor="username" className="block text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full bg-[#1f1f1f] border-gray-600 focus:border-[#A688FA]"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="block text-sm font-medium">
              Bio
            </Label>
            <Input
              id="bio"
              type="text"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="mt-1 w-full bg-[#1f1f1f] border-gray-600 focus:border-[#A688FA]"
            />
          </div>

          <div>
            <Label htmlFor="interests" className="block text-sm font-medium">
              Interests
            </Label>
            <Select
              id="interests"
              options={interestsOptions}
              isMulti
              onChange={(selectedOptions: any) => {
                setInterests(
                  selectedOptions.map((option: any) => option.value)
                );
              }}
              className="mt-1 w-full"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#1F1F1F",
                  borderColor: "gray",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "#A688FA",
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "white",
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "white",
                  "&:hover": {
                    backgroundColor: "red",
                    color: "white",
                  },
                }),
              }}
              required
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button
            onClick={handleSubmit}
            className="mt-5 bg-[#A688FA] hover:bg-secondary w-full"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
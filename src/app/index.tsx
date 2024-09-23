import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AppBar = ({ toggleDarkMode, isDarkMode }: any) => (
  <header className="flex justify-between items-center p-4 bg-background">
    <h1 className="text-2xl font-bold text-primary">AI Automation</h1>
    <nav className="flex items-center space-x-4">
      <Button variant="ghost">Sign In</Button>
      <Button>Sign Up</Button>
      <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
        {isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
    </nav>
  </header>
);

const SignInForm = () => (
  <form className="space-y-4">
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Button className="w-full">Sign In</Button>
  </form>
);

const SignUpForm = () => (
  <form className="space-y-4">
    <Input type="text" placeholder="Full Name" />
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Input type="password" placeholder="Confirm Password" />
    <Button className="w-full">Sign Up</Button>
  </form>
);

const Footer = () => (
  <footer className="mt-8 py-4 text-center bg-muted">
    <p>&copy; 2024 AI Automation. All rights reserved.</p>
  </footer>
);

const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const toggleDarkMode = () => setTheme(isDarkMode ? "light" : "dark");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppBar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to AI Automation</CardTitle>
              <CardDescription>
                Sign in or create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;

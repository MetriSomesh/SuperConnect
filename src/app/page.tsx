"use client";
import SessionTest from "@/components/session";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";

export default function Home() {
  const { data: session } = useSession();

  const handleSignIn = () => {
    // Redirect to the Sign In page
    window.location.href = "/signin";
  };

  const handleSignUp = () => {
    // Redirect to the Sign In page
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-darkBg text-lightText">
      <Head>
        <title>AI Social Platform</title>
        <meta
          name="description"
          content="AI-powered social networking platform"
        />
      </Head>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="text-2xl font-bold text-primary">SuperConnect</div>
        <div>
          <a
            href="#"
            className="px-4 py-2 text-sm font-semibold hover:text-primary"
          >
            Features
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-semibold hover:text-primary"
          >
            Pricing
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-semibold hover:text-primary"
          >
            Contact
          </a>
          <button
            className="px-4 py-2 ml-4 bg-primary text-darkBg rounded-lg font-bold"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
          {session ? (
            <button
              className="px-4 py-2 ml-4 bg-red-500 text-darkBg rounded-lg font-bold"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="px-4 py-2 ml-4 bg-primary text-darkBg rounded-lg font-bold"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="mt-32 text-5xl font-extrabold text-lightText leading-tight md:text-7xl">
          Connect, Collaborate, Automate <br /> with AI
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-3xl">
          An AI-powered social networking platform to help you build meaningful
          connections, collaborate seamlessly, and automate your life.
        </p>
        <a
          href="#features"
          className="mt-10 px-8 py-4 bg-primary text-darkBg rounded-lg text-lg font-semibold hover:bg-secondary"
        >
          Get Started
        </a>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24">
        <h2 className="text-4xl font-bold text-center">Why Choose Us?</h2>
        <div className="grid grid-cols-1 gap-12 mt-12 text-center md:grid-cols-3">
          <div className="ml-5 p-6 bg-[#282828] rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-primary">
              AI-Powered Connections
            </h3>
            <p className="mt-4">
              Our platform suggests and automates meaningful connections based
              on your data.
            </p>
          </div>
          <div className="p-6 bg-[#282828] rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-primary">
              Effortless Collaboration
            </h3>
            <p className="mt-4 text-white">
              Coordinate with your network efficiently, with AI drafting
              conversations and actions for you.
            </p>
          </div>
          <div className="mr-5 p-6 bg-[#282828] rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-primary">
              Global Opportunities
            </h3>
            <p className="mt-4 text-white">
              Access global collaborations and actions, and contribute to a
              better-connected world.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#282828]">
        <div className="container px-6 mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary">
            Join the Revolution
          </h2>
          <p className="mt-4 text-white">
            Sign up today to start building your AI-powered network!
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="px-6 py-3 text-lg font-semibold bg-primary text-darkBg rounded-lg hover:bg-secondary"
            >
              Get Started
            </a>
          </div>
          <div className="mt-8 text-gray-400">
            © 2024 SuperConnect. All rights reserved.
          </div>
        </div>
      </footer>
      <SessionTest />
    </div>
  );
}

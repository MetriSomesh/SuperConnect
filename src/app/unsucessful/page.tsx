"use client";
import SessionTest from "@/components/session";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";

export default function Unsucessful() {
  return (
    <div className="min-h-screen bg-darkBg text-lightText">
      Failed to authicate twitter
    </div>
  );
}

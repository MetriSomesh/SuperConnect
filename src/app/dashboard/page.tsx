"use client";
import Layout from "@/components/Layout";
import { useState } from "react";
import {
  FaUser,
  FaBell,
  FaCog,
  FaComments,
  FaUsers,
  FaStream,
} from "react-icons/fa";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");

  const sidebarItems = [
    { name: "Profile", icon: <FaUser /> },
    { name: "Recommendation", icon: <FaStream /> },
    { name: "Connections", icon: <FaUsers /> },
    { name: "Messages", icon: <FaComments /> },
    { name: "Notifications", icon: <FaBell /> },
    { name: "Settings", icon: <FaCog /> },
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-[#A688FA] mb-10">Dashboard</h1>
      <p className="text-gray-400">
        Welcome to your dashboard! Here, you'll see analytics.
      </p>
    </Layout>
  );
}

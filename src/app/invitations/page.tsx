"use client";
import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import Layout from "@/components/Layout";

const InvitationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    // Simulate initial loading for 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = () => {
    setApproveLoading(true);
    // Simulate 2-second loading for approval
    setTimeout(() => {
      setApproveLoading(false);
      setApproved(true);
    }, 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <ClipLoader color="#A688FA" loading={loading} size={50} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-10 text-white">
        <h2 className="text-2xl font-bold mb-4">Invitations</h2>
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="mb-4">
            @somesh_metri4 wants to connect with @somesh_metri2, their profile
            matching percentage is 75%. What should I do?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={approveLoading || approved}
              className={`px-4 py-2 rounded-md text-white ${
                approveLoading || approved
                  ? "bg-green-500"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {approveLoading
                ? "Approving..."
                : approved
                ? "Approved"
                : "Approve"}
            </button>
            <button
              disabled={approveLoading || approved}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvitationsPage;

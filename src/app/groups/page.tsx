"use client";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ClipLoader } from "react-spinners";

const GroupPage = () => {
  const [messages, setMessages] = useState([
    { sender: "someshmetri_2", content: "Hello there!" },
    { sender: "someshmetri_4", content: "How can I help you?" },
  ]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "Me", content: newMessage }]);
      setNewMessage("");
    }
  };
  useEffect(() => {
    // Simulate initial loading for 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="flex flex-col h-full text-white p-6">
        <h2 className="text-4xl font-bold text-[#A688FA] mb-6">Group Chat</h2>

        {/* Chat Messages Container */}
        <div className="flex-grow bg-[#1f1f1f] rounded-lg shadow-lg p-6 overflow-y-auto mb-6">
          {messages.length ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "Me" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-md ${
                    msg.sender === "Me"
                      ? "bg-blue-600 text-right"
                      : "bg-gray-700 text-left"
                  }`}
                >
                  <strong className="block">{msg.sender}:</strong>
                  <span>{msg.content}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No messages yet</p>
          )}
        </div>

        {/* Input & Send Button */}
        <div className="flex items-center bg-[#121212] p-4 rounded-lg shadow-md">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-gray-700 p-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A688FA] placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="ml-4 bg-[#A688FA] px-6 py-3 rounded-lg text-white font-semibold hover:bg-[#8c68fa] transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default GroupPage;

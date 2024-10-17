// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname for current path
import { FaUser, FaBell, FaCog, FaUsers, FaStream } from "react-icons/fa";

const Layout = ({ children }: any) => {
  const router = useRouter();
  const pathname = usePathname(); // Get current route path
  const [activeSection, setActiveSection] = useState("Dashboard");

  const sidebarItems = [
    { name: "Profile", icon: <FaUser />, path: "/profile/3" },
    { name: "Recommendation", icon: <FaStream />, path: "/recommendation" },
    { name: "Social Connections", icon: <FaUsers />, path: "/connections" },
    { name: "Invitations", icon: <FaUsers />, path: "/invitations" }, // New Invitations Section
    { name: "Groups", icon: <FaUsers />, path: "/groups" }, // New Groups Section
    { name: "Notifications", icon: <FaBell />, path: "/notifications" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  // Update activeSection based on current route path
  useEffect(() => {
    const currentSection = sidebarItems.find(
      (item) => item.path === pathname
    )?.name;
    if (currentSection) {
      setActiveSection(currentSection);
    }
  }, [pathname]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex bg-[#121212] text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1f1f1f] p-5 border-r border-gray-700">
        <h2 className="text-2xl font-bold text-[#A688FA] mb-6">
          SupperConnect
        </h2>
        <nav>
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center p-3 mb-3 cursor-pointer rounded-lg transition-colors ${
                activeSection === item.name
                  ? "bg-[#A688FA] text-black"
                  : "hover:bg-gray-700"
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-10 bg-[#1A1A1A]">{children}</div>
    </div>
  );
};

export default Layout;

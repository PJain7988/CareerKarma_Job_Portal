import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isHrDashboard = location.pathname.startsWith("/hr-dashboard");

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    
    if (token && userInfo) {
      setLoggedIn(true);
      try {
        const parsedUser = JSON.parse(userInfo);
        if (!currentUser || currentUser.id !== parsedUser.id) {
            setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user info", error);
      }
    } else {
      if (loggedIn) {
          setLoggedIn(false);
          setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    checkLogin(); 
    const interval = setInterval(checkLogin, 500);
    return () => clearInterval(interval); 
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("role");

    setLoggedIn(false);
    setCurrentUser(null);
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  const getLogoLink = () => {
    if (currentUser?.role === "recruiter") {
        return "/hr-dashboard/job-management";
    }
    return "/jobs";
  };

  const userTabs = [
    { to: "/jobs", label: "Jobs" },
    { to: "/courses", label: "LMS" },
    { to: "/resume", label: "Resume Builder" },
    { to: "/resume-analyser", label: "Resume Analyser" },
    { to: "/quiz/js-basics", label: "Quiz" },
    { to: "/my-applications", label: "My Applications" },
  ];

  const hrTabs = [
    { to: "/hr-dashboard/job-management", label: "Job Management" },
    { to: "/hr-dashboard/applications", label: "Applications" },
    { to: "/hr-dashboard/course-management", label: "Course Management" },
    { to: "/hr-dashboard/quiz-management", label: "Quiz Management" },
    { to: "/hr-dashboard/analytics", label: "Analytics" },
  ];

  if (isAuthPage) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between py-4 px-6">
        
        <Link
          to={getLogoLink()}
          className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-500 transition-all duration-300"
        >
          CareerKarma
        </Link>

        <button
          className="block md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className={`w-full md:flex md:items-center md:w-auto ${isOpen ? "block" : "hidden"}`}>
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 mt-4 md:mt-0">
            {(isHrDashboard 
                ? hrTabs 
                : (loggedIn 
                    ? userTabs
                    : [{ to: "/jobs", label: "Jobs" }]
                  )
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200 text-base"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {loggedIn ? (
              <div className="flex items-center gap-3 ml-2 pl-2 md:border-l md:border-gray-300 mt-2 md:mt-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 cursor-default">
                  <div className="bg-indigo-600 text-white p-1 rounded-full">
                    <User size={14} />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-indigo-900">
                      {currentUser?.name || "User"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                      {currentUser?.role || "Member"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 text-lg font-medium mt-2 md:mt-0"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
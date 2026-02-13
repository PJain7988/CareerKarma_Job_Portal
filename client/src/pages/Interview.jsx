import React, { useState } from "react";
import { Play, Briefcase, Calendar, Users, CheckCircle } from "lucide-react";

const interviewData = [
  {
    id: 1,
    title: "Frontend Developer Interview",
    company: "TechCorp",
    duration: "30 mins",
    candidates: 120,
    progress: 20,
    status: "Pending",
  },
  {
    id: 2,
    title: "Backend Developer Interview",
    company: "CodeBase",
    duration: "45 mins",
    candidates: 90,
    progress: 50,
    status: "In Progress",
  },
  {
    id: 3,
    title: "Full Stack Developer Interview",
    company: "DevSolutions",
    duration: "60 mins",
    candidates: 150,
    progress: 100,
    status: "Completed",
  },
  {
    id: 4,
    title: "UI/UX Designer Interview",
    company: "DesignHub",
    duration: "40 mins",
    candidates: 80,
    progress: 0,
    status: "Pending",
  },
];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

const InterviewDashboard = () => {
  const [filter, setFilter] = useState("All");

  const filteredInterviews =
    filter === "All"
      ? interviewData
      : interviewData.filter((i) => i.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Interview Dashboard
      </h1>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        {["All", "Pending", "In Progress", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors
              ${filter === f ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-blue-100"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Interview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredInterviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-transform transform hover:-translate-y-2"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {interview.title}
              </h2>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full ${statusColors[interview.status]}`}
              >
                {interview.status}
              </span>
            </div>

            {/* Company & Info */}
            <p className="text-gray-500 mb-4 flex items-center gap-2">
              <Briefcase size={16} /> {interview.company}
            </p>
            <div className="flex justify-between items-center text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar size={16} /> {interview.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} /> {interview.candidates}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full ${
                  interview.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${interview.progress}%` }}
              ></div>
            </div>

            {/* Start Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors">
              <Play size={18} /> {interview.status === "Completed" ? "View" : "Start"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewDashboard;

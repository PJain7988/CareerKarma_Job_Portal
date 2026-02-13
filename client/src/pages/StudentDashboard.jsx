import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, BookOpen, Calendar, Eye, CheckCircle, AlertCircle, Bell } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/student/profile");
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const [notifications, setNotifications] = useState([
    { type: "interview", title: "Senior Developer", date: "2025-09-20", time: "02:00 PM" },
    { type: "course", title: "Advanced React Patterns" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification bell */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full bg-indigo-500 text-white shadow hover:bg-indigo-600 transition"
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
          )}
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto mt-6 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-indigo-600 font-bold text-xl shadow-md">
              {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome back, {student?.name || "Student"}!
              </h1>
              <p className="text-sm text-gray-200 mt-1">{student?.branch || "Computer Science Student"}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => navigate("/resume")}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-100 transition"
            >
              Update Resume
            </button>
            <button
              onClick={() => navigate("/lms")}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-indigo-400 transition flex items-center gap-2"
            >
              🎯 Learning Path
            </button>
          </div>
        </div>

        {/* Right Section: Image */}
        <div className="flex-1 relative h-48">
          <img
            src="https://media.istockphoto.com/id/1159030397/vector/vector-of-a-child-a-boy-looking-at-the-stairs-leading-to-the-door-of-modern-digital-world.jpg?s=612x612&w=0&k=20&c=cPMvHwuxLy3rWZaHzhiXY_TFZXkl0KGp-wHGFA8vak4="
            alt="Digital World"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white bg-opacity-20 pointer-events-none"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={<FileText />} label="Applications Sent" value={student?.stats?.applicationsSent || 0} />
          <StatCard icon={<BookOpen />} label="Courses Completed" value={student?.stats?.coursesCompleted || 0} />
          <StatCard icon={<Calendar />} label="Interviews Scheduled" value={student?.stats?.interviewsScheduled || 0} />
          <StatCard icon={<Eye />} label="Profile Views" value={student?.stats?.profileViews || 0} />
        </div>

        {/* Applications & Interviews */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
            {student?.recentApplications?.map((app, idx) => (
              <ApplicationCard key={idx} {...app} />
            ))}
            <button
              onClick={() => navigate("/jobs")}
              className="mt-4 text-indigo-600 font-medium hover:underline transition"
            >
              View All Applications →
            </button>
          </motion.div>

          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Upcoming Interviews</h2>
            {student?.upcomingInterviews?.map((interview, idx) => (
              <InterviewCard key={idx} {...interview} />
            ))}
            <button
              onClick={() => navigate("/interview")}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Schedule Mock Interview
            </button>
          </motion.div>
        </div>

        {/* Notifications panel */}
        {showNotifications && notifications.length > 0 && (
          <div className="fixed top-14 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Notifications</h3>
            <ul className="space-y-2">
              {notifications.map((n, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                >
                  {n.type === "interview" ? (
                    <p>
                      🎯 Upcoming Interview: <strong>{n.title}</strong> on {n.date} at {n.time}
                    </p>
                  ) : (
                    <p>
                      📚 New Course Assigned: <strong>{n.title}</strong>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learning Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-6">Learning Progress 📚</h2>
          {student?.learningProgress?.map((course, idx) => (
            <ProgressItem key={idx} title={course.title} progress={course.progress} />
          ))}
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 text-indigo-600 font-medium hover:underline transition"
          >
            Browse All Courses →
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ActionCard
            icon={<FileText />}
            title="Build Resume"
            desc="Create a professional resume"
            onClick={() => navigate("/resume")}
          />
          <ActionCard
            icon={<CheckCircle />}
            title="Practice Interview"
            desc="Prepare with AI mock interviews"
            onClick={() => navigate("/interview")}
          />
          <ActionCard
            icon={<AlertCircle />}
            title="Quiz"
            desc="Test your skills with quizzes"
            onClick={() => navigate("/quiz/:slug")}
          />
        </div>
      </div>

      {/* Footer & Contact Form */}
    </div>
  );
}

// Components
const StatCard = ({ icon, label, value }) => (
  <motion.div whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl shadow flex items-center gap-4 transition-all">
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const ApplicationCard = ({ title, company, date, status, statusColor }) => (
  <div className="flex justify-between items-center border-b py-3">
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{company} • {date}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
      {status}
    </span>
  </div>
);

const InterviewCard = ({ title, company, date, time, type }) => (
  <div className="border-b py-3">
    <h3 className="font-medium">{title}</h3>
    <p className="text-sm text-gray-500">{company} • {date} • {time}</p>
    <span className="text-xs text-indigo-600 font-medium">{type} Interview</span>
  </div>
);

const ProgressItem = ({ title, progress }) => (
  <div className="mb-4">
    <p className="font-medium mb-1">{title}</p>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
    <p className="text-sm text-gray-500 mt-1">{progress}% completed</p>
  </div>
);

const ActionCard = ({ icon, title, desc, onClick }) => (
  <motion.div onClick={onClick} whileHover={{ scale: 1.05 }} className="cursor-pointer bg-white p-6 rounded-2xl shadow flex flex-col items-center text-center transition-all">
    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-3">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </motion.div>
);



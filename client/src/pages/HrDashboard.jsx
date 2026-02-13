import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  BookOpen,
  Calendar,
  Search,
  Clock,
  Trophy,
} from "lucide-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const HrDashboard = () => {
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    courses: 0,
    interviews: 0,
  });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  // Initialize as empty array to prevent map errors
  const [interviews, setInterviews] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Jobs
        const jobsRes = await axios.get("/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Safety check: ensure data is an array
        const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        setJobs(jobsData);

        // 2. Fetch Applications
        const appsRes = await axios.get("/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appsData = Array.isArray(appsRes.data) ? appsRes.data : [];
        setApplications(appsData);

        // 3. REMOVED Interview Fetch (caused crash)
        // We just set it to empty or mock data for now
        setInterviews([]);

        // 4. Update Stats
        setStats({
          jobs: jobsData.length,
          applications: appsData.length,
          courses: 0,
          interviews: 0,
        });
      } catch (error) {
        console.error("Failed to fetch HR data:", error);
        // Fallback mock data so page doesn't break completely
        setStats({ jobs: 0, applications: 0, courses: 0, interviews: 0 });
        setJobs([]);
        setApplications([]);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  const statusColors = {
    submitted: "bg-gray-100 text-gray-700",
    review: "bg-yellow-100 text-yellow-600",
    interview: "bg-indigo-100 text-indigo-700",
    offer: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-700",
  };

  // Chart Data (Safely derived)
  const applicationsTrend =
    applications.length > 0
      ? applications
          .map((a) => new Date(a.createdAt))
          .reduce((acc, date) => {
            const month = date.toLocaleString("default", { month: "short" });
            const existing = acc.find((item) => item.month === month);
            if (existing) existing.applications += 1;
            else acc.push({ month, applications: 1 });
            return acc;
          }, [])
      : [{ month: "No Data", applications: 0 }];

  const departmentDistribution =
    jobs.length > 0
      ? jobs.map((job) => ({
          name: job.department || "General",
          value: job.applicants || 0,
        }))
      : [{ name: "No Data", value: 1 }];

  const candidateStatus =
    applications.length > 0
      ? applications.reduce((acc, app) => {
          const existing = acc.find((c) => c.name === app.status);
          if (existing) existing.value += 1;
          else acc.push({ name: app.status, value: 1 });
          return acc;
        }, [])
      : [{ name: "No Data", value: 0 }];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Page Heading + Search */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800">HR Dashboard</h1>
          <p className="text-gray-500 text-lg">
            Manage jobs, applications, interviews, and courses at a glance.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search candidates..."
            className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute top-2.5 left-3 w-5 h-5 text-gray-400" />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          icon={<Briefcase />}
          label="Active Jobs"
          value={stats.jobs}
          color="from-indigo-500 to-indigo-700"
        />
        <StatCard
          icon={<Users />}
          label="Applications"
          value={stats.applications}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={<BookOpen />}
          label="Courses"
          value={stats.courses}
          color="from-purple-500 to-violet-600"
        />
        {/* Interviews Card (Static 0 for now) */}
        <StatCard
          icon={<Calendar />}
          label="Interviews"
          value={stats.interviews}
          color="from-orange-500 to-amber-600"
        />
      </motion.div>

      {/* Applications & Interviews */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <motion.div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Applications
          </h2>
          {Array.isArray(applications) && applications.length > 0 ? (
            applications.map((app) => (
              <div
                key={app._id}
                className="p-4 border-b hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{app.user?.name}</p>
                    <ShowMoreText text={app.coverLetter || ""} limit={60} />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[app.status] || "bg-gray-100"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No applications received yet.</p>
          )}
        </motion.div>

        {/* Interviews (Empty state for now) */}
        <motion.div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Upcoming Interviews
          </h2>
          {interviews.length > 0 ? (
            interviews.map((iv) => (
              <div
                key={iv._id}
                className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {iv.candidate?.name}
                  </p>
                  <p className="text-sm text-gray-500">{iv.type} Interview</p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {new Date(iv.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-4">
              No upcoming interviews scheduled.
            </p>
          )}
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <ChartCard title="Applications Growth">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={applicationsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department-wise Hiring">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {departmentDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Candidate Status">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={candidateStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Leaderboard */}
      <motion.div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Top Candidates
        </h2>
        <div className="flex gap-6 overflow-x-auto">
          {Array.isArray(applications) && applications.length > 0 ? (
            applications.slice(0, 3).map((app, idx) => (
              <div
                key={app._id}
                className="flex flex-col items-center bg-gray-50 rounded-xl p-4 shadow-sm flex-1 hover:shadow-md transition min-w-[150px]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {app.user?.name?.[0] || "?"}
                </div>
                <p className="mt-2 font-medium text-gray-800">
                  {app.user?.name || "Candidate"}
                </p>
                <p className="text-xs text-gray-500">⭐ {95 - idx * 5} Score</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No top candidates to display.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Stat Card
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-r ${color} shadow-lg rounded-xl p-5 flex items-center gap-3 text-white cursor-pointer`}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-white/20">
        {icon}
      </div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

// Reusable Chart Card
function ChartCard({ title, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white shadow-lg rounded-lg p-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

// Show More / Less Component
function ShowMoreText({ text, limit = 100 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div className="text-gray-600 text-sm leading-relaxed">
      <p>
        {expanded
          ? text
          : `${text.slice(0, limit)}${text.length > limit ? "..." : ""}`}
      </p>
      {text.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-indigo-600 text-xs font-medium mt-1 hover:underline"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

export default HrDashboard;
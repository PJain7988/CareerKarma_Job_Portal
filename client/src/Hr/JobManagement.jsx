import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, X, Mail, Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const JobManagement = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAuthConfig = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) token = JSON.parse(userInfo).token;
    }
    return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/jobs`, getAuthConfig());
      setJobs(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      title: form.title.value,
      company: form.company.value,
      location: form.location.value,
      type: form.type.value,
      salary: form.salary.value,
      description: form.description.value,
      hrEmail: form.hrEmail.value,
      status: "Active"
    };

    try {
      await axios.post(`${BACKEND_URL}/api/jobs`, payload, getAuthConfig());
      setShowModal(false);
      fetchJobs();
    } catch {
      alert("Failed to create job.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/jobs/${id}`, getAuthConfig());
      setJobs(jobs.filter((j) => j._id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    (job.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Job Management</h1>
          <div className="w-20 h-1 bg-indigo-600 mt-2 rounded"></div>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Create job postings, manage listings, and track applicants.
          </p>
        </div>

        {/* Responsive Create Job Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 
          bg-gradient-to-r from-indigo-600 to-indigo-700 text-white
          px-4 py-2 md:px-6 md:py-3 
          rounded-xl shadow-lg hover:shadow-xl transition
          text-sm md:text-base font-semibold"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by job title"
          className="w-full pl-10 border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 transition bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Job Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl border shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {["Title", "Company", "Location", "Type", "Salary", "Actions"].map((h, i) => (
                <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredJobs.map((job) => (
              <motion.tr
                key={job._id}
                whileHover={{ backgroundColor: "#F9FAFB" }}
                className="border-b group transition"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                <td className="px-6 py-4 text-gray-700">{job.company}</td>
                <td className="px-6 py-4 text-gray-700">{job.location}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs">
                    {job.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{job.salary || "N/A"}</td>

                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => navigate("/hr-dashboard/applications")}
                    className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition"
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {!isLoading && filteredJobs.length === 0 && (
          <p className="text-center py-6 text-gray-500">No jobs found</p>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 mt-4">
        {filteredJobs.map((job) => (
          <motion.div
            key={job._id}
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-xl border shadow bg-white transition"
          >
            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            <p className="mt-1 text-sm text-gray-700">Location: {job.location}</p>
            <p className="text-sm text-gray-700">Salary: {job.salary || "N/A"}</p>

            <span className="inline-block mt-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-medium">
              {job.type}
            </span>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => navigate("/hr-dashboard/applications")} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded">
                <Users size={18} />
              </button>
              <button onClick={() => handleDelete(job._id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.92 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold mb-5 text-gray-900">Create Job Posting</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <input name="title" required className="w-full border rounded-lg p-2 mt-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <input name="company" required className="w-full border rounded-lg p-2 mt-1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <input name="location" required className="w-full border rounded-lg p-2 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Job Type</label>
                    <select name="type" className="w-full border rounded-lg p-2 mt-1">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Salary</label>
                    <input name="salary" className="w-full border rounded-lg p-2 mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Mail size={14} /> HR Email
                  </label>
                  <input name="hrEmail" type="email" required className="w-full border rounded-lg p-2 mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <textarea name="description" rows="3" required className="w-full border rounded-lg p-2 mt-1"></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 rounded-xl font-semibold hover:shadow-md transition"
                >
                  Post Job
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobManagement;

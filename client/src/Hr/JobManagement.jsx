import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, X, Mail, Users, Search, Briefcase, MapPin, DollarSign, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const JobManagement = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://careerkarma-job-portal.onrender.com";
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editJobId, setEditJobId] = useState(null);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", type: "Full-time", salary: "", description: "", hrEmail: "", deadline: "" });

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

  const handleFormChange = (e) => setJobForm({ ...jobForm, [e.target.name]: e.target.value });

  const openCreateModal = () => {
    setEditJobId(null);
    setJobForm({ title: "", company: "", location: "", type: "Full-time", salary: "", description: "", hrEmail: "", deadline: "" });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditJobId(job._id);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.salary || "",
      description: job.description || "",
      hrEmail: job.hrEmail || "",
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...jobForm,
      status: "Active"
    };

    try {
      if (editJobId) {
        await axios.put(`${BACKEND_URL}/api/jobs/${editJobId}`, payload, getAuthConfig());
      } else {
        await axios.post(`${BACKEND_URL}/api/jobs`, payload, getAuthConfig());
      }
      setShowModal(false);
      fetchJobs();
    } catch {
      alert(`Failed to ${editJobId ? "update" : "create"} job.`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
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
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><Briefcase className="text-indigo-600" size={32}/> Job Management</h1>
            <p className="text-gray-500 mt-1">Create job postings and manage candidate applications.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>Post New Job</span>
          </button>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Role & Company", "Location", "Type", "Salary", "Applicants", "Actions"].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredJobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-base">{job.title}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Building size={14}/> {job.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-gray-600 font-medium text-sm"><MapPin size={16} className="text-gray-400"/> {job.location}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-700 text-sm">
                      <div className="flex items-center gap-1"><DollarSign size={16} className="text-gray-400"/> {job.salary || "Not Specified"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => navigate("/hr-dashboard/applications")}
                      className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition border border-indigo-100"
                    >
                      <Users size={16} /> View
                    </button>
                  </td>
                  <td className="px-6 py-5 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(job)}
                      className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition"
                      title="Edit Job"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Delete Job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && filteredJobs.length === 0 && (
            <div className="text-center py-16">
                <Briefcase size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-xl font-medium text-gray-600">No jobs found.</p>
                <p className="text-gray-400 mt-1">Try adjusting your search or post a new job.</p>
            </div>
          )}
        </div>

        <div className="md:hidden space-y-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-white transition">
              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
              <p className="text-gray-500 font-medium mt-1">{job.company}</p>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {job.location}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={16} className="text-gray-400"/> {job.salary || "N/A"}</p>
              </div>

              <div className="mt-4">
                <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                {job.type}
                </span>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => navigate("/hr-dashboard/applications")} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
                  <Users size={16} /> Applicants
                </button>
                <div className="flex gap-2">
                    <button onClick={() => openEditModal(job)} className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative my-8"
              >
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black mb-6 text-gray-900">{editJobId ? "Edit Job Posting" : "Post a New Job"}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Job Title</label>
                    <input name="title" value={jobForm.title} onChange={handleFormChange} required placeholder="e.g. Senior Product Designer" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Company Name</label>
                      <input name="company" value={jobForm.company} onChange={handleFormChange} required placeholder="e.g. Acme Corp" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Location</label>
                      <input name="location" value={jobForm.location} onChange={handleFormChange} required placeholder="e.g. Remote, NY" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Job Type</label>
                      <select name="type" value={jobForm.type} onChange={handleFormChange} className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Salary (Optional)</label>
                      <input name="salary" value={jobForm.salary} onChange={handleFormChange} placeholder="e.g. $100k - $120k" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                          HR Contact Email
                        </label>
                        <input name="hrEmail" value={jobForm.hrEmail} onChange={handleFormChange} type="email" required placeholder="e.g. hr@company.com" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                          Deadline (Last Date)
                        </label>
                        <input name="deadline" value={jobForm.deadline} onChange={handleFormChange} type="date" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                      </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Job Description</label>
                    <textarea name="description" value={jobForm.description} onChange={handleFormChange} rows="4" required placeholder="Describe the role, responsibilities, and requirements..." className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-y"></textarea>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">{editJobId ? "Save Changes" : "Post Job Listing"}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobManagement;

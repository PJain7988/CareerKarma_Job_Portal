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
  const [editingJob, setEditingJob] = useState(null);

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
      deadline: form.deadline.value || null,
      status: "Active"
    };

    try {
      if (editingJob) {
        await axios.put(`${BACKEND_URL}/api/jobs/${editingJob._id}`, payload, getAuthConfig());
      } else {
        await axios.post(`${BACKEND_URL}/api/jobs`, payload, getAuthConfig());
      }
      setShowModal(false);
      setEditingJob(null);
      fetchJobs();
    } catch {
      alert(`Failed to ${editingJob ? "update" : "create"} job.`);
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
            <p className="text-gray-500 mt-1">Create job postings, set deadlines, and manage candidate applications.</p>
          </div>
          <button
            onClick={() => { setEditingJob(null); setShowModal(true); }}
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
              {filteredJobs.map((job) => {
                const isExpired = job.deadline && new Date(job.deadline) < new Date();
                return (
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
                    <td className="px-6 py-5 flex flex-col gap-1 items-start">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                        {job.type}
                      </span>
                      {job.deadline && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isExpired ? "bg-red-50 text-red-600 border border-red-100" : "bg-orange-50 text-orange-600 border border-orange-100"}`}>
                              {isExpired ? "Expired" : `Ends ${new Date(job.deadline).toLocaleDateString()}`}
                          </span>
                      )}
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
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingJob(job); setShowModal(true); }}
                            className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition"
                            title="Edit Job"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete Job"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                <button onClick={() => handleDelete(job._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition">
                  <Trash2 size={18} />
                </button>
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
                <button onClick={() => { setShowModal(false); setEditingJob(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black mb-6 text-gray-900">{editingJob ? "Edit Job Posting" : "Post a New Job"}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Job Title</label>
                    <input name="title" defaultValue={editingJob?.title} required placeholder="e.g. Senior Product Designer" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Company Name</label>
                      <input name="company" defaultValue={editingJob?.company} required placeholder="e.g. Acme Corp" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Location</label>
                      <input name="location" defaultValue={editingJob?.location} required placeholder="e.g. Remote, NY" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Job Type</label>
                      <select name="type" defaultValue={editingJob?.type || "Full-time"} className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Salary (Optional)</label>
                      <input name="salary" defaultValue={editingJob?.salary} placeholder="e.g. $100k - $120k" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">HR Contact Email</label>
                      <input name="hrEmail" defaultValue={editingJob?.hrEmail} type="email" required placeholder="e.g. hr@company.com" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Application Deadline</label>
                      <input name="deadline" defaultValue={editingJob?.deadline ? new Date(editingJob.deadline).toISOString().split('T')[0] : ''} type="date" className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Job Description</label>
                    <textarea name="description" defaultValue={editingJob?.description} rows="4" required placeholder="Describe the role, responsibilities, and requirements..." className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-y"></textarea>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => { setShowModal(false); setEditingJob(null); }} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">{editingJob ? "Update Job" : "Post Job Listing"}</button>
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Search, X, CheckCircle, XCircle, Download } from "lucide-react";

const Applications = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const getAuthConfig = () => {
    let token = localStorage.getItem("token");
    if (!token) {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) token = JSON.parse(userInfo).token;
    }
    return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/applications/hr`, getAuthConfig());
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${BACKEND_URL}/api/applications/${id}`, { status: newStatus }, getAuthConfig());
      setApplications(prev => prev.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));
      if (selectedCandidate && selectedCandidate._id === id) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getResumeUrl = (filename) => {
    if (!filename || filename === "undefined" || filename === "null") return "#";
    if (filename.startsWith("http")) return filename;
    const cleanName = filename.split(/[/\\]/).pop(); 
    return `${BACKEND_URL}/api/jobs/resume/${cleanName}`;
  };

  // Proper download function using axios
  const handleDownloadResume = async (filename) => {
    if (!filename) return;

    try {
      const url = getResumeUrl(filename);
      const res = await axios.get(url, {
        responseType: "blob", // important to get file as Blob
        headers: getAuthConfig().headers
      });

      const blob = new Blob([res.data], { type: res.data.type });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      const cleanName = filename.split(/[/\\]/).pop();
      link.download = cleanName || "resume.pdf";

      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download resume");
    }
  };

  const statusStyles = {
    "Pending": "bg-yellow-100 text-yellow-800 border border-yellow-300",
    "Interviewing": "bg-indigo-100 text-indigo-800 border border-indigo-300",
    "Accepted": "bg-green-100 text-green-800 border border-green-300",
    "Rejected": "bg-red-100 text-red-800 border border-red-300",
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === "All" || app.status === filter;
    const matchesSearch =
      (app.applicant?.name || "Unknown").toLowerCase().includes(search.toLowerCase()) ||
      (app.job?.title || "Unknown").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Application Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search candidates..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10 pr-4 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-indigo-500" 
            />
            <Search className="absolute top-2.5 left-3 w-5 h-5 text-gray-400" />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Interviewing</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading Applications...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredApplications.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 mt-10">No applications found.</div>
          ) : filteredApplications.map((app) => (
            <div key={app._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{app.applicant?.name || "Unknown Applicant"}</h2>
                  <p className="text-sm text-gray-500">{app.job?.title || "Unknown Job"}</p>
                  <p className="text-xs text-gray-400 mt-1">{app.applicant?.email}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyles[app.status] || "bg-gray-100"}`}>{app.status}</span>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-4 border-t pt-4">
                <button onClick={() => handleStatusUpdate(app._id, "Accepted")} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1"><CheckCircle size={12}/> Accept</button>
                <button onClick={() => handleStatusUpdate(app._id, "Rejected")} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1"><XCircle size={12}/> Reject</button>
              </div>
              <div className="flex gap-3 mt-3">
                <button title="View Details" className="w-full p-2 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition flex items-center justify-center gap-2" onClick={() => setSelectedCandidate(app)}>
                  <Eye size={18} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setSelectedCandidate(null)}><X size={20} /></button>
            <div className="flex border-b mb-4">
              {["Overview", "Notes"].map((tab) => (
                <button 
                  key={tab} 
                  className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedCandidate.applicant?.name}</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Email:</strong> {selectedCandidate.applicant?.email}</p>
                  <p><strong>Job:</strong> {selectedCandidate.job?.title}</p>
                  <div className="bg-gray-50 p-3 rounded border mt-3">
                    <strong className="block mb-1">Cover Letter:</strong>
                    <p className="italic">"{selectedCandidate.coverLetter || "No cover letter."}"</p>
                  </div>

                  {/* Resume View & Download */}
                  {selectedCandidate.resume && selectedCandidate.resume !== "undefined" && (
                    <div className="mt-3 flex flex-col gap-2">
                      <strong>Resume:</strong>
                      <div className="flex gap-3">
                        <a 
                          href={getResumeUrl(selectedCandidate.resume)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-600 underline font-medium flex items-center gap-1"
                        >
                          <Eye size={14} /> View
                        </a>
                        <button 
                          onClick={() => handleDownloadResume(selectedCandidate.resume)}
                          className="text-indigo-600 underline font-medium flex items-center gap-1"
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => handleStatusUpdate(selectedCandidate._id, "Accepted")} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Accept Candidate</button>
                  <button onClick={() => handleStatusUpdate(selectedCandidate._id, "Rejected")} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">Reject Candidate</button>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div>
                <textarea rows={5} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500" placeholder="Write recruiter notes here..." />
                <button className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition" onClick={() => alert("Notes saved locally!")}>Save Notes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;

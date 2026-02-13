import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const MyApplications = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthConfig = () => {
    let token = localStorage.getItem("token");
    if (!token) {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) token = JSON.parse(userInfo).token;
    }
    return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
  };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/applications/my`, getAuthConfig());
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case "Accepted": return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold"><CheckCircle size={16}/> Accepted</span>;
      case "Rejected": return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold"><XCircle size={16}/> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-bold"><Clock size={16}/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>
        
        {loading ? <div className="text-center">Loading...</div> : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">You haven't applied to any jobs yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{app.job?.title || "Job Removed"}</td>
                      <td className="px-6 py-4 text-gray-600">{app.job?.company || "Unknown"}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
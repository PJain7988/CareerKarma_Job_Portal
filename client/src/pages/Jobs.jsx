import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { MapPin, Search, X, Filter, Briefcase, Upload, CheckCircle, Lock, Eye, Mail, Globe, Clock, BrainCircuit } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Footer from "../components/ui/Footer";

const generateMockJobs = () => {
  const roles = ["Frontend Dev", "Backend Engineer", "Full Stack", "UI/UX Designer", "Product Manager", "Data Scientist", "DevOps", "QA Tester", "Mobile Dev", "Cloud Architect"];
  const companies = ["Google", "Amazon", "Microsoft", "Netflix", "Spotify", "Tesla", "Meta", "Apple", "Adobe", "Salesforce", "Oracle", "IBM", "Intel", "Cisco", "Airbnb"];
  const locations = ["Remote", "New York", "London", "Bangalore", "San Francisco", "Berlin", "Toronto", "Singapore", "Austin", "Seattle", "Mumbai", "Sydney"];
  const types = ["Full-time", "Contract", "Part-time", "Freelance", "Internship"];

  return Array.from({ length: 1250 }, (_, i) => {
    const isRecent = i % 10 === 0; 
    const timeOffset = isRecent 
        ? Math.random() * 24 * 60 * 60 * 1000 
        : Math.random() * 30 * 24 * 60 * 60 * 1000; 
    
    const company = companies[i % companies.length];
    const role = i % 3 === 0 ? `Senior ${roles[i % roles.length]}` : roles[i % roles.length];

    return {
      id: `mock_${i}`,
      title: role,
      company: company,
      location: locations[i % locations.length],
      type: types[i % types.length],
      salary: i % 5 === 0 ? "Not Disclosed" : `$${80 + (i % 50)}k - $${120 + (i % 60)}k`,
      description: `We are looking for a talented ${role} to join our team at ${company}. \n\n**Key Responsibilities:**\n- Build scalable systems\n- Collaborate with cross-functional teams\n- Mentor junior developers\n\n**Requirements:**\n- 3+ years of experience\n- Proficiency in modern tech stacks\n- Strong communication skills`,
      hrEmail: `careers@${company.toLowerCase()}.com`,
      website: `www.${company.toLowerCase()}.com`,
      url: "#",
      isLocal: false,
      createdAt: new Date(Date.now() - timeOffset).toISOString()
    };
  });
};

const JobDetailModal = ({ job, onClose, onApply, hasApplied }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        
        <div className="flex items-start justify-between mb-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h2>
                <p className="text-lg text-indigo-600 font-medium">{job.company}</p>
            </div>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">{job.type}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {job.location}</div>
            <div className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400"/> {job.salary}</div>
            <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {job.hrEmail || "hr@company.com"}</div>
            <div className="flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Posted {new Date(job.createdAt).toLocaleDateString()}</div>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="prose text-gray-700 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Job Description</h3>
            <p className="whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Close</button>
            <button 
                onClick={() => { onClose(); onApply(job); }} 
                disabled={hasApplied}
                className={`px-8 py-2 rounded-lg font-bold shadow-lg text-white transition ${hasApplied ? "bg-green-600 hover:bg-green-700 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
                {hasApplied ? "Applied ✅" : "Apply Now"}
            </button>
        </div>
      </div>
    </div>
  );
};

const ApplyModal = ({ job, onClose, onSubmit }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: ""
  });

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const analyze = async () => {
    if (!resumeText) {
      alert("Please paste your resume text below to analyze.");
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/ai/analyze-resume`, { 
        resumeText: resumeText, 
        jobDescription: job.description 
      });
      setAiAnalysis(data);
    } catch (e) {
      alert("AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(job, coverLetter, resumeText, resumeFile, formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition">
            <X size={20} />
        </button>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shrink-0">
          <h2 className="text-2xl font-extrabold mb-1">Apply for {job.title}</h2>
          <div className="flex items-center gap-3 text-indigo-100 text-sm">
            <span className="flex items-center gap-1"><Briefcase size={14}/> {job.company}</span>
            <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
            <form id="apply-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">LinkedIn Profile</label>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="https://linkedin.com/in/johndoe" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Resume & Cover Letter</h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Upload Resume (PDF, DOCX) *</label>
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl p-6 text-center hover:bg-indigo-100 transition relative cursor-pointer group">
                    <input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center gap-2">
                      {resumeFile ? (
                        <>
                          <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{resumeFile.name}</p>
                            <p className="text-xs text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-full text-indigo-500 shadow-sm group-hover:scale-110 transition"><Upload size={24} /></div>
                          <div>
                            <p className="text-sm font-bold text-indigo-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-indigo-500">PDF, DOC, DOCX up to 5MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Cover Letter (Optional)</label>
                  <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Introduce yourself and explain why you're a strong fit..." rows={3} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y transition" />
                </div>

                <div className="mb-4">
                  <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    <span>AI Resume Analysis (Optional)</span>
                    <button type="button" onClick={analyze} disabled={analyzing} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-full font-bold transition disabled:opacity-50">
                      <BrainCircuit size={14} /> {analyzing ? "Analyzing..." : "Analyze Match"}
                    </button>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Paste your resume text below to get an instant AI match score.</p>
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y transition" placeholder="Paste resume plain text here..." />
                  
                  {aiAnalysis && (
                    <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-purple-900 flex items-center gap-2 text-sm"><BrainCircuit size={16}/> AI Analysis Result</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${aiAnalysis.score >= 80 ? 'bg-green-100 text-green-700' : aiAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {aiAnalysis.score}% Match
                        </span>
                      </div>
                      
                      {aiAnalysis.missingKeywords && aiAnalysis.missingKeywords.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Missing Keywords</p>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.missingKeywords.map((kw, i) => (
                              <span key={i} className="bg-white border border-purple-200 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-md">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Suggestion</p>
                        <p className="text-xs text-purple-800 leading-relaxed">{aiAnalysis.llmSuggestion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </form>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" form="apply-form" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition shadow-md disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                ) : "Submit Application"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default function Jobs() {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://careerkarma-job-portal.onrender.com"
  const navigate = useNavigate();
  const locationHook = useLocation();

  const [rawJobs, setRawJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [applyingJob, setApplyingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [applied, setApplied] = useState({}); 
  const [isGuest, setIsGuest] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;
  
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [locSuggestions, setLocSuggestions] = useState([]);

  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({ jobType: [], remote: [], datePosted: [] });

  const filterOptions = {
    jobType: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
    remote: ["Remote", "Onsite", "Hybrid"],
    datePosted: ["Last 24 hours", "Last 7 days", "Last 30 days"],
  };

  const getAuthConfig = () => {
    let token = localStorage.getItem("token");
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
  };

  const normalizeJobData = (job) => ({
    id: String(job._id || job.id),
    title: job.title, company: job.company, location: job.location,
    type: job.type, description: job.description, salary: job.salary || "Not Disclosed",
    hrEmail: job.hrEmail, deadline: job.deadline,
    url: job.url || '#', isLocal: !!job._id, createdAt: job.createdAt
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsGuest(!token);

    const init = async () => {
      let jobsList = [];
      try {
        const res = await axios.get(`${BACKEND_URL}/api/jobs`, { withCredentials: true });
        const rawData = Array.isArray(res.data) ? res.data : res.data.data || [];
        jobsList = rawData.map(normalizeJobData);
      } catch (e) {}

      jobsList = [...jobsList, ...generateMockJobs()];
      setRawJobs(jobsList);

      if(token) {
        try {
            const appRes = await axios.get(`${BACKEND_URL}/api/applications/my`, getAuthConfig());
            const myApps = {};
            appRes.data.forEach(app => { if(app.job) myApps[app.job._id] = true; });
            setApplied(myApps);
        } catch(e) {}
      }
    };
    init();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    setSearchQuery(params.get("keyword") || "");
    setLocationQuery(params.get("location") || "");
  }, [locationHook.search]);

  const filteredJobs = useMemo(() => {
    return rawJobs.filter((job) => {
      // Automatic removal if deadline has passed
      if (job.deadline && new Date(job.deadline) < new Date()) {
          return false;
      }

      const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
      
      const matchesType = filters.jobType.length === 0 || filters.jobType.some(t => job.type.toLowerCase() === t.toLowerCase());
      
      let matchesRemote = true;
      if (filters.remote.length > 0) {
        const locLower = (job.location || "").toLowerCase();
        matchesRemote = filters.remote.some(f => {
            if (f === "Remote") return locLower.includes("remote");
            if (f === "Onsite") return !locLower.includes("remote") && !locLower.includes("hybrid");
            if (f === "Hybrid") return locLower.includes("hybrid");
            return false;
        });
      }

      let matchesDate = true;
      if (filters.datePosted.length > 0) {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        const diffHours = (now - jobDate) / (1000 * 60 * 60);
        matchesDate = filters.datePosted.some(f => {
            if (f === "Last 24 hours") return diffHours <= 24;
            if (f === "Last 7 days") return diffHours <= 168;
            if (f === "Last 30 days") return diffHours <= 720;
            return false;
        });
      }

      return matchesSearch && matchesLocation && matchesType && matchesRemote && matchesDate;
    });
  }, [rawJobs, searchQuery, locationQuery, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs]);

  useEffect(() => { 
      if (isGuest) {
          setDisplayJobs(filteredJobs.slice(0, jobsPerPage)); 
      } else {
          const start = (currentPage - 1) * jobsPerPage;
          const end = start + jobsPerPage;
          setDisplayJobs(filteredJobs.slice(start, end)); 
      }
  }, [filteredJobs, isGuest, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  useEffect(() => {
    if (searchQuery.length > 1) {
        const uniqueTitles = [...new Set(rawJobs.map(j => j.title))].filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6);
        setJobSuggestions(uniqueTitles);
    } else { setJobSuggestions([]); }
  }, [searchQuery, rawJobs]);

  useEffect(() => {
    if (locationQuery.length > 1) {
        const uniqueLocs = [...new Set(rawJobs.map(j => j.location))].filter(l => l.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 6);
        setLocSuggestions(uniqueLocs);
    } else { setLocSuggestions([]); }
  }, [locationQuery, rawJobs]);

  const handleApplyClick = (job) => {
    if (isGuest) { navigate("/login"); return; }
    if (job.url && job.url.startsWith("http")) { window.open(job.url, "_blank"); return; }
    setApplyingJob(job);
  };

  const handleViewDetails = (job) => {
      setViewingJob(job);
  };

  const handleModalSubmit = async (job, coverLetter, resumeText, resumeFile, candidateDetails) => {
    let resumeFilename = "";
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        const uploadRes = await axios.post(`${BACKEND_URL}/api/jobs/upload-resume`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        resumeFilename = (uploadRes.data.filePath || "").split(/[/\\]/).pop(); 
      }
      if (job.isLocal) {
        await axios.post(`${BACKEND_URL}/api/applications`, { 
            jobId: job.id, 
            coverLetter, 
            resumeText,
            resume: resumeFilename,
            candidateDetails
        }, getAuthConfig());
      } 
      alert("Success! Application sent to HR.");
      setApplied(prev => ({ ...prev, [job.id]: true }));
      setApplyingJob(null); 
    } catch (err) {
      alert("Application sent (Text only).");
      setApplyingJob(null);
    }
  };

  const handleFilterChange = (key, option) => {
    setFilters(prev => {
      const current = prev[key];
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {applyingJob && <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} onSubmit={handleModalSubmit} />}
      {viewingJob && <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} onApply={handleApplyClick} hasApplied={applied[viewingJob.id]} />}
      
      {/* HERO SECTION - RESTORED BLUE/INDIGO GRADIENT */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-purple-900/80"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 drop-shadow-md">
            Find Your Dream Job
          </h2>
          
          {/* SEARCH BAR CONTAINER - FIXED DROPDOWN */}
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl p-2 max-w-4xl mx-auto relative z-50">
             
             {/* JOB INPUT */}
             <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 relative">
                <Search className="text-gray-400 w-5 h-5 mr-3" />
                <input 
                  type="text" placeholder="Job title, keywords, or company" value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onFocus={() => setShowJobSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                  className="w-full outline-none p-2 text-gray-700 placeholder-gray-400" 
                />
                {showJobSuggestions && jobSuggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white shadow-2xl border rounded-b-xl z-[100] overflow-hidden text-left mt-1 max-h-60 overflow-y-auto">
                        {jobSuggestions.map((s, i) => (
                           <li key={i} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-0" 
                               onMouseDown={() => { setSearchQuery(s); setShowJobSuggestions(false); }}
                           >
                              {s}
                           </li>
                        ))}
                    </ul>
                )}
             </div>

             {/* LOCATION INPUT */}
             <div className="flex-1 flex items-center px-4 py-3 relative">
                <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                <input 
                  type="text" placeholder="City, state, or remote" value={locationQuery} 
                  onChange={(e) => setLocationQuery(e.target.value)} 
                  onFocus={() => setShowLocSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
                  className="w-full outline-none p-2 text-gray-700 placeholder-gray-400" 
                />
                {showLocSuggestions && locSuggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white shadow-2xl border rounded-b-xl z-[100] overflow-hidden text-left mt-1 max-h-60 overflow-y-auto">
                        {locSuggestions.map((s, i) => (
                            <li key={i} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-0" 
                                onMouseDown={() => { setLocationQuery(s); setShowLocSuggestions(false); }}
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
             </div>
             
             <button className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3 px-8 rounded-lg transition shadow-md">Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b px-6 py-3 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          {Object.keys(filterOptions).map((key) => (
            <div key={key} className="relative">
              <button onClick={() => setActiveFilter(activeFilter === key ? null : key)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition flex items-center gap-2 ${activeFilter === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                {key.replace(/([A-Z])/g, " $1").trim()} <Filter size={14} />
              </button>
              {activeFilter === key && (
                <div className="absolute top-full mt-2 w-56 bg-white rounded-xl shadow-xl border p-3 z-50">
                  {filterOptions[key].map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={filters[key].includes(opt)} onChange={() => handleFilterChange(key, opt)} className="rounded text-indigo-600" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
            {isGuest ? `Showing Top 9 Jobs (${rawJobs.length} available)` : `${filteredJobs.length} Jobs Found`}
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{job.title}</h4>
                    <p className="text-indigo-600 text-sm font-medium">{job.company}</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-semibold whitespace-nowrap">{job.type}</span>
                </div>
                <div className="text-gray-500 text-sm flex items-center gap-1 mb-3"><MapPin size={14} /> {job.location}</div>
                <div className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description.slice(0, 100)}...</div>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between gap-2">
                    {/* VIEW BUTTON ADDED HERE */}
                    <button 
                        onClick={() => handleViewDetails(job)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-100 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1 transition"
                    >
                        <Eye size={16} /> View
                    </button>
                    
                    {/* APPLY BUTTON */}
                    <button 
                        onClick={() => handleApplyClick(job)} 
                        disabled={applied[job.id]} 
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${applied[job.id] ? "bg-green-100 text-green-700 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                    >
                        {applied[job.id] ? "Applied ✅" : "Apply"}
                    </button>
                </div>
              </div>
            ))}
        </div>

        {isGuest && (
            <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-10 text-center text-white shadow-2xl transform hover:scale-[1.01] transition duration-300">
                <Lock size={48} className="mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-extrabold mb-4">Want to see 1,200+ more jobs?</h2>
                <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
                    Join CareerKarma today to unlock the full database, access the Resume Builder, and take free Skill Quizzes.
                </p>
                <Link to="/register" className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition">
                    Create Free Account
                </Link>
            </div>
        )}

        {!isGuest && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    Previous
                </button>
                <span className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    Next
                </button>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
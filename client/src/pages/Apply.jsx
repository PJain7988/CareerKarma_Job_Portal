import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, BrainCircuit, Building, MapPin, Briefcase } from "lucide-react";
import api from "../services/api";
import axios from "axios";

export default function Apply() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    coverLetter: "",
    resumeText: ""
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://careerkarma-job-portal.onrender.com";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (e) {
        console.error("Failed to fetch job", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        nav("/login");
        return;
      }

      let resumeFilename = "";
      if (resumeFile) {
        const fileData = new FormData();
        fileData.append("resume", resumeFile);
        
        let uploadRes;
        try {
          uploadRes = await axios.post(`${BACKEND_URL}/api/jobs/upload-resume`, fileData, { 
            headers: { "Content-Type": "multipart/form-data" } 
          });
        } catch(uploadErr) {
          console.log("Error uploading physical resume file, proceeding with form data.");
        }
        
        if (uploadRes && uploadRes.data && uploadRes.data.filePath) {
            resumeFilename = uploadRes.data.filePath.split(/[/\\]/).pop();
        }
      }

      const { data } = await api.post("/applications", { 
        jobId: id,
        coverLetter: applicationData.coverLetter,
        resumeText: applicationData.resumeText,
        resume: resumeFilename,
        candidateDetails: {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          email: applicationData.email,
          phone: applicationData.phone,
          linkedin: applicationData.linkedin,
          portfolio: applicationData.portfolio
        }
      });
      setResult(data);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function analyze() {
    if (!applicationData.resumeText) {
      alert("Please paste your resume text below to analyze.");
      return;
    }
    setAnalyzing(true);
    try {
      const jobDesc = job ? job.description : applicationData.coverLetter;
      const { data } = await api.post("/ai/analyze-resume", { 
        resumeText: applicationData.resumeText, 
        jobDescription: jobDesc 
      });
      setAiAnalysis(data);
    } catch (e) {
      alert("AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {result ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-lg text-gray-600 mb-8">Thank you for applying to {job?.company || "this company"}. Your application has been successfully received.</p>
            <button onClick={() => nav("/jobs")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
              Browse More Jobs
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <h1 className="text-3xl font-extrabold mb-2">Apply for {job?.title || "Position"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-indigo-100">
                <span className="flex items-center gap-1"><Building size={16} /> {job?.company || "Company"}</span>
                <span className="flex items-center gap-1"><MapPin size={16} /> {job?.location || "Location"}</span>
                <span className="flex items-center gap-1"><Briefcase size={16} /> {job?.type || "Job Type"}</span>
              </div>
            </div>

            <form onSubmit={submit} className="p-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input required type="text" name="firstName" value={applicationData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input required type="text" name="lastName" value={applicationData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input required type="email" name="email" value={applicationData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" value={applicationData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                    <input type="url" name="linkedin" value={applicationData.linkedin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="https://linkedin.com/in/johndoe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                    <input type="url" name="portfolio" value={applicationData.portfolio} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="https://johndoe.com" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Resume & Documents</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF, DOCX)</label>
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl p-8 text-center hover:bg-indigo-100 transition relative cursor-pointer group">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center gap-3">
                      {resumeFile ? (
                        <>
                          <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle size={32} /></div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{resumeFile.name}</p>
                            <p className="text-xs text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-full text-indigo-500 shadow-sm group-hover:scale-110 transition"><Upload size={32} /></div>
                          <div>
                            <p className="text-base font-medium text-indigo-900">Click to upload or drag and drop</p>
                            <p className="text-sm text-indigo-500">PDF, DOC, DOCX (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                  <p className="text-xs text-gray-500 mb-2">Introduce yourself and explain why you're a strong fit for this role.</p>
                  <textarea name="coverLetter" value={applicationData.coverLetter} onChange={handleInputChange} rows={5} className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-y" placeholder="Write your cover letter here..." />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>AI Resume Analysis (Optional)</span>
                    <button type="button" onClick={analyze} disabled={analyzing} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-full font-bold transition disabled:opacity-50">
                      <BrainCircuit size={14} /> {analyzing ? "Analyzing..." : "Analyze Match"}
                    </button>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Paste your resume text below to get an instant AI match score against the job description.</p>
                  <textarea name="resumeText" value={applicationData.resumeText} onChange={handleInputChange} rows={4} className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-y" placeholder="Paste resume plain text here..." />
                  
                  {aiAnalysis && (
                    <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-5 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-purple-900 flex items-center gap-2"><BrainCircuit size={18}/> AI Analysis Result</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${aiAnalysis.score >= 80 ? 'bg-green-100 text-green-700' : aiAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {aiAnalysis.score}% Match
                        </span>
                      </div>
                      
                      {Array.isArray(aiAnalysis.missingKeywords) && aiAnalysis.missingKeywords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Missing Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {aiAnalysis.missingKeywords.map((kw, i) => (
                              <span key={i} className="bg-white border border-purple-200 text-purple-700 text-xs px-2 py-1 rounded-md">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Suggestion</p>
                        <p className="text-sm text-purple-800 leading-relaxed">{aiAnalysis.llmSuggestion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t flex items-center justify-end gap-4">
                <button type="button" onClick={() => nav("/jobs")} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || (!resumeFile && !applicationData.resumeText && !applicationData.coverLetter && !applicationData.firstName)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md disabled:opacity-70 flex items-center gap-2">
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                  ) : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

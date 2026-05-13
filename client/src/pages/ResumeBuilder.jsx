import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileText, Download, Eye, Save, Sparkles, Plus, Trash2, Upload, Edit2 } from "lucide-react";
import api from "../services/api";

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("Executive");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialData = {
    firstName: "", lastName: "", role: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "",
    summary: "", 
    education: [], 
    experience: [], 
    skills: "", 
    projects: [],
    certifications: []
  };

  const [f, setF] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("resumeDataV2");
    if (saved) {
      try { 
        setF({ ...initialData, ...JSON.parse(saved) }); 
      } catch {}
    } else {
        // attempt migration from v1
        const old = localStorage.getItem("resumeData");
        if (old) {
            try {
                const p = JSON.parse(old);
                setF({
                    ...initialData,
                    ...p,
                    education: typeof p.education === "string" ? [{ school: "School", degree: p.education, date: "", desc: "" }] : p.education || [],
                    experience: typeof p.experience === "string" ? [{ company: "Company", role: "Role", date: "", desc: p.experience }] : p.experience || [],
                    projects: typeof p.projects === "string" ? [{ name: "Project", tech: "", desc: p.projects }] : p.projects || [],
                });
            } catch {}
        }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("resumeDataV2", JSON.stringify(f));
    alert("✅ Resume saved successfully!");
  };

  async function callMistral(prompt) {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", { prompt });
      setLoading(false);
      return data.message || "";
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || "AI generation failed");
      return "";
    }
  }

  const askForRole = async () => {
    const value = window.prompt("Enter Target Job Role (e.g. Frontend Developer):");
    if (value) setF(prev => ({ ...prev, role: value }));
    return value;
  };

  const handleAIAssist = async () => {
    const roleText = f.role || (await askForRole());
    if (!roleText) return;

    setLoading(true);
    setError("");

    const prompt = `
You are an expert resume writer. Candidate role: ${roleText}.
Return JSON strictly with the following keys: 
- summary (string)
- skills (string, comma separated)
- experience (array of objects with keys: company, role, date, desc)
- education (array of objects with keys: school, degree, date, desc)
- projects (array of objects with keys: name, tech, desc)
- certifications (array of objects with keys: name, issuer, date)
- linkedin (string)
- github (string)
- website (string)

Make the descriptions professional, use action verbs, and keep it realistic. Provide 2 realistic experiences, 2 projects, and 1 certification. Output ONLY valid JSON, no markdown formatting.
`;

    try {
      const response = await callMistral(prompt);
      if (!response) return;

      const firstBrace = response.indexOf("{");
      const lastBrace = response.lastIndexOf("}");
      const jsonText = firstBrace !== -1 && lastBrace !== -1 ? response.slice(firstBrace, lastBrace + 1) : response;

      const parsed = JSON.parse(jsonText);

      setF(prev => ({
        ...prev,
        summary: parsed.summary || prev.summary,
        skills: parsed.skills || prev.skills,
        experience: Array.isArray(parsed.experience) ? parsed.experience : prev.experience,
        education: Array.isArray(parsed.education) ? parsed.education : prev.education,
        projects: Array.isArray(parsed.projects) ? parsed.projects : prev.projects,
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : prev.certifications,
        linkedin: parsed.linkedin || prev.linkedin,
        github: parsed.github || prev.github,
        website: parsed.website || prev.website,
      }));

      setActiveTab("preview"); 
      setLoading(false);
    } catch (err) {
      console.error("AI returned non-JSON:", err);
      setError("AI generation failed. Check console.");
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const makePDF = async () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");
      await new Promise(r => setTimeout(r, 500));
    }
    const element = document.getElementById("resume-preview-container");
    if (!element) return;
    
    const oldBorder = element.style.border;
    const oldShadow = element.style.boxShadow;
    element.style.border = "none";
    element.style.boxShadow = "none";
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${f.firstName || "My"}_Resume.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      element.style.border = oldBorder;
      element.style.boxShadow = oldShadow;
    }
  };

  const updateArray = (field, index, key, value) => {
    const newArr = [...f[field]];
    newArr[index] = { ...newArr[index], [key]: value };
    setF({ ...f, [field]: newArr });
  };
  const addArrayItem = (field, defaultObj) => {
    setF({ ...f, [field]: [...f[field], defaultObj] });
  };
  const removeArrayItem = (field, index) => {
    const newArr = f[field].filter((_, i) => i !== index);
    setF({ ...f, [field]: newArr });
  };

  const renderInput = (label, placeholder, key, rows = 1) => (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-semibold text-gray-700">{label}</label>
      {rows === 1 ? (
        <input type="text" placeholder={placeholder} value={f[key] || ""} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm" />
      ) : (
        <textarea rows={rows} placeholder={placeholder} value={f[key] || ""} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none transition resize-none text-sm" />
      )}
    </div>
  );

  const renderExecutiveTemplate = () => (
    <div id="resume-preview-container" className="w-full bg-white flex" style={{ minHeight: "1122px", fontFamily: "Arial, sans-serif" }}>
      <div className="w-1/3 bg-slate-800 text-slate-100 p-8 flex flex-col gap-6" style={{ minHeight: "1122px" }}>
        {photo && <img src={photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-slate-600 mb-4"/>}
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-1">{f.firstName}</h1>
          <h1 className="text-3xl font-bold text-slate-400 uppercase tracking-wider mb-2">{f.lastName}</h1>
          <p className="text-lg text-indigo-400 font-medium">{f.role}</p>
        </div>
        
        <div className="text-sm space-y-2 mt-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-600 pb-1 mb-3">Contact</h2>
          {f.email && <p>E: {f.email}</p>}
          {f.phone && <p>P: {f.phone}</p>}
          {f.location && <p>L: {f.location}</p>}
          {f.linkedin && <p>LI: {f.linkedin}</p>}
          {f.github && <p>GH: {f.github}</p>}
        </div>

        <div className="text-sm mt-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-600 pb-1 mb-3">Skills</h2>
          <p className="leading-relaxed whitespace-pre-line">{f.skills.split(',').join('\n')}</p>
        </div>

        {f.education && f.education.length > 0 && (
          <div className="text-sm mt-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-600 pb-1 mb-3">Education</h2>
            {f.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <p className="font-bold text-indigo-300">{edu.degree}</p>
                <p>{edu.school}</p>
                <p className="text-slate-400 text-xs">{edu.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-2/3 bg-white p-8 text-slate-800">
        {f.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-indigo-600 inline-block pb-1 mb-4">Profile</h2>
            <p className="text-sm leading-relaxed text-slate-600">{f.summary}</p>
          </div>
        )}

        {f.experience && f.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-indigo-600 inline-block pb-1 mb-4">Experience</h2>
            <div className="space-y-6">
              {f.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{exp.date}</span>
                  </div>
                  <p className="text-md font-medium text-slate-500 mb-2">{exp.company}</p>
                  <ul className="text-sm text-slate-600 whitespace-pre-line leading-relaxed list-disc pl-5">
                    {exp.desc.split('\n').filter(Boolean).map((line, j) => <li key={j}>{line.replace(/^[•\-\*]\s*/, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {f.projects && f.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-indigo-600 inline-block pb-1 mb-4">Projects</h2>
            <div className="space-y-6">
              {f.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{proj.name}</h3>
                    {proj.tech && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{proj.tech}</span>}
                  </div>
                  <ul className="text-sm text-slate-600 whitespace-pre-line leading-relaxed list-disc pl-5">
                     {proj.desc.split('\n').filter(Boolean).map((line, j) => <li key={j}>{line.replace(/^[•\-\*]\s*/, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {f.certifications && f.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-indigo-600 inline-block pb-1 mb-4">Certifications</h2>
            <div className="space-y-4">
              {f.certifications.map((cert, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{cert.name}</h3>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{cert.date}</span>
                  </div>
                  <p className="text-md font-medium text-slate-500 mb-2">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCleanTemplate = () => (
    <div id="resume-preview-container" className="w-full bg-white p-12 text-gray-800 font-sans" style={{ minHeight: "1122px" }}>
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{f.firstName} {f.lastName}</h1>
        <p className="text-xl text-indigo-600 font-medium mt-1">{f.role}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm text-gray-600 font-medium">
          {f.email && <span>{f.email}</span>}
          {f.phone && <span>• {f.phone}</span>}
          {f.location && <span>• {f.location}</span>}
          {f.linkedin && <span>• {f.linkedin}</span>}
          {f.github && <span>• {f.github}</span>}
        </div>
      </div>

      {f.summary && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-700">{f.summary}</p>
        </div>
      )}

      {f.experience && f.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">Professional Experience</h2>
          <div className="space-y-5">
            {f.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-bold text-gray-800">{exp.role}</h3>
                    <p className="text-sm font-semibold text-indigo-600">{exp.company}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{exp.date}</span>
                </div>
                <ul className="text-sm text-gray-600 leading-relaxed mt-2 list-disc pl-5">
                   {exp.desc.split('\n').filter(Boolean).map((line, j) => <li key={j}>{line.replace(/^[•\-\*]\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {f.education && f.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">Education</h2>
          <div className="space-y-4">
            {f.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{edu.school}</h3>
                  <p className="text-sm font-medium text-gray-600">{edu.degree}</p>
                  {edu.desc && <p className="text-sm text-gray-500 mt-1">{edu.desc}</p>}
                </div>
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{edu.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {f.projects && f.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">Projects</h2>
          <div className="space-y-4">
            {f.projects.map((proj, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-gray-800">{proj.name} {proj.tech && <span className="font-normal text-gray-500 text-xs ml-2">| {proj.tech}</span>}</h3>
                <ul className="text-sm text-gray-600 leading-relaxed mt-1 list-disc pl-5">
                   {proj.desc.split('\n').filter(Boolean).map((line, j) => <li key={j}>{line.replace(/^[•\-\*]\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {f.skills && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">Technical Skills</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{f.skills}</p>
        </div>
      )}

      {f.certifications && f.certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">Certifications</h2>
          <div className="space-y-4">
            {f.certifications.map((cert, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{cert.name}</h3>
                  <p className="text-sm font-medium text-gray-600">{cert.issuer}</p>
                </div>
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderModernTemplate = () => (
    <div id="resume-preview-container" className="w-full bg-white flex flex-col font-sans text-gray-800" style={{ minHeight: "1122px" }}>
      {/* Header */}
      <div className="bg-indigo-700 text-white p-10 flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">{f.firstName} {f.lastName}</h1>
            <h2 className="text-xl text-indigo-200 mt-2 font-medium">{f.role}</h2>
        </div>
        {photo && <img src={photo} alt="Profile" className="w-28 h-28 rounded-xl object-cover border-4 border-indigo-500 shadow-lg"/>}
      </div>

      <div className="flex flex-1">
        {/* Left Column */}
        <div className="w-2/3 p-10">
            {f.summary && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Summary</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{f.summary}</p>
                </div>
            )}
            
            {f.experience && f.experience.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Experience</h3>
                    <div className="space-y-6">
                        {f.experience.map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l-2 border-indigo-200">
                                <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                                <h4 className="text-md font-bold text-gray-900">{exp.role}</h4>
                                <div className="text-sm font-semibold text-indigo-600 mb-1">{exp.company} <span className="text-gray-400 font-normal ml-2">| {exp.date}</span></div>
                                <ul className="text-sm text-gray-600 leading-relaxed mt-2 list-none space-y-1">
                                    {exp.desc.split('\n').filter(Boolean).map((line, j) => <li key={j} className="flex gap-2"><span className="text-indigo-400 font-bold">•</span><span>{line.replace(/^[•\-\*]\s*/, '')}</span></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {f.projects && f.projects.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Projects</h3>
                    <div className="space-y-5">
                        {f.projects.map((proj, i) => (
                            <div key={i}>
                                <h4 className="text-md font-bold text-gray-900">{proj.name}</h4>
                                {proj.tech && <p className="text-xs font-semibold text-indigo-600 mb-2">{proj.tech}</p>}
                                <ul className="text-sm text-gray-600 leading-relaxed list-none space-y-1">
                                    {proj.desc.split('\n').filter(Boolean).map((line, j) => <li key={j} className="flex gap-2"><span className="text-indigo-400 font-bold">•</span><span>{line.replace(/^[•\-\*]\s*/, '')}</span></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Right Column */}
        <div className="w-1/3 bg-gray-50 p-10 border-l border-gray-100">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Contact</h3>
                <div className="space-y-3 text-sm text-gray-600">
                    {f.email && <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase">Email</span><span>{f.email}</span></div>}
                    {f.phone && <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase">Phone</span><span>{f.phone}</span></div>}
                    {f.location && <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase">Location</span><span>{f.location}</span></div>}
                    {f.linkedin && <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase">LinkedIn</span><span>{f.linkedin}</span></div>}
                    {f.github && <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase">GitHub</span><span>{f.github}</span></div>}
                </div>
            </div>

            {f.skills && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {f.skills.split(',').map((skill, i) => skill.trim() && (
                            <span key={i} className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">{skill.trim()}</span>
                        ))}
                    </div>
                </div>
            )}

            {f.education && f.education.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Education</h3>
                    <div className="space-y-4">
                        {f.education.map((edu, i) => (
                            <div key={i}>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{edu.degree}</h4>
                                <p className="text-sm text-indigo-600 mt-1">{edu.school}</p>
                                <p className="text-xs text-gray-400 mt-1">{edu.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {f.certifications && f.certifications.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-indigo-700 uppercase tracking-wide border-b-2 border-indigo-100 pb-2 mb-4">Certifications</h3>
                    <div className="space-y-4">
                        {f.certifications.map((cert, i) => (
                            <div key={i}>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{cert.name}</h4>
                                <p className="text-sm text-indigo-600 mt-1">{cert.issuer}</p>
                                <p className="text-xs text-gray-400 mt-1">{cert.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow z-10 sticky top-0">
        <h1 className="text-2xl font-black flex items-center gap-2 text-indigo-700"><FileText /> Resume Pro</h1>
        <div className="flex gap-3 items-center">
          <button 
            disabled={loading} 
            onClick={handleAIAssist} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-bold transition shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
          >
            <Sparkles size={18} className={loading ? "animate-spin" : "animate-pulse"} /> 
            {loading ? "Generating..." : "AI Auto-Fill"}
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          {activeTab === "preview" ? (
            <button onClick={() => setActiveTab("personal")} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition shadow-sm text-gray-700"><Edit2 size={16} /> Edit Details</button>
          ) : (
            <button onClick={() => setActiveTab("preview")} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition shadow-sm text-gray-700"><Eye size={16} /> Preview</button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition shadow-sm"><Save size={16} /> Save</button>
          <button onClick={makePDF} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-black font-bold shadow-md transition"><Download size={18} /> Download PDF</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-73px)]">
        <div className="w-64 bg-white border-r overflow-y-auto hidden md:block">
          <div className="p-4 border-b">
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Templates</h2>
            <div className="space-y-2">
              {["Executive", "Modern", "Clean"].map(t => (
                <button key={t} onClick={() => setTemplate(t)} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition border ${template===t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-transparent text-gray-600 hover:bg-gray-50"}`}>
                  {t} Template
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Sections</h2>
            <div className="space-y-1">
              {[{id:"personal", label:"Personal Details"}, {id:"summary", label:"Summary"}, {id:"experience", label:"Experience"}, {id:"education", label:"Education"}, {id:"skills_projects", label:"Skills & Projects"}, {id:"certifications", label:"Certifications"}].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab===t.id ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium shadow-sm">{error}</div>}

            {activeTab === "preview" ? (
              <div className="shadow-2xl rounded-lg overflow-hidden border border-gray-200 mx-auto w-full max-w-[850px] bg-white transform origin-top hover:shadow-3xl transition duration-500">
                {template === "Executive" ? renderExecutiveTemplate() : template === "Modern" ? renderModernTemplate() : renderCleanTemplate()}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 animate-in fade-in zoom-in-95 duration-200">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Personal Details</h2>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group cursor-pointer shadow-sm">
                        {photo ? <img src={photo} alt="Upload" className="w-full h-full object-cover"/> : <Upload className="text-gray-400" />}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><span className="text-white text-xs font-bold">Change</span></div>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Upload Profile Photo</p>
                        <p className="text-xs text-gray-500">A professional photo can help you stand out. Upload a clear headshot. (Used in Executive Template)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {renderInput("First Name", "e.g. John", "firstName")}
                      {renderInput("Last Name", "e.g. Doe", "lastName")}
                      {renderInput("Target Role", "e.g. Senior Developer", "role")}
                      {renderInput("Email Address", "e.g. john@example.com", "email")}
                      {renderInput("Phone Number", "e.g. +1 234 567 890", "phone")}
                      {renderInput("Location", "e.g. New York, USA", "location")}
                      {renderInput("LinkedIn URL", "linkedin.com/in/...", "linkedin")}
                      {renderInput("GitHub / Portfolio", "github.com/...", "github")}
                    </div>
                  </div>
                )}

                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Professional Summary</h2>
                    <p className="text-sm font-medium text-gray-500">Write a short, engaging paragraph highlighting your top achievements and goals.</p>
                    {renderInput("", "Experienced software engineer with a track record of...", "summary", 6)}
                  </div>
                )}

                {activeTab === "experience" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                      <button onClick={() => addArrayItem("experience", { company:"", role:"", date:"", desc:"" })} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition shadow-sm"><Plus size={16}/> Add Role</button>
                    </div>
                    {f.experience.map((exp, i) => (
                      <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group mb-4 hover:border-indigo-300 transition">
                        <button onClick={() => removeArrayItem("experience", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Company</label><input value={exp.company} onChange={(e)=>updateArray("experience", i, "company", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. Google" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Job Title</label><input value={exp.role} onChange={(e)=>updateArray("experience", i, "role", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. Software Engineer" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Dates</label><input value={exp.date} onChange={(e)=>updateArray("experience", i, "date", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. Jan 2020 - Present" /></div>
                        </div>
                        <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Description & Achievements</label><textarea rows={4} value={exp.desc} onChange={(e)=>updateArray("experience", i, "desc", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-y" placeholder="• Led development of...&#10;• Increased revenue by..." /></div>
                      </div>
                    ))}
                    {f.experience.length === 0 && <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">No experience added yet. Click "Add Role" above.</div>}
                  </div>
                )}

                {activeTab === "education" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                      <button onClick={() => addArrayItem("education", { school:"", degree:"", date:"", desc:"" })} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition shadow-sm"><Plus size={16}/> Add Education</button>
                    </div>
                    {f.education.map((edu, i) => (
                      <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group hover:border-indigo-300 transition">
                        <button onClick={() => removeArrayItem("education", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">School / University</label><input value={edu.school} onChange={(e)=>updateArray("education", i, "school", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. MIT" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Degree</label><input value={edu.degree} onChange={(e)=>updateArray("education", i, "degree", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. BS Computer Science" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Dates</label><input value={edu.date} onChange={(e)=>updateArray("education", i, "date", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. 2018 - 2022" /></div>
                        </div>
                        <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Additional Details (Optional)</label><input value={edu.desc} onChange={(e)=>updateArray("education", i, "desc", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. GPA 3.9, Honors..." /></div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "skills_projects" && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-4">Core Skills</h2>
                      <p className="text-sm font-medium text-gray-500 mb-2">Comma-separated list of your technical and soft skills.</p>
                      {renderInput("", "e.g. JavaScript, React, Node.js, Project Management...", "skills", 3)}
                    </div>

                    <div>
                      <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                        <button onClick={() => addArrayItem("projects", { name:"", tech:"", desc:"" })} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition shadow-sm"><Plus size={16}/> Add Project</button>
                      </div>
                      {f.projects.map((proj, i) => (
                        <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group mb-4 hover:border-indigo-300 transition">
                          <button onClick={() => removeArrayItem("projects", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                            <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Project Name</label><input value={proj.name} onChange={(e)=>updateArray("projects", i, "name", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. E-Commerce Platform" /></div>
                            <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Tech Stack</label><input value={proj.tech} onChange={(e)=>updateArray("projects", i, "tech", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. React, Node, MongoDB" /></div>
                          </div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Description</label><textarea rows={4} value={proj.desc} onChange={(e)=>updateArray("projects", i, "desc", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-y" placeholder="• Built a scalable platform...&#10;• Implemented Auth..." /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "certifications" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
                      <button onClick={() => addArrayItem("certifications", { name:"", issuer:"", date:"" })} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition shadow-sm"><Plus size={16}/> Add Certification</button>
                    </div>
                    {f.certifications && f.certifications.map((cert, i) => (
                      <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group mb-4 hover:border-indigo-300 transition">
                        <button onClick={() => removeArrayItem("certifications", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Certification Name</label><input value={cert.name} onChange={(e)=>updateArray("certifications", i, "name", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. AWS Solutions Architect" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Issuer</label><input value={cert.issuer} onChange={(e)=>updateArray("certifications", i, "issuer", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. Amazon Web Services" /></div>
                          <div className="flex flex-col"><label className="text-xs font-bold text-gray-600 mb-1">Date Earned</label><input value={cert.date} onChange={(e)=>updateArray("certifications", i, "date", e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="e.g. 2023" /></div>
                        </div>
                      </div>
                    ))}
                    {(!f.certifications || f.certifications.length === 0) && <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">No certifications added yet. Click "Add Certification" above.</div>}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
export default function Apply(){
  const { id } = useParams();
  const [coverLetter,setCoverLetter] = useState("");
  const [resumeText,setResumeText] = useState("");
  const [result,setResult] = useState(null);
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const token = localStorage.getItem("token");
      if(!token) return nav("/login");
      const { data } = await api.post("/applications", { job: id, coverLetter, resumeText });
      setResult(data);
    }catch(e){
      alert("Failed to apply");
    }
  }

  async function analyze(){
    const { data } = await api.post("/ai/analyze-resume", { resumeText, jobDescription: coverLetter });
    alert(`Match score: ${data.score}%\nMissing: ${data.missingKeywords.join(", ").slice(0,120)}\n\nLLM: ${data.llmSuggestion}`);
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="card">
        <h1 className="text-xl font-semibold mb-3">Apply</h1>
        <form onSubmit={submit} className="space-y-3">
          <textarea className="input h-28" placeholder="Cover letter / Job description (optional for analyzer)" value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} />
          <textarea className="input h-40" placeholder="Paste your resume text..." value={resumeText} onChange={e=>setResumeText(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary">Submit Application</button>
            <button type="button" className="btn" onClick={analyze}>Analyze Resume</button>
          </div>
        </form>
        {result && <div className="mt-3 text-sm">Application submitted! ID: {result._id}</div>}
      </div>
    </div>
  );
}

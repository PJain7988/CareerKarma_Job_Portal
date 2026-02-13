import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Award, ShieldCheck } from "lucide-react";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [targetJob, setTargetJob] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!file) return alert("Upload a resume first!");
    setAnalyzing(true);

    setTimeout(() => {
      const role = targetJob.toLowerCase();
      let keywords = [
          { name: "Leadership", val: 65 },
          { name: "Teamwork", val: 85 },
          { name: "Communication", val: 90 }
      ];
      
      if (role.includes("front")) {
          keywords = [ {name: "React", val: 92}, {name: "CSS", val: 88}, {name: "JS", val: 90}, {name: "Git", val: 75} ];
      } else if (role.includes("back")) {
          keywords = [ {name: "Node.js", val: 85}, {name: "MongoDB", val: 80}, {name: "API", val: 95}, {name: "Docker", val: 60} ];
      } else if (role.includes("data")) {
          keywords = [ {name: "Python", val: 95}, {name: "SQL", val: 85}, {name: "Pandas", val: 70}, {name: "Tableau", val: 65} ];
      }

      const score = Math.floor(Math.random() * (98 - 72) + 72);

      const tipsPool = [
        "Use more action verbs (e.g. 'Spearheaded', 'Orchestrated').",
        "Quantify results (e.g. 'Increased efficiency by 25%').",
        "Ensure contact details are clearly visible at the top.",
        "Customize your summary for the specific job description.",
        "Check for consistent formatting in dates and headers."
      ];

      setResult({
        score,
        keywords,
        tips: tipsPool.sort(() => 0.5 - Math.random()).slice(0, 3)
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
             <h1 className="text-4xl font-extrabold text-indigo-900 mb-3">AI Resume Analyzer</h1>
             <p className="text-gray-500">Upload your resume and get an instant ATS score and feedback.</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto border border-gray-100">
            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center mb-6 hover:bg-indigo-50 transition cursor-pointer relative">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={64} className="text-indigo-400 mx-auto mb-4"/>
                <h3 className="text-xl font-semibold text-gray-700">{file ? file.name : "Drop your resume here"}</h3>
                <p className="text-gray-400 text-sm mt-2">Supports PDF, DOCX</p>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Target Job Role</label>
                    <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Full Stack Developer" value={targetJob} onChange={(e) => setTargetJob(e.target.value)}/>
                </div>
                <button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition flex justify-center items-center gap-2">
                    {analyzing ? <><Loader2 className="animate-spin"/> Analyzing...</> : "Analyze Resume"}
                </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            {/* SCORE CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 font-bold mb-4 uppercase tracking-wider">ATS Compatibility</h3>
                    <div className="w-40 h-40">
                        <CircularProgressbar value={result.score} text={`${result.score}%`} styles={buildStyles({ pathColor: result.score > 80 ? "#10b981" : "#f59e0b", textColor: "#1f2937", trailColor: "#f3f4f6" })}/>
                    </div>
                </div>

                {/* KEYWORDS CHART */}
                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-gray-700 font-bold mb-6 flex items-center gap-2"><Award className="text-yellow-500"/> Keyword Match</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.keywords}>
                                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                                <Tooltip cursor={{fill: 'transparent'}}/>
                                <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                                    {result.keywords.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.val > 80 ? "#4f46e5" : "#a5b4fc"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* TIPS SECTION */}
            <div className="bg-gradient-to-r from-indigo-50 to-white p-8 rounded-2xl shadow-lg border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2"><ShieldCheck className="text-indigo-600"/> Optimization Report</h3>
                <div className="grid gap-4">
                    {result.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20}/>
                            <p className="text-gray-700">{tip}</p>
                        </div>
                    ))}
                </div>
                <button onClick={() => {setResult(null); setFile(null);}} className="mt-8 text-indigo-600 font-bold hover:underline">Analyze Another Resume &rarr;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
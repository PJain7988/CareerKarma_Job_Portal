import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { FileText, Download, Eye, Save, Sparkles, RefreshCcw, Upload } from "lucide-react";

const templateStyles = {
  Modern: { container: "bg-white border border-indigo-500", title: "text-indigo-700 font-extrabold text-4xl", sectionTitle: "text-indigo-600 font-bold text-lg", font: "font-sans", photoShape: "rounded-full w-32 h-32 object-cover border-4 border-indigo-100" },
  Classic: { container: "bg-gray-50 border border-gray-700", title: "text-gray-900 font-serif text-3xl", sectionTitle: "text-gray-800 font-semibold text-lg", font: "font-serif", photoShape: "rounded-lg w-32 h-32 object-cover border border-gray-400" },
  Creative: { container: "bg-pink-50 border border-pink-600", title: "text-pink-600 font-bold text-4xl", sectionTitle: "text-pink-500 font-semibold text-lg", font: "font-sans", photoShape: "rounded-full w-32 h-32 object-cover border-4 border-pink-400" },
  Minimal: { container: "bg-gray-50 border border-gray-400", title: "text-gray-700 font-medium text-3xl", sectionTitle: "text-gray-600 font-semibold text-lg", font: "font-sans", photoShape: "rounded w-32 h-32 object-cover" },
};

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("Creative");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [f, setF] = useState({
    firstName: "", lastName: "", role: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "",
    summary: "", education: "", experience: "", skills: "", projects: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) try { setF(JSON.parse(saved)); } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem("resumeData", JSON.stringify(f));
    alert("✅ Resume saved!");
  };

  async function callMistral(prompt) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mistral/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setLoading(false);
      return data.message || "";
    } catch (err) {
      setLoading(false);
      setError(err.message || "AI generation failed");
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
Return JSON with keys: summary, skills, experience, education, projects, linkedin, github, website.
Experience and projects are arrays. Others are strings.
`;

    try {
      const response = await callMistral(prompt);
      if (!response) return;

      const firstBrace = response.indexOf("{");
      const lastBrace = response.lastIndexOf("}");
      const jsonText = firstBrace !== -1 && lastBrace !== -1 ? response.slice(firstBrace, lastBrace + 1) : response;

      const parsed = JSON.parse(jsonText);

      // update all fields in state
      setF(prev => ({
        ...prev,
        summary: parsed.summary?.trim() || prev.summary,
        skills: parsed.skills?.trim() || prev.skills,
        experience: Array.isArray(parsed.experience) ? parsed.experience.join("\n") : prev.experience,
        education: parsed.education?.trim() || prev.education,
        projects: Array.isArray(parsed.projects) ? parsed.projects.join("\n") : prev.projects,
        linkedin: parsed.linkedin?.trim() || prev.linkedin,
        github: parsed.github?.trim() || prev.github,
        website: parsed.website?.trim() || prev.website,
      }));

      setActiveTab("preview"); // show preview immediately
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

  const makePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(`${f.firstName} ${f.lastName}`, 14, 20);
    doc.setFontSize(14); doc.setTextColor(100); doc.text(f.role || "", 14, 28);
    doc.setTextColor(0); doc.setFontSize(11);
    doc.text(`${f.phone || ""} | ${f.email || ""} | ${f.linkedin || ""} | ${f.github || ""}`, 14, 36);
    doc.setFontSize(12); doc.text("Summary", 14, 48);
    doc.setFontSize(10); doc.text(doc.splitTextToSize(f.summary || "", 180), 14, 54);
    doc.save("Resume.pdf");
  };

  const renderInput = (label, placeholder, key, rows = 1) => (
    <div className="flex flex-col">
      <label className="mb-1 font-semibold text-gray-700">{label}</label>
      {rows === 1 ? (
        <input type="text" placeholder={placeholder} value={f[key] || ""} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none transition" />
      ) : (
        <textarea rows={rows} placeholder={placeholder} value={f[key] || ""} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none transition resize-none" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600"><FileText /> Resume Builder</h1>
        <div className="flex gap-3">
          <button disabled={loading} onClick={handleAIAssist} className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100"><Sparkles size={16} /> AI Assist</button>
          <button onClick={() => setActiveTab("preview")} className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100"><Eye size={16} /> Preview</button>
          <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100"><Save size={16} /> Save</button>
          <button onClick={makePDF} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Download size={16} /> Download</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white shadow-lg p-6 border-r overflow-y-auto">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Templates</h2>
          {["Modern","Classic","Creative","Minimal"].map(t => (
            <div key={t} onClick={() => setTemplate(t)} className={`p-3 rounded cursor-pointer border mb-2 ${template===t ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>{t}</div>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-6 border-b px-6 mt-4">
            {[{key:"personal", label:"Personal"},{key:"experience",label:"Experience"},{key:"education",label:"Education"},{key:"skills",label:"Skills"},{key:"preview",label:"Preview"}].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`pb-2 font-medium ${activeTab===t.key ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>{t.label}</button>
            ))}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {loading && <div className="mb-4 text-sm text-indigo-600">AI generating content, please wait...</div>}
            {error && <div className="mb-4 text-sm text-red-600">Error: {error}</div>}

            {activeTab==="preview" ? (
              <div className={`p-10 shadow-xl max-w-3xl mx-auto ${templateStyles[template].container} ${templateStyles[template].font}`}>
                {photo && <div className="flex justify-center mb-6"><img src={photo} alt="Profile" className={templateStyles[template].photoShape}/></div>}
                <h1 className={`text-center ${templateStyles[template].title}`}>{f.firstName} {f.lastName}</h1>
                <p className="text-xl text-indigo-600 text-center font-medium">{f.role}</p>
                <p className="mb-4 text-gray-600 text-center mt-2">{f.email} | {f.phone} | {f.location}</p>
                <p className="mb-4 text-gray-600 text-center">{f.linkedin && <>LinkedIn: {f.linkedin} | </>} {f.github && <>GitHub: {f.github} | </>} {f.website && <>Website: {f.website}</>}</p>
                <hr className="my-4"/>
                <div className="mb-4"><h3 className={templateStyles[template].sectionTitle}>Summary</h3><p>{f.summary}</p></div>
                <div className="mb-4"><h3 className={templateStyles[template].sectionTitle}>Experience</h3><p style={{whiteSpace:"pre-line"}}>{f.experience}</p></div>
                <div className="mb-4"><h3 className={templateStyles[template].sectionTitle}>Skills</h3><p>{f.skills}</p></div>
                <div className="mb-4"><h3 className={templateStyles[template].sectionTitle}>Education</h3><p>{f.education}</p></div>
                <div className="mb-4"><h3 className={templateStyles[template].sectionTitle}>Projects</h3><p style={{whiteSpace:"pre-line"}}>{f.projects}</p></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab==="personal" && <>
                  <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="text-gray-400 mb-2" size={32}/>
                    <span className="text-gray-600 font-medium">{photo ? "Change Profile Photo" : "Upload Profile Photo"}</span>
                  </div>
                  {renderInput("First Name","John","firstName")}
                  {renderInput("Last Name","Doe","lastName")}
                  {renderInput("Target Role (For AI)","React Developer","role")}
                  {renderInput("Email","john@example.com","email")}
                  {renderInput("Phone","123-456-7890","phone")}
                  {renderInput("Location","New York, USA","location")}
                  {renderInput("LinkedIn","linkedin.com/in/johndoe","linkedin")}
                  {renderInput("GitHub","github.com/johndoe","github")}
                  {renderInput("Website","example.com","website")}
                  {renderInput("Professional Summary","Summary...","summary",4)}
                </>}
                {activeTab==="experience" && renderInput("Work Experience","Describe...","experience",6)}
                {activeTab==="skills" && renderInput("Skills","List skills...","skills",4)}
                {activeTab==="education" && renderInput("Education","Degree...","education",4)}
                {activeTab==="projects" && renderInput("Projects","Project details...","projects",4)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

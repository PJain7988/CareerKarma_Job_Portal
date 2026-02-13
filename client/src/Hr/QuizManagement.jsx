import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"; 
import { Plus, Zap, Users, BarChart3, X, UserCheck, Copy } from "lucide-react"; 

const DEFAULT_MOCK_QUIZZES = [
  { id: "default_1", title: "React Fundamentals", category: "Frontend", level: "Easy", status: "Active", duration: "10", questions: [], attempts: 120, published: true },
  { id: "default_2", title: "Node.js Basics", category: "Backend", level: "Medium", status: "Active", duration: "15", questions: [], attempts: 85, published: true }
];

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("hr_demo_quizzes");
    let initialList = saved ? JSON.parse(saved) : [];
    if (initialList.length < 2) initialList = [...initialList, ...DEFAULT_MOCK_QUIZZES];
    return initialList;
  });
  
  const [quizForm, setQuizForm] = useState({ title: "", description: "", category: "", subject: "", level: "Easy", status: "Active", duration: "10" });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false); 
  const [currentQuizResults, setCurrentQuizResults] = useState([]); 
  const [currentQuizIndex, setCurrentQuizIndex] = useState(null);
  const [questionsForm, setQuestionsForm] = useState([]);

  useEffect(() => { localStorage.setItem("hr_demo_quizzes", JSON.stringify(quizzes)); }, [quizzes]);

  const handleQuizFormChange = (e) => setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  const handleAddOrEditQuiz = () => {
    if (!quizForm.title.trim()) return;
    const safeDuration = parseInt(quizForm.duration) || 10;
    const updated = [{ id: Date.now(), ...quizForm, duration: safeDuration, questions: [], attempts: 0, published: false }, ...quizzes];
    setQuizzes(updated);
    setQuizForm({ title: "", description: "", category: "", subject: "", level: "Easy", status: "Active", duration: "10" });
  };
  const handleDeleteQuiz = (index) => { if(window.confirm("Delete?")) setQuizzes(quizzes.filter((_, i) => i !== index)); };
  
  const openQuestionModal = (index) => { setCurrentQuizIndex(index); setQuestionsForm(quizzes[index].questions || []); setShowQuestionModal(true); };
  const saveQuestions = () => {
      const updated = [...quizzes]; updated[currentQuizIndex].questions = questionsForm; setQuizzes(updated); setShowQuestionModal(false);
  };
  const addQ = () => setQuestionsForm([...questionsForm, { title: "", options: ["","","",""], correctOption: 0 }]);
  const changeQ = (i, f, v) => { const u = [...questionsForm]; u[i][f] = v; setQuestionsForm(u); };
  const changeOpt = (qi, oi, v) => { const u = [...questionsForm]; u[qi].options[oi] = v; setQuestionsForm(u); };

  // --- ROBUST RESULTS VIEWER ---
  const handleViewResults = (quizId) => {
    const allResults = JSON.parse(localStorage.getItem("hr_shared_quiz_results") || "[]");
    // Filter out results for this quiz, and ensure they have valid data
    const filtered = allResults.filter(r => r.quizId === quizId && r.studentName);
    setCurrentQuizResults(filtered);
    setShowResultsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-8">HR Quiz Dashboard</h1>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Create New Quiz</h2>
            <div className="grid md:grid-cols-4 gap-4">
                <input name="title" placeholder="Quiz Title" value={quizForm.title} onChange={handleQuizFormChange} className="p-2 border rounded col-span-2" />
                <input name="category" placeholder="Category" value={quizForm.category} onChange={handleQuizFormChange} className="p-2 border rounded" />
                <input type="number" name="duration" placeholder="Mins" value={quizForm.duration} onChange={handleQuizFormChange} className="p-2 border rounded" />
                <button onClick={handleAddOrEditQuiz} className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 col-span-4">Create Quiz</button>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz, index) => (
                <div key={quiz.id} className="border rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-indigo-700">{quiz.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{quiz.category} • {quiz.duration}m</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openQuestionModal(index)} className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" title="Edit Questions"><FiEdit/></button>
                            <button onClick={() => handleDeleteQuiz(index)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><FiTrash2/></button>
                            <button onClick={() => handleViewResults(quiz.id)} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="View Results"><Users size={16}/></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {showQuestionModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-auto">
            <div className="bg-white p-6 rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowQuestionModal(false)} className="absolute top-4 right-4"><X/></button>
              <h2 className="text-xl font-bold mb-4">Edit Questions</h2>
              {questionsForm.map((q, qi) => (
                <div key={qi} className="mb-6 border p-4 rounded bg-gray-50">
                  <input placeholder="Question Title" value={q.title} onChange={(e) => changeQ(qi, "title", e.target.value)} className="w-full mb-3 p-2 border rounded font-medium" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {q.options.map((opt, oi) => (<input key={oi} placeholder={`Option ${oi+1}`} value={opt} onChange={(e) => changeOpt(qi, oi, e.target.value)} className="p-2 border rounded" />))}
                  </div>
                  <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-green-700">Correct Answer:</label>
                      <select value={q.correctOption} onChange={(e) => changeQ(qi, "correctOption", Number(e.target.value))} className="p-1 border rounded bg-white text-sm">
                          <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                      </select>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                  <button onClick={addQ} className="px-4 py-2 bg-green-100 text-green-700 rounded font-bold">+ Add Question</button>
                  <button onClick={saveQuestions} className="px-4 py-2 bg-indigo-600 text-white rounded ml-auto font-bold">Save All</button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS MODAL (FIXED UNDEFINED) */}
        {showResultsModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowResultsModal(false)} className="absolute top-4 right-4"><X/></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCheck className="text-green-600"/> Student Results</h3>
              {currentQuizResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No valid attempts recorded yet.</div>
              ) : (
                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {currentQuizResults.map((r, i) => (
                          <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                              <div>
                                  <p className="font-bold text-gray-800">{r.studentName}</p>
                                  {/* SAFE EMAIL DISPLAY */}
                                  <p className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer" 
                                     title="Click to Copy" 
                                     onClick={() => {
                                         if(r.studentEmail && r.studentEmail !== "No Email") {
                                            navigator.clipboard.writeText(r.studentEmail);
                                            alert("Email copied!");
                                         }
                                     }}>
                                      {r.studentEmail && r.studentEmail !== "undefined" ? r.studentEmail : "No Email Provided"} 
                                      <Copy size={10}/>
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${r.score/r.total >= 0.5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                      {r.score}/{r.total}
                                  </span>
                              </div>
                          </li>
                      ))}
                  </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagement;
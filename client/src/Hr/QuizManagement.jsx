import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi"; 
import { Plus, Users, X, UserCheck, Copy, BrainCircuit, Target, Clock, BookOpen } from "lucide-react"; 

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false); 
  const [currentQuizResults, setCurrentQuizResults] = useState([]); 
  const [currentQuizIndex, setCurrentQuizIndex] = useState(null);
  const [questionsForm, setQuestionsForm] = useState([]);

  useEffect(() => { localStorage.setItem("hr_demo_quizzes", JSON.stringify(quizzes)); }, [quizzes]);

  const handleQuizFormChange = (e) => setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  const handleAddOrEditQuiz = (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;
    const safeDuration = parseInt(quizForm.duration) || 10;
    const updated = [{ id: Date.now(), ...quizForm, duration: safeDuration, questions: [], attempts: 0, published: false }, ...quizzes];
    setQuizzes(updated);
    setQuizForm({ title: "", description: "", category: "", subject: "", level: "Easy", status: "Active", duration: "10" });
    setShowCreateModal(false);
  };
  const handleDeleteQuiz = (index) => { if(window.confirm("Are you sure you want to delete this quiz?")) setQuizzes(quizzes.filter((_, i) => i !== index)); };
  
  const openQuestionModal = (index) => { setCurrentQuizIndex(index); setQuestionsForm(quizzes[index].questions || []); setShowQuestionModal(true); };
  const saveQuestions = () => {
      const updated = [...quizzes]; updated[currentQuizIndex].questions = questionsForm; setQuizzes(updated); setShowQuestionModal(false);
  };
  const addQ = () => setQuestionsForm([...questionsForm, { title: "", options: ["","","",""], correctOption: 0 }]);
  const changeQ = (i, f, v) => { const u = [...questionsForm]; u[i][f] = v; setQuestionsForm(u); };
  const changeOpt = (qi, oi, v) => { const u = [...questionsForm]; u[qi].options[oi] = v; setQuestionsForm(u); };

  const handleViewResults = (quizId) => {
    const allResults = JSON.parse(localStorage.getItem("hr_shared_quiz_results") || "[]");
    const filtered = allResults.filter(r => r.quizId === quizId && r.studentName);
    setCurrentQuizResults(filtered);
    setShowResultsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><BrainCircuit className="text-indigo-600" size={32}/> Quiz Management</h1>
            <p className="text-gray-500 mt-1">Create assessments and track candidate performance.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <Plus size={20}/> Create Assessment
          </button>
        </div>

        {quizzes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <BrainCircuit size={64} className="mx-auto text-gray-300 mb-4"/>
                <h3 className="text-xl font-medium text-gray-600">No quizzes available.</h3>
                <p className="text-gray-400 mt-2">Click 'Create Assessment' to get started.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 flex flex-col group">
                        <div className="h-2 bg-indigo-600"></div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{quiz.title}</h3>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{quiz.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><Target size={14} className="text-indigo-500"/> {quiz.category || "General"}</span>
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><Clock size={14} className="text-indigo-500"/> {quiz.duration} mins</span>
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><BookOpen size={14} className="text-indigo-500"/> {quiz.questions?.length || 0} Qs</span>
                            </div>
                            <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center">
                                <button onClick={() => handleViewResults(quiz.id)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"><Users size={16}/> Results</button>
                                <div className="flex gap-2">
                                    <button onClick={() => openQuestionModal(index)} className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition" title="Edit Questions"><FiEdit size={18}/></button>
                                    <button onClick={() => handleDeleteQuiz(index)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition"><FiTrash2 size={18}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* CREATE MODAL */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-8 relative">
                    <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"><X size={20}/></button>
                    <h2 className="text-2xl font-black mb-6 text-gray-900">Create New Assessment</h2>
                    <form onSubmit={handleAddOrEditQuiz} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Quiz Title</label>
                            <input name="title" value={quizForm.title} onChange={handleQuizFormChange} placeholder="e.g. React Basics" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600 uppercase">Category</label>
                                <input name="category" value={quizForm.category} onChange={handleQuizFormChange} placeholder="e.g. Frontend" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600 uppercase">Duration (Mins)</label>
                                <input type="number" name="duration" value={quizForm.duration} onChange={handleQuizFormChange} placeholder="10" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required min="1" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Level</label>
                            <select name="level" value={quizForm.level} onChange={handleQuizFormChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">Create Assessment</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* QUESTIONS MODAL */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
            <div className="bg-white p-8 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">Edit Quiz Questions</h2>
                <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"><X size={20}/></button>
              </div>
              
              {questionsForm.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-6">
                      <BrainCircuit size={48} className="mx-auto text-gray-300 mb-3"/>
                      <p className="text-gray-500">No questions added yet.</p>
                  </div>
              ) : (
                <div className="space-y-6 mb-8">
                  {questionsForm.map((q, qi) => (
                    <div key={qi} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm relative">
                      <div className="absolute -left-3 -top-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">{qi + 1}</div>
                      <input placeholder="Question Text" value={q.title} onChange={(e) => changeQ(qi, "title", e.target.value)} className="w-full mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-gray-800" />
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, oi) => (
                          <div className="relative" key={oi}>
                              <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 uppercase">Opt {oi+1}</span>
                              <input placeholder={`Option ${oi+1} text`} value={opt} onChange={(e) => changeOpt(qi, oi, e.target.value)} className="w-full p-3 pl-14 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
                          <label className="text-sm font-bold text-green-800">Correct Answer:</label>
                          <select value={q.correctOption} onChange={(e) => changeQ(qi, "correctOption", Number(e.target.value))} className="p-2 border border-green-200 rounded-lg bg-white text-sm font-bold text-green-700 outline-none focus:ring-2 focus:ring-green-500">
                              <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                          </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={addQ} className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center gap-2"><Plus size={18}/> Add Question</button>
                  <button onClick={saveQuestions} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold ml-auto shadow-lg hover:bg-indigo-700 transition">Save Assessment</button>
              </div>
            </div>
          </div>
        )}

        {showResultsModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowResultsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition"><X size={18}/></button>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-900"><UserCheck className="text-indigo-600"/> Candidate Results</h3>
              {currentQuizResults.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No attempts recorded yet.</p>
                  </div>
              ) : (
                  <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {currentQuizResults.map((r, i) => (
                          <li key={i} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition rounded-xl border border-gray-100">
                              <div>
                                  <p className="font-bold text-gray-900">{r.studentName}</p>
                                  <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 cursor-pointer mt-1" 
                                     title="Copy Email" 
                                     onClick={() => {
                                         if(r.studentEmail && r.studentEmail !== "No Email") {
                                            navigator.clipboard.writeText(r.studentEmail);
                                         }
                                     }}>
                                      {r.studentEmail && r.studentEmail !== "undefined" ? r.studentEmail : "No Email"} 
                                      <Copy size={10}/>
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
                              </div>
                              <div className="text-right">
                                  <div className="flex flex-col items-end">
                                      <span className={`px-3 py-1 rounded-full font-bold text-sm shadow-sm ${r.score/r.total >= 0.6 ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                          {r.score}/{r.total}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-400 mt-1">{Math.round((r.score/r.total)*100)}%</span>
                                  </div>
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
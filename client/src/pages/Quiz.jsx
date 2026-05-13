import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Trophy, Search, Layers, Zap, Clock, Users, Star, Crown, BarChart3, ArrowRight, ArrowLeft, RotateCcw, CheckCircle, Brain, Target, Shield
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const STATIC_QUIZZES = [
    { id: "s1", title: "React Fundamentals", category: "Frontend", level: "Beginner", duration: "10", participants: 1240, rating: 4.8 },
    { id: "s2", title: "Advanced Node.js", category: "Backend", level: "Advanced", duration: "15", participants: 850, rating: 4.9 },
    { id: "s3", title: "System Design Basics", category: "Architecture", level: "Intermediate", duration: "20", participants: 3200, rating: 4.7 }
];

const MOCK_QUESTIONS = [
  { question: "What is the Virtual DOM in React?", options: ["Direct HTML copy", "Lightweight JS representation", "Browser plugin", "Database"], correct: 1 },
  { question: "Which hook handles side effects?", options: ["useState", "useReducer", "useEffect", "useMemo"], correct: 2 },
  { question: "What is JSX?", options: ["JavaScript XML", "Java Syntax", "JSON XML", "No idea"], correct: 0 },
  { question: "How to pass data to child?", options: ["State", "Props", "Context", "Redux"], correct: 1 }
];

const QuizDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [allQuizzes, setAllQuizzes] = useState(STATIC_QUIZZES);

  const [userId, setUserId] = useState(null);
  const [attempts, setAttempts] = useState([]); 

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(900);
  const [leaderboard, setLeaderboard] = useState([]);

  const [userAnswers, setUserAnswers] = useState({}); 

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    let currentUserId = "guest";
    if (userInfoStr) { try { const user = JSON.parse(userInfoStr); currentUserId = user.id || "guest"; } catch (e) {} }
    setUserId(currentUserId);

    const loadData = () => {
      const savedData = localStorage.getItem("hr_demo_quizzes");
      let hrQuizzesToUse = [];
      if (savedData) {
        try {
          const hrQuizzes = JSON.parse(savedData);
          hrQuizzesToUse = hrQuizzes.map(q => ({
            id: q.id, title: q.title, category: q.category || "General", level: q.level,
            realQuestions: q.questions, questions: q.questions ? q.questions.length : 0,
            duration: q.duration || "10", rating: 5.0, participants: Math.floor(Math.random() * 500) + 50, creator: "HR Admin"
          }));
        } catch (e) {}
      }
      setAllQuizzes([...STATIC_QUIZZES, ...hrQuizzesToUse]);
      
      const storageKey = `student_quiz_attempts_${currentUserId}`;
      const savedAttempts = localStorage.getItem(storageKey);
      if (savedAttempts) setAttempts(JSON.parse(savedAttempts));
    };
    loadData();
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const myName = userInfo ? JSON.parse(userInfo).name : "You";
    const mockUsers = [{ name: "Sarah Jenkins", score: 98 }, { name: "Michael Chen", score: 96 }, { name: "David Ross", score: 94 }, { name: "Emily White", score: 89 }, { name: "Rahul Verma", score: 88 }];
    const myScore = Math.floor(Math.random() * (97 - 80 + 1)) + 80;
    setLeaderboard([...mockUsers, { name: `${myName} (You)`, score: myScore, isMe: true }].sort((a, b) => b.score - a.score));
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === "playing" && timer > 0) { interval = setInterval(() => setTimer((prev) => prev - 1), 1000); } 
    else if (timer === 0 && activeTab === "playing") { calculateFinalScore(); }
    return () => clearInterval(interval);
  }, [activeTab, timer]);

  const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    const questionsToUse = (quiz.realQuestions && quiz.realQuestions.length > 0) ? quiz.realQuestions : MOCK_QUESTIONS;
    setQuizQuestions(questionsToUse);
    setCurrentQuestionIndex(0); setScore(0); setSelectedOption(null); setUserAnswers({});
    setTimer(parseInt(quiz.duration) * 60 || 900);
    setActiveTab("playing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (index) => {
      setSelectedOption(index);
      setUserAnswers({...userAnswers, [currentQuestionIndex]: index});
  };

  const prevQuestion = () => {
      if (currentQuestionIndex > 0) {
          const prevIndex = currentQuestionIndex - 1;
          setCurrentQuestionIndex(prevIndex);
          setSelectedOption(userAnswers[prevIndex] !== undefined ? userAnswers[prevIndex] : null);
      }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setSelectedOption(userAnswers[nextIndex] !== undefined ? userAnswers[nextIndex] : null);
    } else {
        calculateFinalScore();
    }
  };

  const calculateFinalScore = () => {
      let finalScore = 0;
      quizQuestions.forEach((q, idx) => {
          const correct = q.correctOption !== undefined ? Number(q.correctOption) : q.correct;
          if (userAnswers[idx] === correct) finalScore++;
      });
      finishQuiz(finalScore);
  };

  const saveGlobalResult = (quizId, finalScore, totalQuestions) => {
    let userInfo = {};
    try {
        const stored = localStorage.getItem("userInfo");
        if (stored) userInfo = JSON.parse(stored);
    } catch (e) {}

    const studentName = userInfo.name || "Guest User";
    const studentEmail = userInfo.email || "student@careerkarma.com"; 

    const newResult = { quizId, studentName, studentEmail, score: finalScore, total: totalQuestions, date: new Date().toLocaleDateString() };
    const globalResults = JSON.parse(localStorage.getItem("hr_shared_quiz_results") || "[]");
    const filteredResults = globalResults.filter(r => !(r.quizId === quizId && r.studentEmail === studentEmail));
    
    filteredResults.push(newResult);
    localStorage.setItem("hr_shared_quiz_results", JSON.stringify(filteredResults));
  };

  const finishQuiz = (finalScore) => {
    if (!attempts.includes(currentQuiz.id)) {
        const newAttempts = [...attempts, currentQuiz.id];
        setAttempts(newAttempts);
        if (userId) localStorage.setItem(`student_quiz_attempts_${userId}`, JSON.stringify(newAttempts));
        saveGlobalResult(currentQuiz.id, finalScore, quizQuestions.length);
    }
    setScore(finalScore);
    setActiveTab("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetQuiz = () => { setActiveTab("dashboard"); setCurrentQuiz(null); setScore(0); setCurrentQuestionIndex(0); };

  const categories = ["All", ...new Set(allQuizzes.map(q => q.category))];
  const levels = ["All", "Beginner", "Intermediate", "Advanced", "Easy", "Medium", "Hard"];

  const filteredQuizzes = allQuizzes.filter((quiz) => 
      (selectedCategory === "All" || quiz.category === selectedCategory) &&
      (selectedLevel === "All" || quiz.level === selectedLevel || (selectedLevel === "Beginner" && quiz.level === "Easy")) &&
      (quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || quiz.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "Attempted" ? attempts.includes(quiz.id) : true)
  );

  const chartData = leaderboard.slice(0, 5).map((user) => ({ name: user.name.split(' ')[0], score: user.score }));
  const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

  const progressPercentage = quizQuestions.length > 0 ? ((currentQuestionIndex) / quizQuestions.length) * 100 : 0;
  const scorePercentage = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* PREMIUM HERO NAVBAR */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-3">
                    <Brain className="text-yellow-400" size={40}/> Skill Assessments
                </h1>
                <p className="text-indigo-200 text-lg max-w-xl">Validate your technical expertise, track your progress, and stand out to top recruiters.</p>
            </div>
            
            <div className="flex bg-white/10 p-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-xl">
                <button onClick={() => setActiveTab("dashboard")} className={`px-8 py-3 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === "dashboard" || activeTab === "playing" || activeTab === "result" ? "bg-white text-indigo-900 shadow-lg" : "text-white hover:bg-white/10"}`}>
                    <LayoutDashboard size={18} /> Assessments
                </button>
                <button onClick={() => setActiveTab("leaderboard")} className={`px-8 py-3 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === "leaderboard" ? "bg-white text-indigo-900 shadow-lg" : "text-white hover:bg-white/10"}`}>
                    <Trophy size={18} /> Leaderboard
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {/* ================= PLAYING STATE ================= */}
        {activeTab === "playing" && quizQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header & Progress */}
            <div className="bg-gray-50 border-b p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Target className="text-indigo-600"/> {currentQuiz?.title}</h2>
                    <div className={`px-4 py-2 rounded-lg font-mono font-bold flex items-center gap-2 shadow-sm ${timer < 60 ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' : 'bg-white text-indigo-700 border border-gray-200'}`}>
                        <Clock size={16}/> {formatTime(timer)}
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progressPercentage)}% Completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {/* Question Area */}
            <div className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                    {quizQuestions[currentQuestionIndex].title || quizQuestions[currentQuestionIndex].question}
                </h3>
                <div className="space-y-4 mb-10">
                    {quizQuestions[currentQuestionIndex].options.map((opt, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => handleAnswer(idx)} 
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${selectedOption === idx ? "border-indigo-600 bg-indigo-50/50 shadow-md" : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"}`}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition ${selectedOption === idx ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-400 group-hover:border-indigo-400 group-hover:text-indigo-500"}`}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className={`text-lg font-medium ${selectedOption === idx ? "text-indigo-900" : "text-gray-700"}`}>{opt}</span>
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition">
                        <ArrowLeft size={20}/> Previous
                    </button>
                    <button 
                        onClick={nextQuestion} 
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition ${selectedOption !== null ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        disabled={selectedOption === null}
                    >
                        {currentQuestionIndex + 1 === quizQuestions.length ? "Submit Test" : "Next Question"} <ArrowRight size={20}/>
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* ================= RESULT STATE ================= */}
        {activeTab === "result" && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center animate-in zoom-in duration-500">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${scorePercentage >= 80 ? 'bg-green-50' : scorePercentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                {scorePercentage >= 80 ? <Trophy size={64} className="text-green-500" /> : scorePercentage >= 50 ? <Shield size={64} className="text-yellow-500"/> : <Zap size={64} className="text-red-500"/>}
            </div>
            
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                {scorePercentage >= 80 ? "Outstanding!" : scorePercentage >= 50 ? "Good Job!" : "Keep Practicing!"}
            </h2>
            <p className="text-gray-500 text-lg mb-10">You've completed the {currentQuiz?.title} assessment.</p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Final Score</p>
                    <p className={`text-5xl font-extrabold ${scorePercentage >= 80 ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {scorePercentage}%
                    </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Accuracy</p>
                    <p className="text-5xl font-extrabold text-indigo-900">
                        {score}/{quizQuestions.length}
                    </p>
                </div>
            </div>

            <button onClick={resetQuiz} className="bg-indigo-900 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-black transition flex items-center gap-3 mx-auto">
                <LayoutDashboard size={20}/> Return to Dashboard
            </button>
          </div>
        )}

        {/* ================= DASHBOARD STATE ================= */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in duration-500">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <input type="text" placeholder="Search assessments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm font-medium text-gray-700 outline-none">
                    <option value="All">All Status</option>
                    <option value="Attempted">Completed ({attempts.length})</option>
                </select>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm font-medium text-gray-700 outline-none max-w-[180px]">
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm font-medium text-gray-700 outline-none">
                    {levels.map((lvl) => (<option key={lvl} value={lvl}>{lvl}</option>))}
                </select>
              </div>
            </div>

            {/* Quiz Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => {
                  const isAttempted = attempts.includes(quiz.id);
                  return (
                    <div key={quiz.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">{quiz.category}</span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${quiz.level === "Easy" || quiz.level === "Beginner" ? "bg-green-50 text-green-700" : quiz.level === "Hard" || quiz.level === "Advanced" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
                                {quiz.level}
                            </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition">{quiz.title}</h2>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2">Test your knowledge and benchmark your skills against industry standards in this {quiz.duration} minute assessment.</p>
                            
                            <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col gap-4">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {quiz.duration} mins</span>
                                    <span className="flex items-center gap-1.5"><Users size={14} /> {quiz.participants} taken</span>
                                </div>
                                {isAttempted ? (
                                    <button onClick={() => startQuiz(quiz)} className="w-full py-3 rounded-xl font-bold shadow-sm bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center gap-2 transition border border-green-200">
                                        <CheckCircle size={18}/> Retake Assessment
                                    </button>
                                ) : (
                                    <button onClick={() => startQuiz(quiz)} className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2">
                                        Start Assessment <ArrowRight size={18}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <Trophy className="mx-auto text-gray-300 mb-4" size={64}/>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Assessments Found</h3>
                    <p className="text-gray-500">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= LEADERBOARD STATE ================= */}
        {activeTab === "leaderboard" && (
          <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Crown className="text-yellow-500" size={28}/> Global Leaderboard
                    </h2>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Rank</th>
                                <th className="p-4">Candidate</th>
                                <th className="p-4 text-right">Top Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.map((user, idx) => (
                                <tr key={idx} className={`transition hover:bg-gray-50 ${user.isMe ? "bg-indigo-50 hover:bg-indigo-100" : ""}`}>
                                    <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                                        {idx === 0 ? <Crown className="text-yellow-500" size={20}/> : 
                                         idx === 1 ? <Crown className="text-gray-400" size={20}/> : 
                                         idx === 2 ? <Crown className="text-amber-700" size={20}/> : 
                                         <span className="w-5 text-center text-gray-400">{idx + 1}</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${user.isMe ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className={`font-medium ${user.isMe ? "text-indigo-900 font-bold" : "text-gray-800"}`}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.isMe ? "bg-indigo-200 text-indigo-800" : "bg-gray-100 text-gray-700"}`}>
                                            {user.score}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 self-start">
                    <BarChart3 className="text-indigo-600" /> Score Distribution
                </h2>
                <div className="flex-1 flex items-center justify-center w-full">
                    <PieChart width={280} height={280}>
                        <Pie data={chartData} cx={140} cy={140} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="score">
                            {chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                    </PieChart>
                </div>
                <div className="w-full mt-6 space-y-2">
                    {chartData.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div> {d.name}</span>
                            <span className="font-bold text-gray-900">{d.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;
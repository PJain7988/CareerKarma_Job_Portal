import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Trophy, Search, Layers, Zap, Clock, Users, Star, Crown, Medal, BarChart3, ArrowRight, ArrowLeft, RotateCcw, RefreshCw, CheckCircle
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const STATIC_QUIZZES = [];
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
      if (savedData) {
        try {
          const hrQuizzes = JSON.parse(savedData);
          const formattedHrQuizzes = hrQuizzes.map(q => ({
            id: q.id, title: q.title, category: q.category || "General", level: q.level,
            realQuestions: q.questions, questions: q.questions ? q.questions.length : 0,
            duration: q.duration || "10", rating: 5.0, participants: Math.floor(Math.random() * 500) + 50, creator: "HR Admin"
          }));
          setAllQuizzes([...STATIC_QUIZZES, ...formattedHrQuizzes]);
        } catch (e) {}
      }
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
    else if (timer === 0 && activeTab === "playing") { finishQuiz(); }
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
    } catch (e) { console.error("Error parsing user info"); }

    const studentName = userInfo.name || "Guest User";
    
    const studentEmail = userInfo.email || "student@careerkarma.com"; 

    const newResult = {
      quizId,
      studentName,
      studentEmail, // working pheww
      score: finalScore,
      total: totalQuestions,
      date: new Date().toLocaleDateString()
    };

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
    setScore(finalScore); // Show score
    setActiveTab("result");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 font-sans">
      <nav className="bg-indigo-700 text-white px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold tracking-wide flex items-center gap-2">Quiz Portal</h1>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-white text-indigo-700 shadow-md" : "hover:bg-indigo-600"}`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab("leaderboard")} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${activeTab === "leaderboard" ? "bg-white text-indigo-700 shadow-md" : "hover:bg-indigo-600"}`}><Trophy size={18} /> Leaderboard</button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        {activeTab === "playing" && quizQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div><h2 className="text-2xl font-bold text-indigo-700">{currentQuiz?.title}</h2><p className="text-gray-500 text-sm">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p></div>
              <div className={`px-4 py-2 rounded-full font-mono font-bold ${timer < 60 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>{formatTime(timer)}</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{quizQuestions[currentQuestionIndex].title || quizQuestions[currentQuestionIndex].question}</h3>
            <div className="space-y-4 mb-8">
              {quizQuestions[currentQuestionIndex].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOption === idx ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              {/* PREVIOUS BUTTON */}
              <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="px-6 py-3 rounded-xl font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-2"><ArrowLeft size={20}/> Previous</button>
              
              {/* NEXT/FINISH BUTTON */}
              <button onClick={nextQuestion} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                {currentQuestionIndex + 1 === quizQuestions.length ? "Finish" : "Next"} <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        )}
        {activeTab === "result" && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="mb-6 inline-block p-4 rounded-full bg-green-100"><Trophy size={64} className="text-green-600" /></div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Quiz Completed!</h2>
            <div className="flex justify-center gap-8 mb-10 mt-8">
              <div className="p-4 bg-indigo-50 rounded-xl min-w-[120px]"><p className="text-sm text-gray-500">Score</p><p className="text-3xl font-bold text-indigo-700">{Math.round((score / quizQuestions.length) * 100)}%</p></div>
              <div className="p-4 bg-purple-50 rounded-xl min-w-[120px]"><p className="text-sm text-gray-500">Correct</p><p className="text-3xl font-bold text-purple-700">{score}/{quizQuestions.length}</p></div>
            </div>
            <button onClick={resetQuiz} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black flex items-center gap-2 mx-auto"><RotateCcw size={20}/> Back to Dashboard</button>
          </div>
        )}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <div className="relative w-full md:w-1/3"><input type="text" placeholder="Search quizzes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" /><Search size={20} className="absolute left-4 top-3.5 text-indigo-500" /></div>
              <div className="flex gap-4">
                <div className="relative"><CheckCircle className="absolute left-3 top-3 text-indigo-500" size={18} /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-10 pr-4 py-2 rounded-full border bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"><option value="All">All Quizzes</option><option value="Attempted">Attempted ({attempts.length})</option></select></div>
                <div className="relative"><Layers className="absolute left-3 top-3 text-indigo-500" size={18} /><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="pl-10 pr-4 py-2 rounded-full border bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 max-w-[200px]">{categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                <div className="relative"><Zap className="absolute left-3 top-3 text-indigo-500" size={18} /><select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="pl-10 pr-4 py-2 rounded-full border bg-white shadow-sm focus:ring-2 focus:ring-indigo-500">{levels.map((lvl) => (<option key={lvl} value={lvl}>{lvl}</option>))}</select></div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => {
                  const isAttempted = attempts.includes(quiz.id);
                  return (
                    <div key={quiz.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50"><span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">{quiz.category}</span><span className={`px-2 py-1 rounded text-xs font-bold ${quiz.level === "Easy" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{quiz.level}</span></div>
                        <div className="p-6"><h2 className="text-lg font-bold text-gray-800 mb-4">{quiz.title}</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6"><span className="flex items-center gap-1"><Clock size={14} /> {quiz.duration}m</span><span className="flex items-center gap-1"><Users size={14} /> {quiz.participants}</span><span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> 4.8</span></div>
                            {isAttempted ? (<button onClick={() => startQuiz(quiz)} className="w-full py-2.5 rounded-lg font-semibold shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"><CheckCircle size={16} className="text-green-600"/> Retake Quiz</button>) : (<button onClick={() => startQuiz(quiz)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow transition">Start Quiz</button>)}
                        </div>
                    </div>
                  );
                })
              ) : (<div className="col-span-full text-center py-12"><Trophy className="mx-auto text-gray-300 mb-3" size={48}/><p className="text-gray-500 text-lg">No quizzes found.</p></div>)}
            </div>
          </div>
        )}
        {activeTab === "leaderboard" && (
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg border"><h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Leaderboard</h2><table className="w-full border-collapse rounded-lg overflow-hidden text-sm"><thead><tr className="bg-indigo-100 text-indigo-900 text-left"><th className="p-3">Rank</th><th className="p-3">Student</th><th className="p-3">Score</th></tr></thead><tbody>{leaderboard.map((user, idx) => (<tr key={idx} className={`border-b ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition ${user.isMe ? "bg-indigo-50 font-bold border-l-4 border-indigo-500" : ""}`}><td className="p-3 font-semibold flex items-center gap-2">{idx === 0 && <Crown className="text-yellow-500" size={16} />}{idx + 1}</td><td className="p-3">{user.name}</td><td className="p-3 text-indigo-700 font-bold">{user.score}%</td></tr>))}</tbody></table></div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border flex flex-col items-center"><h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-600" /> Score Distribution</h2><PieChart width={300} height={300}><Pie data={chartData} cx={150} cy={150} labelLine={false} outerRadius={100} fill="#8884d8" dataKey="score" label={({ name }) => name}>{chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;
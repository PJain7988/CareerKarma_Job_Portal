import React, { useState, useEffect } from "react";
import { BookOpen, Clock, DollarSign, User, Star, Search, PlayCircle, CheckCircle, X } from "lucide-react";

const DEFAULT_MOCK_COURSES = [
  { id: "m1", title: "Python for Data Science", instructor: "Dr. Angela Yu", price: "$12.99", duration: "22 Weeks", status: "Published", image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg", category: "Data Science", description: "Master Python and data analysis libraries like Pandas and NumPy." },
  { id: "m2", title: "Complete Digital Marketing", instructor: "Rob Percival", price: "Free", duration: "4 Weeks", status: "Published", image: "https://cdn-icons-png.flaticon.com/512/1998/1998087.png", category: "Marketing", description: "Learn SEO, Social Media Marketing, and Google Ads from scratch." },
  { id: "m3", title: "UI/UX Design Masterclass", instructor: "Gary Simon", price: "$49.99", duration: "8 Weeks", status: "Published", image: "https://cdn-icons-png.flaticon.com/512/5202/5202998.png", category: "Design", description: "Design beautiful interfaces using Figma and Adobe XD." },
  { id: "m4", title: "Machine Learning A-Z", instructor: "Kirill Eremenko", price: "$94.99", duration: "12 Weeks", status: "Published", image: "https://upload.wikimedia.org/wikipedia/commons/1/17/Google-flutter-logo.png", category: "AI", description: "Build powerful ML models using Python and R." },
  { id: "m5", title: "Docker & Kubernetes", instructor: "Stephen Grider", price: "$19.99", duration: "6 Weeks", status: "Published", image: "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png", category: "DevOps", description: "Master containerization and orchestration." },
  { id: "m6", title: "Financial Analysis 101", instructor: "365 Careers", price: "Free", duration: "3 Weeks", status: "Published", image: "https://cdn-icons-png.flaticon.com/512/2702/2702602.png", category: "Finance", description: "Excel skills for financial modeling and valuation." }
];

const LMS = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCourse, setViewingCourse] = useState(null);
  const [userId, setUserId] = useState(null); // Store usr id

  useEffect(() => {
    
    const userInfoStr = localStorage.getItem("userInfo");
    let currentUserId = "guest";
    if (userInfoStr) {
        try {
            const user = JSON.parse(userInfoStr);
            currentUserId = user.id || "guest";
        } catch (e) {}
    }
    setUserId(currentUserId);

    const loadData = () => {
      
      const savedCourses = localStorage.getItem("hr_courses");
      let hrList = savedCourses ? JSON.parse(savedCourses) : [];
      setCourses([...hrList, ...DEFAULT_MOCK_COURSES]);


      const storageKey = `student_enrollments_${currentUserId}`;
      const savedEnrollments = localStorage.getItem(storageKey);
      if (savedEnrollments) setEnrolledIds(JSON.parse(savedEnrollments));
      else setEnrolledIds([]); // Reseting
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEnroll = (course) => {
    if (enrolledIds.includes(course.id)) {
        setViewingCourse(course);
        return;
    }
    if (course.price && course.price.toLowerCase() !== "free" && course.price !== "$0") {
        if(!window.confirm(`Pay ${course.price} to enroll?`)) return;
    }

    const newEnrollments = [...enrolledIds, course.id];
    setEnrolledIds(newEnrollments);
    
    
    if (userId) {
        localStorage.setItem(`student_enrollments_${userId}`, JSON.stringify(newEnrollments));
    }
    
    alert("Success! You are now enrolled.");
    setActiveTab("my");
  };

  const displayCourses = courses.filter(c => 
    c.status === "Published" && 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === "my" ? enrolledIds.includes(c.id) : true)
  );

  const [activeCourseTab, setActiveCourseTab] = useState("curriculum");
  const [courseNotes, setCourseNotes] = useState("");

  useEffect(() => {
    if (viewingCourse) {
      const savedNotes = localStorage.getItem(`notes_${userId}_${viewingCourse.id}`) || "";
      setCourseNotes(savedNotes);
      setActiveCourseTab("curriculum");
    }
  }, [viewingCourse, userId]);

  const saveNotes = () => {
    localStorage.setItem(`notes_${userId}_${viewingCourse.id}`, courseNotes);
    alert("Notes saved successfully!");
  };

  const renderCourseModal = () => {
    if (!viewingCourse) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl h-[90vh] flex flex-col relative">
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <PlayCircle size={24} className="text-indigo-400"/> {viewingCourse.title}
                    </h2>
                    <button onClick={() => setViewingCourse(null)} className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition">
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Video Player Section */}
                    <div className="flex-1 bg-black flex flex-col">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe 
                                className="absolute inset-0 w-full h-full" 
                                src="https://www.youtube.com/embed/jBzwzrDvZ18?autoplay=1" 
                                title="Course Video" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-6 bg-gray-900 text-gray-300 flex-1 overflow-y-auto">
                            <h3 className="text-white text-2xl font-bold mb-2">About this Course</h3>
                            <p className="leading-relaxed">{viewingCourse.description}</p>
                            <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><User size={16}/> Instructor: {viewingCourse.instructor}</span>
                                <span className="flex items-center gap-1"><Clock size={16}/> Duration: {viewingCourse.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="w-full md:w-96 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-white">
                            <button 
                                onClick={() => setActiveCourseTab("curriculum")} 
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeCourseTab === "curriculum" ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                            >
                                Curriculum
                            </button>
                            <button 
                                onClick={() => setActiveCourseTab("notes")} 
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeCourseTab === "notes" ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                            >
                                My Notes
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeCourseTab === "curriculum" ? (
                                <ul className="space-y-3">
                                    {[1,2,3,4,5,6].map(i => (
                                        <li key={i} className="flex items-center gap-3 text-sm p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition group">
                                            <div className="bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 transition">
                                                {i}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">Module {i}</p>
                                                <p className="text-xs text-gray-500">Video Lesson • 15 min</p>
                                            </div>
                                            <PlayCircle size={18} className="text-gray-300 group-hover:text-indigo-500 transition"/>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-4 flex items-start gap-2">
                                        <Star size={16} className="mt-0.5 shrink-0"/>
                                        <p>Jot down important timestamps and concepts. These are saved automatically to your device.</p>
                                    </div>
                                    <textarea 
                                        className="flex-1 w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                                        placeholder="Type your notes here..."
                                        value={courseNotes}
                                        onChange={(e) => setCourseNotes(e.target.value)}
                                    ></textarea>
                                    <button 
                                        onClick={saveNotes}
                                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Save Notes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {renderCourseModal()}
      
      <div className="bg-indigo-900 pt-16 pb-24 px-6 text-center text-white relative">
        <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Learning Hub</h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">Advance your career with courses taught by industry leaders.</p>
            <div className="max-w-lg mx-auto relative">
                <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-6 pl-12 rounded-full text-gray-800 shadow-xl outline-none" />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
            </div>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex bg-white p-1.5 rounded-full shadow-2xl z-20">
            <button onClick={() => setActiveTab("all")} className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === "all" ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
                All Courses
            </button>
            <button onClick={() => setActiveTab("my")} className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "my" ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
                My Learning <span className="bg-indigo-100 text-indigo-800 text-[10px] py-0.5 px-2 rounded-full">{enrolledIds.length}</span>
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        {displayCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl text-gray-500 font-medium">{activeTab === "my" ? "You haven't enrolled in any courses yet." : "No courses found."}</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col border border-gray-100 group">
                    <div className="h-48 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                        <img src={course.image || "https://via.placeholder.com/400x200?text=Course"} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt={course.title} onError={(e) => e.target.src = "https://via.placeholder.com/400x200?text=Course"}/>
                        {isEnrolled && <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1"><CheckCircle size={12} /> Enrolled</div>}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-2"><User size={14}/> {course.instructor}</p>
                        <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{course.price || "Free"}</span>
                                <span className="flex items-center gap-1 text-gray-400"><Clock size={14}/> {course.duration}</span>
                            </div>
                            <button onClick={() => handleEnroll(course)} className={`px-5 py-2 rounded-lg font-semibold text-sm transition shadow-sm ${isEnrolled ? "bg-gray-900 text-white hover:bg-black" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                                {isEnrolled ? "Continue" : "Enroll"}
                            </button>
                        </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LMS;
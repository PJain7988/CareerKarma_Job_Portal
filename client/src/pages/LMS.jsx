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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {viewingCourse && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl h-[85vh] flex flex-col">
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2"><PlayCircle size={20}/> {viewingCourse.title}</h2>
                    <button onClick={() => setViewingCourse(null)} className="hover:text-red-400 transition"><X size={24}/></button>
                </div>
                <div className="flex-1 flex">
                    <div className="flex-1 bg-black flex items-center justify-center text-white flex-col p-10 text-center">
                        <PlayCircle size={80} className="mb-6 opacity-80 hover:scale-110 transition duration-300 cursor-pointer text-indigo-500"/>
                        <h3 className="text-2xl font-bold">Start Learning</h3>
                    </div>
                    <div className="w-80 bg-gray-50 p-6 overflow-y-auto border-l border-gray-200">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">Course Info</h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{viewingCourse.description}</p>
                        <h4 className="font-bold text-xs text-gray-500 uppercase mb-3 tracking-wider">Curriculum</h4>
                        <ul className="space-y-2">
                            {[1,2,3,4].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition">
                                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">{i}</div>
                                    <span className="truncate">Module {i}: Lesson Title</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      )}

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
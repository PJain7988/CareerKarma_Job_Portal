import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, User, Image as ImageIcon, Users, X, PlayCircle, BookOpen, Clock, DollarSign } from "lucide-react";

const initialCourses = [
  { id: 1, title: "React for Beginners", instructor: "John Doe", price: "Free", duration: "4 Weeks", status: "Published", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800", videoUrl: "https://www.youtube.com/embed/jBzwzrDvZ18", description: "Learn React from scratch." }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState(() => { const s = localStorage.getItem("hr_courses"); return s ? JSON.parse(s) : initialCourses; });
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false); 
  const [enrollments, setEnrollments] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", instructor: "", price: "", duration: "", image: "", videoUrl: "", description: "", status: "Draft" });

  useEffect(() => { localStorage.setItem("hr_courses", JSON.stringify(courses)); }, [courses]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, image: formData.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" };
    if (editingId) setCourses(courses.map(c => c.id === editingId ? { ...payload, id: editingId } : c));
    else setCourses([{ ...payload, id: Date.now() }, ...courses]);
    setShowModal(false);
  };
  const handleDelete = (id) => { if(window.confirm("Are you sure you want to delete this course?")) setCourses(courses.filter(c => c.id !== id)); };

  const handleViewEnrollments = (courseId) => {
      const allEnrollments = JSON.parse(localStorage.getItem("hr_shared_course_enrollments") || "[]");
      const filtered = allEnrollments.filter(e => e.courseId === courseId);
      setEnrollments(filtered);
      setShowEnrollModal(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><BookOpen className="text-indigo-600" size={32}/> Course Management</h1>
            <p className="text-gray-500 mt-1">Create and manage your educational content.</p>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ title: "", instructor: "", price: "", duration: "", image: "", videoUrl: "", description: "", status: "Draft" }); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <Plus size={20}/> Create Course
          </button>
        </div>

        {courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4"/>
                <h3 className="text-xl font-medium text-gray-600">No courses available.</h3>
                <p className="text-gray-400 mt-2">Click 'Create Course' to get started.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col border border-gray-100 group">
                <div className="h-48 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                    {course.image ? <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onError={(e)=>e.target.src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"}/> : <ImageIcon className="text-gray-400"/>}
                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm ${course.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{course.status}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-2"><User size={14}/> {course.instructor}</p>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 mb-4">
                        <span className="flex items-center gap-1"><DollarSign size={14}/> {course.price || "Free"}</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        <button onClick={() => handleViewEnrollments(course.id)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"><Users size={16}/> Students</button>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingId(course.id); setFormData(course); setShowModal(true); }} className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition"><Edit size={18}/></button>
                            <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition"><Trash size={18}/></button>
                        </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* CREATE MODAL */}
        {showModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">{editingId ? "Edit Course" : "Create New Course"}</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Course Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Master React JS" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Instructor Name</label>
                            <input name="instructor" value={formData.instructor} onChange={handleChange} placeholder="e.g. John Doe" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Price</label>
                            <input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. $49.99 or Free" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Duration</label>
                            <input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 8 Weeks" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Thumbnail Image URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Video Embed URL (Youtube/Vimeo)</label>
                            <div className="relative">
                                <PlayCircle className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <p className="text-[10px] text-gray-400">Provide an embed URL. Example: https://www.youtube.com/embed/jBzwzrDvZ18</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Course Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What will students learn?" rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-y" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">Save Course</button>
                    </div>
                </form>
            </div>
            </div>
        )}

        {/* ENROLLMENT MODAL */}
        {showEnrollModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-900"><Users className="text-indigo-600"/> Enrolled Students</h3>
                {enrollments.length === 0 ? <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">No students enrolled yet.</p> : (
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {enrollments.map((e, i) => (
                            <li key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{e.studentName?.[0] || "U"}</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 leading-tight">{e.studentName}</p>
                                    <p className="text-xs text-gray-500">{e.date}</p>
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

export default CourseManagement;
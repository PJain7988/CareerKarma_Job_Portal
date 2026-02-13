import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, User, Image as ImageIcon, Users, X } from "lucide-react";

const initialCourses = [{ id: 1, title: "React for Beginners", instructor: "John Doe", price: "Free", duration: "4 Weeks", status: "Published", image: "" }];

const CourseManagement = () => {
  const [courses, setCourses] = useState(() => { const s = localStorage.getItem("hr_courses"); return s ? JSON.parse(s) : initialCourses; });
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false); 
  const [enrollments, setEnrollments] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", instructor: "", price: "", duration: "", image: "", description: "", status: "Draft" });

  useEffect(() => { localStorage.setItem("hr_courses", JSON.stringify(courses)); }, [courses]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, image: formData.image || "https://via.placeholder.com/300" };
    if (editingId) setCourses(courses.map(c => c.id === editingId ? { ...payload, id: editingId } : c));
    else setCourses([{ ...payload, id: Date.now() }, ...courses]);
    setShowModal(false);
  };
  const handleDelete = (id) => { if(window.confirm("Delete?")) setCourses(courses.filter(c => c.id !== id)); };

  
  const handleViewEnrollments = (courseId) => {
      const allEnrollments = JSON.parse(localStorage.getItem("hr_shared_course_enrollments") || "[]");
      const filtered = allEnrollments.filter(e => e.courseId === courseId);
      setEnrollments(filtered);
      setShowEnrollModal(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
        <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded shadow flex gap-2"><Plus/> Add Course</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="h-32 bg-gray-200 relative flex items-center justify-center">
                {course.image ? <img src={course.image} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'}/> : <ImageIcon/>}
                <span className="absolute top-2 right-2 bg-white px-2 py-1 text-xs font-bold rounded">{course.status}</span>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg">{course.title}</h3>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleViewEnrollments(course.id)} className="text-green-600 flex items-center gap-1 text-sm hover:underline"><Users size={14}/> Students</button>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingId(course.id); setFormData(course); setShowModal(true); }} className="text-indigo-600"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(course.id)} className="text-red-600"><Trash size={18}/></button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit" : "Add"} Course</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required />
                <input name="instructor" value={formData.instructor} onChange={handleChange} placeholder="Instructor" className="w-full p-2 border rounded" required />
                <div className="flex gap-2"><input name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" /><input name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration" className="w-full p-2 border rounded" /></div>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded"><option>Draft</option><option>Published</option></select>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded mt-4">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm relative shadow-xl">
            <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4"><X/></button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="text-green-600"/> Enrolled Students</h3>
            {enrollments.length === 0 ? <p className="text-gray-500 text-center py-4">No students enrolled yet.</p> : (
                <ul className="space-y-2">
                    {enrollments.map((e, i) => (
                        <li key={i} className="p-2 bg-gray-50 rounded flex justify-between text-sm">
                            <span className="font-medium">{e.studentName}</span>
                            <span className="text-gray-500">{e.date}</span>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
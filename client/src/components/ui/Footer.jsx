import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Linkedin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleProtectedLink = (e, path) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/register");
    }
  };

  return (
    <footer className="bg-indigo-900 text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-indigo-800 pb-12">
        
        <div>
          <h2 className="text-3xl font-extrabold mb-4">CareerKarma</h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-6">
            Empowering students to manage their career, learning, and skills effectively.
            Join the fastest growing community today.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-indigo-800 rounded-lg hover:bg-indigo-700 transition"><Mail size={18}/></a>
            <a href="#" className="p-2 bg-indigo-800 rounded-lg hover:bg-indigo-700 transition"><Linkedin size={18}/></a>
            <a href="#" className="p-2 bg-indigo-800 rounded-lg hover:bg-indigo-700 transition"><Instagram size={18}/></a>
            <a href="#" className="p-2 bg-indigo-800 rounded-lg hover:bg-indigo-700 transition"><Twitter size={18}/></a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6">Quick Links</h3>
          <ul className="space-y-3 text-indigo-200 text-sm">
            <li><Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link></li>
            
            <li>
                <a href="#" onClick={(e) => handleProtectedLink(e, "/courses")} className="hover:text-white transition">
                    LMS Courses
                </a>
            </li>
            <li>
                <a href="#" onClick={(e) => handleProtectedLink(e, "/resume")} className="hover:text-white transition">
                    Resume Builder
                </a>
            </li>
            
            {!isLoggedIn && (
                <li><Link to="/login" className="hover:text-white transition">Login / Register</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6">Resources</h3>
          <ul className="space-y-3 text-indigo-200 text-sm">
            <li><a href="#" className="hover:text-white transition">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Career Blog</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6">Stay Updated</h3>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your Email" className="w-full px-4 py-2 rounded bg-indigo-800 border border-indigo-700 text-white placeholder-indigo-400 focus:outline-none focus:border-white" />
            <button className="w-full bg-yellow-400 text-indigo-900 font-bold py-2 rounded hover:bg-yellow-300 transition">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className="text-center pt-8 text-indigo-400 text-sm">
        &copy; {new Date().getFullYear()} CareerKarma Inc. All rights reserved.
      </div>
    </footer>
  );
}
import React, { useState, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  X,
  Mail,
  Linkedin,
  Instagram,
  Twitter,
  Phone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Footer = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://getform.io/f/ayvewgeb", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("Message sent successfully! ✅");
        e.target.reset();
      } else {
        setStatus("Failed to send message. ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong. ❌");
    }

    setLoading(false);

    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <footer className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white mt-12 relative">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">CareerKarma</h2>
          <p className="text-gray-200">
            Empowering students to manage their career, learning, and skills effectively.
          </p>
          <div className="flex gap-4 text-white text-xl mt-2">
            <a href="mailto:hello@careerkarma.com" target="_blank" rel="noreferrer" title="Email"><Mail /></a>
            <a href="https://linkedin.com/company/careerkarma" target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin /></a>
            <a href="https://instagram.com/careerkarma" target="_blank" rel="noreferrer" title="Instagram"><Instagram /></a>
            <a href="https://twitter.com/careerkarma" target="_blank" rel="noreferrer" title="Twitter"><Twitter /></a>
            <a href="tel:+919876543210" title="Phone"><Phone /></a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li className="hover:text-yellow-400 cursor-pointer">Dashboard</li>
            <li className="hover:text-yellow-400 cursor-pointer">Resume</li>
            <li className="hover:text-yellow-400 cursor-pointer">Jobs</li>
            <li className="hover:text-yellow-400 cursor-pointer">Courses</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-200">
            <li className="hover:text-yellow-400 cursor-pointer">Blog</li>
            <li className="hover:text-yellow-400 cursor-pointer">FAQs</li>
            <li className="hover:text-yellow-400 cursor-pointer">Help Center</li>
            <li className="hover:text-yellow-400 cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        <div className="relative">
          <h3 className="font-semibold mb-4">Send Message</h3>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
              required
            />
            <textarea
              rows="3"
              name="message"
              placeholder="Your Message"
              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded font-medium transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>

          {status && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
              {status}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white border-opacity-20 mt-6 text-center py-4 text-gray-200 text-sm">
        &copy; {new Date().getFullYear()} CareerKarma. All rights reserved.
      </div>
    </footer>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [trendingOpen, setTrendingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [resume, setResume] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [jobFocused, setJobFocused] = useState(false);
  const [locFocused, setLocFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [warning, setWarning] = useState("");

  const locationInputRef = useRef(null);

  const fetchSuggestions = async (query, type) => {
    try {
      if (!query.trim()) return;
      const url =
        type === "search"
          ? `${BACKEND_URL}/api/suggest-jobs?q=${encodeURIComponent(query)}`
          : `${BACKEND_URL}/api/suggest-locations?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (type === "search") setSearchSuggestions(res.data || []);
      else setLocationSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      if (type === "search") setSearchSuggestions([]);
      else setLocationSuggestions([]);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  const handleInputChange = (value, type) => {
    if (type === "search") setSearchQuery(value);
    else setLocation(value);
    debouncedFetch(value, type);
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim() || !location.trim()) {
      setWarning("⚠️ Please fill both Job and Location.");
      setTimeout(() => setWarning(""), 3000);
      return;
    }

    setRecentSearches((prev) => {
      const newSearch = { query: searchQuery, location };
      const filtered = prev.filter(
        (item) => item.query !== newSearch.query || item.location !== newSearch.location
      );
      return [newSearch, ...filtered].slice(0, 5);
    });

    navigate(`/jobs?query=${searchQuery}&location=${location}`);
  };

  const handleJobKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (locationInputRef.current) locationInputRef.current.focus();
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <section
        className="relative flex flex-col items-center justify-center text-center py-20 px-6 rounded-b-3xl shadow-lg bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.7), rgba(79,70,229,0.7)), url('https://media.istockphoto.com/id/1159030397/vector/vector-of-a-child-a-boy-looking-at-the-stairs-leading-to-the-door-of-modern-digital-world.jpg?s=612x612&w=0&k=20&c=cPMvHwuxLy3rWZaHzhiXY_TFZXkl0KGp-wHGFA8vak4=')`,
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          Find Your <span className="text-yellow-300">Dream Job</span>
        </h1>
        <p className="text-base md:text-xl mb-8 max-w-2xl text-gray-200">
          Explore thousands of opportunities and grow your career with <span className="font-semibold">CareerKarma</span>.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative flex flex-col md:flex-row items-center bg-white rounded-full shadow-xl overflow-visible w-full max-w-5xl"
        >
          <div className="relative flex-1 px-4 py-3 border-b md:border-b-0 md:border-r overflow-visible">
            <div className="flex items-center">
              <Search className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Job title or Company"
                value={searchQuery}
                onFocus={() => setJobFocused(true)}
                onBlur={() => setTimeout(() => setJobFocused(false), 150)}
                onChange={(e) => handleInputChange(e.target.value, "search")}
                onKeyDown={handleJobKeyDown}
                className="w-full outline-none text-black"
              />
            </div>

            {jobFocused && (recentSearches.length > 0 || searchSuggestions.length > 0) && (
              <ul className="absolute left-0 top-full mt-1 w-full bg-black text-white shadow-md rounded-lg z-50 max-h-60 overflow-y-auto border border-gray-700">
                {recentSearches.length > 0 && !searchQuery && (
                  <>
                    <li className="px-4 py-2 flex justify-between items-center bg-gray-900 border-b">
                      <span className="font-medium">Recent Searches</span>
                      <X className="cursor-pointer" size={16} onMouseDown={clearRecentSearches} />
                    </li>
                    {recentSearches.map((item, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex justify-between"
                        onMouseDown={() => {
                          setSearchQuery(item.query);
                          setLocation(item.location);
                          setJobFocused(false);
                        }}
                      >
                        <span>{item.query}</span>
                        <span className="text-gray-400 text-sm">{item.location}</span>
                      </li>
                    ))}
                  </>
                )}
                {searchQuery && searchSuggestions.length > 0 && (
                  <>
                    <li className="px-4 py-2 font-medium bg-gray-900 border-b">Suggestions</li>
                    {searchSuggestions.map((s, idx) => {
                      const value = s.title || s.company || s.name;
                      return (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                          onMouseDown={() => {
                            setSearchQuery(value);
                            setSearchSuggestions([]);
                            setJobFocused(false);
                          }}
                        >
                          {value}
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
            )}
          </div>

          <div className="relative flex-1 px-4 py-3 overflow-visible">
            <div className="flex items-center">
              <MapPin className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="City or state"
                value={location}
                ref={locationInputRef}
                onFocus={() => setLocFocused(true)}
                onBlur={() => setTimeout(() => setLocFocused(false), 150)}
                onChange={(e) => handleInputChange(e.target.value, "location")}
                className="w-full outline-none text-black"
              />
            </div>

            {locFocused && locationSuggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 w-full bg-black text-white shadow-md rounded-lg z-50 max-h-60 overflow-y-auto border border-gray-700">
                <li className="px-4 py-2 font-medium bg-gray-900 border-b">Location Suggestions</li>
                {locationSuggestions.map((l, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                    onMouseDown={() => {
                      setLocation(l.city || l.state || l.country || l.display_name);
                      setLocFocused(false);
                    }}
                  >
                    {l.city || l.state || l.country || l.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                       hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 
                       text-white font-semibold px-8 py-3 rounded-full shadow-lg w-full md:w-auto flex items-center justify-center gap-2 h-full"
          >
            Find Jobs <ArrowRight size={18} />
          </Button>
        </form>

        {warning && (
          <div className="mt-4 text-black font-medium text-sm">{warning}</div>
        )}

        <div className="mt-6">
          <Button
            onClick={() => navigate("/register")}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-full shadow-md transition font-bold"
          >
            Get Started →
          </Button>
        </div>
      </section>

      <section className="py-12 px-6 text-center">
        <button
          onClick={() => setTrendingOpen(!trendingOpen)}
          className="flex items-center justify-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition"
        >
          Trending on CareerKarma {trendingOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {trendingOpen && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Remote Jobs", "Internships", "Top Companies", "Work From Home"].map((trend, idx) => (
              <Card key={idx} className="hover:shadow-lg transition cursor-pointer rounded-xl">
                <CardContent className="p-4 text-sm font-medium text-gray-700 text-center">{trend}</CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Explore Career Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ icon: Building2, title: "Programming" }, { icon: Building2, title: "Design" },
            { icon: Building2, title: "Marketing" }, { icon: Building2, title: "Human Resources" }].map((category, idx) => (
            <Card key={idx} className="hover:shadow-xl transition cursor-pointer rounded-2xl">
              <CardContent className="flex flex-col items-center p-6">
                <category.icon size={36} className="text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-800">{category.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-t-3xl">
        <h2 className="text-3xl font-bold mb-4">Ready to take the next step?</h2>
        <p className="mb-6 text-lg">Upload your resume and let top companies find you today.</p>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          id="resumeUpload"
          style={{ display: "none" }}
          onChange={handleResumeUpload}
        />
        <Button
          onClick={() => document.getElementById("resumeUpload").click()}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-full font-semibold"
        >
          {resume ? `Uploaded: ${resume}` : "Post Your Resume"}
        </Button>
      </section>

      <Footer />
    </div>
  );
}

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Navbar from "./components/Navbar.jsx";

import StudentDashboard from "./pages/StudentDashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Apply from "./pages/Apply.jsx";
import LMS from "./pages/LMS.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import Quiz from "./pages/Quiz.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";

import JobManagement from "./Hr/JobManagement.jsx";
import Applications from "./Hr/Applications.jsx";
import CourseManagement from "./Hr/CourseManagement.jsx";
import Analytics from "./Hr/Analytics.jsx";
import QuizManagement from "./Hr/QuizManagement.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="/courses" element={<LMS />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/quiz/:slug" element={<Quiz />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resume-analyser" element={<ResumeAnalyzer />} />
        <Route path="/register" element={<Register />} />

        <Route path="/hr-dashboard" element={<Navigate to="/hr-dashboard/job-management" replace />} />
        
        <Route path="/hr-dashboard/job-management" element={<JobManagement />} />
        <Route path="/hr-dashboard/applications" element={<Applications />} />
        <Route path="/hr-dashboard/course-management" element={<CourseManagement />} />
        <Route path="/hr-dashboard/quiz-management" element={<QuizManagement />} />
        <Route path="/hr-dashboard/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
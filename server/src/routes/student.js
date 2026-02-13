import { Router } from "express";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";

const router = Router();

// Student Dashboard
router.get("/profile", async (req, res) => {
  try {
    // Latest student for now (replace with auth in future)
    const student = await Student.findOne().sort({ createdAt: -1 });

    if (!student) {
      return res.json({ 
        name: "Priya", email: "priya@example.com", branch: "Computer Science",
        profileViews: 0, applicationsSent: 0, coursesCompleted: 0,
        interviewsScheduled: 0, learningProgress: []
      });
    }

    const applicationsSent = await Application.countDocuments({ student: student._id });

    const interviewsScheduled = await Interview.countDocuments({ candidates: student._id, scheduledAt: { $gte: new Date() } });

    const coursesCompleted = await Course.countDocuments({ [`studentsProgress.${student._id}`]: { $gte: 100 } });

    const allCourses = await Course.find({ [`studentsProgress.${student._id}`]: { $exists: true } });
    const learningProgress = allCourses.map(course => ({
      title: course.title,
      progress: course.studentsProgress.get(student._id.toString()) || 0,
    }));

    res.json({
      name: student.name,
      email: student.email,
      branch: student.branch,
      profileViews: student.profileViews,
      applicationsSent,
      coursesCompleted,
      interviewsScheduled,
      learningProgress
    });

  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

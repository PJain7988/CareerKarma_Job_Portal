import express from "express";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all courses with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: "i" };

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching courses" });
  }
});

// Get single course
router.get("/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching course" });
  }
});

// Enroll student
router.post("/enroll", protect, authorize("student"), async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Enrollment.findOne({ course: courseId, user: req.user.id });
    if (existing) return res.json(existing);

    const enrollment = await Enrollment.create({ course: courseId, user: req.user.id });
    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error enrolling course" });
  }
});

// HR/Admin: Create a course
router.post("/", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating course" });
  }
});

// HR/Admin: Update a course
router.put("/:id", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating course" });
  }
});

// HR/Admin: Delete a course
router.delete("/:id", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error deleting course" });
  }
});

export default router;

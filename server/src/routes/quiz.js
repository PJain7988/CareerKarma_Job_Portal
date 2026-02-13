import express from "express";
import Quiz from "../models/Quiz.js";
import Assignment from "../models/Assignment.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const { title, slug, description, questions } = req.body;

    const existing = await Quiz.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Slug already exists" });

    const quiz = await Quiz.create({ title, slug, description, questions });
    res.status(201).json(quiz);
  } catch (err) {
    console.error("Quiz creation error:", err);
    res.status(500).json({ message: "Server error creating quiz" });
  }
});

router.get("/", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error("Fetching quizzes error:", err);
    res.status(500).json({ message: "Server error fetching quizzes" });
  }
});

router.put("/:slug", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    console.error("Updating quiz error:", err);
    res.status(500).json({ message: "Server error updating quiz" });
  }
});

router.delete("/:slug", protect, authorize("hr", "admin"), async (req, res) => {
  try {
    await Quiz.findOneAndDelete({ slug: req.params.slug });
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Deleting quiz error:", err);
    res.status(500).json({ message: "Server error deleting quiz" });
  }
});

router.get("/:slug", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ slug: req.params.slug });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const safeQuiz = {
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        type: q.type
      }))
    };

    res.json(safeQuiz);
  } catch (err) {
    console.error("Fetching quiz error:", err);
    res.status(500).json({ message: "Server error fetching quiz" });
  }
});

router.post("/:slug/submit", protect, authorize("student"), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ slug: req.params.slug });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const { answers = [] } = req.body;
    let totalMcq = 0, correct = 0;

    quiz.questions.forEach((q, i) => {
      if (q.type === "mcq") {
        totalMcq++;
        if (answers[i] === q.answerIndex) correct++;
      }
    });

    const score = totalMcq ? Math.round((correct / totalMcq) * 100) : 0;

    let assignment = await Assignment.findOne({ user: req.user._id, quiz: quiz._id });
    if (!assignment) {
      assignment = await Assignment.create({
        user: req.user._id,
        quiz: quiz._id,
        answers,
        status: "completed",
        score
      });
    } else {
      assignment.answers = answers;
      assignment.status = "completed";
      assignment.score = score;
      await assignment.save();
    }

    res.json({ totalMcq, correct, score });
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ message: "Server error submitting quiz" });
  }
});

router.get("/:slug/score", protect, authorize("student"), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ slug: req.params.slug });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const assignment = await Assignment.findOne({ user: req.user._id, quiz: quiz._id });
    if (!assignment) return res.status(404).json({ message: "No submission found" });

    res.json({ score: assignment.score, status: assignment.status });
  } catch (err) {
    console.error("Fetching quiz score error:", err);
    res.status(500).json({ message: "Server error fetching quiz score" });
  }
});

export default router;

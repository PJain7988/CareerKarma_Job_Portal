import express from "express";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No resume uploaded",
    });
  }

  const analysis = {
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    recommendations: [
      "Add more measurable achievements",
      "Highlight leadership experience",
      "Tailor skills to the target job role",
    ],
    keywords: ["React", "Node.js", "MongoDB", "Teamwork"],
    atsScore: Math.floor(Math.random() * 100),
  };

  res.json({ status: "success", analysis }); // ✅ no redirect
});

export default router;

import express from "express";
import Job from "../models/Job.js";
import { protect } from "../middleware/auth.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();


const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Clean filename to avoid weird characters
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// --- 2. UPLOAD ROUTE (The one that was failing) ---
router.post("/upload-resume", upload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("File uploaded successfully:", req.file.filename);
    
    // Return the path so Frontend can save it
    res.status(200).json({
      message: "Resume uploaded successfully",
      filePath: req.file.filename, // We just send the filename back
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error during upload" });
  }
});

// --- 3. SERVE RESUME FILE (The View Link) ---
router.get("/resume/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Resume file not found on server.");
  }
});

// --- 4. SUGGESTIONS ROUTES ---
router.get("/suggest-jobs", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const regex = new RegExp(q, "i");
    const jobs = await Job.find({ $or: [{ title: regex }, { company: regex }] }).limit(10);
    const suggestions = [...new Set(jobs.map((job) => job.title))].slice(0, 10);
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.get("/suggest-locations", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const regex = new RegExp(q, "i");
    const jobs = await Job.find({ location: regex }).limit(10);
    const suggestions = [...new Set(jobs.map((job) => job.location))];
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- 5. CRUD ROUTES ---
router.get("/", async (req, res) => {
  try {
    const { q = "", jobType, company, location } = req.query;
    let filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ],
    };
    if (jobType && jobType !== "Any") filter.type = jobType;
    if (company) filter.company = { $regex: company, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ data: jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.post("/", protect, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: new mongoose.Types.ObjectId(req.user.id)
    };
    const newJob = new Job(jobData);
    const job = await newJob.save();
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err); 
    res.status(400).json({ message: "Failed to create job" }); 
  }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch(e) { res.status(500).send("Error"); }
});

export default router;
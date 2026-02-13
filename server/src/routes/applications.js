// import express from "express";
// import Application from "../models/Application.js";
// import Job from "../models/Job.js"; 
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// // 1. STUDENT: Apply for a job
// router.post("/", protect, async (req, res) => {
//   try {
//     const { jobId, coverLetter, resume } = req.body;

//     // Find job to identify the Employer (HR)
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     // Prevent duplicate applications
//     const existingApp = await Application.findOne({
//       job: jobId,
//       applicant: req.user.id,
//     });
//     if (existingApp) {
//       return res.status(400).json({ message: "You have already applied for this job" });
//     }

//     const application = await Application.create({
//       job: jobId,
//       applicant: req.user.id,
//       employer: job.postedBy, // This connects the app to the HR dashboard
//       coverLetter,
//       resume,
//       status: "Pending"
//     });

//     res.status(201).json(application);
//   } catch (err) {
//     console.error("Error applying:", err);
//     res.status(500).json({ message: "Server error applying for job" });
//   }
// });

// // 2. HR: Get applications for THEIR jobs
// // 2. HR: Get ALL applications (Emergency Demo Mode)
// router.get("/hr", protect, async (req, res) => {
//   try {
//     // REMOVED: { employer: req.user.id } 
//     // NOW: We fetch EVERYTHING so it never hides your data
//     const applications = await Application.find()
//       .populate("job", "title company")      
//       .populate("applicant", "name email") 
//       .sort({ createdAt: -1 });

//     res.json(applications);
//   } catch (err) {
//     console.error("Error fetching applications:", err);
//     res.status(500).json({ message: "Server error fetching applications" });
//   }
// });

// // 3. HR: Update Status (Accept/Reject)
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const application = await Application.findById(req.params.id);

//     if (!application) return res.status(404).json({ message: "Application not found" });

//     // Security check: Only the employer can update
//     if (application.employer.toString() !== req.user.id) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     application.status = status;
//     await application.save();

//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ message: "Server error updating status" });
//   }
// });

// // STUDENT: Get MY application history
// router.get("/my", protect, async (req, res) => {
//   try {
//     const applications = await Application.find({ applicant: req.user.id })
//       .populate("job", "title company location type") // Get job details
//       .sort({ createdAt: -1 });
//     res.json(applications);
//   } catch (err) {
//     console.error("Error fetching my applications:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js"; 
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 1. STUDENT: Apply for a job
router.post("/", protect, async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });
    
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      employer: job.postedBy,
      coverLetter,
      resume,
      status: "Pending"
    });

    res.status(201).json(application);
  } catch (err) {
    console.error("Error applying:", err);
    res.status(500).json({ message: "Server error applying for job" });
  }
});

router.get("/hr", protect, async (req, res) => {
  try {
    
    const applications = await Application.find({ employer: req.user.id })
      .populate("job", "title company")      
      .populate("applicant", "name email") 
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error fetching applications" });
  }
});


router.put("/:id", protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ message: "Application not found" });

  
    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();
    res.json(application);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error updating status" });
  }
});


router.get("/my", protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate("job", "title company location type")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Error fetching my applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
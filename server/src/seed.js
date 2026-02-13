// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { fileURLToPath } from "url";
// import path from "path";

// // Import your models
// import Job from "./models/Job.js";
// import Course from "./models/Course.js";
// import Quiz from "./models/Quiz.js";
// import User from "./models/User.js";

// // --- PATH FIX ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// // --- DATA PREPARATION ---

// // Valid Bcrypt Hash for password "password"
// const HASHED_PASSWORD = "$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/ca/wJ7yIq9f8.l1.eH/u.y1.uq"; 

// const rawJobs = [
//   { 
//     title: "Frontend Developer", 
//     company: "Acme", 
//     location: "Remote", 
//     skills: ["react", "vite", "css"], 
//     description: "Build modern UIs with React + Vite.",
//     type: "Full-time", 
//   },
//   { 
//     title: "Backend Engineer", 
//     company: "Globex", 
//     location: "Bengaluru", 
//     skills: ["node", "express", "mongodb"], 
//     description: "Design APIs and services.",
//     type: "Full-time",
//   },
//   {
//     title: "Full Stack Developer",
//     company: "TechCorp",
//     location: "Mumbai",
//     skills: ["react", "node", "typescript", "postgresql"], 
//     description: "Work on both frontend and backend systems.",
//     type: "Full-time",
//   }
// ];

// const rawCourses = [
//   {
//     title: "React for Job Seekers",
//     slug: "react-job-seekers",
//     category: "Frontend",
//     description: "Ace your frontend interviews with targeted React lessons.",
//     duration: "4 weeks",
//     level: "intermediate",
//     isPublished: true,
//     lessons: [
//       { title: "Intro to React", content: "Learn fundamentals.", duration: "45 minutes", order: 1 },
//       { title: "Hooks Deep Dive", content: "Master useState, useEffect.", duration: "60 minutes", order: 2 }
//     ]
//   },
//   {
//     title: "Node.js Backend Fundamentals",
//     slug: "nodejs-backend-fundamentals",
//     category: "Backend",
//     description: "Master server-side development with Node.js and Express.",
//     duration: "6 weeks",
//     level: "beginner",
//     isPublished: true,
//     lessons: [
//       { title: "Getting Started with Node.js", content: "Runtime & modules.", duration: "40 minutes", order: 1 }
//     ]
//   }
// ];

// const rawQuizzes = [
//   {
//     title: "JavaScript Basics",
//     slug: "js-basics",
//     category: "Programming",
//     description: "Test your fundamental JavaScript knowledge",
//     difficulty: "beginner",
//     timeLimit: 600,
//     isPublished: true,
//     questions: [
//       // ERROR FIXED HERE: Changed 'text' to 'question'
//       { question: "What is 'use strict' used for?", options: ["Enable strict mode","Import modules","Type checking","Nothing"], answerIndex: 0 },
//       { question: "Which is NOT a primitive?", options: ["String","Number","Object","Boolean"], answerIndex: 2 }
//     ]
//   }
// ];

// // --- DATABASE LOGIC ---

// async function connectDB() {
//   if (!process.env.MONGO_URI) {
//     throw new Error("MONGO_URI is required in .env");
//   }
//   await mongoose.connect(process.env.MONGO_URI);
//   console.log("✅ Connected to MongoDB");
// }

// async function seedDatabase() {
//   try {
//     await connectDB();
    
//     // 1. CLEAR OLD DATA
//     console.log("🗑️ Clearing existing data...");
//     await Promise.all([
//         Job.deleteMany({}), 
//         Course.deleteMany({}), 
//         Quiz.deleteMany({}), 
//         User.deleteMany({})
//     ]);

//     // 2. CREATE USERS FIRST
//     console.log("👤 Creating Users...");
    
//     // Create Student 
//     const student = await new User({
//         name: "Demo Student",
//         email: "student@demo.com",
//         passwordHash: HASHED_PASSWORD, 
//         role: "candidate" 
//     }).save();

//     // Create HR (Recruiter)
//     const hrUser = await new User({
//         name: "Demo HR",
//         email: "hr@demo.com",
//         passwordHash: HASHED_PASSWORD, 
//         role: "recruiter" 
//     }).save();

//     console.log(`   -> HR User Created with ID: ${hrUser._id}`);

//     // 3. ATTACH USERS TO CONTENT (The Fix)
//     // Fix Jobs (needs postedBy)
//     const jobsWithUser = rawJobs.map(job => ({
//         ...job,
//         postedBy: hrUser._id
//     }));

//     // Fix Courses (needs createdBy)
//     const coursesWithUser = rawCourses.map(course => ({
//         ...course,
//         createdBy: hrUser._id
//     }));

//     // Fix Quizzes (needs createdBy)
//     const quizzesWithUser = rawQuizzes.map(quiz => ({
//         ...quiz,
//         createdBy: hrUser._id
//     }));

//     // 4. INSERT CONTENT
//     console.log("📦 Inserting Content...");
//     const [jobs, courses, quizzes] = await Promise.all([
//       Job.insertMany(jobsWithUser),
//       Course.insertMany(coursesWithUser),
//       Quiz.insertMany(quizzesWithUser)
//     ]);

//     console.log("\n🎉 SEEDING COMPLETED SUCCESSFULLY!");
//     console.log(`   • Jobs: ${jobs.length}`);
//     console.log(`   • Courses: ${courses.length}`);
//     console.log(`   • Quizzes: ${quizzes.length}`);
    
//     console.log("\n=================================");
//     console.log("LOGIN CREDENTIALS:");
//     console.log("---------------------------------");
//     console.log("🎓 Student Login: student@demo.com");
//     console.log("👔 HR Login:      hr@demo.com");
//     console.log("🔑 Password:      password");
//     console.log("=================================\n");

//     process.exit(0);

//   } catch (err) {
//     console.error("❌ Seeding failed:", err.message);
//     // console.error(err); 
//     process.exit(1);
//   }
// }

// if (process.argv[1] === __filename) {
//   seedDatabase();
// }

// export default seedDatabase;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();


console.log("DEBUG - Mongo URI:", process.env.MONGO_URI);

import express from "express";

import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import jobRoutes from "./routes/jobs.js"; 
import applicationRoutes from "./routes/applications.js";

// dotenv.config({ path: "../.env" }); 

const app = express();

app.use(express.json());
const corsOptions = {
  origin: ["https://career-karma-ef8u.vercel.app",
  "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Active", message: "Server is running smoothly" });
});


app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Backend available at http://localhost:${PORT}/api`);
});
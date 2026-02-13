import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "General" },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  videos: [{ type: String }], 
  pdfs: [{ type: String }], 
  lessons: [lessonSchema], 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  studentsProgress: {
    type: Map,
    of: Number, 
    default: {},
  },
});

export default mongoose.model("Course", courseSchema);

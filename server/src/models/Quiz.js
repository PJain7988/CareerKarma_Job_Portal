import mongoose from "mongoose";


const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "coding", "subjective"],
    default: "mcq",
    required: true,
  },
  question: { type: String, required: true },
  options: [{ type: String }], // Only for MCQ type
  answer: mongoose.Schema.Types.Mixed, // Index for MCQ, text for subjective, code for coding
});

// Quiz schema
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true }, // URL-friendly
    description: { type: String, default: "" },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // HR/Admin
    published: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt and updatedAt
);

export default mongoose.model("Quiz", quizSchema);

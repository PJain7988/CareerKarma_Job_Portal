import mongoose from "mongoose";
const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  progress: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model("Enrollment", enrollmentSchema);

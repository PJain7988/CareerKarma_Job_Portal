import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    branch: { type: String, default: "Computer Science" },
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;

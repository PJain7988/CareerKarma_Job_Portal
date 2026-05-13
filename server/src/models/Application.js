import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    resume: {
      type: String, 
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
    },
    candidateDetails: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Interviewing"],
      default: "Pending",
    },
    coverLetter: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
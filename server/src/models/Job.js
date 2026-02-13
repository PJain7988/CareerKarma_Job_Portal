// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     company: { type: String, required: true },
//     location: { type: String, default: "Remote" },
//     type: { 
//       type: String, 
//       enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"], 
//       default: "Full-time" 
//     },
//     description: { type: String, default: "" },
//     salary: { type: String, default: "Not Disclosed" }, // ADDED THIS
//     postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Job", jobSchema);
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote" },
    type: { 
      type: String, 
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"], 
      default: "Full-time" 
    },
    description: { type: String, default: "" },
    salary: { type: String, default: "Not Disclosed" },
    hrEmail: { type: String, default: "" }, // NEW FIELD
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
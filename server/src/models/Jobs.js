import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },   
  company: { type: String, required: true }, 
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Jobs = mongoose.model("Jobs", jobSchema);
export default Jobs;

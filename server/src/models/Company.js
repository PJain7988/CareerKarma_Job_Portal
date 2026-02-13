
import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  website: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);
export default Company;

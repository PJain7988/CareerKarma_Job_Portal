import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const GEO_API_KEY = process.env.GEO_API_KEY;
const JOB_API_KEY = process.env.JOB_API_KEY;


router.get("/suggest-jobs", async (req, res) => {
  const q = req.query.q || "";
  if (!q) return res.json([]);

  if (!JOB_API_KEY) {
    return res.status(500).json({ error: "JOB_API_KEY is not defined in backend" });
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(q)}&hl=en&api_key=${JOB_API_KEY}`;
    const response = await axios.get(url);

    const jobs = response.data?.jobs_results;
    if (!Array.isArray(jobs)) {
      console.error("❌ SerpAPI returned unexpected data:", response.data);
      return res.status(500).json({ error: "SerpAPI returned unexpected data" });
    }

    const formatted = jobs.map(job => ({
      title: job.title || "",
      company: job.company_name || "",
      location: job.location || "",
      description: job.description || ""
    }));

    res.json(formatted.slice(0, 10));
  } catch (err) {
    console.error("❌ SerpAPI fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching jobs from API" });
  }
});

router.get("/suggest-locations", async (req, res) => {
  const cityQuery = req.query.q || "";
  if (!cityQuery) return res.json([]);

  if (!GEO_API_KEY) {
    return res.status(500).json({ error: "GEO_API_KEY is not defined in backend" });
  }

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${GEO_API_KEY}&q=${encodeURIComponent(cityQuery)}&format=json&limit=10`;
    const response = await axios.get(url);

    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.log("No locations found for query:", cityQuery);
      return res.json([]);
    }

    const formatted = response.data.map(loc => {
      const addr = loc.address || {};
      return {
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || addr.county || "",
        country: addr.country || "",
        display_name: loc.display_name || "" // fallback full name
      };
    }).filter(loc => loc.city || loc.state || loc.country || loc.display_name);

    res.json(formatted);
  } catch (err) {
    console.error("Locations API error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});




export default router;

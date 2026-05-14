import express from "express";
import axios from "axios";
import OpenAI from "openai";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const originalname = req.file.originalname.toLowerCase();

    let extractedText = "";

    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      originalname.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimetype === "text/plain" || originalname.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." });
    }

    res.json({ text: extractedText.trim() });
  } catch (err) {
    console.error("❌ /extract-text error:", err);
    res.status(500).json({ error: "Failed to extract text from file" });
  }
});

async function askAI(messages) {
  // Use OpenAI if the key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // You can change this to gpt-4 if needed
        messages: messages,
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.error("OpenAI API Error:", err.message);
      return null;
    }
  } 
  
  // Fallback to Mistral if no OpenAI key is provided
  if (process.env.MISTRAL_API_KEY) {
    try {
      const res = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-small", 
          messages: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
        }
      );
      return res.data.choices[0].message.content;
    } catch (err) {
      console.error("Mistral API Error:", err.response?.data || err.message);
      return null;
    }
  }

  console.error("No AI API Keys found in .env (Needs OPENAI_API_KEY or MISTRAL_API_KEY)");
  return null;
}

// For Resume Builder auto-fill
router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const reply = await askAI([
      { role: "user", content: prompt }
    ]);
    res.json({ message: reply || "⚠️ No response from AI." });
  } catch (e) {
    console.error("❌ /chat error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post("/hr", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    const reply = await askAI([
      {
        role: "system",
        content: "You are an HR assistant helping candidates with hiring questions."
      },
      { role: "user", content: question }
    ]);

    res.json({ message: reply || "⚠️ No response from AI." });
  } catch (e) {
    console.error("❌ /hr error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post("/interview", async (req, res) => {
  try {
    const { role = "Software Engineer", context } = req.body;

    if (!context?.trim()) {
      return res.status(400).json({ error: "Context is required." });
    }

    const reply = await askAI([
      {
        role: "system",
        content: `You are a strict mock interviewer for the role: ${role}. Ask one question at a time and evaluate concisely.`
      },
      { role: "user", content: context }
    ]);

    res.json({ message: reply || "⚠️ No response from AI." });
  } catch (e) {
    console.error("❌ /interview error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post("/analyze-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({ error: "Resume text and job description are required." });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System). 
Analyze this resume against the job description.
Resume Text:
${resumeText}

Job Description:
${jobDescription}

Return a valid JSON object strictly with these keys:
- "score": A number between 0 and 100 representing the ATS match score.
- "keywordsMatched": Array of up to 5 important skills/keywords found in both.
- "missingKeywords": Array of up to 5 important skills/keywords missing from the resume.
- "llmSuggestion": A string containing exactly 3 actionable bullet points to improve the resume.

Output ONLY valid JSON, no markdown formatting.`;

    const reply = await askAI([{ role: "user", content: prompt }]);
    let parsed = null;
    
    try {
        const cleaned = reply.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(cleaned);
    } catch (err) {
        console.error("Failed to parse JSON from AI:", reply);
        // Fallback
        parsed = {
            score: 50,
            keywordsMatched: ["Experience"],
            missingKeywords: ["Specific Skills"],
            llmSuggestion: "- Tailor your resume more closely to the job description.\n- Add quantifiable achievements.\n- Ensure formatting is ATS friendly."
        };
    }

    res.json(parsed);
  } catch (e) {
    console.error("❌ /analyze-resume error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;

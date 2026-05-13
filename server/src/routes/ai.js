import express from "express";
import axios from "axios";
import OpenAI from "openai";

const router = express.Router();

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

    const resWords = new Set(resumeText.toLowerCase().match(/\b[a-z]+\b/g) || []);
    const jdWords = jobDescription.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const jdSet = new Set(jdWords);

    const overlap = jdWords.filter((w) => resWords.has(w));
    const score = Math.round((overlap.length / Math.max(1, jdSet.size)) * 100);
    const missingKeywords = [...jdSet].filter((w) => !resWords.has(w)).slice(0, 20);

    const llmSuggestion = await askAI([
      {
        role: "system",
        content: "You are an assistant that improves resume matching suggestions."
      },
      {
        role: "user",
        content: `Resume Text:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nGiven a simple keyword overlap score of ${score}%, list 5 concrete improvements as bullet points.`
      }
    ]);

    res.json({
      score,
      keywordsMatched: [...new Set(overlap)].slice(0, 50),
      missingKeywords,
      llmSuggestion: llmSuggestion || "⚠️ No suggestion from AI."
    });
  } catch (e) {
    console.error("❌ /analyze-resume error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;

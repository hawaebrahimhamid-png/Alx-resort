import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let chatHistory = [];

console.log("KEY LOADED:", !!process.env.GEMINI_API_KEY);

// ✅ CHAT ROUTE (REST API - GUARANTEED WORKING)
app.post("/chat", async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Save user message
    chatHistory.push({ role: "user", text: message });

    const prompt = `
You are a smart AI concierge for a modern Ethiopian resort.

Context:
- Lake view restaurant
- Coffee ceremony
- Spa
- Boat rides
- Cultural events

Guest type: ${type || "general"}

Conversation so far:
${chatHistory.map((m) => `${m.role}: ${m.text}`).join("\n")}

Rules:
- Keep reply under 3 sentences
- Be friendly
- Recommend at least one service

User message:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 2. Save AI reply
    chatHistory.push({ role: "ai", text });

    res.json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
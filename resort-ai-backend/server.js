import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CHAT ENDPOINT
app.post("/chat", async (req, res) => {
  try {
    const { message, type } = req.body;

    const prompt = `
You are a smart AI concierge for a modern Ethiopian resort.

Your mission:
Help guests have an amazing experience and recommend resort services.

Context:
- Lake view restaurant
- Coffee ceremony
- Spa & massage
- Boat rides
- Cultural dance nights

Guest type: ${type || "general"}

Rules:
- Keep response under 3 sentences
- Always recommend at least one service
- Be friendly and natural

User message:
"${message}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "Welcome! Try our coffee ceremony ☕ or spa 💆‍♀️.";

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("KEY LOADED:", !!process.env.GEMINI_API_KEY);

// ✅ CHAT ROUTE (REST API - GUARANTEED WORKING)
app.post("/chat", async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const prompt = `
You are a smart AI concierge for an Ethiopian resort.

Guest type: ${type || "general"}

Help with:
- spa
- lake view dinner
- coffee ceremony
- boat rides
- cultural shows

User: ${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Try our spa 💆‍♀️ or lake view dinner 🌅";

    res.json({ reply: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST
app.get("/", (req, res) => {
  res.send("AI Resort Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

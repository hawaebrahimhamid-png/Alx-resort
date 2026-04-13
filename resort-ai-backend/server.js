import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import authMiddleware from "./middleware/auth.js";
dotenv.config();

console.log("JWT:", process.env.JWT_SECRET);

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();


console.log("KEY LOADED:", !!process.env.GEMINI_API_KEY);

// =====================
// USERS ROUTE (DATABASE TEST)
// =====================
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// =====================
// ✅ REGISTER ROUTE (ADD THIS)
// =====================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.json({ message: "User created", user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// LOGIN ROUTE
// =====================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. check user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3. create JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// =====================
// CHAT ROUTE (DATABASE VERSION)
// =====================
app.post("/chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 💾 1. Save USER message to database
    await prisma.message.create({
      data: {
        text: message,
        role: "user",
        userId,
      },
    });
    // Load full chat history from DB
    const history = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // 🤖 2.Build conversation context (memory)
    const prompt = `
Conversation so far:
${history.map((m) => `${m.role}: ${m.text}`).join("\n")}

User message:
${message}
`;
    const aiReply = "This is a placeholder AI response using memory.";
    // 💾 3. Save AI message to database
    await prisma.message.create({
      data: {
        text: aiReply,
        role: "ai",
        userId,
      },
    });

    // 📤 4. Send response to frontend
    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// =====================
// START SERVER
// =====================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

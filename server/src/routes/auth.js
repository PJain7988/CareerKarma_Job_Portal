import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import axios from "axios";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send email using Brevo REST API
const sendOTPEmail = async (email, otp) => {
  console.log("📧 Initiating OTP email to:", email);
  
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: email }],
        sender: { 
          name: "Job Portal",
          email: process.env.BREVO_EMAIL || "a78fd0001@smtp-brevo.com"
        },
        subject: "Verify your email - Job Portal",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="font-size: 16px; color: #666;">
              Your OTP for email verification is:
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
              <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 14px;">
              This OTP will expire in 10 minutes. Do not share this code with anyone.
            </p>
            <p style="color: #999; font-size: 12px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully via Brevo API:", response.data.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error.response?.data?.message || error.message);
    throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // Create user in database FIRST
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role,
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpiry: Date.now() + 10 * 60 * 1000,
    });

    console.log("👤 User created:", user._id);

    // Send OTP email with timeout
    try {
      await Promise.race([
        sendOTPEmail(normalizedEmail, otp),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email send timeout")), 10000)
        ),
      ]);
      console.log("✅ OTP email sent successfully");
    } catch (emailError) {
      console.error("⚠️ Email error (continuing registration):", emailError.message);
      // Don't fail the entire registration if email fails
      // User can request OTP resend later
    }

    res.status(201).json({
      userId: user._id,
      message: "User registered. OTP sent to email.",
      email: normalizedEmail,
    });
  } catch (e) {
    console.error("❌ Register error:", e.message);
    res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: "User ID and code are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

    if (user.verificationToken !== code) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, message: "Email verified successfully" });
  } catch (e) {
    console.error("❌ OTP verification error:", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });
    if (!user.isVerified) return res.status(400).json({ error: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: "Login successful",
    });
  } catch (e) {
    console.error("❌ Login error:", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Resend OTP endpoint
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.error("⚠️ Email resend failed:", emailError.message);
    }

    res.json({ message: "OTP resent to email" });
  } catch (e) {
    console.error("❌ Resend OTP error:", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
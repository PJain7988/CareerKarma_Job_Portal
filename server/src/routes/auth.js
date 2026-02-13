import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  console.log("initiated otp")
  // const transporter = nodemailer.createTransport({
  //   service: "smtp.gmail.com",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  console.log("transporter set")

  await transporter.sendMail({
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
  });

  console.log("mail sent")
};


router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role,
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpiry: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(normalizedEmail, otp);

    res.status(201).json({
      userId: user._id,
      message: "User registered. OTP sent to email.",
    });
  } catch (e) {
    console.error("Register error:", e.message);
    res.status(500).json({
      message: "Server error",
      error: e.message,                     // send the real error message to frontend
    });

  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

    if (user.verificationToken !== code || user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
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
    console.error("OTP verification error:", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
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
    console.error("Login error:", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

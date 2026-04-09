import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create transporter ONCE (don't recreate for every email)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,  // 10 seconds
  socketTimeout: 10000,       // 10 seconds
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

const sendOTPEmail = async (email, otp) => {
  console.log("📧 Initiating OTP email to:", email);
  
  try {
    const info = await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
      html: `<h2>Email Verification</h2><p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
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
          setTimeout(() => reject(new Error("Email send timeout")), 8000)
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

// ADD: Resend OTP endpoint
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


// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import nodemailer from "nodemailer";

// const router = express.Router();

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// const sendOTPEmail = async (email, otp) => {
//   console.log("initiated otp")
//   const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

//   console.log("transporter set")

//   await transporter.sendMail({
//     from: `"Job Portal" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Verify your email",
//     text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
//   });

//   console.log("mail sent")
// };


// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const normalizedEmail = email.trim().toLowerCase();
//     const exists = await User.findOne({ email: normalizedEmail });
//     if (exists) return res.status(400).json({ error: "Email already registered" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOTP();

//     const user = await User.create({
//       name,
//       email: normalizedEmail,
//       passwordHash: hashedPassword,
//       role,
//       isVerified: false,
//       verificationToken: otp,
//       verificationTokenExpiry: Date.now() + 10 * 60 * 1000,
//     });

//     await sendOTPEmail(normalizedEmail, otp);

//     res.status(201).json({
//       userId: user._id,
//       message: "User registered. OTP sent to email.",
//     });
//   } catch (e) {
//     console.error("Register error:", e.message);
//     res.status(500).json({
//       message: "Server error",
//       error: e.message,                     // send the real error message to frontend
//     });

//   }
// });

// // VERIFY OTP
// router.post("/verify", async (req, res) => {
//   try {
//     const { userId, code } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(400).json({ error: "User not found" });
//     if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

//     if (user.verificationToken !== code || user.verificationTokenExpiry < Date.now()) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpiry = null;
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({ token, message: "Email verified successfully" });
//   } catch (e) {
//     console.error("OTP verification error:", e.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const normalizedEmail = email.trim().toLowerCase();

//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user) return res.status(400).json({ error: "Invalid email or password" });
//     if (!user.isVerified) return res.status(400).json({ error: "Email not verified" });

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//       message: "Login successful",
//     });
//   } catch (e) {
//     console.error("Login error:", e.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;

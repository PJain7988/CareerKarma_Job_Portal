import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be defined in .env");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,           // 465 for secure SSL, 587 for TLS
  secure: true,    
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password recommended
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Nodemailer connection error:", err);
  } else {
    console.log("✅ Nodemailer is ready to send emails");
  }
});

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string|number} code - Verification code
 */
export const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"CareerKarma" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - CareerKarma",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
          <h2 style="color:#4f46e5;">Email Verification</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <hr>
          <p style="font-size:0.85rem; color:#555;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Email sending failed");
  }
};

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.BREVO_API_KEY || !process.env.BREVO_EMAIL) {
  throw new Error("BREVO_API_KEY and BREVO_EMAIL must be defined in .env");
}

/**
 * Send verification email using Brevo REST API
 * @param {string} email - Recipient email
 * @param {string|number} code - Verification code (OTP)
 */
export const sendVerificationEmail = async (email, code) => {
  try {
    console.log("📧 Sending verification email to:", email);

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: email }],
        sender: {
          name: "CareerKarma",
          email: process.env.BREVO_EMAIL,
        },
        subject: "Verify Your Email - CareerKarma",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="color:#4f46e5; margin-top: 0;">Email Verification</h2>
              <p style="font-size: 16px;">Your verification code is:</p>
              <div style="background-color: #4f46e5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h1 style="color: white; margin: 0; letter-spacing: 5px; font-family: monospace;">${code}</h1>
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
              <p style="font-size: 12px; color: #999;">© CareerKarma Job Portal</p>
            </div>
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

    console.log("✅ Verification email sent successfully:", response.data.messageId);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.response?.data || error.message);
    throw new Error(`Email sending failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Send OTP email (alias for verification email)
 * @param {string} email - Recipient email
 * @param {string|number} otp - One-Time Password
 */
export const sendOTPEmail = async (email, otp) => {
  return sendVerificationEmail(email, otp);
};
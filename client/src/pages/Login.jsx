import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";
import { X, Key, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [loginFormData, setLoginFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP/NewPassword
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotData, setForgotData] = useState({ otp: "", newPassword: "", confirmPassword: "" });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
        return setForgotError("Please enter your email address.");
    }
    setForgotLoading(true);
    setForgotError("");
    try {
        await api.post("/auth/forgot-password", { email: forgotEmail });
        setForgotStep(2);
    } catch (err) {
        setForgotError(err.response?.data?.error || "Failed to send OTP.");
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotData.otp || !forgotData.newPassword || !forgotData.confirmPassword) {
        return setForgotError("Please fill in all fields.");
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
        return setForgotError("Passwords do not match.");
    }
    setForgotLoading(true);
    setForgotError("");
    try {
        await api.post("/auth/reset-password", { 
            email: forgotEmail, 
            otp: forgotData.otp, 
            newPassword: forgotData.newPassword 
        });
        setForgotSuccess("Password reset successful! You can now login.");
        setTimeout(() => {
            setShowForgotModal(false);
            setForgotStep(1);
            setForgotSuccess("");
        }, 3000);
    } catch (err) {
        setForgotError(err.response?.data?.error || "Reset failed.");
    }
    setForgotLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: loginFormData.email.trim().toLowerCase(),
        password: loginFormData.password,
      };

      const res = await api.post("/auth/login", payload);

      setAuth(res.data.token);
      
      localStorage.setItem("token", res.data.token);
      
      localStorage.setItem("role", res.data.user.role);

      const userInfo = {
        id: res.data.user.id || res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      if (res.data.user.role === "recruiter") {
        navigate("/hr-dashboard/job-management");
      } else {
        navigate("/jobs");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err?.response?.data?.error || "Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Welcome Message */}
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center p-10">
        <h1 className="text-4xl font-bold text-gray-800 leading-relaxed text-center">
          👋 Hello Friend, <br /> Welcome to{" "}
          <span className="text-purple-600">CareerKarma</span> <br />
          Your gateway to career success 🚀
        </h1>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-[380px] transform transition duration-300 hover:scale-105">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login to CareerKarma
          </h2>

          {error && (
            <p className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={loginFormData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={loginFormData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end">
                <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition"
                >
                    Forgot Password?
                </button>
            </div>

            <button
              type="submit"
              className={`w-full bg-purple-600 text-white py-3 rounded-lg shadow-md hover:bg-purple-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep(1);
                    setForgotError("");
                    setForgotSuccess("");
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
                    {forgotStep === 1 ? <Mail size={32} /> : <ShieldCheck size={32} />}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  {forgotStep === 1 ? "Forgot Password?" : "Reset Password"}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-8">
                  {forgotStep === 1 
                    ? "Enter your email address and we'll send you an OTP to reset your password." 
                    : `We've sent a 6-digit code to ${forgotEmail}. Enter it below with your new password.`}
                </p>

                {forgotError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-6 border border-red-100 flex items-center gap-2"
                  >
                    <span className="font-bold">⚠️</span> {forgotError}
                  </motion.div>
                )}

                {forgotSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-green-50 text-green-600 text-xs p-3 rounded-xl mb-6 border border-green-100 flex items-center gap-2"
                  >
                    <span className="font-bold">✅</span> {forgotSuccess}
                  </motion.div>
                )}

                {forgotStep === 1 ? (
                  /* Step 1: Email Form */
                  <form onSubmit={handleRequestOTP} noValidate className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail.trim()}
                      className="w-full bg-purple-600 text-white py-4 rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Code"}
                      {!forgotLoading && <ArrowRight size={18} />}
                    </button>
                  </form>
                ) : (
                  /* Step 2: OTP & New Password Form */
                  <form onSubmit={handleResetPassword} noValidate className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">6-Digit Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotData.otp}
                        onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value })}
                        placeholder="000000"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition text-center text-xl tracking-[10px] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">New Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                          type="password"
                          required
                          value={forgotData.newPassword}
                          onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                          type="password"
                          required
                          value={forgotData.confirmPassword}
                          onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotSuccess || !forgotData.otp || !forgotData.newPassword || !forgotData.confirmPassword}
                      className="w-full bg-purple-600 text-white py-4 rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setForgotStep(1)}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 transition py-2 font-medium"
                    >
                        Back to Email
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
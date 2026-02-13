import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [step, setStep] = useState("register");
  const [code, setCode] = useState("");
  const [tempUserId, setTempUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (!data.userId) throw new Error("No userId returned");

      setTempUserId(data.userId);
      setStep("verify");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Registration failed");
    }
    setLoading(false);
  }

  // Handle email verification
  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify", {
        userId: tempUserId,
        code,
      });

      if (!data.token) throw new Error("No token returned");

      localStorage.setItem("token", data.token);
      
      
      const userInfo = {
        id: tempUserId,
        name: name, 
        email: email,
        role: role
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("role", role);

      // Navigate to correct dashboard
      if (role === "recruiter") {
          nav('/hr-dashboard/job-management');
      } else {
          nav('/jobs');
      }

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Invalid verification code");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform hover:shadow-2xl"
        >
          {step === "register" ? (
            <>
              <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Create Your Account
              </h1>

              {error && <div className="text-red-600 mb-3">{error}</div>}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="candidate">Job Seeker</option>
                    <option value="recruiter">HR / Recruiter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>

              <p className="text-sm mt-4 text-center text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 hover:underline">
                  Login
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-blue-400 to-blue-500">
                <div className="bg-white/20 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">Verify Your Account</h1>
                  <p className="text-white mb-6">
                    We emailed you the six digit code to <br />
                    <span className="font-semibold">{email}</span>
                    <br />
                    Enter the code below to confirm your email address
                  </p>

                  {error && <div className="text-red-600 mb-3">{error}</div>}

                  {/* OTP Boxes */}
                  <form onSubmit={verifyCode} className="space-y-6">
                    <div className="flex justify-center gap-3">
                      <input
                          type="text"
                          maxLength="6"
                          placeholder="123456"
                          className="w-full text-center text-3xl font-bold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none py-4"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "VERIFY & LOGIN"}
                    </button>
                  </form>
                </div>
              </div>
            </>

          )}
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-purple-100 px-10">
        <h2 className="text-4xl font-extrabold text-purple-700 text-center mb-4">
          Welcome to CareerKarma 🚀
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed text-center max-w-lg">
          At CareerKarma, we connect{" "}
          <span className="font-semibold">talented professionals</span> with{" "}
          <span className="font-semibold">top employers</span>. Build your
          resume, explore job listings, take skill-based quizzes, and grow your
          career with the power of AI.
        </p>
      </div>
    </div>
  );
}
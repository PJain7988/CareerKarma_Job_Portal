import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(error, );
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = () => {
    const email = prompt("Please enter your registered email address:");
    if (email) {
        alert("Processing...");
        setTimeout(() => {
            alert(`✅ Password reset instructions have been sent to ${email}.\n\n`);
        }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await api.post("/auth/login", payload);

      // 1. Set Global Auth Header
      setAuth(res.data.token);
      
      // 2. Save Token
      localStorage.setItem("token", res.data.token);
      
      // 3. Save Role (Legacy support)
      localStorage.setItem("role", res.data.user.role);

      // 4. Save Full User Info for Navbar
      const userInfo = {
        id: res.data.user.id || res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // 5. Navigate based on role
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
                value={formData.email}
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
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end">
                <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
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
    </div>
  );
}
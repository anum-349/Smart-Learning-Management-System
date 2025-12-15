"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LMSSignupPage() {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [extraField, setExtraField] = useState(""); 
    const [adminSecret, setAdminSecret] = useState(""); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const ADMIN_SECRET_KEY = "LMS-ADMIN-2025"; 

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword || !extraField) {
            setError("Please fill all required fields.");
            return;
        }

        if (role === "admin" && adminSecret !== ADMIN_SECRET_KEY) {
            setError("Invalid admin secret key.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        // Call your API to register user with role
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr  relative text-black">
            <div className="absolute inset-0 bg-[url('/bg2.png')] bg-center bg-cover opacity-40"></div>

            <div className=" mt-10 mb-10 relative bg-light rounded-2xl backdrop-blur-md shadow-[0_0_20px_#6f8197] border border-light overflow-hidden w-full max-w-md">
                <div className=" bg-primary p-6 text-center">
                    <h1 className="text-3xl font-bold text-light tracking-wide">
                        LMS Signup
                    </h1>
                    <p className="text-gray-200 mt-2 text-sm">
                        Create your account as Admin, Student, or Instructor
                    </p>
                </div>

                <div className="p-8 bg-light">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Role Selector */}
                        <div className="mb-5">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Common Fields */}
                        <div className="mb-5">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        <div className="mb-5">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                                autoComplete="email"
                            />
                        </div>

                        {role === "admin" && (
                            <>
                                <div className="mb-5">
                                    <input
                                        type="text"
                                        placeholder="Admin Secret Key"
                                        value={adminSecret}
                                        onChange={(e) => setAdminSecret(e.target.value)}
                                        className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                                    />
                                </div>
                            </>
                        )}

                        {/* Password Fields */}
                        <div className="mb-5 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        <div className="mb-5 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                            >
                                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="flex justify-end text-sm mb-6">
                            <a href="/login" className="text-accentDark hover:underline">
                                Already have an account? Log in
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-linear-to-r bg-primary text-light font-semibold hover:scale-105 transition transform"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

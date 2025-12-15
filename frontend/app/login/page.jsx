"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        // Perform login logic here...
        setTimeout(() => setLoading(false), 1000); // simulate login
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr  relative text-black">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-[url('/bg2.png')] bg-center bg-cover opacity-40"></div>

            {/* Card */}
            <div className=" relative bg-light rounded-2xl backdrop-blur-md shadow-[0_0_20px_#6f8197] border border-light overflow-hidden w-full max-w-md">
                {/* Header */}
                <div className=" bg-primary p-6 text-center">
                    <h1 className="text-3xl font-bold text-light tracking-wide">
                        Learning Management System
                    </h1>
                    <p className="text-gray-200 mt-2 text-sm">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="p-8 bg-light">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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

                        <div className="mb-5 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        <div className="flex justify-between text-sm mb-6">
                            <a href="/forget" className="text-accentDark hover:underline">
                                Forgot Password?
                            </a>
                            <a href="/signup" className="text-accent hover:underline">
                                Not Registered? Sign up
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-linear-to-r bg-primary text-light font-semibold hover:scale-105 transition transform"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

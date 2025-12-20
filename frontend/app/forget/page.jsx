"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const HARD_CODED_OTP = "123456";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const EnterEmail = ({ setStep, setEmail, setOtp }) => {
    const [emailInput, setEmailInput] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!emailInput) return setError("Email is required");

        setIsSending(true);

        setTimeout(() => {
            setEmail(emailInput);
            setStep("otp");
            setIsSending(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr  relative text-black">
            <div className="absolute inset-0 bg-[url('/bg2.png')] bg-center bg-cover opacity-40"></div>

            <div className=" mt-10 mb-10 relative bg-light rounded-2xl backdrop-blur-md shadow-[0_0_20px_#6f8197] border border-light overflow-hidden w-full max-w-md">
                <div className=" bg-primary p-6 text-center">
                    <h1 className="text-3xl font-bold text-light tracking-wide">
                        LMS Password Reset
                    </h1>
                    <p className="text-gray-200 mt-2 text-sm">
                        Enter your email to receive OTP
                    </p>
                </div>
                <div className="p-8 bg-light">
                    {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            disabled={isSending}
                            className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full py-3 rounded-lg bg-linear-to-r bg-primary text-light font-semibold hover:scale-105 transition transform"
                        >
                            {isSending ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Step 2: Enter OTP
const EnterOTP = ({ otp, setOtp, email, setStep }) => {
    const inputs = Array(6).fill(0);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timer === 0) return setCanResend(true);
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = () => {
        setTimer(60);
        setCanResend(false);
        setError("");
        setOtp(""); // reset dummy OTP
    };

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = otp.split("");
        newOtp[index] = value;
        setOtp(newOtp.join(""));

        // Focus next input
        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            if (next) next.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            if (prev) prev.focus();
        }
    };

    const verifyOtp = () => {
        if (otp === HARD_CODED_OTP) {
            setStep("reset");
        } else {
            setError("Invalid OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr  relative text-black">
            <div className="absolute inset-0 bg-[url('/bg2.png')] bg-center bg-cover opacity-40"></div>

            <div className=" mt-10 mb-10 relative bg-light rounded-2xl backdrop-blur-md shadow-[0_0_20px_#6f8197] border border-light overflow-hidden w-full max-w-md">
                <div className=" bg-primary p-6 text-center">
                    <h1 className="text-3xl font-bold text-light tracking-wide">
                        Verify OTP
                    </h1>
                    <p className="text-gray-200 mt-2 text-sm">
                        OTP sent to {email}
                    </p>
                </div>
                <div className="p-8 space-y-4 bg-light">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}

                    <div className="flex justify-center gap-3 mt-3">
                        {inputs.map((_, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                value={otp[i] ?? ""}
                                maxLength={1}
                                onChange={(e) => handleChange(e.target.value, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                className="w-12 h-12 border-secondary text-center text-xl border rounded-md focus:ring focus:ring-primary text-primary"
                            />
                        ))}
                    </div>

                    <button
                        onClick={verifyOtp}
                        className="w-full py-3 rounded-lg bg-linear-to-r bg-primary text-light font-semibold hover:scale-105 transition transform"                    >
                        Verify OTP
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`w-full mt-2 py-2 rounded-lg text-center ${canResend ? "text-accentDark hover:underline" : "text-gray-500 cursor-not-allowed"}`}
                    >
                        {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                    </button>
                </div>
            </div>
        </div>
    );
};


// Step 3: Reset Password
const ResetPassword = ({ email, setStep }) => {
    const router = useRouter();
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleSubmit = async () => {
        setError("");
        if (!form.password || !form.confirmPassword) return setError("All fields required");
        if (form.password !== form.confirmPassword) return setError("Passwords do not match");

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword: form.password }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Password reset failed");
            } else {
                alert("Password reset successfully!");
                router.push("/login");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr  relative text-black">
            <div className="absolute inset-0 bg-[url('/bg2.png')] bg-center bg-cover opacity-40"></div>

            <div className=" mt-10 mb-10 relative bg-light rounded-2xl backdrop-blur-md shadow-[0_0_20px_#6f8197] border border-light overflow-hidden w-full max-w-md">
                <div className=" bg-primary p-6 text-center">
                    <h1 className="text-3xl font-bold text-light tracking-wide">
                        Reset Password
                    </h1>
                    <p className="text-gray-200 mt-2 text-sm">
                        Set your new password
                    </p>
                </div>
                <div className="p-8 space-y-4 bg-light">
                    {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}

                    <div className="mb-5 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border-secondary border rounded-lg  text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                        >
                            {showConfirm ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full py-3 rounded-lg bg-primary text-light font-semibold hover:scale-105 transition transform"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Forget Component
export default function Forget() {
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    return (
        <>
            {step === "email" && <EnterEmail setStep={setStep} setEmail={setEmail} setOtp={setOtp} />}
            {step === "otp" && <EnterOTP otp={otp} setOtp={setOtp} email={email} setStep={setStep} />}
            {step === "reset" && <ResetPassword email={email} setStep={setStep} />}
        </>
    );
}
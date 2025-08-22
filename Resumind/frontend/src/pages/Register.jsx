import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Axios instance pointing to Django backend
import { Eye, EyeOff } from "lucide-react";

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            toast.error(
                "Username must be 3-20 characters long (letters, numbers, underscore)"
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Invalid email format");
            return;
        }

        if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]).{6,}$/.test(
                password
            )
        ) {
            toast.error(
                "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
            );
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // ✅ Step 1: Register user
            await api.post("/accounts/register/", {
                username,
                email,
                password,
                password2: password,
            });

            // ✅ Step 2: Auto-login with JWT
            const res = await api.post("/token/", { username, password });

            if (res.data.access) localStorage.setItem("access", res.data.access);
            if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);

            toast.success("Registration successful! Logged in.");
            navigate("/resumes");
        } catch (error) {
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).flat().join(", ");
                toast.error(errorMsg);
            } else {
                toast.error("Server error. Please try again later.");
            }
        }
    };

    const inputClass =
        "w-full px-3 py-2 border rounded text-white bg-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500";

    return (
        <div className="flex justify-center items-center min-h-screen px-4 bg-gray-900">
            <form
                onSubmit={handleRegister}
                className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                    Create an Account
                </h2>

                {/* Username */}
                <div className="flex flex-col mb-4">
                    <label htmlFor="username" className="text-gray-300 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        className={inputClass}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col mb-4">
                    <label htmlFor="email" className="text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col mb-4 relative">
                    <label htmlFor="password" className="text-gray-300 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className={inputClass + " pr-10"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        spellCheck="false"
                        required
                    />
                    <span
                        className="absolute right-3 top-9 cursor-pointer text-gray-300"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col mb-6 relative">
                    <label htmlFor="confirmPassword" className="text-gray-300 mb-1">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm password"
                        className={inputClass + " pr-10"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        spellCheck="false"
                        required
                    />
                    <span
                        className="absolute right-3 top-9 cursor-pointer text-gray-300"
                        onClick={() => setShowConfirm((prev) => !prev)}
                    >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>

                {/* Register Button */}
                <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition mb-4"
                >
                    Register
                </button>

                {/* Login Link */}
                <p className="text-center text-gray-300">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-yellow-500 hover:underline cursor-pointer"
                    >
                        Login
                    </span>
                </p>

                {/* Hide default browser eye icon */}
                <style>
                    {`
            input::-ms-reveal,
            input::-ms-clear {
            display: none;
            }
            input::-webkit-credentials-auto-fill-button,
            input::-webkit-credentials-auto-fill-indicator,
            input::-webkit-password-toggle-button {
            display: none !important;
            -webkit-appearance: none;
            }
        `}
                </style>
            </form>
        </div>
    );
}

export default Register;

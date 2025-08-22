import React, { useState } from "react";
import api from "../api/axios"; // Axios instance pointing to Django backend
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Custom eye icons

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            toast.error("Username is required");
            return;
        }

        try {
            // ✅ Correct JWT login endpoint
            const res = await api.post("/token/", { username, password });

            if (res.data.access) localStorage.setItem("access", res.data.access);
            if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);

            toast.success("Login successful!");
            navigate("/resumes");
        } catch (error) {
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).flat().join(", ");
                toast.error(errorMsg);
            } else {
                toast.error("Invalid credentials or server error");
            }
        }
    };

    const inputClass =
        "w-full px-3 py-2 border rounded text-white bg-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500";

    return (
        <div className="flex justify-center items-center min-h-screen px-4 bg-gray-900">
            <form
                onSubmit={handleLogin}
                className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                    Login
                </h2>

                {/* Username */}
                <div className="flex flex-col mb-4">
                    <label className="text-gray-300 mb-1">Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        className={inputClass}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col mb-6 relative">
                    <label className="text-gray-300 mb-1">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`${inputClass} pr-10`} // extra padding for icon
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div
                        className="absolute right-3 top-[38px] cursor-pointer text-gray-300"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition mb-4"
                >
                    Login
                </button>

                {/* Register Link */}
                <p className="text-center text-gray-300">
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-yellow-500 hover:underline cursor-pointer"
                    >
                        Register
                    </span>
                </p>
            </form>

            {/* Hide default browser eye icon */}
            <style>
                {`
            input[type="password"]::-ms-reveal,
            input[type="password"]::-ms-clear,
            input[type="password"]::-webkit-password-toggle-button {
            display: none;
            }
        `}
            </style>
        </div>
    );
}

export default Login;

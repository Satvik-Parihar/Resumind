import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "@/assets/logo.png";
import api from "@/api/axios";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/accounts/logout-clear-media/");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            sessionStorage.removeItem("selectedJobTitle");
            sessionStorage.removeItem("skills");
            toast.success("Logged out successfully!", { autoClose: 2000 });
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed", { autoClose: 2000 });
        }
    };

    return (
        <nav className="bg-gray-900 text-white fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto px-4 py-5 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3">
                    <img src={logo} alt="Resumind Logo" className="h-12 w-12 rounded-full object-cover" />
                    <span className="text-2xl font-bold hover:text-yellow-400">Resumind</span>
                </Link>
                <div className="hidden md:flex space-x-6 items-center text-lg">
                    <Link to="/" className="hover:text-yellow-400">Home</Link>
                    {token ? (
                        <>
                            <Link to="/upload" className="hover:text-yellow-400">Upload</Link>
                            <Link to="/resumes" className="hover:text-yellow-400">Resumes</Link>
                            <Link to="/reports" className="hover:text-yellow-400">Reports</Link>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-yellow-400">Login</Link>
                            <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">Register</Link>
                        </>
                    )}
                </div>
                <button className="md:hidden text-yellow-400 focus:outline-none text-2xl" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? "✖" : "☰"}
                </button>
            </div>
            <hr className="border-gray-700" />
            {isOpen && (
                <div className="md:hidden bg-gray-900 px-4 py-3 space-y-2">
                    <Link to="/" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Home</Link>
                    {token ? (
                        <>
                            <Link to="/upload" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Upload</Link>
                            <Link to="/resumes" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Resumes</Link>
                            <Link to="/reports" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Reports</Link>
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register" className="block bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded" onClick={() => setIsOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;

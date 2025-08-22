import React from "react";
import { FaPhone, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-6">
            {/* Horizontal line */}
            <hr className="border-gray-700 mb-4" />

            <div className="container mx-auto px-4 text-center space-y-3">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <FaPhone className="text-yellow-400" />
                        <span>+91 9636092499</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-yellow-400" />
                        <a href="mailto:vedansh.dubai@gmail.com" className="hover:underline">
                            vedansh.dubai@gmail.com
                        </a>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaLinkedin className="text-yellow-400" />
                        <a
                            href="https://www.linkedin.com/in/satvik-parihar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            LinkedIn
                        </a>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaGithub className="text-yellow-400" />
                        <a
                            href="https://github.com/Ichigo-wiz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
                <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} Resumind. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;

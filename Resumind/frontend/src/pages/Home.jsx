// src/pages/Home.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const features = [
    {
        title: "AI Resume Analysis",
        desc: "Our AI quickly scans resumes for keywords, skills, and relevant experience to match candidates efficiently.",
        modal: "Leverage machine learning to analyze resumes and highlight key strengths, gaps, and role fit. Helps recruiters save hours of manual screening."
    },
    {
        title: "Detailed Reports",
        desc: "Get structured, visual reports that simplify complex resume data into actionable insights.",
        modal: "Reports include skill match percentages, education highlights, and predictive hiring metrics to help recruiters make data-driven decisions."
    },
    {
        title: "Faster Hiring Decisions",
        desc: "Streamline hiring with instant resume shortlisting and bias-free recommendations.",
        modal: "Reduce time-to-hire significantly while ensuring fair, unbiased evaluation. Makes decision-making faster and smarter."
    }
];

export default function Home() {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            {/* Main content */}
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
                {/* Heading */}
                <div className="text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Welcome to Resumind 🚀
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-12">
                        Smart AI-powered resume analysis & fair hiring solutions.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="cursor-pointer"
                            onClick={() => setActiveModal(f)}
                        >
                            <Card className="shadow-lg rounded-2xl bg-gray-800 hover:bg-gray-700 hover:shadow-2xl transition h-full">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold text-white">{f.title}</h2>
                                    <p className="text-gray-300 mt-3">{f.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-white">
                            {activeModal.title}
                        </h2>
                        <p className="text-gray-300 mb-6">{activeModal.modal}</p>
                        <Button
                            onClick={() => setActiveModal(null)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

function Reports({ clearTrigger }) {
    const [reports, setReports] = useState([]);
    const [modalReport, setModalReport] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await api.get("/reports/");
            let data = res.data || [];
            data = data.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.date) - new Date(a.date);
            });
            setReports(data);
        } catch (err) {
            console.error("Error fetching reports:", err);
            toast.error("Failed to fetch reports");
        }
    };

    useEffect(() => {
        fetchReports();
    }, [clearTrigger]);

    const openModal = (report) => {
        setModalReport(report);
        setSelectedReport(report);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalReport(null);
        setModalOpen(false);
    };

    const skillGraphData = reports.map((report) => ({
        name: report.name,
        matched: (report.analysis?.required_skills_matched || []).length,
        missing: (report.analysis?.required_skills_missing || []).length,
    }));

    const contributionData = (report) => {
        const a = report.analysis || {};
        return [
            { factor: "Skills", value: (a.required_skills_matched?.length || 0) * 10 },
            { factor: "Experience", value: (a.experience_years || 0) * 2 },
            { factor: "Education", value: a.education_score || 0 },
            { factor: "Certifications", value: a.certifications || 0 },
            { factor: "Projects", value: a.projects || 0 },
        ];
    };

    return (
        <div className="bg-gray-900 min-h-screen pt-24 px-4 pb-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">📊 Reports & Rankings</h2>

                {reports.length === 0 ? (
                    <p className="text-center text-gray-400">
                        No reports yet. Generate one from the upload/job page.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto mb-8">
                            <h3 className="text-2xl font-semibold mb-4 text-yellow-400">🏆 Candidate Rankings</h3>
                            <table className="w-full text-left text-white border border-gray-700 rounded-lg overflow-hidden">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Rank</th>
                                        <th className="px-4 py-2">Candidate</th>
                                        <th className="px-4 py-2">Score</th>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Analysis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, index) => {
                                        const a = report.analysis || {};
                                        const matched = (a.required_skills_matched || []).slice(0, 3);
                                        const missing = (a.required_skills_missing || []).slice(0, 3);
                                        return (
                                            <tr
                                                key={report.id}
                                                className={`border-t border-gray-700 cursor-pointer ${
                                                    index % 2 === 0
                                                        ? "bg-gray-800 hover:bg-gray-800/50"
                                                        : "bg-gray-700 hover:bg-gray-700/50"
                                                }`}
                                                onClick={() => openModal(report)}
                                            >
                                                <td className="px-4 py-2 font-bold text-yellow-400">#{index + 1}</td>
                                                <td className="px-4 py-2">{report.name}</td>
                                                <td className="px-4 py-2">{Math.round(report.score) ?? "—"}</td>
                                                <td className="px-4 py-2">{report.date}</td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            report.status === "Completed"
                                                                ? "bg-green-700 text-green-100"
                                                                : "bg-yellow-700 text-yellow-100"
                                                        }`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-300">
                                                    {matched.length > 0 && (
                                                        <div>
                                                            ✅ Matched: {matched.join(", ")}
                                                            {a.required_skills_matched?.length > 3 && " …"}
                                                        </div>
                                                    )}
                                                    {missing.length > 0 && (
                                                        <div>
                                                            ❌ Missing: {missing.join(", ")}
                                                            {a.required_skills_missing?.length > 3 && " …"}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-white mb-4">✅ Skills Matched vs Missing</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={skillGraphData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="matched" fill="#4ade80" />
                                        <Bar dataKey="missing" fill="#f87171" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    📊 Factor Contribution - {selectedReport?.name || "Select a Candidate"}
                                </h3>
                                {selectedReport ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart
                                            layout="vertical"
                                            data={contributionData(selectedReport)}
                                            margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="factor" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400">Click on any row to view contributions.</p>
                                )}
                            </div>
                        </div>

                        {modalOpen && modalReport && (
                            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                                <div className="relative bg-gray-900 p-6 rounded-xl w-11/12 max-w-3xl overflow-y-auto max-h-[80vh]">
                                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                                        {modalReport.name} - Full Details
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-4 right-4 text-white font-bold text-xl"
                                    >
                                        ×
                                    </button>
                                    <div className="text-white space-y-2">
                                        <div className="bg-gray-700 p-2 rounded">
                                            <div className="text-white mb-1">Progress: Skills Matched vs Missing</div>
                                            <div className="w-full h-4 bg-gray-600 rounded-full relative">
                                                <div
                                                    className="absolute top-0 left-0 h-4 bg-green-400 rounded-l-full"
                                                    style={{
                                                        width: `${
                                                            ((modalReport.analysis.required_skills_matched?.length || 0) /
                                                                ((modalReport.analysis.required_skills_matched?.length || 0) +
                                                                    (modalReport.analysis.required_skills_missing?.length || 0) || 1)) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                                <div
                                                    className="absolute top-0 right-0 h-4 bg-red-400 rounded-r-full"
                                                    style={{
                                                        width: `${
                                                            ((modalReport.analysis.required_skills_missing?.length || 0) /
                                                                ((modalReport.analysis.required_skills_matched?.length || 0) +
                                                                    (modalReport.analysis.required_skills_missing?.length || 0) || 1)) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>✅ Skills Matched: {(modalReport.analysis.required_skills_matched || []).join(", ")}</div>
                                        <div>❌ Skills Missing: {(modalReport.analysis.required_skills_missing || []).join(", ")}</div>
                                        <div>💼 Experience: {modalReport.analysis.experience_years} yrs</div>
                                        <div>🎓 Education: {modalReport.analysis.education}</div>
                                        <div>📜 Certifications: {modalReport.analysis.certifications || 0}</div>
                                        <div>🚀 Projects: {modalReport.analysis.projects}</div>
                                        {modalReport.file_url && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => window.open(modalReport.file_url, "_blank")}
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    View Resume
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Reports;

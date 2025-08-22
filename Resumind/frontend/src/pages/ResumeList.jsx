import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Trash2, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ResumeList({ clearTrigger }) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResume, setSelectedResume] = useState(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [clearTrigger]);

    const handleScroll = () => setShowScrollTop(window.scrollY > 100);

    const fetchResumes = async () => {
        try {
            const res = await api.get("/resumes/");
            let data = res.data || [];

            // Filter duplicates based on email + phone + linkedin + github + name
            const seen = new Set();
            data = data.filter((r) => {
                const key =
                    (r.summary?.email || "") +
                    "|" +
                    (r.summary?.phone || "") +
                    "|" +
                    (r.summary?.linkedin || "") +
                    "|" +
                    (r.summary?.github || "") +
                    "|" +
                    (r.summary?.name || "");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            setResumes(data);
        } catch (err) {
            console.error("Fetch resumes error:", err.response || err);
            toast.error("Failed to load resumes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResume = (resume) => {
        let url = resume.file_url;
        if (url) {
            window.open(url, "_blank");
        } else {
            toast.error("Resume file not available.");
        }
    };

    const handleCheckbox = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
            setSelectAll(false);
        } else {
            setSelectedIds(resumes.map((r) => r.id));
            setSelectAll(true);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedIds.length) return toast.info("Select resumes first!");
        try {
            await api.post("/resumes/bulk-delete/", { ids: selectedIds });
            toast.success("Selected resumes deleted!");
            setDeleteMode(false);
            setSelectedIds([]);
            setSelectAll(false);
            fetchResumes();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete selected resumes.");
        }
    };

    const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className="bg-gray-900 min-h-[calc(100vh-64px)] pt-24 px-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">📂 Your Resumes</h2>

                {loading ? (
                    <p className="text-center text-gray-400">Loading resumes...</p>
                ) : resumes.length === 0 ? (
                    <p className="text-center text-gray-400">No resumes uploaded yet. Upload one from Dashboard.</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                className={`bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-yellow-500/50 transition relative ${
                                    deleteMode ? "border-2 border-yellow-500" : ""
                                }`}
                            >
                                {deleteMode && (
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(resume.id)}
                                        onChange={() => handleCheckbox(resume.id)}
                                        className="absolute top-2 left-2 w-5 h-5"
                                    />
                                )}
                                <h3
                                    className="text-lg font-semibold mb-2 text-white cursor-pointer hover:underline"
                                    onClick={() => !deleteMode && handleOpenResume(resume)}
                                >
                                    {resume.summary?.name || resume.filename}
                                </h3>
                                <p
                                    className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                        resume.status === "processed"
                                            ? "bg-green-700 text-green-100"
                                            : "bg-yellow-700 text-yellow-100"
                                    }`}
                                >
                                    {resume.status || "Pending"}
                                </p>
                                {!deleteMode && (
                                    <button
                                        className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded transition"
                                        onClick={() => setSelectedResume(resume)}
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 flex justify-center gap-6 pb-8">
                {!deleteMode && (
                    <>
                        <button
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                            onClick={() => navigate("/upload")}
                        >
                            <Plus size={18} /> Add Resume
                        </button>
                        <button
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                            onClick={() => setDeleteMode(true)}
                        >
                            <Trash2 size={18} /> Delete Resume
                        </button>
                    </>
                )}
                {deleteMode && (
                    <>
                        <button
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                            onClick={handleSelectAll}
                        >
                            {selectAll ? "Unselect All" : "Select All"}
                        </button>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                            onClick={handleDeleteSelected}
                        >
                            Delete Selected
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded transition"
                            onClick={() => {
                                setDeleteMode(false);
                                setSelectedIds([]);
                                setSelectAll(false);
                            }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {selectedResume && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-lg relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            onClick={() => setSelectedResume(null)}
                        >
                            ✖
                        </button>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                            {selectedResume.summary?.name || selectedResume.filename}
                        </h3>
                        <p className="text-gray-300 mb-2">
                            <strong>Email:</strong> {selectedResume.summary?.email || "N/A"}
                        </p>
                        <p className="text-gray-300 mb-2">
                            <strong>Phone:</strong> {selectedResume.summary?.phone || "N/A"}
                        </p>
                        <p className="text-gray-300 mb-2">
                            <strong>LinkedIn:</strong>{" "}
                            {selectedResume.summary?.linkedin ? (
                                <a
                                    href={selectedResume.summary.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    {selectedResume.summary.linkedin}
                                </a>
                            ) : (
                                "N/A"
                            )}
                        </p>
                        <p className="text-gray-300 mb-2">
                            <strong>GitHub:</strong>{" "}
                            {selectedResume.summary?.github ? (
                                <a
                                    href={selectedResume.summary.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    {selectedResume.summary.github}
                                </a>
                            ) : (
                                "N/A"
                            )}
                        </p>
                        <p className="text-gray-300 mb-4">
                            <strong>Skills:</strong>{" "}
                            {selectedResume.summary?.skills?.length > 0
                                ? selectedResume.summary.skills.join(", ")
                                : "N/A"}
                        </p>
                    </div>
                </div>
            )}

            {showScrollTop && (
                <button
                    className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full shadow-lg z-50 transition"
                    onClick={handleScrollTop}
                >
                    <ChevronUp size={24} />
                </button>
            )}
        </div>
    );
}

export default ResumeList;

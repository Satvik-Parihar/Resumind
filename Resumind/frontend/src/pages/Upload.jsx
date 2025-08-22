import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const jobCategories = {
    "Engineering": ["Software Engineer", "DevOps Engineer", "Data Analyst", "UI/UX Designer", "Project Manager", "Product Manager", "Operations Manager"],
    "HR & Marketing": ["HR Specialist", "Recruiter", "Marketing Manager", "Content Writer", "Social Media Manager"],
    "Finance & Legal": ["Accountant", "Financial Analyst", "Compliance Officer", "Legal Advisor"],
    "Support & Admin": ["Customer Support", "Sales Executive", "Technical Support", "Administrative Assistant"]
};

const Upload = () => {
    const [singleFile, setSingleFile] = useState(null);
    const [multiFiles, setMultiFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedJobTitle, setSelectedJobTitle] = useState("");
    const [jobs, setJobs] = useState([]);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [jobConfirmed, setJobConfirmed] = useState(false);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const navigate = useNavigate();

    // Load session on mount
    useEffect(() => {
        fetchJobs();
        const savedJobTitle = sessionStorage.getItem("selectedJobTitle");
        const savedSkills = sessionStorage.getItem("skills");
        if (savedJobTitle) {
            setSelectedJobTitle(savedJobTitle);
            setJobConfirmed(true);
            if (savedSkills) setSkills(JSON.parse(savedSkills));
            else fetchSkillsForJob(savedJobTitle);
        }
    }, []);

    // Persist session when job is confirmed
    useEffect(() => {
        if (jobConfirmed) {
            sessionStorage.setItem("selectedJobTitle", selectedJobTitle);
            sessionStorage.setItem("skills", JSON.stringify(skills));
        }
    }, [jobConfirmed, selectedJobTitle, skills]);

    const fetchJobs = async () => {
        try {
            const res = await api.get("/jobs/");
            setJobs(res.data);
        } catch (err) {
            console.error(err.response || err);
            toast.error("❌ Failed to fetch jobs.");
        }
    };

    const fetchSkillsForJob = async (job) => {
        try {
            setSkillsLoading(true);
            const res = await api.get(`/jobs/skills/?job=${encodeURIComponent(job)}`);
            let fetchedSkills = res.data.skills || [];
            if (typeof fetchedSkills === "string") fetchedSkills = [];
            setSkills(fetchedSkills);
        } catch (err) {
            console.error(err.response || err);
            toast.error("❌ Failed to fetch skills.");
        } finally {
            setSkillsLoading(false);
        }
    };

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ];

    const handleSingleChange = (e) => {
        const file = e.target.files[0];
        if (file && allowedTypes.includes(file.type)) setSingleFile(file);
        else {
            toast.error("Only PDF, DOC, DOCX, and TXT files are allowed!");
            e.target.value = "";
            setSingleFile(null);
        }
    };

    const handleMultiChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => allowedTypes.includes(file.type));
        if (validFiles.length !== files.length) toast.warn("Some files were not valid.");
        setMultiFiles(validFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!singleFile && multiFiles.length === 0) {
            toast.error("Please select at least one file before uploading!");
            return;
        }
        if (!selectedJobTitle) {
            toast.error("Please select a job before uploading!");
            return;
        }
        const formData = new FormData();
        if (singleFile) formData.append("files", singleFile);
        multiFiles.forEach((file) => formData.append("files", file));
        formData.append("job", selectedJobTitle);
        try {
            setLoading(true);
            const res = await api.post("/resumes/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const extracted = res.data.extracted || [];
            const firstName = extracted[0]?.name || extracted[0]?.filename || "Resume";
            toast.success(`✅ Uploaded & parsed: ${firstName}`);
            setSingleFile(null);
            setMultiFiles([]);
            navigate("/resumes");
        } catch (err) {
            console.error(err.response || err);
            toast.error(`❌ Upload failed: ${err.response?.data?.error || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    // Confirm job + store frontend-selected skills to backend
    const handleJobConfirm = async () => {
        if (!selectedJobTitle) {
            toast.error("Please select a job before confirming.");
            return;
        }
        try {
            setSkillsLoading(true);
            await api.post("/jobs/", { job: selectedJobTitle, skills });
            setJobConfirmed(true);
            toast.success("✅ Job & skills saved!");
        } catch (err) {
            console.error(err.response || err);
            toast.error("❌ Failed to save job and skills.");
        } finally {
            setSkillsLoading(false);
        }
    };

    // Add skill & sync with backend if job is confirmed
    const handleAddSkill = async () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            const updatedSkills = [...skills, newSkill.trim()];
            setSkills(updatedSkills);
            setNewSkill("");

            if (jobConfirmed) {
                try {
                    setSkillsLoading(true);
                    await api.post("/jobs/", { job: selectedJobTitle, skills: updatedSkills });
                    toast.success("✅ Skills updated!");
                } catch (err) {
                    console.error(err.response || err);
                    toast.error("❌ Failed to update skills.");
                } finally {
                    setSkillsLoading(false);
                }
            }
        }
    };

    // Remove skill & sync with backend if job is confirmed
    const handleRemoveSkill = async (skill) => {
        const updatedSkills = skills.filter((s) => s !== skill);
        setSkills(updatedSkills);

        if (jobConfirmed) {
            try {
                setSkillsLoading(true);
                await api.post("/jobs/", { job: selectedJobTitle, skills: updatedSkills });
                toast.success("✅ Skills updated!");
            } catch (err) {
                console.error(err.response || err);
                toast.error("❌ Failed to update skills.");
            } finally {
                setSkillsLoading(false);
            }
        }
    };

    const handleChangeJob = () => {
        setJobConfirmed(false);
        setSkills([]);
        setSelectedJobTitle("");
        sessionStorage.removeItem("selectedJobTitle");
        sessionStorage.removeItem("skills");
    };

    const handleContinue = () => navigate("/resumes");

    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center px-6 pt-28 pb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Resume <span className="text-yellow-400">Upload</span>
            </h1>

            <form onSubmit={handleSubmit} className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10">
                    {/* Single Upload */}
                    <div className="border-2 border-dashed border-yellow-400 rounded-2xl p-10 bg-[#0B1120] shadow-lg flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold mb-6">Upload <span className="text-yellow-400">Single Resume</span></h2>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleSingleChange}
                            className="block w-full text-lg text-gray-300 cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
                        />
                        {singleFile && <p className="mt-5 text-lg font-medium text-green-400 truncate max-w-full">✅ {singleFile.name}</p>}
                    </div>

                    {/* OR divider */}
                    <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-0.5 bg-gray-500 mb-2"></div>
                            <span className="text-2xl font-bold text-gray-400">OR</span>
                            <div className="h-10 w-0.5 bg-gray-500 mt-2"></div>
                        </div>
                    </div>

                    {/* Multiple Upload */}
                    <div className="border-2 border-dashed border-yellow-400 rounded-2xl p-10 bg-[#0B1120] shadow-lg flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold mb-6">Upload <span className="text-yellow-400">Multiple Resumes</span></h2>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleMultiChange}
                            className="block w-full text-lg text-gray-300 cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
                        />
                        {multiFiles.length > 0 && <p className="mt-5 text-lg font-medium text-green-400">✅ {multiFiles.length} file(s) selected</p>}
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center mt-10">
                        <div className="w-12 h-12 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="flex justify-center mt-12">
                    <button type="submit" disabled={loading || !jobConfirmed} className="px-12 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xl rounded-xl shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                        {loading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </form>

            {/* Job selection & confirm */}
            {!jobConfirmed && (
                <div className="mt-12 w-full max-w-lg bg-[#1A2238] p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Select <span className="text-yellow-400">Job Role</span></h2>
                    <select
                        value={selectedJobTitle}
                        onChange={(e) => {
                            setSelectedJobTitle(e.target.value);
                            fetchSkillsForJob(e.target.value);
                        }}
                        className="w-full p-3 rounded-lg bg-gray-800 text-white text-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">-- Choose Job Role --</option>
                        {Object.entries(jobCategories).map(([category, titles]) => (
                            <optgroup key={category} label={category}>
                                {titles.map((title) => jobs.find((j) => j.title === title) && <option key={title} value={title}>{title}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <div className="flex justify-center mt-8">
                        <button onClick={handleJobConfirm} disabled={skillsLoading} className="px-10 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                            {skillsLoading ? "Fetching Skills..." : "Confirm"}
                        </button>
                    </div>
                    {skillsLoading && <div className="flex justify-center mt-4"><div className="w-12 h-12 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div></div>}
                </div>
            )}

            {/* Edit skills after confirm */}
            {jobConfirmed && (
                <div className="mt-12 w-full max-w-2xl bg-[#1A2238] p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Selected Job: <span className="text-yellow-400">{selectedJobTitle}</span></h2>
                    <div className="flex justify-center mb-6">
                        <button onClick={handleChangeJob} className="px-10 py-3 bg-red-500 hover:bg-red-600 text-black font-semibold rounded-lg shadow-lg">Change Job</button>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Edit <span className="text-yellow-400">Skills</span></h2>
                    <ul className="mb-4">
                        {skills.map((skill, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg mb-2">
                                <span>{skill}</span>
                                <button onClick={() => handleRemoveSkill(skill)} className="text-red-400 hover:text-red-600">✕</button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 mb-6">
                        <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" className="flex-1 p-3 rounded-lg bg-gray-800 text-white" />
                        <button onClick={handleAddSkill} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg">Add</button>
                    </div>
                    <div className="flex justify-center">
                        <button onClick={handleContinue} disabled={!skills.length} className="px-10 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg rounded-lg shadow-lg disabled:opacity-50">
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;

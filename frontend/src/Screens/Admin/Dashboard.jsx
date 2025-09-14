import React, { useState, useEffect, useRef } from "react";
import { getCompletedInterviews, getOngoingInterviews } from "../../api/Services/Candidate.jsx";
import { useSocket } from "../../Context/SocketWrapper.jsx";
import { useParams } from "react-router-dom";

const AdminDashboard = () => {
    const [completedCandidates, setCompletedCandidates] = useState([]);
    const [ongoingCandidates, setOngoingCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [isLiveView, setIsLiveView] = useState(false);
    const [selectedCandidateLogs, setSelectedCandidateLogs] = useState([]);
    const videoRef = useRef(null);
    const socket = useSocket();
    const { adminId } = useParams();

    // Fetch completed interviews
    const fetchCompletedInterviews = async () => {
        try {
            const response = await getCompletedInterviews();
            console.log("Completed interviews:", response);
            setCompletedCandidates(response.data?.candidates || []);
        } catch (e) {
            console.error("Error fetching completed interviews:", e);
        }
    };

    // Fetch ongoing interviews
    const fetchOngoingInterviews = async () => {
        try {
            const response = await getOngoingInterviews();
            console.log("Ongoing interviews:", response);
            setOngoingCandidates(response.data?.candidates || []);
        } catch (e) {
            console.error("Error fetching ongoing interviews:", e);
        }
    };

    useEffect(() => {
        fetchCompletedInterviews();
        fetchOngoingInterviews();

        if (socket && adminId) {
            // Let the server know this admin joined
            socket.emit("admin-join", adminId);
        }

        return () => {
            // Cleanup when component unmounts
            if (socket) {
                socket.off("candidate-event");
                socket.off("candidate-joined");
                socket.off("candidate-completed");
            }
        };
    }, [socket, adminId]);

    useEffect(() => {
        if (!socket) return;

        // Listen for candidate events
        const handleCandidateEvent = ({ candidateId, event }) => {
            console.log("Candidate event received:", { candidateId, event });

            // If selected candidate is same → append log
            if (selectedCandidate?.id === candidateId) {
                setSelectedCandidateLogs(prevLogs => [...prevLogs, event]);
            }

            // Update only the affected candidate
            setOngoingCandidates(prevCandidates => {
                const idx = prevCandidates.findIndex(c => c.id === candidateId);
                if (idx === -1) return prevCandidates; // candidate not found

                const candidate = prevCandidates[idx];
                const updatedCandidate = {
                    ...candidate,
                    liveLogs: [...(candidate.liveLogs || []), event],
                };

                // return new array with only that candidate replaced
                return [
                    ...prevCandidates.slice(0, idx),
                    updatedCandidate,
                    ...prevCandidates.slice(idx + 1),
                ];
            });
        };


        const handleCandidateJoined = ({ candidate }) => {
            console.log("New candidate joined:", candidate);

            const newCandidate = {
                id: candidate._id || candidate.id,
                name: candidate.name,
                startedAt: new Date(candidate.startedAt || candidate.createdAt).toLocaleTimeString(),
                currentDuration: "00:00",
                integrityScore: "Live: 100",
                liveLogs: []
            };

            setOngoingCandidates(prevCandidates => {
                // ✅ Check if candidate already exists
                const exists = prevCandidates.some(c => c.id === newCandidate.id);
                if (exists) return prevCandidates;

                return [...prevCandidates, newCandidate];
            });
        };


        const handleCandidateCompleted = ({ candidateId }) => {
            console.log("Candidate completed interview:", candidateId);

            // Remove from ongoing and add to completed
            setOngoingCandidates(prevCandidates =>
                prevCandidates.filter(candidate => candidate.id !== candidateId)
            );

            // Refresh completed list
            fetchCompletedInterviews();
        };

        // Setup event listeners
        socket.on("candidate-event", handleCandidateEvent);
        socket.on("candidate-joined", handleCandidateJoined);
        socket.on("candidate-completed", handleCandidateCompleted);

        // Cleanup listeners
        return () => {
            socket.off("candidate-event", handleCandidateEvent);
            socket.off("candidate-joined", handleCandidateJoined);
        };
    }, [socket, selectedCandidate]);

    const viewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setSelectedCandidateLogs([]);
        setIsLiveView(false);
        setShowLogsModal(true);
    };

    const viewLiveLogs = (candidate) => {
        setSelectedCandidate(candidate);
        setSelectedCandidateLogs(candidate.liveLogs || []);
        setIsLiveView(true);
        setShowLogsModal(true);
    };

    const getScoreColor = (score) => {
        if (typeof score === "string") {
            if (score.includes("Live:")) {
                const liveScore = parseInt(score.replace("Live:", "").trim());
                if (liveScore >= 90) return "text-green-400";
                if (liveScore >= 80) return "text-yellow-400";
                if (liveScore >= 70) return "text-orange-400";
                return "text-red-400";
            }
            return "text-green-400";
        }
        if (score >= 90) return "text-green-400";
        if (score >= 80) return "text-yellow-400";
        if (score >= 70) return "text-orange-400";
        return "text-red-400";
    };

    const getEventColor = (type) => {
        switch (type) {
            case "warning":
                return "text-yellow-400";
            case "success":
                return "text-green-400";
            case "info":
                return "text-blue-400";
            default:
                return "text-white";
        }
    };


    const Table = ({ title, data, columns, showDetailsButton = false, showLiveButton = false }) => (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider"
                            >
                                {col.label}
                            </th>
                        ))}
                        {(showDetailsButton || showLiveButton) && (
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {data.length > 0 ? (
                        data.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-800 transition">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            col.key === "integrityScore" ? getScoreColor(row[col.key]) : "text-white"
                                        }`}
                                    >
                                        {row[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    {showDetailsButton && (
                                        <button
                                            onClick={() => viewDetails(row)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm transition"
                                        >
                                            View Details
                                        </button>
                                    )}
                                    {showLiveButton && (
                                        <button
                                            onClick={() => viewLiveLogs(row)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition"
                                        >
                                            Live Logs
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-400">
                                No records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden p-10">
            {/* Background glow */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

            <h1 className="text-5xl font-extrabold mb-8 tracking-wide animate-fade-in">
                Admin<span className="text-indigo-500"> Dashboard</span>
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                <Table
                    title="Completed Interviews"
                    data={completedCandidates}
                    columns={[
                        { key: "name", label: "Candidate Name" },
                        { key: "interviewDate", label: "Date" },
                        { key: "integrityScore", label: "Score" },
                        { key: "duration", label: "Duration" },
                    ]}
                    showDetailsButton={true}
                />

                <Table
                    title="Ongoing Interviews"
                    data={ongoingCandidates}
                    columns={[
                        { key: "name", label: "Candidate Name" },
                        { key: "startedAt", label: "Started" },
                        { key: "integrityScore", label: "Score" },
                        { key: "currentDuration", label: "Duration" },
                    ]}
                    showLiveButton={true}
                />
            </div>

            {/* Modal */}
            {showLogsModal && selectedCandidate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {isLiveView ? "Live Logs - " : "Interview Details - "}
                                {selectedCandidate.name}
                                {isLiveView && <span className="ml-2 text-green-400 text-sm">● LIVE</span>}
                            </h3>
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
                            {isLiveView ? (
                                <div>
                                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-400">
                                        <div>Started: {selectedCandidate.startedAt}</div>
                                        <div>Duration: {selectedCandidate.currentDuration}</div>
                                        <div className="text-right">
                                            Score:{" "}
                                            <span className={getScoreColor(selectedCandidate.integrityScore)}>
                                                {selectedCandidate.integrityScore}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                                            <div>TIMESTAMP</div>
                                            <div>EVENT</div>
                                            <div>STATUS</div>
                                        </div>
                                        {selectedCandidateLogs.map((log, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-750 transition"
                                            >
                                                <div className="grid grid-cols-3 gap-2 items-center">
      <span className="text-blue-400 text-sm truncate overflow-hidden whitespace-nowrap">
        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "N/A"}
      </span>
                                                    <span className="text-white text-sm truncate overflow-hidden whitespace-nowrap">
        {log.event || log.type}
      </span>
                                                    <span
                                                        className={`text-sm ${getEventColor(log.type || "info")} truncate overflow-hidden whitespace-nowrap text-right`}
                                                    >
        {(log.type || "info").toUpperCase()}
      </span>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Video Player */}
                                    <div className="lg:col-span-1">
                                        <h4 className="font-semibold text-white mb-3">Interview Recording</h4>
                                        <div className="bg-black rounded-lg overflow-hidden">
                                            <video
                                                ref={videoRef}
                                                className="w-full h-64 object-cover"
                                                className="w-full h-64 object-cover"
                                                controls
                                            >
                                                <source src={selectedCandidate.interviewUrl || selectedCandidate.details?.videoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                            <div className="bg-gray-800 p-3 rounded-lg">
                                                <div className="text-gray-400">Total Duration</div>
                                                <div className="text-white text-lg">{selectedCandidate.duration}</div>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg">
                                                <div className="text-gray-400">Final Score</div>
                                                <div className={`text-lg ${getScoreColor(selectedCandidate.integrityScore)}`}>
                                                    {selectedCandidate.integrityScore}%
                                                </div>
                                            </div>
                                            {/* 👉 Lost Focus Time */}
                                            <div className="bg-gray-800 p-3 rounded-lg col-span-2">
                                                <div className="text-gray-400">Lost Focus Time</div>
                                                <div className="text-yellow-400 text-lg">
                                                    {
                                                        (selectedCandidate.details?.events || [])
                                                            .filter(e => e.type === "NO_FACE" || e.type === "LOOK_AWAY")
                                                            .reduce((sum, e) => sum + (e.durationMs || 0), 0)
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Events List */}
                                    <div className="lg:col-span-1">
                                        <h4 className="font-semibold text-white mb-3">Interview Events</h4>
                                        <div className="bg-gray-800 p-3 rounded-lg mb-4">
                                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                                                <div>TIMESTAMP</div>
                                                <div>EVENT</div>
                                                <div>STATUS</div>
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {(selectedCandidate.details?.events || []).map((event, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-700 p-2 rounded-lg hover:bg-gray-650 transition"
                                                    >
                                                        <div className="grid grid-cols-3 gap-2 items-center text-sm">
      <span className="text-blue-400 truncate overflow-hidden whitespace-nowrap">
        {event.time}
      </span>
                                                            <span className="text-white truncate overflow-hidden whitespace-nowrap">
        {event.event}
      </span>
                                                            <span
                                                                className={`text-xs ${getEventColor(event.type)} truncate overflow-hidden whitespace-nowrap text-right`}
                                                            >
        {event.type.toUpperCase()}
      </span>
                                                        </div>
                                                    </div>
                                                ))}

                                            </div>
                                        </div>

                                        <div className="bg-gray-800 p-3 rounded-lg">
                                            <div className="text-gray-400">Total Violations</div>
                                            <div className="text-red-400 text-lg">{selectedCandidate.violations || 0}</div>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
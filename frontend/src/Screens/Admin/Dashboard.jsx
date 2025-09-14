import React, { useState, useEffect } from "react";
import { getCompletedInterviews, getOngoingInterviews } from "../../api/Services/Candidate.jsx";
import { useSocket } from "../../Context/SocketWrapper.jsx";
import { useParams, useNavigate } from "react-router-dom"; // ✅ useNavigate for logout redirect
import Table from "./components/Table.jsx";
import BackgroundGlow from "./components/BackgroundGlow.jsx";
import LogsModal from "./components/LogsModal.jsx";
import { removeCookieItem } from "../../Utils/cookies-helpers.js";

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [completedCandidates, setCompletedCandidates] = useState([]);
  const [ongoingCandidates, setOngoingCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [isLiveView, setIsLiveView] = useState(false);
  const [selectedCandidateLogs, setSelectedCandidateLogs] = useState([]);
  const socket = useSocket();
  const { adminId } = useParams();
  const navigate = useNavigate(); // ✅ navigation hook

  // Logout handler
  const handleLogout = () => {
    removeCookieItem("token")

    navigate("/");
  };

  // Fetch completed interviews
  const fetchCompletedInterviews = async () => {
    try {
      const response = await getCompletedInterviews();
      setCompletedCandidates(response.data?.candidates || []);
    } catch (e) {
      console.error("Error fetching completed interviews:", e);
    }
  };

  // Fetch ongoing interviews
  const fetchOngoingInterviews = async () => {
    try {
      const response = await getOngoingInterviews();
      setOngoingCandidates(response.data?.candidates || []);
    } catch (e) {
      console.error("Error fetching ongoing interviews:", e);
    }
  };

  useEffect(() => {
    fetchCompletedInterviews();
    fetchOngoingInterviews();

    if (socket && adminId) {
      socket.emit("admin-join", adminId);
    }

    return () => {
      if (socket) {
        socket.off("candidate-event");
        socket.off("candidate-joined");
        socket.off("candidate-completed");
      }
    };
  }, [socket, adminId]);

  useEffect(() => {
    if (!socket) return;

    const handleCandidateEvent = ({ candidateId, event }) => {
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidateLogs((prevLogs) => [...prevLogs, event]);
      }

      setOngoingCandidates((prevCandidates) => {
        const idx = prevCandidates.findIndex((c) => c.id === candidateId);
        if (idx === -1) return prevCandidates;

        const candidate = prevCandidates[idx];
        const updatedCandidate = {
          ...candidate,
          liveLogs: [...(candidate.liveLogs || []), event],
        };

        return [
          ...prevCandidates.slice(0, idx),
          updatedCandidate,
          ...prevCandidates.slice(idx + 1),
        ];
      });
    };

    const handleCandidateJoined = ({ candidate }) => {
      const newCandidate = {
        id: candidate._id || candidate.id,
        name: candidate.name,
        startedAt: new Date(
          candidate.startedAt || candidate.createdAt
        ).toLocaleTimeString(),
        currentDuration: "00:00",
        integrityScore: "Live: 100",
        liveLogs: [],
      };

      setOngoingCandidates((prevCandidates) => {
        const exists = prevCandidates.some((c) => c.id === newCandidate.id);
        if (exists) return prevCandidates;
        return [...prevCandidates, newCandidate];
      });
    };

    const handleCandidateCompleted = ({ candidateId }) => {
      setOngoingCandidates((prevCandidates) =>
        prevCandidates.filter((candidate) => candidate.id !== candidateId)
      );
      fetchCompletedInterviews();
    };

    socket.on("candidate-event", handleCandidateEvent);
    socket.on("candidate-joined", handleCandidateJoined);
    socket.on("candidate-completed", handleCandidateCompleted);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden p-10">
      <BackgroundGlow />

      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-wide animate-fade-in">
          Admin<span className="text-indigo-500"> Dashboard</span>
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 pointer-cursor text-white px-4 py-2 rounded-lg shadow-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Tables */}
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
          onViewDetails={viewDetails}
          getScoreColor={getScoreColor}
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
          onViewLiveLogs={viewLiveLogs}
          getScoreColor={getScoreColor}
        />
      </div>

      {/* Logs Modal */}
      <LogsModal
        show={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        candidate={selectedCandidate}
        isLiveView={isLiveView}
        logs={selectedCandidateLogs}
        getScoreColor={getScoreColor}
        getEventColor={getEventColor}
      />
    </div>
  );
};

export default AdminDashboard;

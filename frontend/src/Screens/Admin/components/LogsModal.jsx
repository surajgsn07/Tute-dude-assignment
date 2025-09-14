import React from "react";
import LiveLogsView from "./LiveLogsView";
import InterviewDetailsView from "./InterviewDetailsView";


// ✅ Logs Modal Component
const LogsModal = ({
  show,
  onClose,
  candidate,
  isLiveView,
  logs,
  getScoreColor,
  getEventColor,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {isLiveView ? "Live Logs - " : "Interview Details - "}
            {candidate.name}
            {isLiveView && (
              <span className="ml-2 text-green-400 text-sm">● LIVE</span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-900 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
          {isLiveView ? (
            <LiveLogsView
              candidate={candidate}
              logs={logs}
              getScoreColor={getScoreColor}
              getEventColor={getEventColor}
            />
          ) : (
            <InterviewDetailsView
              candidate={candidate}
              getScoreColor={getScoreColor}
              getEventColor={getEventColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsModal;

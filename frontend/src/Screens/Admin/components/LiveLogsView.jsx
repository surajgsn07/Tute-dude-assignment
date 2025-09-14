import React from "react";

// ✅ Live Logs View Component
const LiveLogsView = ({ candidate, logs, getScoreColor, getEventColor }) => (
  <div>
    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-400">
      <div>Started: {candidate.startedAt}</div>
      <div>Duration: {candidate.currentDuration}</div>
      <div className="text-right">
        Score:{" "}
        <span className={getScoreColor(candidate.integrityScore)}>
          {candidate.integrityScore}
        </span>
      </div>
    </div>

    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
        <div>TIMESTAMP</div>
        <div>EVENT</div>
        <div>STATUS</div>
      </div>
      {logs.map((log, index) => (
        <div
          key={index}
          className="bg-gray-800 p-3 rounded-lg hover:bg-gray-750 transition"
        >
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-blue-400 text-sm truncate overflow-hidden whitespace-nowrap">
              {log.timestamp
                ? new Date(log.timestamp).toLocaleTimeString()
                : "N/A"}
            </span>
            <span className="text-white text-sm truncate overflow-hidden whitespace-nowrap">
              {log.event || log.type}
            </span>
            <span
              className={`text-sm ${getEventColor(
                log.type || "info"
              )} truncate overflow-hidden whitespace-nowrap text-right`}
            >
              {(log.type || "info").toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LiveLogsView;

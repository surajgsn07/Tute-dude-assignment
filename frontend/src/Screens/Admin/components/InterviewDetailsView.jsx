import React, { useRef } from "react";

// ✅ Interview Details View Component
const InterviewDetailsView = ({ candidate, getScoreColor, getEventColor }) => {
  const videoRef = useRef(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-1">
        <h4 className="font-semibold text-white mb-3">Interview Recording</h4>
        <div className="bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-64 object-cover" controls>
            <source
              src={candidate.interviewUrl || candidate.details?.videoUrl}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Total Duration</div>
            <div className="text-white text-lg">{candidate.duration}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Final Score</div>
            <div
              className={`text-lg ${getScoreColor(candidate.integrityScore)}`}
            >
              {candidate.integrityScore}%
            </div>
          </div>
          {/* 👉 Lost Focus Time */}
          <div className="bg-gray-800 p-3 rounded-lg col-span-2">
            <div className="text-gray-400">Lost Focus Time</div>
            <div className="text-yellow-400 text-lg">
              {(candidate.details?.events || [])
                .filter((e) => e.type === "NO_FACE" || e.type === "LOOK_AWAY")
                .reduce((sum, e) => sum + (e.durationMs || 0), 0)}
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
            {(candidate.details?.events || []).map((event, index) => (
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
                    className={`text-xs ${getEventColor(
                      event.type
                    )} truncate overflow-hidden whitespace-nowrap text-right`}
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
          <div className="text-red-400 text-lg">
            {candidate.violations || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailsView;

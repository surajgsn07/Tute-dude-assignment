import React from "react";

// ✅ Table Component
const Table = ({
  title,
  data,
  columns,
  showDetailsButton = false,
  showLiveButton = false,
  onViewDetails,
  onViewLiveLogs,
  getScoreColor,
}) => (
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
                      col.key === "integrityScore"
                        ? getScoreColor(row[col.key])
                        : "text-white"
                    }`}
                  >
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {showDetailsButton && (
                    <button
                      onClick={() => onViewDetails(row)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm transition"
                    >
                      View Details
                    </button>
                  )}
                  {showLiveButton && (
                    <button
                      onClick={() => onViewLiveLogs(row)}
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
              <td
                colSpan={columns.length + 1}
                className="px-6 py-4 text-center text-gray-400"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;

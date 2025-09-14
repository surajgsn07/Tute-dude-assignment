import React from "react";

const LoadingOverlay = ({ visible = false, text = "Loading..." }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-900 text-white px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>

                {/* Text */}
                <span className="text-xl font-semibold animate-pulse">{text}</span>
            </div>
        </div>
    );
};

export default LoadingOverlay;

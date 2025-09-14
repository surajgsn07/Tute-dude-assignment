import React from "react";
import { useNavigate } from "react-router-dom";

const PostInterview = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

            {/* Thank you message */}
            <h1 className="text-5xl font-extrabold mb-6 tracking-wide animate-fade-in">
                🎉 Thank You!
            </h1>
            <p className="text-gray-300 text-lg mb-10 animate-fade-in delay-200">
                Your interview has been successfully submitted.
            </p>

            {/* Button */}
            <button
                onClick={() => navigate("/")}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition duration-300 animate-fade-in delay-500"
            >
                🏠 Go to Homepage
            </button>
        </div>
    );
};

export default PostInterview;

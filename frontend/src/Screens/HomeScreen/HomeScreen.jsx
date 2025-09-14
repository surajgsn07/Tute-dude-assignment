import React from "react";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

      {/* Title */}
      <h1 className="text-6xl font-extrabold mb-4 tracking-wide animate-fade-in">
        Interview<span className="text-indigo-500">.ai</span>
      </h1>

      {/* Tagline */}
      <p className="text-gray-300 text-lg mb-12 animate-fade-in delay-200">
        Smart, AI-powered proctoring for online interviews
      </p>

      {/* Button Container */}
      <div className="flex gap-10 bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl animate-fade-in delay-500">
        {/* Admin Login */}
        <button
          onClick={() => navigate("/admin-login")}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
        >
          🚀 Login as Admin
        </button>

        {/* Candidate */}
        <button
          onClick={() => navigate("/candidate")}
          className="px-10 py-5 bg-green-600 hover:bg-green-700 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
        >
          🎤 Give Interview
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;

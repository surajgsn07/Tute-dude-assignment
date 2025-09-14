import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../../api/axiosInstance"; // your axios instance
import { createCandidate } from "../../api/Services/Candidate";

const CandidateLogin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!name || !email) {
      toast.error("Please fill all fields");
      return;
    }

    const interviewId = uuidv4(); // generate unique interview id

    try {
      setLoading(true);
      const { data } = await createCandidate({ name, email, interviewId });
      toast.success("Interview started successfully!");
      console.log({data})
      navigate(`/candidate/${data?.candidate?._id}`, { state: {candidate : data.candidate} });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

      <div className="relative w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl p-10 z-10">
        <h2 className="text-4xl font-extrabold text-white text-center mb-6">
          Candidate Login
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Enter your details to start the interview
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-gray-300 mb-2 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition transform hover:scale-105 duration-300"
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;

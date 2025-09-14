import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import { adminLogin } from "../../api/Services/Admin";
import { setCookieItem } from "../../Utils/cookies-helpers";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      const { data } = await adminLogin({ email, password });
      toast.success("Login successful");
      setCookieItem("token", data?.token);
      navigate(`/admin/${data?.admin?.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                bg-gradient-to-br from-gray-900 via-black to-gray-800 
                relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

      {/* Login card */}
      <div className="relative w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 z-10 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-white text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-gray-300 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-gray-300 mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition transform hover:scale-105 duration-300"
          >
            {loading ? (
              <ThreeDots height="25" width="60" radius="9" color="#fff" visible={true} />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-2">Don't have an account?</p>
          <button
            onClick={() => navigate("/admin-signup")}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105 duration-300"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import React from "react";

// ✅ Background Glow Component
const BackgroundGlow = () => (
  <>
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
  </>
);

export default BackgroundGlow;

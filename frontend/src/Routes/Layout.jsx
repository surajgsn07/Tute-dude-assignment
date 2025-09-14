import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        
        <main>
          <Outlet />
        </main>
    </div>
  );
};

export default AdminLayout;

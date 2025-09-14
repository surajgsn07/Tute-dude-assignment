import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { adminRoutes, candidateRoutes } from "./Routes";
import { AuthGuard } from "./AuthGuard";
import HomeScreen from "../Screens/HomeScreen/HomeScreen";
import AdminLogin from "../Screens/AdminAuth/AdminLogin";
import AdminSignup from "../Screens/AdminAuth/AdminSignup";

const CustomRouter = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeScreen />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route path="/candidate"  element={<Layout />}>
        {candidateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default CustomRouter;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookieItem } from "../Utils/cookies-helpers";

export const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookieItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return <>{children}</>;
};

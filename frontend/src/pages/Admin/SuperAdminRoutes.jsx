import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const SuperAdminRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);
  if (!userInfo) {
    return <Navigate to="/" replace />;
  }
  if (userInfo.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default SuperAdminRoutes;

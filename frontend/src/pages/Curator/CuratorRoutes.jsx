import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const CuratorRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "curator" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default CuratorRoutes;

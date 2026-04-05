import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ArtistRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "artist" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default ArtistRoutes;

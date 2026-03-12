import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { STORAGE_KEYS } from "../utils/constants";

const SuperAdminProtectedRoute = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const role = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role !== "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default SuperAdminProtectedRoute;

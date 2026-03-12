import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="container-fluid g-0 p-0">
      <div className="row g-0 flex-nowrap" style={{ minHeight: "100vh" }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className="col bg-light p-3 p-md-4 overflow-auto"
          style={{
            height: "100vh",
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary d-md-none mb-3"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="bi bi-list fs-4" />
          </button>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminProtectedRoute;

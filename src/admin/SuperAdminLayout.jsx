import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./components/SuperAdminSidebar";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="container-fluid g-0 p-0">
      <div className="row g-0 flex-nowrap" style={{ minHeight: "100vh" }}>
        {/* Left: fixed sidebar — no scroll */}
        <SuperAdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Right: scrollable content only */}
        <main
          className="col bg-light p-3 p-md-4 overflow-auto"
          style={{
            height: "100vh",
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="btn btn-outline-secondary d-md-none mb-3"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="bi bi-list fs-4" />
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

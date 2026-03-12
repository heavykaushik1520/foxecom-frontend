import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../../utils/constants";

const SuperAdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    { path: "/superadmin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/superadmin/create-superadmin", label: "Create Super Admin", icon: "bi-person-plus" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const linkClass = ({ isActive }) =>
    `btn text-start w-100 ${isActive ? "btn-primary" : "btn-light"}`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1039 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar — fixed, no scroll */}
      <aside
        className="col-12 col-md-3 col-lg-2 bg-white border-end d-none d-md-flex flex-column p-3"
        style={{ height: "100vh", minWidth: "200px" }}
      >
        <div className="mb-3 mb-md-4 fw-bold fs-5 text-primary d-flex align-items-center gap-2">
          <span className="bi bi-shield-lock" />
          Super Admin
        </div>
        <ul className="nav nav-pills flex-column gap-2 flex-grow-1">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={linkClass}
                onClick={handleLinkClick}
              >
                <span className={`bi ${item.icon} me-2`} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-3 border-top">
          <button
            type="button"
            className="btn btn-danger w-100"
            onClick={handleLogout}
          >
            <span className="bi bi-box-arrow-right me-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar — slide-out drawer */}
      <aside
        className={`d-md-none position-fixed bg-white border-end d-flex flex-column p-3 ${
          isOpen ? "" : "d-none"
        }`}
        style={{
          height: "100vh",
          width: "280px",
          left: isOpen ? 0 : "-280px",
          top: 0,
          zIndex: 1040,
          transition: "left 0.25s ease-out",
          boxShadow: isOpen ? "4px 0 12px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-bold fs-5 text-primary">Super Admin</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className="bi bi-x-lg" />
          </button>
        </div>
        <ul className="nav nav-pills flex-column gap-2" style={{ overflowY: "auto", flex: 1 }}>
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={linkClass}
                onClick={handleLinkClick}
              >
                <span className={`bi ${item.icon} me-2`} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-3 border-top">
          <button
            type="button"
            className="btn btn-danger w-100"
            onClick={handleLogout}
          >
            <span className="bi bi-box-arrow-right me-2" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;

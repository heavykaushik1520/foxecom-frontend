import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../utils/api";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // 1️⃣ Clear auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  // Navigation items
  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/dashboard#live-visitors", label: "Live visitors" },
    { path: "/admin/analytics", label: "Analytics" },
    { path: "/admin/categories", label: "Categories" },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/banners", label: "Banners" },
    { path: "/admin/buy-one-get-one", label: "Buy One Get One" },
    { path: "/admin/deal-of-the-week", label: "Deal of the Week" },
    { path: "/admin/foxcom-originals", label: "FOXECOM Originals" },
    { path: "/admin/reviews", label: "Product Reviews" },
    { path: "/admin/blogs", label: "Blogs" },
    { path: "/admin/seller-reviews", label: "Seller Reviews" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/admins", label: "Admins" },
    { path: "/admin/mobile-brand", label: "Mobile Brand" },
    { path: "/admin/mobile-model", label: "Mobile Model" },
    { path: "/admin/mobile-case", label: "Mobile Case" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && typeof onClose === "function") {
      onClose();
    }
  };

  const handleDownloadMetaFeed = async () => {
    try {
      await adminAPI.downloadMetaProductFeed();
      handleLinkClick();
    } catch (error) {
      if (error?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      window.alert(error?.message || "Failed to download Meta CSV feed.");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1039 }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className="col-12 col-md-3 col-lg-2 bg-white border-end d-none d-md-flex flex-column p-3 d-flex flex-column"
        style={{
          height: "100vh"
        }}
        >
        {/* Logo */}
        <div className="mb-3 mb-md-4 fw-bold fs-5 text-primary">Admin Panel</div>

        {/* Navigation */}
        <ul className="nav nav-pills flex-column gap-2">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className="btn btn-light text-start w-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-auto pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-primary w-100 mb-2"
            onClick={handleDownloadMetaFeed}
          >
            Download Meta CSV Feed
          </button>
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Fixed Position) */}
      <aside
        className={`d-md-none position-fixed bg-white border-end d-flex flex-column p-3 ${
          isOpen ? '' : 'd-none'
        }`}
        style={{ 
          height: "100vh",
          width: '280px',
          left: isOpen ? '0' : '-280px',
          top: 0,
          zIndex: 1040,
          transition: 'left 0.3s ease-in-out',
          boxShadow: isOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {/* Mobile Close Button */}
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
          <div className="fw-bold fs-5 text-primary">Admin Panel</div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <ul className="nav nav-pills flex-column gap-2" style={{ overflowY: 'auto', flex: 1 }}>
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className="btn btn-light text-start w-100"
                onClick={handleLinkClick}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-auto pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-primary w-100 mb-2"
            onClick={handleDownloadMetaFeed}
          >
            Download Meta CSV Feed
          </button>
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

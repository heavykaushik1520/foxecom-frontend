import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await adminAPI.getDashboardStats();
      setStats(dashboardData);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      // If admin token is invalid/expired, force re-login
      if (err.isAdminTokenError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Error:</strong> {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadDashboardStats}>
          Retry
        </button>
      </div>
    );
  }

  const dashboardStats = stats?.stats || {};

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-2">
        <h4 className="mb-0">Dashboard</h4>
        <div className="fw-semibold text-muted small text-sm-start">Welcome, Admin</div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        {/* Total Categories */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-primary">
            <div className="card-body p-3 p-md-4">
              <h6 className="card-title text-muted text-uppercase small mb-2 mb-md-3">Total Categories</h6>
              <h2 className="text-primary mb-2 mb-md-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {dashboardStats.totalCategories || 0}
              </h2>
              <Link to={"/admin/categories"} className="btn btn-primary btn-sm w-100 w-md-auto">
                Manage Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-success">
            <div className="card-body p-3 p-md-4">
              <h6 className="card-title text-muted text-uppercase small mb-2 mb-md-3">Total Products</h6>
              <h2 className="text-success mb-2 mb-md-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {dashboardStats.totalProducts || 0}
              </h2>
              <Link to={"/admin/products"} className="btn btn-success btn-sm w-100 w-md-auto">
                Manage Products
              </Link>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-info">
            <div className="card-body p-3 p-md-4">
              <h6 className="card-title text-muted text-uppercase small mb-2 mb-md-3">Total Users</h6>
              <h2 className="text-info mb-2 mb-md-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {dashboardStats.totalUsers || 0}
              </h2>
              <Link to={"/admin/users"} className="btn btn-info btn-sm w-100 w-md-auto">
                View Users
              </Link>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-warning">
            <div className="card-body p-3 p-md-4">
              <h6 className="card-title text-muted text-uppercase small mb-2 mb-md-3">Total Orders</h6>
              <h2 className="text-warning mb-2 mb-md-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {dashboardStats.totalOrders || 0}
              </h2>
              <Link to={"/admin/orders"} className="btn btn-warning btn-sm w-100 w-md-auto">
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        <div className="col-12">
          <div className="card shadow-sm border-success">
            <div className="card-body p-3 p-md-4">
              <h6 className="card-title text-muted text-uppercase small mb-2 mb-md-3">Total Revenue</h6>
              <h1 className="text-success mb-0" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
                {formatCurrency(dashboardStats.totalRevenue)}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      {stats?.categoryStats && stats.categoryStats.length > 0 && (
        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header p-3 p-md-4">
                <h5 className="mb-0" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Category Statistics</h5>
              </div>
              <div className="card-body p-3 p-md-4">
                <div className="row g-2 g-md-3">
                  {stats.categoryStats.map((category) => (
                    <div key={category.id} className="col-6 col-md-4 col-lg-3">
                      <div className="p-2 p-md-3 border rounded h-100">
                        <strong className="d-block mb-1 mb-md-2" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                          {category.name}
                        </strong>
                        <p className="mb-0 text-muted small">{category.productCount} products</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        <div className="col-12">
          <h5 className="mb-3" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Quick Links</h5>
          <div className="row g-2 g-md-3">
            <div className="col-6 col-sm-4 col-lg-3">
              <Link to={"/admin/categories"} className="btn btn-outline-primary w-100">
                Categories
              </Link>
            </div>
            <div className="col-6 col-sm-4 col-lg-3">
              <Link to={"/admin/products"} className="btn btn-outline-success w-100">
                Products
              </Link>
            </div>
            <div className="col-6 col-sm-4 col-lg-3">
              <Link to={"/admin/mobile-brand"} className="btn btn-outline-info w-100">
                Mobile Brands
              </Link>
            </div>
            <div className="col-6 col-sm-4 col-lg-3">
              <Link to={"/admin/mobile-model"} className="btn btn-outline-secondary w-100">
                Mobile Models
              </Link>
            </div>
            <div className="col-6 col-sm-4 col-lg-3">
              <Link to={"/admin/mobile-case"} className="btn btn-outline-dark w-100">
                Mobile Cases
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

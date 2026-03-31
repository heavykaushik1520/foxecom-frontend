import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import LiveVisitorsSection from "./components/LiveVisitorsSection";

const FILTERS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloadingFeed, setDownloadingFeed] = useState(false);
  const [downloadingGst, setDownloadingGst] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [gstMonth, setGstMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [revenueFilter, setRevenueFilter] = useState("daily");
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [revenueError, setRevenueError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    loadRevenueByPeriod(revenueFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenueFilter]);

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

  const loadRevenueByPeriod = async (period) => {
    try {
      setRevenueLoading(true);
      setRevenueError(null);
      const res = await adminAPI.getRevenueByPeriod({ period });
      setRevenueData(res);
    } catch (err) {
      console.error("Error loading revenue:", err);
      if (err.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setRevenueError(err.message || "Failed to load revenue data");
      setRevenueData(null);
    } finally {
      setRevenueLoading(false);
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

  const handleDownloadMetaFeed = async () => {
    try {
      setDownloadingFeed(true);
      await adminAPI.downloadMetaProductFeed();
    } catch (err) {
      if (err.isAdminTokenError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      window.alert(err.message || 'Failed to download Meta CSV feed.');
    } finally {
      setDownloadingFeed(false);
    }
  };

  const handleDownloadGstExcel = async () => {
    try {
      setDownloadingGst(true);
      await adminAPI.downloadGstMonthlyExcel(gstMonth);
    } catch (err) {
      if (err.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      window.alert(err.message || "Failed to download GST monthly Excel.");
    } finally {
      setDownloadingGst(false);
    }
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
  const revenueSummary = revenueData?.summary || {};

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-2">
        <h4 className="mb-0">Dashboard</h4>
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div>
            <label className="form-label small fw-semibold mb-1">GST Month</label>
            <input
              type="month"
              className="form-control form-control-sm"
              value={gstMonth}
              onChange={(e) => setGstMonth(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={handleDownloadGstExcel}
            disabled={downloadingGst}
          >
            {downloadingGst ? "Downloading..." : "Download GST Excel"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleDownloadMetaFeed}
            disabled={downloadingFeed}
          >
            {downloadingFeed ? "Downloading..." : "Download Meta CSV Feed"}
          </button>
          <div className="fw-semibold text-muted small text-sm-start">Welcome, Admin</div>
        </div>
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

      <LiveVisitorsSection />

      {/* Revenue by period (Admin) */}
      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
              <h5 className="mb-0" style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}>
                Revenue Dashboard
              </h5>
              <ul className="nav nav-pills gap-1 mb-0">
                {FILTERS.map((f) => (
                  <li key={f.value} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${revenueFilter === f.value ? "active" : ""}`}
                      onClick={() => setRevenueFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-3 p-md-4">
              {revenueError && (
                <div className="alert alert-danger mb-3" role="alert">
                  {revenueError}
                </div>
              )}

              {revenueLoading && !revenueData ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "120px" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Period summary cards */}
                  <div className="row g-3 g-md-4 mb-3 mb-md-4">
                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">Today Revenue</h6>
                        <div className="text-success fw-bold" style={{ fontSize: "1.25rem" }}>
                          {formatCurrency(revenueSummary?.today?.revenue)}
                        </div>
                        <small className="text-muted d-block">{revenueSummary?.today?.orders ?? 0} paid orders</small>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">This Week Revenue</h6>
                        <div className="text-success fw-bold" style={{ fontSize: "1.25rem" }}>
                          {formatCurrency(revenueSummary?.week?.revenue)}
                        </div>
                        <small className="text-muted d-block">{revenueSummary?.week?.orders ?? 0} paid orders</small>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">This Month Revenue</h6>
                        <div className="text-success fw-bold" style={{ fontSize: "1.25rem" }}>
                          {formatCurrency(revenueSummary?.month?.revenue)}
                        </div>
                        <small className="text-muted d-block">{revenueSummary?.month?.orders ?? 0} paid orders</small>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">This Year Revenue</h6>
                        <div className="text-success fw-bold" style={{ fontSize: "1.25rem" }}>
                          {formatCurrency(revenueSummary?.year?.revenue)}
                        </div>
                        <small className="text-muted d-block">{revenueSummary?.year?.orders ?? 0} paid orders</small>
                      </div>
                    </div>
                  </div>

                  {/* Selected range */}
                  <div className="row g-3 g-md-4 mb-3 mb-md-4">
                    <div className="col-12 col-lg-6">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">
                          Revenue ({revenueFilter})
                        </h6>
                        <div className="text-primary fw-bold" style={{ fontSize: "1.4rem" }}>
                          {formatCurrency(revenueSummary?.range?.totalRevenue)}
                        </div>
                        <small className="text-muted d-block">
                          {revenueSummary?.range?.totalOrders ?? 0} paid orders in range
                        </small>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="p-3 border rounded h-100">
                        <h6 className="text-muted text-uppercase small mb-2">Range</h6>
                        <small className="text-muted d-block">
                          {revenueSummary?.range?.start ? new Date(revenueSummary.range.start).toLocaleDateString("en-IN") : "—"} -{" "}
                          {revenueSummary?.range?.end ? new Date(revenueSummary.range.end).toLocaleDateString("en-IN") : "—"}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Sales by period */}
                  {revenueData?.byPeriod?.length > 0 ? (
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-bottom py-3">
                        <h6 className="mb-0 fw-semibold">Sales by period</h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="ps-3">Period</th>
                                <th className="text-end">Orders</th>
                                <th className="text-end pe-3">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {revenueData.byPeriod.map((row) => (
                                <tr key={row.period}>
                                  <td className="ps-3">{row.period}</td>
                                  <td className="text-end">{row.orderCount}</td>
                                  <td className="text-end pe-3">{formatCurrency(row.revenue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-secondary mb-0" role="alert">
                      No revenue data found for the selected period.
                    </div>
                  )}
                </>
              )}
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

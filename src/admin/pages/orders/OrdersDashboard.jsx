import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    status: "paid",
    search: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  });

  useEffect(() => {
    const hasFilters = Object.values(filters).some(v => v !== "");
    if (hasFilters) {
      applyFilters();
    } else {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminAPI.getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      // Handle response format
      const ordersList = data.data || data.orders || [];
      setOrders(ordersList);
      
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          total: data.pagination.totalItems || data.total || 0,
        }));
      } else {
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const data = await adminAPI.getOrdersWithFilters(params);
      const ordersList = data.data || [];
      setOrders(ordersList);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          total: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to filter orders");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: ""
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      paid: "info",
      processing: "primary",
      shipped: "success",
      delivered: "success",
      cancelled: "danger",
    };
    return statusColors[status] || "secondary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0">Orders Management</h4>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Filters Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Status (default: Paid)</label>
              <select
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Search</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Order ID or Email"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Start Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">End Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Min Amount</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Max Amount</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {orders.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No orders found</p>
              {Object.values(filters).some(v => v !== "") && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <small className="text-muted">
                    Showing {orders.length} of {pagination.total} orders
                  </small>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User Email</th>
                      <th>Total Amount</th>
                      <th>Discount</th>
                      <th>Order #</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user?.email || order.emailAddress || "N/A"}</td>
                        <td className="fw-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td>
                          {Number(order.discountAmount) > 0 ? (
                            <span className="text-success" title={`${order.upiDiscountPercent}% UPI`}>
                              -{formatCurrency(order.discountAmount)}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {order.orderNumberForUser != null ? (
                            <span className="badge bg-light text-dark">{order.orderNumberForUser}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge bg-${getStatusBadge(order.status)}`}
                          >
                            {order.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="small">{formatDate(order.createdAt)}</td>
                        <td>
                          <Link
                            to={`/admin/orders/view/${order.id}`}
                            className="btn btn-sm btn-primary"
                            title="View Order Details"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
                    </small>
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;

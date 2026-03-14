import React, { useState, useEffect, useCallback } from "react";
import { superadminAPI } from "../utils/api";

const FILTERS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function SuperAdminDashboard() {
  const [filter, setFilter] = useState("daily");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        filter,
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      const res = await superadminAPI.getDashboard(params);
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filter, page, limit, sortBy, sortOrder, search]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const formatCurrency = (n) =>
    typeof n === "number" ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "short" }) : "—";

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h4 className="mb-0 fw-semibold">Dashboard</h4>
        <ul className="nav nav-pills gap-1 mb-0">
          {FILTERS.map((f) => (
            <li key={f.value} className="nav-item">
              <button
                type="button"
                className={`nav-link rounded-3 ${filter === f.value ? "active" : ""}`}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Revenue by period: Day / Week / Month */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase small mb-2">Today&apos;s Revenue</h6>
                  <h4 className="mb-1 text-success">{formatCurrency(data.sales?.summary?.revenueToday)}</h4>
                  <small className="text-muted">{data.sales?.summary?.ordersToday ?? 0} paid orders</small>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase small mb-2">This Week&apos;s Revenue</h6>
                  <h4 className="mb-1 text-success">{formatCurrency(data.sales?.summary?.revenueThisWeek)}</h4>
                  <small className="text-muted">{data.sales?.summary?.ordersThisWeek ?? 0} paid orders</small>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase small mb-2">This Month&apos;s Revenue</h6>
                  <h4 className="mb-1 text-success">{formatCurrency(data.sales?.summary?.revenueThisMonth)}</h4>
                  <small className="text-muted">{data.sales?.summary?.ordersThisMonth ?? 0} paid orders</small>
                </div>
              </div>
            </div>
          </div>

          {/* Filter-period summary: total over the selected date range */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase small mb-2">
                    Total revenue ({filter === "daily" ? "last 30 days" : filter === "weekly" ? "last 12 weeks" : "last 12 months"}) — paid only
                  </h6>
                  <h4 className="mb-0 text-primary">{formatCurrency(data.sales?.summary?.totalRevenue)}</h4>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted text-uppercase small mb-2">Paid orders in range</h6>
                  <h4 className="mb-0">{data.sales?.summary?.totalOrders ?? 0}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Sales by period */}
          {data.sales?.byPeriod?.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
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
                      {data.sales.byPeriod.map((row) => (
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
          )}

          {/* Orders table — paid orders only, full details */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap align-items-center gap-2">
              <h6 className="mb-0 fw-semibold me-auto">Paid orders (all details)</h6>
              <form className="d-flex flex-wrap gap-2" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search by ID, email, name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ minWidth: "180px" }}
                />
                <button type="submit" className="btn btn-sm btn-primary">
                  Search
                </button>
                {search && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                          onClick={() => handleSort("id")}
                        >
                          ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                          onClick={() => handleSort("totalAmount")}
                        >
                          Amount {sortBy === "totalAmount" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th>Payment</th>
                      <th>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                          onClick={() => handleSort("createdAt")}
                        >
                          Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="pe-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders?.data?.length ? (
                      data.orders.data.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr>
                            <td className="ps-3">{order.orderNumber || order.id}</td>
                            <td>{[order.firstName, order.lastName].filter(Boolean).join(" ") || "—"}</td>
                            <td>{order.emailAddress}</td>
                            <td>{order.mobileNumber ?? "—"}</td>
                            <td>{formatCurrency(parseFloat(order.totalAmount))}</td>
                            <td>{order.paymentMode ?? "—"}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="pe-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                aria-expanded={expandedId === order.id}
                              >
                                {expandedId === order.id ? "Hide" : "View"}
                              </button>
                            </td>
                          </tr>
                          {expandedId === order.id && (
                            <tr className="bg-light">
                              <td colSpan={8} className="p-0">
                                <div className="p-3 small">
                                  <div className="row g-3">
                                    <div className="col-12">
                                      <strong>Address:</strong> {order.fullAddress}, {order.townOrCity}, {order.state} {order.pinCode}, {order.country}
                                    </div>
                                    {(order.payuTxnId || order.payuPaymentId || order.bankRefNo) && (
                                      <div className="col-12">
                                        <strong>Payment ref:</strong>{" "}
                                        {[order.payuTxnId, order.payuPaymentId, order.bankRefNo].filter(Boolean).join(" | ") || "—"}
                                      </div>
                                    )}
                                    {order.orderItems?.length > 0 && (
                                      <div className="col-12">
                                        <strong>Items:</strong>
                                        <ul className="mb-0 mt-1 list-unstyled">
                                          {order.orderItems.map((item) => (
                                            <li key={item.id}>
                                              {item.product?.title ?? `Product #${item.productId}`} × {item.quantity} @ {formatCurrency(parseFloat(item.priceAtPurchase))}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-5">
                          No paid orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {data.orders?.pagination && data.orders.pagination.totalPages > 1 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
                <small className="text-muted">
                  Page {data.orders.pagination.currentPage} of {data.orders.pagination.totalPages}{" "}
                  ({data.orders.pagination.totalItems} total)
                </small>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={page >= data.orders.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SuperAdminDashboard;

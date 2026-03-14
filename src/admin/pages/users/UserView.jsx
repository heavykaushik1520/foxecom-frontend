import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const UserView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const [userData, ordersData] = await Promise.all([
        adminAPI.getUserProfile(id),
        adminAPI.getUserOrders(id),
      ]);
      setUser(userData);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="alert alert-danger">
        {error || "User not found"}
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>User Details - {user.email}</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>

      <div className="row g-4">
        {/* User Information */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">User Information</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>User ID:</strong> #{user.id}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <span className="badge bg-secondary">
                  {user.role || "customer"}
                </span>
              </p>
              <p>
                <strong>Joined Date:</strong> {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order History ({orders.length})</h5>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <p className="text-muted">No orders found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.orderNumber || order.id}</td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <span
                              className={`badge bg-${getStatusBadge(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                navigate(`/admin/orders/view/${order.id}`)
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const MarqueesDashboard = () => {
  const [marquees, setMarquees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMarquees = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await adminAPI.getMarquees();
      setMarquees(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load marquees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarquees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marquee?")) return;
    try {
      await adminAPI.deleteMarquee(id);
      setSuccess("Marquee deleted.");
      setTimeout(() => setSuccess(""), 3000);
      fetchMarquees();
    } catch (err) {
      setError(err.message || "Failed to delete marquee.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleToggle = async (id, currentState) => {
    try {
      await adminAPI.toggleMarquee(id, !Boolean(currentState));
      setSuccess("Marquee status updated.");
      setTimeout(() => setSuccess(""), 2500);
      fetchMarquees();
    } catch (err) {
      setError(err.message || "Failed to toggle marquee status.");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Marquee Ticker</h4>
          <p className="text-muted small mb-0">Only one marquee can be active at a time.</p>
        </div>
        <Link to="/admin/marquees/add" className="btn btn-primary">
          Add Marquee
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {marquees.length === 0 ? (
            <p className="text-muted mb-0">No marquee created yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ minWidth: 80 }}>ID</th>
                    <th>Text</th>
                    <th style={{ minWidth: 120 }}>Status</th>
                    <th style={{ minWidth: 260 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marquees.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div style={{ maxWidth: 700, whiteSpace: "normal" }}>{item.text}</div>
                      </td>
                      <td>
                        <span className={`badge ${item.isActive ? "bg-success" : "bg-secondary"}`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm ${item.isActive ? "btn-outline-secondary" : "btn-outline-success"}`}
                            onClick={() => handleToggle(item.id, item.isActive)}
                          >
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link to={`/admin/marquees/edit/${item.id}`} className="btn btn-sm btn-outline-primary">
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
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
  );
};

export default MarqueesDashboard;

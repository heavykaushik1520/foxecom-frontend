import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dealOfTheWeekAPI, getImageUrl } from "../../../utils/api";

const DealOfTheWeekDashboard = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [showInactive, setShowInactive] = useState(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await dealOfTheWeekAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        includeInactive: showInactive,
      });
      
      setDeals(data.deals || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [pagination.page, showInactive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Deal of the Week? This cannot be undone.")) return;
    try {
      await dealOfTheWeekAPI.delete(id);
      setSuccess("Deal deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      fetchDeals();
    } catch (err) {
      setError(err.message || "Failed to delete deal.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleToggleActive = async (deal) => {
    try {
      await dealOfTheWeekAPI.update(deal.id, {
        isActive: !deal.isActive,
        title: deal.title,
        description: deal.description,
        productIds: deal.products?.map((p) => p.id) || [],
      });
      setSuccess(`Deal ${!deal.isActive ? "activated" : "deactivated"} successfully.`);
      setTimeout(() => setSuccess(""), 3000);
      fetchDeals();
    } catch (err) {
      setError(err.message || "Failed to update deal.");
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
        <h4 className="mb-0 fw-bold">Deal of the Week</h4>
        <Link to="/admin/deal-of-the-week/add" className="btn btn-primary">
          Add Deal
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
            <label className="form-check-label" htmlFor="showInactive">
              Show inactive deals
            </label>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {deals.length === 0 ? (
            <p className="text-muted mb-0">
              No deals found. {showInactive ? "All deals are active." : "Add one to show on the homepage."}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Products</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id}>
                      <td>
                        <strong>{deal.title}</strong>
                        {deal.description && (
                          <div className="small text-muted mt-1">{deal.description}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${deal.isActive ? "bg-success" : "bg-secondary"}`}
                        >
                          {deal.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {deal.products?.slice(0, 3).map((product) => (
                            <img
                              key={product.id}
                              src={getImageUrl(product.thumbnailImage)}
                              alt={product.title}
                              className="rounded"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                              title={product.title}
                            />
                          ))}
                          {deal.productCount > 3 && (
                            <span className="badge bg-secondary align-self-center">
                              +{deal.productCount - 3}
                            </span>
                          )}
                        </div>
                        <small className="text-muted d-block mt-1">
                          {deal.productCount || 0} product(s)
                        </small>
                      </td>
                      <td>
                        {deal.startDate
                          ? new Date(deal.startDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {deal.endDate
                          ? new Date(deal.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleToggleActive(deal)}
                            title={deal.isActive ? "Deactivate" : "Activate"}
                          >
                            {deal.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link
                            to={`/admin/deal-of-the-week/edit/${deal.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(deal.id)}
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

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
              </small>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealOfTheWeekDashboard;

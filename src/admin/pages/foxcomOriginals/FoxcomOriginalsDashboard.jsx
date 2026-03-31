import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { foxcomOriginalsAPI, getImageUrl } from "../../../utils/api";

const FoxcomOriginalsDashboard = () => {
  const [originals, setOriginals] = useState([]);
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

  const fetchOriginals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await foxcomOriginalsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        includeInactive: showInactive,
      });

      setOriginals(data.originals || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load FOXECOM Originals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOriginals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, showInactive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FOXECOM Originals section? This cannot be undone.")) return;
    try {
      await foxcomOriginalsAPI.delete(id);
      setSuccess("FOXECOM Originals section deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      fetchOriginals();
    } catch (err) {
      setError(err.message || "Failed to delete section.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await foxcomOriginalsAPI.update(section.id, {
        title: section.title,
        isActive: !section.isActive,
        productIds: section.products?.map((p) => p.id) || [],
      });
      setSuccess(`Section ${!section.isActive ? "activated" : "deactivated"} successfully.`);
      setTimeout(() => setSuccess(""), 3000);
      fetchOriginals();
    } catch (err) {
      setError(err.message || "Failed to update section.");
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
        <h4 className="mb-0 fw-bold">FOXECOM Originals</h4>
        <Link to="/admin/foxcom-originals/add" className="btn btn-primary">
          Add Section
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
              id="showInactiveOriginals"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
            <label className="form-check-label" htmlFor="showInactiveOriginals">
              Show inactive sections
            </label>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {originals.length === 0 ? (
            <p className="text-muted mb-0">
              No FOXECOM Originals sections found.{" "}
              {showInactive ? "All sections are active." : "Add one to show on the homepage."}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Products</th>
                    <th>Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {originals.map((section) => (
                    <tr key={section.id}>
                      <td>
                        <strong>{section.title}</strong>
                      </td>
                      <td>
                        <span className={`badge ${section.isActive ? "bg-success" : "bg-secondary"}`}>
                          {section.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {section.products?.slice(0, 3).map((product) => (
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
                          {section.productCount > 3 && (
                            <span className="badge bg-secondary align-self-center">
                              +{section.productCount - 3}
                            </span>
                          )}
                        </div>
                        <small className="text-muted d-block mt-1">
                          {section.productCount || 0} product(s)
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">{new Date(section.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleToggleActive(section)}
                            title={section.isActive ? "Deactivate" : "Activate"}
                          >
                            {section.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link
                            to={`/admin/foxcom-originals/edit/${section.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(section.id)}
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

export default FoxcomOriginalsDashboard;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const AdminsDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, [pagination.page, search]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (search) {
        params.search = search;
      }
      
      const data = await adminAPI.getAllAdmins(params);
      
      // Handle response format
      const adminsList = data.admins || data;
      setAdmins(Array.isArray(adminsList) ? adminsList : []);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const result = await adminAPI.deleteAdmin(id);
      setSuccessMessage(result.message || "Admin deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete admin");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
        <h4 className="mb-2 mb-md-0">Admins Management</h4>
        <Link to={"/admin/admins/add"} className="btn btn-primary">
          + Add New Admin
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {/* Error Message */}
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

      {/* Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Search Admins</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by email or phone..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {admins.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No admins found</p>
              {search && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <small className="text-muted">
                    Showing {admins.length} of {pagination.totalItems} admins
                  </small>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>#{admin.id}</td>
                        <td className="fw-medium">{admin.name || "N/A"}</td>
                        <td>{admin.email}</td>
                        <td>{admin.phone_number || "N/A"}</td>
                        <td>
                          <span className="badge bg-primary">
                            {admin.role || "admin"}
                          </span>
                        </td>
                        <td className="small">{formatDate(admin.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/admin/admins/edit/${admin.id}`}
                              className="btn btn-sm btn-warning"
                              title="Edit Admin"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(admin.id)}
                              title="Delete Admin"
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Page {pagination.page} of {pagination.totalPages}
                    </small>
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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

export default AdminsDashboard;

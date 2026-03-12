import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../utils/api";

const AddCategory = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !slug) {
      setError("Name and slug are required");
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug must contain only lowercase letters, numbers, and hyphens");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await adminAPI.createCategory({ name: name.trim(), slug: slug.trim() });
      
      setSuccess(result.message || "Category created successfully");

      // Optional redirect after success
      setTimeout(() => {
        navigate("/admin/categories");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create category. Make sure name and slug are unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="mb-1 text-center fw-bold">ADD CATEGORY</h4>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Name */}
            <div className="col-12">
              <label className="form-label fw-medium">Category Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mobile Case"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="col-12">
              <label className="form-label fw-medium">Slug</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. mobile-case"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="form-text">
                Use lowercase letters and hyphens only
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="col-12">
                <div className="alert alert-danger mb-0">{error}</div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="col-12">
                <div className="alert alert-success mb-0">{success}</div>
              </div>
            )}

            {/* Actions */}
            <div className="col-12 d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create Category"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;

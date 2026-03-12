import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryAPI, adminAPI } from "../../utils/api";

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setFetching(true);
      setError("");
      const data = await categoryAPI.getById(id);
      // Handle both new format (with success) and legacy format
      const category = data.category || data;
      setName(category.name || "");
      setSlug(category.slug || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load category");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !slug) {
      setError("Name and slug are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        setError("Slug must contain only lowercase letters, numbers, and hyphens");
        return;
      }

      const result = await adminAPI.updateCategory(id, { name: name.trim(), slug: slug.trim() });
      
      setSuccess(result.message || "Category updated successfully");
      setTimeout(() => {
        navigate("/admin/categories");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update category. Make sure name and slug are unique.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Category</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/categories")}
        >
          Back to Categories
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Category Name *
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="slug" className="form-label">
                Slug *
              </label>
              <input
                type="text"
                className="form-control"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Category"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/categories")}
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

export default EditCategory;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mobileBrandAPI, adminAPI } from "../../../utils/api";

const EditMobileBrand = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBrand();
  }, [id]);

  const fetchBrand = async () => {
    try {
      setFetching(true);
      const data = await mobileBrandAPI.getById(id);
      setName(data.name || "");
    } catch (err) {
      console.error(err);
      setError("Failed to load mobile brand");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await adminAPI.updateMobileBrand(id, { name });

      setSuccess("Mobile brand updated successfully");
      setTimeout(() => {
        navigate("/admin/mobile-brand");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update mobile brand");
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
        <h4>Edit Mobile Brand</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/mobile-brand")}
        >
          Back to Mobile Brands
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
                Brand Name *
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

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Brand"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/mobile-brand")}
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

export default EditMobileBrand;

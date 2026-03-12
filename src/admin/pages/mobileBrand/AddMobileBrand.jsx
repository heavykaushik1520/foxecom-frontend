import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/api";

const AddMobileBrand = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Name required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${API_BASE_URL}/mobile-brands`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create Brand");
      }

      setSuccess("Mobile Brand created successfully");

      // Optional redirect after success
      setTimeout(() => {
        navigate("/admin/mobile-brand");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="mb-1 text-center fw-bold">ADD BRAND</h4>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Name */}
            <div className="col-12">
              <label className="form-label fw-medium">Brand Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brand Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                {loading ? "Saving..." : "Create Brand"}
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

export default AddMobileBrand;

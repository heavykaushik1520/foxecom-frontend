import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const DESKTOP_HINT = "Desktop: 1521×516 px (allowed range: 1400–1650 × 450–580).";
const MOBILE_HINT = "Mobile: 531×316 px (allowed range: 480–580 × 280–350).";

const AddBanner = () => {
  const navigate = useNavigate();
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desktopFile || !mobileFile) {
      setError("Please select both desktop and mobile images.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("desktopImage", desktopFile);
      formData.append("mobileImage", mobileFile);
      await adminAPI.createBanner(formData);
      navigate("/admin/banners");
    } catch (err) {
      setError(err.message || "Upload failed. Check image dimensions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">Add Billboard Banner</h4>
        <p className="text-muted small mb-0">Images only. No text. Upload both desktop and mobile sizes.</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Desktop image *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                />
                <div className="form-text">{DESKTOP_HINT}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Mobile image *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
                />
                <div className="form-text">{MOBILE_HINT}</div>
              </div>
              {error && (
                <div className="col-12">
                  <div className="alert alert-danger mb-0">{error}</div>
                </div>
              )}
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Uploading..." : "Add Banner"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/admin/banners")}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBanner;

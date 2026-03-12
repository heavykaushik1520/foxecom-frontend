import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI, getImageUrl } from "../../../utils/api";

const DESKTOP_HINT = "Desktop: 1521×516 px (allowed: 1400–1650 × 450–580). Leave empty to keep current.";
const MOBILE_HINT = "Mobile: 531×316 px (allowed: 480–580 × 280–350). Leave empty to keep current.";

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const list = await adminAPI.getBanners();
        const b = Array.isArray(list) ? list.find((x) => Number(x.id) === Number(id)) : null;
        setBanner(b || null);
        if (!b) setLoadError("Banner not found.");
      } catch (err) {
        setLoadError(err.message || "Failed to load banner.");
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!banner) return;
    if (!desktopFile && !mobileFile) {
      setError("Upload at least one new image (desktop or mobile) to update.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      if (desktopFile) formData.append("desktopImage", desktopFile);
      if (mobileFile) formData.append("mobileImage", mobileFile);
      await adminAPI.updateBanner(id, formData);
      navigate("/admin/banners");
    } catch (err) {
      setError(err.message || "Update failed. Check image dimensions.");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="alert alert-danger">{loadError}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin/banners")}>
          Back to Banners
        </button>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">Edit Billboard Banner</h4>
        <p className="text-muted small mb-0">Replace one or both images. Leave file empty to keep current.</p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <p className="small fw-medium mb-2">Current images</p>
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <div className="small text-muted">Desktop</div>
              <img
                src={getImageUrl(banner.desktopImageUrl)}
                alt="Desktop"
                className="img-fluid rounded border"
                style={{ maxHeight: 120, objectFit: "cover", width: "100%" }}
              />
            </div>
            <div className="col-6 col-md-3">
              <div className="small text-muted">Mobile</div>
              <img
                src={getImageUrl(banner.mobileImageUrl)}
                alt="Mobile"
                className="img-fluid rounded border"
                style={{ maxHeight: 120, objectFit: "cover", width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">New desktop image (optional)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                />
                <div className="form-text">{DESKTOP_HINT}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">New mobile image (optional)</label>
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
                  {loading ? "Updating..." : "Update Banner"}
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

export default EditBanner;

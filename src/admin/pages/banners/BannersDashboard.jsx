import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI, getImageUrl } from "../../../utils/api";

const BannersDashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await adminAPI.getBanners();
      setBanners(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner? This cannot be undone.")) return;
    try {
      await adminAPI.deleteBanner(id);
      setSuccess("Banner deleted.");
      setTimeout(() => setSuccess(""), 3000);
      fetchBanners();
    } catch (err) {
      setError(err.message || "Failed to delete banner.");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <h4 className="mb-0 fw-bold">Billboard Banners</h4>
        <Link to="/admin/banners/add" className="btn btn-primary">
          Add Banner
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <p className="text-muted small mb-3">
            Desktop: 1521×516 px (min–max allowed). Mobile: 531×316 px (min–max allowed). Images only.
          </p>
          {banners.length === 0 ? (
            <p className="text-muted mb-0">No banners yet. Add one to show on the homepage billboard.</p>
          ) : (
            <div className="row g-3">
              {banners.map((b) => (
                <div key={b.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border">
                    <div className="card-body p-2 p-md-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="small text-muted mb-1">Desktop</div>
                          <img
                            src={getImageUrl(b.desktopImageUrl)}
                            alt="Desktop"
                            className="img-fluid rounded border"
                            style={{ maxHeight: 80, objectFit: "cover", width: "100%" }}
                          />
                        </div>
                        <div className="col-6">
                          <div className="small text-muted mb-1">Mobile</div>
                          <img
                            src={getImageUrl(b.mobileImageUrl)}
                            alt="Mobile"
                            className="img-fluid rounded border"
                            style={{ maxHeight: 80, objectFit: "cover", width: "100%" }}
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <Link to={`/admin/banners/edit/${b.id}`} className="btn btn-sm btn-outline-primary">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannersDashboard;

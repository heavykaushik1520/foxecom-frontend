import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const EditMarquee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPage(true);
        const list = await adminAPI.getMarquees();
        const found = Array.isArray(list) ? list.find((x) => Number(x.id) === Number(id)) : null;
        if (!found) {
          setLoadError("Marquee not found.");
          return;
        }
        setText(found.text || "");
        setIsActive(Boolean(found.isActive));
      } catch (err) {
        setLoadError(err.message || "Failed to load marquee.");
      } finally {
        setLoadingPage(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Marquee text is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await adminAPI.updateMarquee(id, { text: trimmed, isActive });
      navigate("/admin/marquees");
    } catch (err) {
      setError(err.message || "Failed to update marquee.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="alert alert-danger">{loadError}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin/marquees")}>
          Back to Marquees
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">Edit Marquee</h4>
        <p className="text-muted small mb-0">Update marquee text and active status.</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-medium">Marquee text *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="form-check-input"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isActive" className="form-check-label">
                    Set as active marquee
                  </label>
                </div>
                <div className="form-text">Only one marquee can remain active.</div>
              </div>
              {error && (
                <div className="col-12">
                  <div className="alert alert-danger mb-0">{error}</div>
                </div>
              )}
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Marquee"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/admin/marquees")}>
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

export default EditMarquee;

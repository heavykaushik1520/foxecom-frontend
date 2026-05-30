import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const AddMarquee = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await adminAPI.createMarquee({ text: trimmed, isActive });
      navigate("/admin/marquees");
    } catch (err) {
      setError(err.message || "Failed to create marquee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">Add Marquee</h4>
        <p className="text-muted small mb-0">Create announcement text for ticker above navbar.</p>
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
                  placeholder="Type marquee text..."
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
                <div className="form-text">If enabled, currently active marquee will be turned off.</div>
              </div>
              {error && (
                <div className="col-12">
                  <div className="alert alert-danger mb-0">{error}</div>
                </div>
              )}
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Add Marquee"}
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

export default AddMarquee;

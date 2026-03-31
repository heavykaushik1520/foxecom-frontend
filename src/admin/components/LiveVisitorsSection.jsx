import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../utils/api";

const REFRESH_MS = 10_000;

function formatSeen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

/**
 * Live visitors (last_seen within server-defined window, typically 2 minutes). Refreshes every 10s.
 */
const LiveVisitorsSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await adminAPI.getLiveVisitors();
      setPayload(data);
    } catch (err) {
      console.error("Live visitors:", err);
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err?.message || "Failed to load live visitors");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      load();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const total = payload?.totalLiveVisitors ?? 0;
  const loggedIn = payload?.totalLoggedInLive ?? 0;
  const guestLive = payload?.totalGuestLive ?? Math.max(0, total - loggedIn);
  const visitors = Array.isArray(payload?.visitors) ? payload.visitors : [];
  const windowMin = payload?.onlineWindowMinutes ?? 2;
  const periodStats = payload?.periodStats || {};

  const statRows = [
    { label: "Today", key: "today" },
    { label: "This week", key: "week" },
    { label: "This month", key: "month" },
    { label: "This year", key: "year" },
  ];

  return (
    <div className="row g-3 g-md-4 mb-3 mb-md-4" id="live-visitors">
      <div className="col-12">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h5 className="mb-0" style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}>
                Live visitors
              </h5>
              <small className="text-muted">
                Online = last activity within {windowMin} minute{windowMin === 1 ? "" : "s"}. Refreshes every 10s.
              </small>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
          <div className="card-body p-3 p-md-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="p-3 border rounded h-100">
                  <h6 className="text-muted text-uppercase small mb-2">Total live</h6>
                  <div className="fw-bold fs-4 text-primary">{total}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="p-3 border rounded h-100">
                  <h6 className="text-muted text-uppercase small mb-2">Logged-in online</h6>
                  <div className="fw-bold fs-4 text-success">{loggedIn}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="p-3 border rounded h-100">
                  <h6 className="text-muted text-uppercase small mb-2">Guest online</h6>
                  <div className="fw-bold fs-4 text-secondary">{guestLive}</div>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {statRows.map((item) => {
                const s = periodStats[item.key] || {};
                return (
                  <div className="col-12 col-sm-6 col-lg-3" key={item.key}>
                    <div className="p-3 border rounded h-100">
                      <h6 className="text-muted text-uppercase small mb-2">{item.label}</h6>
                      <div className="small">
                        <div>
                          Total: <strong>{s.total ?? 0}</strong>
                        </div>
                        <div>
                          Logged in: <strong>{s.loggedIn ?? 0}</strong>
                        </div>
                        <div>
                          Guest: <strong>{s.guest ?? 0}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && !payload ? (
              <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Session</th>
                      <th scope="col">User ID</th>
                      <th scope="col">Page</th>
                      <th scope="col">Product</th>
                      <th scope="col">Last seen</th>
                      <th scope="col">Logged in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-muted text-center py-4">
                          No visitors online right now.
                        </td>
                      </tr>
                    ) : (
                      visitors.map((v) => (
                        <tr key={v.session_id || v.id}>
                          <td className="text-break">
                            <code className="small">{v.session_id || "—"}</code>
                          </td>
                          <td>{v.user_id ?? "—"}</td>
                          <td className="text-break small">{v.current_page || "—"}</td>
                          <td>{v.product_id != null ? v.product_id : "—"}</td>
                          <td className="small text-nowrap">{formatSeen(v.last_seen)}</td>
                          <td>{v.is_logged_in ? "Yes" : "No"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVisitorsSection;

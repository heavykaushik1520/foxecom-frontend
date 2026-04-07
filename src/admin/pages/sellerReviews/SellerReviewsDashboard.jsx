import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI, getImageUrl } from "../../../utils/api";

function StarDisplay({ rating }) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0));
  return (
    <span className="d-inline-flex align-items-center gap-0" aria-label={`${r} stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`bi ${s <= r ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
          style={{ fontSize: "0.95rem" }}
        />
      ))}
    </span>
  );
}

function formatSellerReviewDateCell(value) {
  if (!value) return "—";
  const s = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const LIMIT = 15;

export default function SellerReviewsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [draftProduct, setDraftProduct] = useState("");
  const [draftRating, setDraftRating] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [filters, setFilters] = useState({ productId: "", rating: "", search: "" });
  const [sortBy, setSortBy] = useState("createdAt");

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const rows = await adminAPI.getSellerReviewPerProductStats();
      setStats(Array.isArray(rows) ? rows : []);
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  }, [navigate]);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        limit: LIMIT,
        sortBy,
        sortOrder: "desc",
      };
      if (filters.productId) params.productId = filters.productId;
      if (filters.rating) params.rating = filters.rating;
      if (filters.search.trim()) params.search = filters.search.trim();
      const data = await adminAPI.getSellerReviews(params);
      setReviews(data?.sellerReviews || []);
      setPagination(data?.pagination || null);
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, page, filters, sortBy]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const applyFilters = (e) => {
    e.preventDefault();
    setFilters({
      productId: draftProduct,
      rating: draftRating,
      search: draftSearch,
    });
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this seller review? Images will be removed from the server.")) return;
    try {
      await adminAPI.deleteSellerReview(id);
      loadList();
      loadStats();
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      window.alert(err.message || "Delete failed.");
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Seller reviews</h1>
          <p className="text-muted small mb-0">
            Showcase reviews tied to products (admin only). Shoppers do not submit these from the storefront.
          </p>
        </div>
        <Link to="/admin/seller-reviews/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" aria-hidden />
          Add review
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <span className="fw-semibold">Your reviews per product</span>
        </div>
        <div className="card-body">
          <p className="text-muted small mb-3">
            Counts reflect reviews created under your current admin account.
          </p>
          {statsLoading ? (
            <div className="text-muted">Loading stats…</div>
          ) : stats.length === 0 ? (
            <p className="text-muted mb-0">No stats yet. Add a seller review for a product to see counts here.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-center" style={{ width: "120px" }}>
                      Your reviews
                    </th>
                    <th style={{ width: "200px" }} />
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row) => (
                    <tr key={row.productId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {row.product?.thumbnailImage && (
                            <img
                              src={getImageUrl(row.product.thumbnailImage)}
                              alt=""
                              className="rounded border"
                              style={{ width: 40, height: 40, objectFit: "cover" }}
                            />
                          )}
                          <span>{row.product?.title || `Product #${row.productId}`}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary rounded-pill">{row.reviewCount}</span>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/admin/seller-reviews/product/${row.productId}`}
                          className="btn btn-sm btn-outline-primary me-1"
                        >
                          Open page
                        </Link>
                        <Link
                          to={`/admin/seller-reviews/add?productId=${row.productId}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Add another
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom">
          <span className="fw-semibold">All seller reviews</span>
        </div>
        <div className="card-body">
          <form className="row g-2 align-items-end mb-4" onSubmit={applyFilters}>
            <div className="col-md-3">
              <label className="form-label small text-muted mb-0">Product ID</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Filter by product id"
                value={draftProduct}
                onChange={(e) => setDraftProduct(e.target.value)}
                min={1}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-0">Rating</label>
              <select
                className="form-select form-select-sm"
                value={draftRating}
                onChange={(e) => setDraftRating(e.target.value)}
              >
                <option value="">Any</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-0">Sort</label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Newest (created)</option>
                <option value="reviewDate">Review date</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted mb-0">Search</label>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Name or message"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100">
                Apply
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-muted py-4 text-center">Loading…</div>
          ) : reviews.length === 0 ? (
            <p className="text-muted mb-0">No seller reviews match your filters.</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Reviewer</th>
                      <th>Shown date</th>
                      <th>Rating</th>
                      <th>Message</th>
                      <th>Photos</th>
                      <th style={{ width: "140px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <Link to={`/admin/seller-reviews/product/${r.productId}`} className="text-decoration-none">
                            {r.product?.title || `#${r.productId}`}
                          </Link>
                        </td>
                        <td>{r.name}</td>
                        <td className="text-muted small text-nowrap">
                          {formatSellerReviewDateCell(r.reviewDate || r.createdAt)}
                        </td>
                        <td>
                          <StarDisplay rating={r.rating} />
                        </td>
                        <td>
                          <span className="text-muted small">
                            {(r.message || "—").slice(0, 80)}
                            {(r.message || "").length > 80 ? "…" : ""}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {Array.isArray(r.images) ? r.images.length : 0}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/admin/seller-reviews/edit/${r.id}`}
                            className="btn btn-sm btn-outline-primary me-1"
                          >
                            Edit
                          </Link>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <nav className="d-flex justify-content-between align-items-center mt-3">
                  <span className="text-muted small">
                    Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                  </span>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

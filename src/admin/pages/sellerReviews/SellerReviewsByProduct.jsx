import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  if (!value) return "";
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
    return "";
  }
}

const LIMIT = 12;

export default function SellerReviewsByProduct() {
  const { productId: productIdParam } = useParams();
  const navigate = useNavigate();
  const productId = parseInt(productIdParam, 10);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!productId) {
      setError("Invalid product.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await adminAPI.getSellerReviewsByProduct(productId, { page, limit: LIMIT });
      setProduct(data?.product || null);
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
  }, [productId, page, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this seller review?")) return;
    try {
      await adminAPI.deleteSellerReview(id);
      load();
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
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/admin/seller-reviews">Seller reviews</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Product #{productId}
          </li>
        </ol>
      </nav>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && !product ? (
        <div className="text-muted">Loading…</div>
      ) : product ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-start">
            {product.thumbnailImage && (
              <img
                src={getImageUrl(product.thumbnailImage)}
                alt=""
                className="rounded border"
                style={{ width: 72, height: 72, objectFit: "cover" }}
              />
            )}
            <div className="flex-grow-1">
              <h1 className="h4 mb-1">{product.title}</h1>
              <p className="text-muted small mb-2">Product ID: {product.id}</p>
              <Link
                to={`/admin/seller-reviews/add?productId=${product.id}`}
                className="btn btn-sm btn-primary"
              >
                Add seller review
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom">
          <span className="fw-semibold">Reviews for this product</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-muted py-3">Loading…</div>
          ) : reviews.length === 0 ? (
            <p className="text-muted mb-0">No seller reviews for this product yet.</p>
          ) : (
            <div className="row g-3">
              {reviews.map((r) => (
                <div key={r.id} className="col-12">
                  <div className="border rounded p-3 h-100 bg-light bg-opacity-50">
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                      <div>
                        <strong>{r.name}</strong>
                        {(r.reviewDate || r.createdAt) && (
                          <div className="text-muted small">{formatSellerReviewDateCell(r.reviewDate || r.createdAt)}</div>
                        )}
                        <div className="mt-1">
                          <StarDisplay rating={r.rating} />
                        </div>
                      </div>
                      <div>
                        <Link
                          to={`/admin/seller-reviews/edit/${r.id}`}
                          className="btn btn-sm btn-outline-primary me-1"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {r.message && <p className="small mb-2 text-muted">{r.message}</p>}
                    <div className="d-flex flex-wrap gap-2">
                      {(Array.isArray(r.images) ? r.images : []).map((src) => (
                        <a
                          key={src}
                          href={getImageUrl(src)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-block"
                        >
                          <img
                            src={getImageUrl(src)}
                            alt=""
                            className="rounded border"
                            style={{ width: 72, height: 72, objectFit: "cover" }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <nav className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted small">
                Page {pagination.currentPage} of {pagination.totalPages}
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
        </div>
      </div>
    </div>
  );
}

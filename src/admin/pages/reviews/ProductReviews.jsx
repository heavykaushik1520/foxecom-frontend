import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest first" },
  { value: "rating", label: "Rating (high to low)" },
];

function StarDisplay({ rating }) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0));
  return (
    <span className="d-inline-flex align-items-center" aria-label={`${r} stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`bi ${s <= r ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
          style={{ fontSize: "1rem" }}
        />
      ))}
    </span>
  );
}

const ProductReviews = () => {
  const { productId: urlProductId } = useParams();
  const [view, setView] = useState("all"); // "all" | "by-product"
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(urlProductId ? parseInt(urlProductId, 10) : "");
  const [reviews, setReviews] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // All-reviews filters & pagination
  const [allPage, setAllPage] = useState(1);
  const [allLimit] = useState(15);
  const [allProductFilter, setAllProductFilter] = useState("");
  const [allRatingFilter, setAllRatingFilter] = useState("");
  const [allSearch, setAllSearch] = useState("");
  const [allSortBy, setAllSortBy] = useState("createdAt");
  const [allPagination, setAllPagination] = useState(null);

  // Edit state (for "All reviews" tab)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admin star-rating summary (by-product)
  const [ratingSummary, setRatingSummary] = useState({ count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 });
  const [loadingRatingSummary, setLoadingRatingSummary] = useState(false);

  const selectedProduct = products.find((p) => p.id === parseInt(productId, 10));

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (urlProductId) {
      setProductId(parseInt(urlProductId, 10));
      setView("by-product");
    } else setProductId("");
  }, [urlProductId]);

  const applyAllFilters = useCallback(() => {
    setAllPage(1);
    setLoadingReviews(true);
    setError("");
    const params = {
      page: 1,
      limit: allLimit,
      sortBy: allSortBy,
      sortOrder: "desc",
    };
    if (allProductFilter) params.productId = allProductFilter;
    if (allRatingFilter) params.rating = allRatingFilter;
    if (allSearch) params.search = allSearch;
    adminAPI
      .getAllReviews(params)
      .then((data) => {
        setReviews(data.reviews || []);
        setAllPagination(data.pagination || null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load reviews.");
        setReviews([]);
      })
      .finally(() => setLoadingReviews(false));
  }, [allLimit, allProductFilter, allRatingFilter, allSearch, allSortBy]);

  useEffect(() => {
    if (view === "all") loadAllReviews();
  }, [view, allPage, allProductFilter, allRatingFilter, allSearch, allSortBy]);

  useEffect(() => {
    if (productId && view === "by-product") {
      loadRatingSummary();
    } else if (view === "by-product") {
      setRatingSummary({ count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 });
    }
  }, [productId, view]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setError("");
      const data = await adminAPI.getAllProductsForAdmin({ limit: 500 });
      const list = data.products || data.data?.products || [];
      setProducts(Array.isArray(list) ? list : []);
      if (urlProductId && list.length > 0) {
        const id = parseInt(urlProductId, 10);
        if (list.some((p) => p.id === id)) setProductId(id);
      }
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadAllReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      setError("");
      const params = {
        page: allPage,
        limit: allLimit,
        sortBy: allSortBy,
        sortOrder: "desc",
      };
      if (allProductFilter) params.productId = allProductFilter;
      if (allRatingFilter) params.rating = allRatingFilter;
      if (allSearch) params.search = allSearch;
      const data = await adminAPI.getAllReviews(params);
      setReviews(data.reviews || []);
      setAllPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [allPage, allLimit, allProductFilter, allRatingFilter, allSearch, allSortBy]);

  const loadReviews = async () => {
    if (!productId) return;
    try {
      setLoadingReviews(true);
      setError("");
      const list = await adminAPI.getProductReviews(productId);
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadRatingSummary = async () => {
    if (!productId) return;
    try {
      setLoadingRatingSummary(true);
      setError("");
      const summary = await adminAPI.getProductRatingSummary(productId);
      setRatingSummary({
        count1: summary.count1 ?? 0,
        count2: summary.count2 ?? 0,
        count3: summary.count3 ?? 0,
        count4: summary.count4 ?? 0,
        count5: summary.count5 ?? 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load rating summary.");
      setRatingSummary({ count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 });
    } finally {
      setLoadingRatingSummary(false);
    }
  };

  const handleSaveRatingSummary = async (e) => {
    e.preventDefault();
    if (!productId) return;
    try {
      setSubmitting(true);
      setError("");
      await adminAPI.updateProductRatingSummary(productId, {
        count1: Math.max(0, parseInt(ratingSummary.count1, 10) || 0),
        count2: Math.max(0, parseInt(ratingSummary.count2, 10) || 0),
        count3: Math.max(0, parseInt(ratingSummary.count3, 10) || 0),
        count4: Math.max(0, parseInt(ratingSummary.count4, 10) || 0),
        count5: Math.max(0, parseInt(ratingSummary.count5, 10) || 0),
      });
      setSuccess("Star rating summary saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save rating summary.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditName(r.reviewerName || "");
    setEditRating(r.rating);
    setEditText(r.reviewText || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditRating(5);
    setEditText("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (editRating < 1 || editRating > 5) return;
    try {
      setSubmitting(true);
      setError("");
      await adminAPI.updateProductReview(editingId, {
        reviewerName: editName.trim() || undefined,
        rating: editRating,
        reviewText: editText.trim() || undefined,
      });
      setSuccess("Review updated.");
      setTimeout(() => setSuccess(""), 3000);
      cancelEdit();
      if (view === "all") loadAllReviews();
      else loadReviews();
    } catch (err) {
      setError(err.message || "Failed to update review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      setError("");
      await adminAPI.deleteProductReview(id);
      setSuccess("Review deleted.");
      setTimeout(() => setSuccess(""), 3000);
      if (view === "all") loadAllReviews();
      else loadReviews();
    } catch (err) {
      setError(err.message || "Failed to delete review.");
    }
  };

  const truncate = (str, len = 80) =>
    !str ? "" : str.length <= len ? str : str.slice(0, len) + "…";

  if (loadingProducts) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <h4 className="mb-0 fw-semibold">Product Reviews</h4>
        <Link to="/admin/products" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" />
          Back to Products
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close" />
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")} aria-label="Close" />
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${view === "all" ? "active" : ""}`}
            onClick={() => setView("all")}
          >
            All reviews
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${view === "by-product" ? "active" : ""}`}
            onClick={() => setView("by-product")}
          >
            By product
          </button>
        </li>
      </ul>

      {view === "all" && (
        <>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label small text-muted">Product</label>
                  <select
                    className="form-select form-select-sm"
                    value={allProductFilter}
                    onChange={(e) => {
                      setAllProductFilter(e.target.value);
                      setAllPage(1);
                    }}
                  >
                    <option value="">All products</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {truncate(p.title, 40)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label small text-muted">Rating</label>
                  <select
                    className="form-select form-select-sm"
                    value={allRatingFilter}
                    onChange={(e) => {
                      setAllRatingFilter(e.target.value);
                      setAllPage(1);
                    }}
                  >
                    <option value="">All</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label small text-muted">Search</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Name or review text..."
                    value={allSearch}
                    onChange={(e) => setAllSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyAllFilters())}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label small text-muted">Sort</label>
                  <select
                    className="form-select form-select-sm"
                    value={allSortBy}
                    onChange={(e) => {
                      setAllSortBy(e.target.value);
                      setAllPage(1);
                    }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100"
                    onClick={applyAllFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                Reviews {allPagination ? `(${allPagination.totalItems} total)` : ""}
              </h6>
            </div>
            <div className="card-body p-0">
              {loadingReviews ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-muted text-center py-5 mb-0">No reviews match your filters.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Product</th>
                        <th>Reviewer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date</th>
                        <th className="pe-3 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <React.Fragment key={r.id}>
                          <tr>
                            <td className="ps-3">
                              {r.product ? (
                                <Link to={`/admin/products/view/${r.product.id}`} className="text-decoration-none">
                                  {truncate(r.product.title, 35)}
                                </Link>
                              ) : "—"}
                            </td>
                            <td>{r.reviewerName || "—"}</td>
                            <td><StarDisplay rating={r.rating} /></td>
                            <td>{truncate(r.reviewText, 60) || "—"}</td>
                            <td>{formatDate(r.createdAt)}</td>
                            <td className="pe-3 text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => startEdit(r)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(r.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {editingId === r.id && (
                            <tr className="bg-light">
                              <td colSpan={6} className="p-3">
                                <form onSubmit={handleUpdate} className="row g-2 align-items-end">
                                  <div className="col-md-3">
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      placeholder="Name"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                    />
                                  </div>
                                  <div className="col-md-2">
                                    <select
                                      className="form-select form-select-sm"
                                      value={editRating}
                                      onChange={(e) => setEditRating(parseInt(e.target.value, 10))}
                                    >
                                      {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      placeholder="Review text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                    />
                                  </div>
                                  <div className="col-md-3 d-flex gap-1">
                                    <button type="submit" className="btn btn-sm btn-primary" disabled={submitting}>
                                      Save
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {allPagination && allPagination.totalPages > 1 && (
              <div className="card-footer bg-white border-top d-flex justify-content-between align-items-center py-3">
                <small className="text-muted">
                  Page {allPagination.currentPage} of {allPagination.totalPages}
                </small>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={allPage <= 1}
                    onClick={() => setAllPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={allPage >= allPagination.totalPages}
                    onClick={() => setAllPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {view === "by-product" && (
        <>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <label className="form-label fw-semibold">Select product</label>
              <select
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value ? parseInt(e.target.value, 10) : "")}
              >
                <option value="">— Choose a product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.sku ? `(${p.sku})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!productId ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5 text-center text-muted">
                Select a product above to add or manage its admin star rating.
              </div>
            </div>
          ) : (
            <>
              {selectedProduct && (
                <div className="mb-3">
                  <span className="badge bg-light text-dark border">{selectedProduct.title}</span>
                  <Link to={`/admin/products/view/${selectedProduct.id}`} className="ms-2 small">
                    View product
                  </Link>
                </div>
              )}

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-semibold">Admin star rating (reviewer counts)</h6>
                  <p className="mb-0 mt-1 small text-muted">
                    Set the number of reviewers for each star level. No names or messages — only star counts. This will be shown as the product rating on the storefront.
                  </p>
                </div>
                <div className="card-body">
                  {loadingRatingSummary ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveRatingSummary}>
                      <div className="row g-3 align-items-end">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="col-12 col-sm-6 col-md-4 col-lg">
                            <label className="form-label d-flex align-items-center gap-2">
                              <StarDisplay rating={star} />
                              <span>{star} star{star !== 1 ? "s" : ""} — count</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={ratingSummary[`count${star}`] ?? ""}
                              onChange={(e) =>
                                setRatingSummary((prev) => ({
                                  ...prev,
                                  [`count${star}`]: e.target.value,
                                }))
                              }
                              placeholder="0"
                            />
                          </div>
                        ))}
                        <div className="col-12 col-md-auto mt-2 mt-md-0">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                          >
                            {submitting ? "Saving…" : "Save rating summary"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {!loadingRatingSummary && (
                    <p className="mb-0 mt-3 small text-muted">
                      Total reviewers:{" "}
                      {(Number(ratingSummary.count1) || 0) +
                        (Number(ratingSummary.count2) || 0) +
                        (Number(ratingSummary.count3) || 0) +
                        (Number(ratingSummary.count4) || 0) +
                        (Number(ratingSummary.count5) || 0)}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;

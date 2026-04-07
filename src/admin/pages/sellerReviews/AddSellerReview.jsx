import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminAPI } from "../../../utils/api";

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AddSellerReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetProductId = searchParams.get("productId") || "";

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(presetProductId);
  const [productQuery, setProductQuery] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeaheadWrapRef = useRef(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [reviewDate, setReviewDate] = useState(todayYmd);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!presetProductId) return;
    setProductId(presetProductId);
    // We set productQuery once products are loaded (so we can show the product title).
  }, [presetProductId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminAPI.getAllProductsForAdmin({ limit: 500 });
        const list = data.products || data.data?.products || [];
        if (!cancelled) setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          if (err?.isAdminTokenError) navigate("/admin/login", { replace: true });
          else setError(err.message || "Failed to load products.");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // If we came with ?productId=, show the title in the typeahead after products load.
  useEffect(() => {
    if (!presetProductId) return;
    const match = products.find((p) => String(p.id) === String(presetProductId));
    if (match) setProductQuery(match.title || "");
  }, [products, presetProductId]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const base = Array.isArray(products) ? products : [];
    if (!q) return base.slice(0, 30);
    const filtered = base.filter((p) =>
      String(p.title || "").toLowerCase().includes(q)
    );
    return filtered.slice(0, 30);
  }, [products, productQuery]);

  useEffect(() => {
    if (!productDropdownOpen) return;
    const onMouseDown = (e) => {
      const el = typeaheadWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) {
        setProductDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [productDropdownOpen]);

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const onFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 5) {
      setError("Choose at most 5 images.");
      e.target.value = "";
      return;
    }
    setError("");
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!productId) {
      setError("Select a product.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (files.length < 1 || files.length > 5) {
      setError("Upload between 1 and 5 images.");
      return;
    }
    if (!reviewDate || !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) {
      setError("Choose a valid review date.");
      return;
    }

    const formData = new FormData();
    formData.append("productId", String(productId));
    formData.append("name", name.trim());
    formData.append("rating", String(rating));
    formData.append("message", message.trim());
    formData.append("reviewDate", reviewDate);
    files.forEach((f) => formData.append("images", f));

    try {
      setSubmitting(true);
      await adminAPI.createSellerReview(formData);
      navigate("/admin/seller-reviews");
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message || "Could not create review.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseProduct = (p) => {
    setProductId(String(p.id));
    setProductQuery(p.title || "");
    setProductDropdownOpen(false);
    setActiveIndex(-1);
    setError("");
  };

  const onProductInputChange = (e) => {
    const v = e.target.value;
    setProductQuery(v);
    setProductId(""); // force selection again from dropdown
    setProductDropdownOpen(true);
    setActiveIndex(-1);
    setError("");
  };

  return (
    <div className="container-fluid py-3" style={{ maxWidth: 720 }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/admin/seller-reviews">Seller reviews</Link>
          </li>
          <li className="breadcrumb-item active">Add</li>
        </ol>
      </nav>

      <h1 className="h3 mb-4">Add seller review</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product</label>
              <div ref={typeaheadWrapRef} style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  value={productQuery}
                  onChange={onProductInputChange}
                  onFocus={() => setProductDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (!productDropdownOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
                      setProductDropdownOpen(true);
                      setActiveIndex(0);
                      return;
                    }
                    if (!productDropdownOpen) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((idx) => Math.min(idx + 1, filteredProducts.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((idx) => Math.max(idx - 1, 0));
                    } else if (e.key === "Enter") {
                      if (activeIndex >= 0 && activeIndex < filteredProducts.length) {
                        e.preventDefault();
                        chooseProduct(filteredProducts[activeIndex]);
                      }
                    } else if (e.key === "Escape") {
                      setProductDropdownOpen(false);
                      setActiveIndex(-1);
                    }
                  }}
                  placeholder={loadingProducts ? "Loading products…" : "Search product by name"}
                  disabled={loadingProducts || submitting}
                  aria-autocomplete="list"
                  aria-expanded={productDropdownOpen}
                />

                {productDropdownOpen && !loadingProducts && (
                  <div
                    className="position-absolute start-0 end-0 bg-white border rounded-3 mt-1 shadow-sm"
                    style={{ zIndex: 2500, maxHeight: 260, overflowY: "auto" }}
                    role="listbox"
                  >
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-muted small">No matching products.</div>
                    ) : (
                      filteredProducts.map((p, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className="w-100 text-start list-group-item list-group-item-action"
                            style={{
                              border: "none",
                              borderRadius: 0,
                              background: isActive ? "rgba(84,117,53,0.10)" : "transparent",
                            }}
                            onMouseDown={(e) => e.preventDefault()} // keep input focus
                            onClick={() => chooseProduct(p)}
                            role="option"
                            aria-selected={isActive}
                          >
                            <div className="d-flex align-items-start justify-content-between gap-3">
                              <div className="fw-semibold" style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {p.title}
                              </div>
                              <div className="text-muted small flex-shrink-0">#{p.id}</div>
                            </div>
                          </button>
                        );
                      })
                    )}
                    <div className="p-2 text-center text-muted small" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      Select a product from the list
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Reviewer name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Rating</label>
              <select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Review date (shown to customers)</label>
              <input
                type="date"
                className="form-control"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                required
              />
              <div className="form-text">Pick any calendar date; it appears on the product page review card.</div>
            </div>

            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Review text shown to customers (optional)"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Images (1–5)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={onFilesChange}
              />
              <div className="form-text">JPEG, PNG, or WebP. Up to 5 files, 5MB each.</div>
              {previews.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {previews.map((url) => (
                    <img key={url} src={url} alt="" className="rounded border" style={{ width: 80, height: 80, objectFit: "cover" }} />
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting || loadingProducts}>
                {submitting ? "Saving…" : "Save review"}
              </button>
              <Link to="/admin/seller-reviews" className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

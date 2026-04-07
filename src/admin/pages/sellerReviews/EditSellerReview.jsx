import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminAPI, getImageUrl } from "../../../utils/api";

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function EditSellerReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reviewId = parseInt(id, 10);

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [keptImages, setKeptImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!reviewId) {
      setError("Invalid review id.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const [reviewData, productsData] = await Promise.all([
        adminAPI.getSellerReview(reviewId),
        adminAPI.getAllProductsForAdmin({ limit: 500 }),
      ]);
      const list = productsData.products || productsData.data?.products || [];
      setProducts(Array.isArray(list) ? list : []);

      const r = reviewData;
      if (!r || !r.id) {
        setError("Review not found.");
        return;
      }
      setProductId(String(r.productId));
      setName(r.name || "");
      setRating(Number(r.rating) || 5);
      setMessage(r.message || "");
      if (r.reviewDate) {
        setReviewDate(String(r.reviewDate).slice(0, 10));
      } else if (r.createdAt) {
        setReviewDate(new Date(r.createdAt).toISOString().slice(0, 10));
      } else {
        setReviewDate(todayYmd());
      }
      setKeptImages(Array.isArray(r.images) ? [...r.images] : []);
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to load review.");
    } finally {
      setLoading(false);
    }
  }, [reviewId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newPreviews]);

  const removeKeptImage = (path) => {
    setKeptImages((prev) => prev.filter((p) => p !== path));
  };

  const onNewFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const maxNew = 5 - keptImages.length;
    if (selected.length > maxNew) {
      setError(`You can add at most ${maxNew} more image(s) (5 total).`);
      e.target.value = "";
      return;
    }
    setError("");
    newPreviews.forEach((u) => URL.revokeObjectURL(u));
    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const totalCount = keptImages.length + newFiles.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (totalCount < 1 || totalCount > 5) {
      setError("Keep or add images so you have between 1 and 5 total.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!reviewDate || !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) {
      setError("Choose a valid review date.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("rating", String(rating));
    formData.append("message", message.trim());
    formData.append("reviewDate", reviewDate);
    formData.append("existingImages", JSON.stringify(keptImages));
    newFiles.forEach((f) => formData.append("images", f));

    try {
      setSubmitting(true);
      await adminAPI.updateSellerReview(reviewId, formData);
      navigate(productId ? `/admin/seller-reviews/product/${productId}` : "/admin/seller-reviews");
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message || "Could not update review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-3">
        <div className="text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3" style={{ maxWidth: 720 }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/admin/seller-reviews">Seller reviews</Link>
          </li>
          {productId && (
            <li className="breadcrumb-item">
              <Link to={`/admin/seller-reviews/product/${productId}`}>Product #{productId}</Link>
            </li>
          )}
          <li className="breadcrumb-item active">Edit</li>
        </ol>
      </nav>

      <h1 className="h3 mb-4">Edit seller review</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled
              >
                {!products.some((p) => String(p.id) === String(productId)) && productId ? (
                  <option value={productId}>Product #{productId} (not in current list)</option>
                ) : null}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (ID {p.id})
                  </option>
                ))}
              </select>
              <div className="form-text">Product cannot be changed. Delete and create a new review to move it.</div>
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
                    {n} stars
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
            </div>

            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Current images — click to remove from this review</label>
              <div className="d-flex flex-wrap gap-2">
                {(Array.isArray(keptImages) ? keptImages : []).map((src) => (
                  <button
                    key={src}
                    type="button"
                    className="btn p-0 border-0 position-relative"
                    onClick={() => removeKeptImage(src)}
                    title="Remove from review"
                  >
                    <img
                      src={getImageUrl(src)}
                      alt=""
                      className="rounded border"
                      style={{ width: 88, height: 88, objectFit: "cover", opacity: 0.95 }}
                    />
                    <span className="position-absolute top-0 end-0 badge bg-danger m-1">×</span>
                  </button>
                ))}
              </div>
              <div className="form-text">
                Shown images are kept. Click an image to drop it (must stay between 1 and 5 total with new uploads).
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Add images ({5 - keptImages.length} slots left)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={onNewFilesChange}
                disabled={keptImages.length >= 5}
              />
              {newPreviews.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {newPreviews.map((url) => (
                    <img key={url} src={url} alt="" className="rounded border" style={{ width: 80, height: 80, objectFit: "cover" }} />
                  ))}
                </div>
              )}
              <div className="form-text mt-1">
                Total images now: <strong>{totalCount}</strong> (need 1–5)
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save changes"}
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

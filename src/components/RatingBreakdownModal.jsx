import React, { useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Renders star display with optional half-star (e.g. 3.2 → 3 full, 1 half, 1 empty)
 */
export function StarDisplay({ rating = 0, size = "1rem", className = "" }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const fullCount = full + (hasHalf ? 1 : 0);

  return (
    <div className={`d-flex align-items-center gap-0 ${className}`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= full) {
          return <i key={star} className="bi bi-star-fill text-warning" aria-hidden />;
        }
        if (star === full + 1 && hasHalf) {
          return <i key={star} className="bi bi-star-half text-warning" aria-hidden />;
        }
        return <i key={star} className="bi bi-star text-muted" aria-hidden />;
      })}
    </div>
  );
}

/**
 * Modal showing full rating breakdown: average, star distribution bars, "See customer reviews" link.
 * Shows stars + count in brackets per row (no global statement, no percentages).
 */
const RatingBreakdownModal = ({
  show,
  onClose,
  averageRating = 0,
  totalCount = 0,
  distribution = {},
  productId = null,
  onSeeReviews = null,
}) => {
  const rows = [5, 4, 3, 2, 1].map((star) => {
    const pct = distribution[star] ?? 0;
    const count = totalCount > 0 ? Math.round((pct / 100) * totalCount) : 0;
    return { star, pct, count };
  });

  useEffect(() => {
    if (!show) return;
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="rating-breakdown-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-breakdown-title"
    >
      <div
        className="rating-breakdown-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rating-breakdown-modal-header">
          <h2 id="rating-breakdown-title" className="rating-breakdown-modal-title">
            {Number(averageRating).toFixed(1)} out of 5
          </h2>
        </div>

        

        <div className="rating-breakdown-bars">
          {rows.map(({ star, count }) => (
            <div key={star} className="rating-breakdown-bar-row">
              <span className="rating-breakdown-bar-label d-flex align-items-center gap-2">
                <StarDisplay rating={star} size="1.1rem" />
                <span className="text-muted">({count})</span>
              </span>
            </div>
          ))}
        </div>

        {(onSeeReviews || productId) && (
          <div className="rating-breakdown-see-reviews">
            {onSeeReviews ? (
              <button
                type="button"
                className="rating-breakdown-see-reviews-link"
                onClick={() => {
                  onSeeReviews();
                  onClose();
                }}
              >
                See customer reviews <i className="bi bi-chevron-right" />
              </button>
            ) : productId ? (
              <Link
                to={`/product/${productId}#reviews`}
                className="rating-breakdown-see-reviews-link"
                onClick={onClose}
              >
                See customer reviews <i className="bi bi-chevron-right" />
              </Link>
            ) : null}
          </div>
        )}
        <div className="rating-breakdown-modal-footer">
          <button
            type="button"
            className="rating-breakdown-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg" /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingBreakdownModal;

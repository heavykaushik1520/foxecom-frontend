import React, { useState, useCallback } from "react";
import { StarDisplay } from "./RatingBreakdownModal";
import RatingBreakdownModal from "./RatingBreakdownModal";
import { reviewAPI } from "../utils/api";

/**
 * Compute distribution (percent per star 1-5) from reviews array or from API distribution counts
 */
function getDistribution(reviews, distributionCounts = null, totalCount = 0) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (distributionCounts && totalCount > 0) {
    [1, 2, 3, 4, 5].forEach((star) => {
      counts[star] = ((distributionCounts[star] || 0) / totalCount) * 100;
    });
    return counts;
  }
  if (!reviews?.length) return counts;
  reviews.forEach((r) => {
    const s = Math.min(5, Math.max(1, Number(r.rating) || 0));
    counts[s] = (counts[s] || 0) + 1;
  });
  const total = reviews.length;
  return Object.fromEntries(
    [1, 2, 3, 4, 5].map((star) => [star, total ? (counts[star] / total) * 100 : 0])
  );
}

/**
 * Inline average star rating with expand chevron; opens modal with full breakdown.
 * Use on product card (pass productId) or product details (pass distribution + onSeeReviews).
 * showCount: on product cards set to false to show only stars (no total count).
 */
const ProductRatingExpandable = ({
  averageRating = 0,
  totalCount = 0,
  productId = null,
  distribution: distributionProp = null,
  onSeeReviews = null,
  starSize = "0.95rem",
  productPage = false,
  showCount = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [distribution, setDistribution] = useState(distributionProp || {});
  const [loadingDistribution, setLoadingDistribution] = useState(false);

  const openModal = useCallback(async () => {
    if (distributionProp) {
      setDistribution(distributionProp);
      setShowModal(true);
      return;
    }
    if (productId) {
      setShowModal(true);
      setLoadingDistribution(true);
      try {
        const data = await reviewAPI.getByProduct(productId);
        const reviews = data.reviews || [];
        const total = data.totalCount ?? reviews.length;
        const dist = data.distribution && total > 0
          ? getDistribution(null, data.distribution, total)
          : getDistribution(reviews);
        setDistribution(dist);
      } catch {
        setDistribution({});
      } finally {
        setLoadingDistribution(false);
      }
    } else {
      setDistribution({});
      setShowModal(true);
    }
  }, [productId, distributionProp]);

  const hasReviews = totalCount > 0;

  if (!hasReviews) {
    return (
      <span className="text-muted small d-flex align-items-center gap-1">
        <i className="bi bi-star" style={{ fontSize: starSize }} aria-hidden />
        No reviews
      </span>
    );
  }

  return (
    <>
      <div className="product-rating-expandable-inline d-flex align-items-center gap-1 flex-wrap">
        <StarDisplay rating={averageRating} size={starSize} />
        <button
          type="button"
          className="product-rating-expandable-trigger btn btn-link p-0 border-0 text-decoration-none text-muted small d-flex align-items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal();
          }}
          aria-label="View rating breakdown"
        >
          {showCount && <span className="ms-1">({totalCount})</span>}
          <i className="bi bi-chevron-down ms-0 ms-sm-1 product-rating-expandable-chevron" aria-hidden />
        </button>
      </div>

      <RatingBreakdownModal
        show={showModal}
        onClose={() => setShowModal(false)}
        averageRating={averageRating}
        totalCount={totalCount}
        distribution={loadingDistribution ? {} : distribution}
        productId={productPage ? null : productId}
        onSeeReviews={productPage ? onSeeReviews : null}
      />
    </>
  );
};

export default ProductRatingExpandable;

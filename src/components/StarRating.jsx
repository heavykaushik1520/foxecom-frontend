import React, { memo } from 'react'

const StarRating = memo(({ rating = 0, count = 0, size = '0.85rem' }) => {
  const roundedRating = Math.round(rating)

  // No reviews case
  if (!count || count === 0) {
    return (
      <span className="text-muted small d-flex align-items-center gap-1">
        <i className="bi bi-star" style={{ fontSize: size }}></i>
        No reviews
      </span>
    )
  }

  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${
            star <= roundedRating
              ? 'bi-star-fill text-warning'
              : 'bi-star text-muted'
          }`}
          style={{ fontSize: size }}
        ></i>
      ))}
      <span className="text-muted small ms-1">({count})</span>
    </div>
  )
});

StarRating.displayName = 'StarRating';

export default StarRating;

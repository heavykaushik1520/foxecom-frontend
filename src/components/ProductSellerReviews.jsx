import React, { useEffect, useMemo, useRef, useState } from "react";
import { reviewAPI, getImageUrl } from "../utils/api";
import { StarDisplay } from "./RatingBreakdownModal";

function formatReviewDate(value) {
  if (!value) return "";
  try {
    const s = String(value).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(`${s}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function reviewDateTimeAttr(reviewDate, createdAt) {
  if (reviewDate && /^\d{4}-\d{2}-\d{2}$/.test(String(reviewDate).slice(0, 10))) {
    return `${String(reviewDate).slice(0, 10)}T12:00:00`;
  }
  if (createdAt) return new Date(createdAt).toISOString();
  return "";
}

/**
 * Featured (admin-curated) seller reviews on the product page — before customer reviews.
 */
export default function ProductSellerReviews({ productId, productTitle }) {
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    if (productId == null) {
      setSellerReviews([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await reviewAPI.getSellerReviewsByProduct(productId);
        const list = data?.sellerReviews || [];
        if (!cancelled) setSellerReviews(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setSellerReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const update = () => {
      const maxLeft = el.scrollWidth - el.clientWidth;
      const left = el.scrollLeft;
      setCanPrev(left > 0);
      setCanNext(left < maxLeft - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sellerReviews.length, loading]);

  const scrollCarousel = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const jsonLd = useMemo(() => {
    if (!sellerReviews.length || !productTitle) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Featured reviews: ${productTitle}`,
      numberOfItems: sellerReviews.length,
      itemListElement: sellerReviews.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Review",
          author: { "@type": "Person", name: r.name },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          ...(r.message ? { reviewBody: r.message } : {}),
          ...(r.reviewDate
            ? { datePublished: String(r.reviewDate).slice(0, 10) }
            : r.createdAt
              ? { datePublished: new Date(r.createdAt).toISOString().slice(0, 10) }
              : {}),
          itemReviewed: {
            "@type": "Product",
            name: productTitle,
          },
        },
      })),
    };
  }, [sellerReviews, productTitle]);

  if (loading) {
    return (
      <div className="row mt-4 mt-md-5 seller-reviews-section" aria-busy="true">
        <div className="col-12">
          <div className="seller-reviews-skeleton rounded-3" />
        </div>
      </div>
    );
  }

  if (!sellerReviews.length) return null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <section
        id="seller-reviews"
        className="row mt-4 mt-md-5 seller-reviews-section"
        aria-labelledby="seller-reviews-heading"
      >
        <div className="col-12">
          <header className="seller-reviews-header mb-3 mb-md-4">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-between gap-2 gap-sm-3">
              <h3
                id="seller-reviews-heading"
                className="seller-reviews-title mb-1 fw-bold"
              >
                Customer Reviews
              </h3>
            </div>
          </header>

          <div className="seller-reviews-carousel-shell">
            <button
              type="button"
              className="seller-reviews-carousel-btn seller-reviews-carousel-btn-left"
              onClick={() => scrollCarousel(-1)}
              disabled={!canPrev}
              aria-label="Scroll reviews left"
            >
              &lt;
            </button>

            <div
              className="seller-reviews-grid seller-reviews-carousel"
              ref={carouselRef}
            >
              {sellerReviews.map((r) => (
                <article key={r.id} className="seller-reviews-card">
                  <div className="seller-reviews-card-inner">
                    <div className="seller-reviews-card-top">
                      <p className="seller-reviews-name fw-semibold mb-0 mt-2">
                        {r.name}
                      </p>
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div className="seller-reviews-stars-wrap">
                          <StarDisplay
                            rating={r.rating}
                            className="seller-reviews-star-display"
                          />
                        </div>
                        {(r.reviewDate || r.createdAt) && (
                          <time
                            className="seller-reviews-date text-muted"
                            dateTime={reviewDateTimeAttr(r.reviewDate, r.createdAt)}
                          >
                            {formatReviewDate(r.reviewDate || r.createdAt)}
                          </time>
                        )}
                      </div>
                    </div>

                    {Array.isArray(r.images) && r.images.length > 0 ? (
                      <div
                        className="seller-reviews-photos"
                        aria-label="Review photos"
                      >
                        <ul className="seller-reviews-photo-list list-unstyled mb-0">
                          {r.images.map((src, idx) => (
                            <li
                              key={`${r.id}-${idx}`}
                              className="seller-reviews-photo-item"
                            >
                              <a
                                href={getImageUrl(src)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="seller-reviews-photo-link d-block rounded-2 overflow-hidden"
                              >
                                <img
                                  src={getImageUrl(src)}
                                  alt={`${productTitle || "Product"} — review photo ${idx + 1}`}
                                  className="seller-reviews-photo-img"
                                  loading="lazy"
                                  decoding="async"
                                  width={160}
                                  height={160}
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {r.message ? (
                      <p className="seller-reviews-message mb-0">{r.message}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="seller-reviews-carousel-btn seller-reviews-carousel-btn-right"
              onClick={() => scrollCarousel(1)}
              disabled={!canNext}
              aria-label="Scroll reviews right"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

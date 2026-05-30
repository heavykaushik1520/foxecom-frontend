import React from "react";

const shimmer = { animation: "skeleton-shimmer 1.2s ease-in-out infinite" };

export function CartPageSkeleton() {
  return (
    <div className="padding-large cart-page">
      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.45; }
          50% { opacity: 0.9; }
          100% { opacity: 0.45; }
        }
      `}</style>
      <div className="container">
        <div
          className="mb-3 mb-md-4 rounded bg-secondary bg-opacity-25"
          style={{ height: "clamp(1.75rem, 4vw, 2.25rem)", maxWidth: 240, ...shimmer }}
        />
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 p-md-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="d-flex flex-column flex-md-row gap-3 mb-4 pb-4 border-bottom"
                  >
                    <div
                      className="rounded bg-secondary bg-opacity-25 flex-shrink-0 mx-auto mx-md-0"
                      style={{ width: 120, height: 120, ...shimmer }}
                    />
                    <div className="flex-grow-1 w-100">
                      <div
                        className="rounded bg-secondary bg-opacity-25 mb-2"
                        style={{ height: 18, width: "85%", ...shimmer }}
                      />
                      <div
                        className="rounded bg-secondary bg-opacity-25 mb-3"
                        style={{ height: 14, width: "45%", ...shimmer }}
                      />
                      <div
                        className="rounded bg-secondary bg-opacity-25"
                        style={{ height: 22, width: 100, ...shimmer }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 p-md-4 placeholder-glow">
                <div
                  className="rounded bg-secondary bg-opacity-25 mb-4"
                  style={{ height: 22, width: "60%", ...shimmer }}
                />
                <div
                  className="rounded bg-secondary bg-opacity-25 mb-2"
                  style={{ height: 16, width: "100%", ...shimmer }}
                />
                <div
                  className="rounded bg-secondary bg-opacity-25 mb-4"
                  style={{ height: 16, width: "80%", ...shimmer }}
                />
                <div
                  className="rounded bg-secondary bg-opacity-25"
                  style={{ height: 48, width: "100%", ...shimmer }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="padding-large product-detail-page">
      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.45; }
          50% { opacity: 0.9; }
          100% { opacity: 0.45; }
        }
      `}</style>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-6">
            <div
              className="rounded bg-secondary bg-opacity-25 w-100"
              style={{ aspectRatio: "1", maxHeight: 480, ...shimmer }}
            />
            <div className="d-flex gap-2 mt-3 overflow-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded bg-secondary bg-opacity-25 flex-shrink-0"
                  style={{ width: 72, height: 72, ...shimmer }}
                />
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="rounded bg-secondary bg-opacity-25 mb-3"
              style={{ height: 28, width: "90%", ...shimmer }}
            />
            <div
              className="rounded bg-secondary bg-opacity-25 mb-2"
              style={{ height: 20, width: 140, ...shimmer }}
            />
            <div
              className="rounded bg-secondary bg-opacity-25 mb-4"
              style={{ height: 36, width: 200, ...shimmer }}
            />
            <div
              className="rounded bg-secondary bg-opacity-25 mb-2"
              style={{ height: 14, width: "100%", ...shimmer }}
            />
            <div
              className="rounded bg-secondary bg-opacity-25 mb-2"
              style={{ height: 14, width: "95%", ...shimmer }}
            />
            <div
              className="rounded bg-secondary bg-opacity-25 mb-4"
              style={{ height: 14, width: "70%", ...shimmer }}
            />
            <div className="d-flex flex-wrap gap-2">
              <div
                className="rounded bg-secondary bg-opacity-25"
                style={{ height: 44, width: 160, ...shimmer }}
              />
              <div
                className="rounded bg-secondary bg-opacity-25"
                style={{ height: 44, width: 140, ...shimmer }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="padding-large checkout-page">
      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.45; }
          50% { opacity: 0.9; }
          100% { opacity: 0.45; }
        }
      `}</style>
      <div className="container">
        <div
          className="rounded bg-secondary bg-opacity-25 mb-4"
          style={{ height: 36, maxWidth: 200, ...shimmer }}
        />
        <div className="row g-4">
          <div className="col-lg-8 order-2 order-lg-1">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-3 p-md-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded bg-secondary bg-opacity-25 mb-3"
                    style={{ height: 48, width: "100%", ...shimmer }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4 order-1 order-lg-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 p-md-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between mb-3"
                  >
                    <div
                      className="rounded bg-secondary bg-opacity-25"
                      style={{ height: 16, width: "55%", ...shimmer }}
                    />
                    <div
                      className="rounded bg-secondary bg-opacity-25"
                      style={{ height: 16, width: 72, ...shimmer }}
                    />
                  </div>
                ))}
                <hr />
                <div
                  className="rounded bg-secondary bg-opacity-25"
                  style={{ height: 40, width: "100%", ...shimmer }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

const STEP_ICONS = {
  order_placed: "📋",
  payment_confirmed: "✅",
  manifested: "🏷️",
  picked_up: "📦",
  in_transit: "🚚",
  out_for_delivery: "🛵",
  delivered: "🎉",
};

export default function OrderTimeline({
  timeline,
  stage,
  cancellationWindow,
  onCancel,
  isCanceling = false,
}) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const safeStage = stage || null;
  const safeCancellationWindow = cancellationWindow || null;
  const isPartialRefund =
    safeStage?.refundType === "partial" ||
    safeCancellationWindow?.expired === true;

  const showCancel =
    safeCancellationWindow && safeStage?.isCancellable;

  return (
    <div className="order-timeline">
      {safeTimeline.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
            margin: "16px 0",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 6,
            minWidth: 680,
          }}
          aria-label="Order progress steps"
        >
          {safeTimeline.map((step, i) => (
            <React.Fragment key={step.code || i}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 70,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: step.completed
                      ? "#1d9e75"
                      : step.active
                        ? "#185fa5"
                        : "#e0e0e0",
                    color: step.completed || step.active ? "#fff" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 600,
                    transition: "background 0.3s",
                  }}
                >
                  {step.completed
                    ? "✓"
                    : STEP_ICONS[step.code] || step.step || step.label || "-"}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    textAlign: "center",
                    color: step.active
                      ? "#185fa5"
                      : step.completed
                        ? "#1d9e75"
                        : "#999",
                    fontWeight: step.active ? 600 : 400,
                    maxWidth: 90,
                  }}
                >
                  {step.label || step.code || ""}
                </span>
              </div>
              {i < safeTimeline.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    marginTop: 16,
                    background: step.completed ? "#1d9e75" : "#e0e0e0",
                    transition: "background 0.3s",
                    minWidth: 20,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {safeStage && (
        <div
          style={{
            background: "#f0f7ff",
            border: "1px solid #b5d4f4",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "#185fa5" }}>{safeStage.label}</strong>
          <p
            style={{
              margin: "4px 0 0",
              color: "#444",
              fontSize: 14,
            }}
          >
            {safeStage.description}
          </p>
        </div>
      )}

      {showCancel && (
        <div
          style={{
            background: "#fef9f0",
            border: "1px solid #fac775",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, color: "#854f0b" }}>
            {isPartialRefund ? (
              <>Cancellation may include a partial refund (GST + courier deductions).</>
            ) : (
              <>
                Cancel window: {safeCancellationWindow.hoursLeft}h{" "}
                {safeCancellationWindow.minutesLeft}m remaining
              </>
            )}
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isCanceling}
            style={{
              background: isCanceling ? "#a94442" : "#c0392b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "7px 16px",
              cursor: isCanceling ? "not-allowed" : "pointer",
              fontSize: 13,
              minWidth: 140,
            }}
            aria-busy={isCanceling ? "true" : "false"}
          >
            {isCanceling ? "Cancelling..." : "Cancel order"}
          </button>
        </div>
      )}
    </div>
  );
}


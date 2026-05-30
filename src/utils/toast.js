export function emitAppToast(message, variant = "warning", durationMs = 2200) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("appToast", {
      detail: {
        message,
        variant,
        durationMs,
      },
    }),
  );
}

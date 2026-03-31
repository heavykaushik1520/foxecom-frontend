import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { APP_CONFIG, STORAGE_KEYS } from "../utils/constants";

const HEARTBEAT_MS = 30_000;
const ACTIVITY_THROTTLE_MS = 10_000;

function isAdminPath(pathname) {
  if (!pathname || typeof pathname !== "string") return false;
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/superadmin" ||
    pathname.startsWith("/superadmin/")
  );
}

/**
 * Same browser id as analytics (VISITOR_ID); sent as session_id to the live-visitor API.
 */
function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (id && typeof id === "string" && id.trim().length >= 8) {
      return id.trim();
    }
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    }
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, id);
    return id;
  } catch {
    return null;
  }
}

function parseProductId(pathname) {
  if (!pathname || typeof pathname !== "string") return null;
  const m = /\/product\/(\d+)/.exec(pathname);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Sends a heartbeat every 30s on the storefront so admins can see live visitors (last_seen within 2 minutes).
 * Skips admin/superadmin routes. Uses customer JWT when present so user_id is trusted server-side.
 */
export function useVisitorHeartbeat() {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const search = location.search || "";
  const currentPageRef = useRef(`${pathname}${search}`);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    currentPageRef.current = `${pathname}${search}`;
  }, [pathname, search]);

  useEffect(() => {
    if (isAdminPath(pathname)) return undefined;

    const url = `${APP_CONFIG.API_BASE_URL}/visitor/heartbeat`;
    let cancelled = false;

    const send = (force = false) => {
      if (cancelled) return;
      const now = Date.now();
      if (!force && now - lastSentAtRef.current < ACTIVITY_THROTTLE_MS) return;
      const sessionId = getOrCreateSessionId();
      if (!sessionId) return;

      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const page = currentPageRef.current.startsWith("/")
        ? currentPageRef.current
        : `/${currentPageRef.current}`;
      const productId = parseProductId(pathname);

      fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          current_page: page,
          product_id: productId,
          is_logged_in: !!token,
        }),
        credentials: "omit",
      })
        .then((res) => {
          lastSentAtRef.current = now;
          const refreshed = res.headers.get("x-auth-token");
          if (refreshed) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, refreshed);
          }
        })
        .catch(() => {});
    };

    send(true);
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      send();
    }, HEARTBEAT_MS);

    const onVisibility = () => {
      if (!document.hidden) send();
    };
    const onActivity = () => send();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("click", onActivity, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [pathname, search]);
}

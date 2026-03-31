import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { APP_CONFIG, STORAGE_KEYS } from "../utils/constants";

function getOrCreateVisitorId() {
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
 * Records a page view on each route change (public storefront only).
 * Uses localStorage visitor id and React Router pathname.
 */
export function useTrackPageVisit() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || "/";
    if (isAdminPath(pathname)) return;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const page = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const url = `${APP_CONFIG.API_BASE_URL}/analytics/visit`;
    const controller = new AbortController();

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, page }),
      signal: controller.signal,
      credentials: "omit",
    }).catch(() => {});

    return () => controller.abort();
  }, [location.pathname]);
}

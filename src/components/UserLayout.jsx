import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import SVGSymbols from "./SVGSymbols";
import SearchPopup from "./SearchPopup";

const UserLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [centerToast, setCenterToast] = useState({
    open: false,
    message: "",
    variant: "warning",
  });

  // Sync login state with localStorage on mount and changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Check on mount
    checkLoginStatus();

    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkLoginStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (same-tab login/logout)
    const handleLoginStatusChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("loginStatusChanged", handleLoginStatusChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
    };
  }, []);

  useEffect(() => {
    const onAppToast = (event) => {
      const message = event?.detail?.message;
      const variant = event?.detail?.variant || "warning";
      const durationMs = Number(event?.detail?.durationMs) || 2200;
      if (!message) return;
      setCenterToast({ open: true, message, variant });
      window.clearTimeout(window.__appCenterToastTimer);
      window.__appCenterToastTimer = window.setTimeout(() => {
        setCenterToast((prev) => ({ ...prev, open: false }));
      }, durationMs);
    };

    window.addEventListener("appToast", onAppToast);
    return () => {
      window.removeEventListener("appToast", onAppToast);
      window.clearTimeout(window.__appCenterToastTimer);
    };
  }, []);

  return (
    <>
      <SVGSymbols />
      <SearchPopup />
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      {centerToast.open && (
        <div
          className="checkout-center-toast-overlay"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={`checkout-center-toast checkout-center-toast--${centerToast.variant}`}
          >
            {centerToast.message}
          </div>
        </div>
      )}
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;

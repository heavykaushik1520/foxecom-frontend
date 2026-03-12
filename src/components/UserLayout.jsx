import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import SVGSymbols from "./SVGSymbols";
import SearchPopup from "./SearchPopup";

const UserLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <>
      <SVGSymbols />
      <SearchPopup />
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;

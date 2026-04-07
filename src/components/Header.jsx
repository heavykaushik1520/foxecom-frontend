import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { userAuthAPI, mobileBrandAPI, mobileModelAPI } from "../utils/api";
import logoImg from "../assest/logo/foxicom.webp";

const Header = ({ isLoggedIn: isLoggedInProp, setIsLoggedIn: setIsLoggedInProp }) => {
  const { getCartItemsCount, loadCart } = useCart();
  const cartCount = getCartItemsCount();
  const location = useLocation();
  const navigate = useNavigate();
  const collapseRef = useRef(null);
  const collapseInstanceRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [brands, setBrands] = useState([]);
  const [modelsByBrand, setModelsByBrand] = useState({});
  const [hoverBrandId, setHoverBrandId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });
  const [mobileExpandedBrandId, setMobileExpandedBrandId] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  const setLoginState = (v) => {
    setIsLoggedIn(!!v);
    if (typeof setIsLoggedInProp === "function") setIsLoggedInProp(!!v);
  };

  useEffect(() => {
    const check = () => {
      const token = !!localStorage.getItem("token");
      setLoginState(token);
    };
    window.addEventListener("storage", () => check());
    window.addEventListener("loginStatusChanged", check);
    check();
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("loginStatusChanged", check);
    };
  }, [setIsLoggedInProp]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await mobileBrandAPI.getAll({ limit: 100 });
        const list = Array.isArray(res) ? res : (res?.brands || []);
        if (!cancelled) setBrands(list);
      } catch (e) {
        if (!cancelled) setBrands([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchModelsForBrand = async (brandId) => {
    if (modelsByBrand[brandId]) return;
    try {
      const res = await mobileModelAPI.getAll({ brandId, limit: 100 });
      const list = Array.isArray(res) ? res : (res?.models || res?.mobileModels || []);
      setModelsByBrand((prev) => ({ ...prev, [brandId]: list }));
    } catch (e) {
      setModelsByBrand((prev) => ({ ...prev, [brandId]: [] }));
    }
  };

  const handleBrandMouseEnter = (brandId, event) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPos({ left: rect.left, top: rect.bottom });
    fetchModelsForBrand(brandId);
    setHoverBrandId(brandId);
  };

  const handleBrandMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setHoverBrandId(null), 100);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setHoverBrandId(null), 100);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onScroll = (e) => {
      // Close the dropdown only when the page itself is scrolling.
      // Scrolling inside overflow containers (like `.brand-dropdown`) should not dismiss it.
      const target = e.target;
      const isPageScrollTarget =
        target === window ||
        target === document ||
        target === document.scrollingElement ||
        target === document.documentElement;

      if (isPageScrollTarget) setHoverBrandId(null);
    };

    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;
    const init = () => {
      if (el && window.bootstrap?.Collapse) {
        try {
          collapseInstanceRef.current = window.bootstrap.Collapse.getOrCreateInstance?.(el, { toggle: false })
            || new window.bootstrap.Collapse(el, { toggle: false });
        } catch (e) { }
      }
    };
    init();
    const t = setTimeout(init, 100);
    const onShow = () => {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        setMobileSidebarOpen(true);
        setNavbarExpanded(true);
        document.body.classList.add('mobile-sidebar-open');
      }, 10);
    };
    const onHide = () => {
      setMobileSidebarOpen(false);
      setNavbarExpanded(false);
      setMobileExpandedBrandId(null);
      document.body.classList.remove('mobile-sidebar-open');
    };
    el.addEventListener("show.bs.collapse", onShow);
    el.addEventListener("hidden.bs.collapse", onHide);
    return () => {
      clearTimeout(t);
      el.removeEventListener("show.bs.collapse", onShow);
      el.removeEventListener("hidden.bs.collapse", onHide);
      document.body.classList.remove('mobile-sidebar-open');
      try { collapseInstanceRef.current?.dispose?.(); } catch (e) { }
    };
  }, []);

  const closeNavbar = () => {
    setMobileExpandedBrandId(null);
    setNavbarExpanded(false);
    document.body.classList.remove('mobile-sidebar-open');
    try {
      if (collapseRef.current?.classList.contains("show")) {
        collapseInstanceRef.current?.hide?.();
      }
    } catch (e) {
      collapseRef.current?.classList.remove("show");
      setMobileSidebarOpen(false);
    }
  };

  const toggleMobileBrand = (brandId) => {
    fetchModelsForBrand(brandId);
    setMobileExpandedBrandId((prev) => (prev === brandId ? null : brandId));
  };

  const handleLogout = async () => {
    try { await userAuthAPI.signout(); } catch (e) { }
    localStorage.removeItem("token");
    setLoginState(false);
    loadCart();
    navigate("/");
    closeNavbar();
  };

  const handleModelClick = (modelId) => {
    navigate(`/shop?modelId=${modelId}`);
    setHoverBrandId(null);
    closeNavbar();
  };

  const models = hoverBrandId ? (modelsByBrand[hoverBrandId] || []) : [];

  return (
    <header className="fixed-top bg-white shadow-sm">
      {/* Mobile backdrop when sidebar is open */}
      <div
        className={`mobile-sidebar-backdrop d-lg-none position-fixed top-0 start-0 end-0 bottom-0 bg-dark ${mobileSidebarOpen ? 'show' : ''}`}
        style={{ zIndex: 1054 }}
        aria-hidden={!mobileSidebarOpen}
        onClick={closeNavbar}
      />
      {/* Top row: toggler (mobile) | logo | search (desktop) | cart | account */}
      <div className="border-bottom">
        <div className="container">
          <nav className="navbar navbar-expand-lg py-2">
            <button
              className="navbar-toggler d-lg-none order-first border-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
              aria-controls="mainNavbar"
              aria-expanded={navbarExpanded}
              aria-label="Toggle menu"
              onClick={() => {
                if (!navbarExpanded) {
                  setNavbarExpanded(true);
                }
              }}
            >
              <span className="navbar-toggler-icon" />
            </button>
            <Link
              className="navbar-brand order-lg-2 mx-auto mx-lg-0 me-lg-auto text-center text-lg-start d-flex align-items-center"
              to="/"
              onClick={closeNavbar}
            >
              <img
                src={logoImg}
                alt="FOXECOM"
                className="header-logo"
                width="180"
                height="52"
                loading="eager"
                fetchpriority="high"
              />
            </Link>
            {/* Desktop: search, cart, account inside collapse */}
            <div className="collapse navbar-collapse order-last" id="mainNavbar" ref={collapseRef}>
              <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3 d-none d-lg-flex">
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center"
                    to="/shop"
                    onClick={closeNavbar}
                    aria-label="Search products"
                  >
                    <i className="bi bi-search fs-5" />
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/cart" onClick={closeNavbar} aria-label="View Shopping Cart">
                    <i className="bi bi-bag fs-5" />
                    {cartCount > 0 && <span className="ms-1 badge bg-dark rounded-pill">{cartCount}</span>}
                  </Link>
                </li>
                {!isLoggedIn ? (
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold" to="/login" onClick={closeNavbar}>
                      Sign in
                    </Link>
                  </li>
                ) : (
                  <li className="nav-item dropdown">
                    <button type="button" className="btn btn-link nav-link p-0 dropdown-toggle text-dark text-decoration-none" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User Menu">
                      <i className="bi bi-person fs-5" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to="/my-orders" onClick={closeNavbar}>My Orders</Link>
                      </li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>

              {/* Mobile sidebar: logo + close, Home, brands with expandable models (no search) */}
              <div className="mobile-sidebar-panel d-lg-none">
                <div className="mobile-sidebar-header d-flex align-items-center justify-content-between py-3 px-3 border-bottom">
                  <img
                    src={logoImg}
                    alt="FOXECOM"
                    className="header-logo header-logo-mobile"
                    width="130"
                    height="38"
                    loading="eager"
                  />
                  <button
                    type="button"
                    className="btn btn-link p-0 text-dark text-decoration-none"
                    aria-label="Close menu"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    onClick={closeNavbar}
                  >
                    <i className="bi bi-x fs-2" />
                  </button>
                </div>
                <div className="mobile-sidebar-body py-2">
                  <Link to="/" className="mobile-sidebar-link d-block py-2 px-3 text-uppercase fw-bold text-dark text-decoration-none" onClick={closeNavbar}>
                    Home
                  </Link>
                  {brands.map((b) => (
                    <div key={b.id} className="mobile-sidebar-brand border-top">
                      <button
                        type="button"
                        className="mobile-sidebar-link w-100 d-flex align-items-center justify-content-between py-2 px-3 text-uppercase fw-bold text-dark text-decoration-none bg-transparent border-0 text-start"
                        onClick={() => toggleMobileBrand(b.id)}
                      >
                        {b.name}
                        <i className={`bi bi-chevron-${mobileExpandedBrandId === b.id ? "up" : "down"} small`} />
                      </button>
                      {mobileExpandedBrandId === b.id && (
                        <div className="mobile-sidebar-models">
                          {(modelsByBrand[b.id] || []).length === 0 ? (
                            <div className="px-3 py-2 small text-muted">Loading...</div>
                          ) : (
                            (modelsByBrand[b.id] || []).map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                className="mobile-sidebar-model-link d-block w-100 text-start border-0 bg-transparent py-2 px-3 ps-4 small text-dark text-decoration-none"
                                onClick={() => handleModelClick(m.id)}
                              >
                                {m.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* <Link to="/shop" className="mobile-sidebar-link d-block py-2 px-3 text-uppercase fw-bold text-dark text-decoration-none border-top" onClick={closeNavbar}>
                    All Products
                  </Link> */}
                  <Link to="/contact-us" className="mobile-sidebar-link d-block py-2 px-3 text-uppercase fw-bold text-dark text-decoration-none" onClick={closeNavbar}>
                    Contact
                  </Link>
                  {/* <Link to="/order/0/track" className="mobile-sidebar-link d-block py-2 px-3 text-uppercase fw-bold text-dark text-decoration-none" onClick={closeNavbar}>
                    Track Order
                  </Link> */}
                </div>
              </div>
            </div>

            {/* Mobile only: cart (and account) on the right, outside sidebar */}
            <div className="d-flex align-items-center gap-2 d-lg-none order-last ms-2">
              <Link className="nav-link p-0 d-flex align-items-center" to="/cart" onClick={closeNavbar} aria-label="View Shopping Cart">
                <i className="bi bi-bag fs-5 text-dark" />
                {cartCount > 0 && <span className="ms-1 badge bg-dark rounded-pill">{cartCount}</span>}
              </Link>
              {!isLoggedIn ? (
                <Link
                  className="nav-link p-0"
                  to="/login"
                  onClick={closeNavbar}
                  aria-label="Sign in"
                >
                  <i className="bi bi-person fs-5 text-dark" />
                </Link>
              ) : (
                <div className="dropdown">
                  <button type="button" className="btn btn-link p-0 text-dark" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User Menu">
                    <i className="bi bi-person fs-5" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/my-orders" onClick={closeNavbar}>My Orders</Link></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom row: brand bar (desktop only) */}
      <div className="brand-bar border-bottom bg-white d-none d-lg-block">
        <div className="container">
          <div className="d-flex align-items-center justify-content-center overflow-auto flex-nowrap py-2 gap-1 gap-md-3">
            <Link
              to="/"
              className="brand-bar-item text-uppercase text-dark text-decoration-none fw-semibold small"
              onClick={closeNavbar}
            >
              Home
            </Link>
            {brands.map((b) => (
              <div
                key={b.id}
                className="brand-bar-item-wrapper position-relative d-inline-block"
                onMouseEnter={(e) => handleBrandMouseEnter(b.id, e)}
                onMouseLeave={handleBrandMouseLeave}
              >
                <span
                  className={`brand-bar-item text-uppercase text-dark text-decoration-none fw-semibold small d-inline-block ${hoverBrandId === b.id ? "brand-bar-item-active" : ""
                    }`}
                >
                  {b.name}
                </span>
                {hoverBrandId === b.id && (
                  <div
                    className="brand-dropdown position-fixed bg-white border shadow-sm py-2 min-w-200"
                    style={{ left: dropdownPos.left, top: dropdownPos.top, zIndex: 1050 }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {models.length === 0 ? (
                      <div className="px-3 py-2 small text-muted">Loading...</div>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {models.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              className="dropdown-model-btn w-100 text-start border-0 bg-transparent px-3 py-2 small text-dark text-uppercase"
                              onClick={() => handleModelClick(m.id)}
                            >
                              {m.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* <Link
              to="/shop"
              className="brand-bar-item text-uppercase text-dark text-decoration-none fw-semibold small"
              onClick={closeNavbar}
            >
              All Products
            </Link> */}
            <Link
              to="/contact-us"
              className="brand-bar-item text-uppercase text-dark text-decoration-none fw-semibold small"
              onClick={closeNavbar}
            >
              Contact
            </Link>
            {/* <Link
              to="/order/0/track"
              className="brand-bar-item text-uppercase text-dark text-decoration-none fw-semibold small"
              onClick={closeNavbar}
            >
              Track Order
            </Link> */}
          </div>
        </div>
      </div>

      <style>{`
        .brand-bar-item { white-space: nowrap; padding: 0.25rem 0.5rem; border-bottom: 2px solid transparent;  }
        .brand-bar-item:hover, .brand-bar-item-active { border-bottom-color: #000; }
        .brand-dropdown { max-height: 70vh; overflow-y: auto; }
        .dropdown-model-btn:hover { background-color: #f5f5f5 !important; }
        .brand-bar .d-flex { 
          justify-content: center !important; 
          width: 100%; 
          margin: 0 auto;
        }
        @media (max-width: 991.98px) {
          .brand-bar .d-flex { padding-left: 0.5rem; padding-right: 0.5rem; }
        }
        /* Mobile sidebar overlay */
        @media (max-width: 991.98px) {
          .navbar-collapse.collapse { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; max-width: 85vw; z-index: 1055; background: #fff; box-shadow: 4px 0 12px rgba(0,0,0,0.15); overflow-y: auto; flex-direction: column; padding: 0; margin: 0; border: none; }
          .navbar-collapse.collapse:not(.show) { display: none !important; }
          .navbar-collapse.collapse.show { display: flex !important; }
          .mobile-sidebar-panel { display: flex; flex-direction: column; width: 100%; min-height: 100%; }
          .mobile-sidebar-body { flex: 1; }
          .mobile-sidebar-link:hover, .mobile-sidebar-model-link:hover { background-color: #f5f5f5; }
          .mobile-sidebar-models { border-left: 2px solid #dee2e6; margin-left: 0.5rem; }
        }
        @media (min-width: 992px) {
          .mobile-sidebar-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;

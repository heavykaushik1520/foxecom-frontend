import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { API_BASE_URL } from "../../../utils/api";

const AddMobileCase = () => {
  const navigate = useNavigate();

  /* =========================
     DROPDOWN DATA
  ========================== */
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  /* =========================
     FORM STATES
  ========================== */
  const [productId, setProductId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");

  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [caseType, setCaseType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product search for dropdown
  const [productSearch, setProductSearch] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  // Brand & model search for dropdowns
  const [brandSearch, setBrandSearch] = useState("");
  const [brandLoading, setBrandLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  /* =========================
     PRODUCT DROPDOWN (SEARCH ONLY, NO PAGINATION)
     Uses:
       - GET /products         (initial load, big limit)
       - GET /products/search  (when typing)
  ========================== */
  const fetchProducts = async ({ search = "" } = {}) => {
    try {
      setProductLoading(true);

      let url;
      const trimmed = search.trim();

      if (trimmed) {
        // Search by name
        url = `${API_BASE_URL}/products/search?name=${encodeURIComponent(
          trimmed
        )}`;
      } else {
        // Initial / full load with a large limit so dropdown has enough options
        url = `${API_BASE_URL}/products?limit=500`;
      }

      const res = await fetch(url);
      const data = await res.json();

      // Normalize response:
      // - /products/search returns array (or 404)
      // - /products returns { products: [...] }
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.products)) {
        list = data.products;
      }

      setProducts(list);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setError("Failed to load products");
    } finally {
      setProductLoading(false);
    }
  };

  // Initial load (no search -> many products)
  useEffect(() => {
    fetchProducts({ search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search when user types product name
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProducts({ search: productSearch });
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch]);

  /* =========================
     FETCH BRANDS (SAFE)
  ========================== */
  const fetchBrands = async ({ search = "" } = {}) => {
    try {
      setBrandLoading(true);

      const params = new URLSearchParams();
      params.append("limit", 500);
      const trimmed = search.trim();
      if (trimmed) {
        params.append("search", trimmed);
      }

      const res = await fetch(
        `${API_BASE_URL}/mobile-brands?${params.toString()}`
      );
      const data = await res.json();

      // Backend returns { brands, pagination } or an array
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.brands)) {
        list = data.brands;
      }

      setBrands(list);
    } catch (err) {
      console.error(err);
      setBrands([]);
      setError("Failed to load brands");
    } finally {
      setBrandLoading(false);
    }
  };

  // Initial brands load
  useEffect(() => {
    fetchBrands({ search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced brand search
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchBrands({ search: brandSearch });
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSearch]);

  /* =========================
     FETCH MODELS (SAFE)
  ========================== */
  const fetchModels = async ({ search = "", brandIdFilter = "" } = {}) => {
    try {
      setModelLoading(true);

      const params = new URLSearchParams();
      params.append("limit", 500);
      const trimmed = search.trim();
      if (trimmed) {
        params.append("search", trimmed);
      }
      if (brandIdFilter) {
        params.append("brandId", brandIdFilter);
      }

      const res = await fetch(
        `${API_BASE_URL}/mobile-models?${params.toString()}`
      );
      const data = await res.json();

      // Backend returns { models, pagination } or an array
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.models)) {
        list = data.models;
      }

      setModels(list);
    } catch (err) {
      console.error(err);
      setModels([]);
      setError("Failed to load models");
    } finally {
      setModelLoading(false);
    }
  };

  // Initial models load (no filters)
  useEffect(() => {
    fetchModels({ search: "", brandIdFilter: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch models when brand changes
  useEffect(() => {
    // reset selected model when brand changes
    setModelId("");
    fetchModels({ search: modelSearch, brandIdFilter: brandId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  // Debounced model search
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchModels({ search: modelSearch, brandIdFilter: brandId });
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelSearch]);

  /* =========================
     SUBMIT CASE DETAILS
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productId ||
      !brandId ||
      !modelId ||
      !color ||
      !material ||
      !caseType
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${API_BASE_URL}/case-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            brandId,
            modelId,
            color,
            material,
            caseType,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create case details");
      }

      setSuccess("Case details created successfully");

      setTimeout(() => {
        navigate("/admin/mobile-case");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9 col-md-10">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-3">Add Case Details</h4>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && (
                <div className="alert alert-success">{success}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* PRODUCT (custom combo: dropdown + search in same input) */}
                  <div className="col-md-4 position-relative">
                    <label className="form-label">Product</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={productLoading ? "Loading products..." : "Type to search product..."}
                        value={productSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setProductSearch(value);
                          // Clear selected productId when user types free text
                          setProductId("");
                        }}
                        onFocus={() => setProductDropdownOpen(true)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setProductDropdownOpen((open) => !open)}
                      >
                        ▾
                      </button>
                    </div>
                    {productDropdownOpen && (
                      <div
                        className="border rounded mt-1 bg-white position-absolute w-100"
                        style={{ maxHeight: "220px", overflowY: "auto", zIndex: 1050 }}
                      >
                        {productLoading && (
                          <div className="px-2 py-1 text-muted small">Loading products...</div>
                        )}
                        {!productLoading && products.length === 0 && (
                          <div className="px-2 py-1 text-muted small">No products found</div>
                        )}
                        {!productLoading &&
                          products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className={`dropdown-item text-truncate ${
                                String(p.id) === String(productId) ? "active" : ""
                              }`}
                              onClick={() => {
                                setProductId(String(p.id));
                                setProductSearch(p.title || "");
                                setProductDropdownOpen(false);
                              }}
                            >
                              {p.title}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* BRAND (custom combo: dropdown + search in same input) */}
                  <div className="col-md-4 position-relative">
                    <label className="form-label">Brand</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={brandLoading ? "Loading brands..." : "Type to search brand..."}
                        value={brandSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBrandSearch(value);
                          // Clear selected brandId when user types free text
                          setBrandId("");
                        }}
                        onFocus={() => setBrandDropdownOpen(true)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setBrandDropdownOpen((open) => !open)}
                      >
                        ▾
                      </button>
                    </div>
                    {brandDropdownOpen && (
                      <div
                        className="border rounded mt-1 bg-white position-absolute w-100"
                        style={{ maxHeight: "220px", overflowY: "auto", zIndex: 1050 }}
                      >
                        {brandLoading && (
                          <div className="px-2 py-1 text-muted small">Loading brands...</div>
                        )}
                        {!brandLoading && brands.length === 0 && (
                          <div className="px-2 py-1 text-muted small">No brands found</div>
                        )}
                        {!brandLoading &&
                          brands.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              className={`dropdown-item text-truncate ${
                                String(b.id) === String(brandId) ? "active" : ""
                              }`}
                              onClick={() => {
                                setBrandId(String(b.id));
                                setBrandSearch(b.name || "");
                                setBrandDropdownOpen(false);
                              }}
                            >
                              {b.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* MODEL (custom combo: dropdown + search in same input, filtered by brand if selected) */}
                  <div className="col-md-4 position-relative">
                    <label className="form-label">Model</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={modelLoading ? "Loading models..." : "Type to search model..."}
                        value={modelSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setModelSearch(value);
                          // Clear selected modelId when user types free text
                          setModelId("");
                        }}
                        onFocus={() => setModelDropdownOpen(true)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setModelDropdownOpen((open) => !open)}
                      >
                        ▾
                      </button>
                    </div>
                    {modelDropdownOpen && (
                      <div
                        className="border rounded mt-1 bg-white position-absolute w-100"
                        style={{ maxHeight: "220px", overflowY: "auto", zIndex: 1050 }}
                      >
                        {modelLoading && (
                          <div className="px-2 py-1 text-muted small">Loading models...</div>
                        )}
                        {!modelLoading && models.length === 0 && (
                          <div className="px-2 py-1 text-muted small">No models found</div>
                        )}
                        {!modelLoading &&
                          models.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className={`dropdown-item text-truncate ${
                                String(m.id) === String(modelId) ? "active" : ""
                              }`}
                              onClick={() => {
                                setModelId(String(m.id));
                                setModelSearch(m.name || "");
                                setModelDropdownOpen(false);
                              }}
                            >
                              {m.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* COLOR */}
                  <div className="col-md-4">
                    <label className="form-label">Color</label>
                    <input
                      className="form-control"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>

                  {/* MATERIAL */}
                  <div className="col-md-4">
                    <label className="form-label">Material</label>
                    <input
                      className="form-control"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                </div>

                {/* CASE TYPE - Markdown editor */}
                <div className="row mt-3">
                  <div className="col-12">
                    <label className="form-label">Case Type</label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={caseType}
                        onChange={(val) => setCaseType(val || "")}
                        preview="edit"
                        height={240}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 d-flex gap-2 mt-3 text-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Create Case Details"}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMobileCase;

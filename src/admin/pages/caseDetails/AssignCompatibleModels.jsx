import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminAPI } from "../../../utils/api";

const emptyRow = () => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  brandId: "",
  modelId: "",
  priceOverride: "",
});

const AssignCompatibleModels = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const [brands, setBrands] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);

  const [rows, setRows] = useState([emptyRow()]);
  const [rowModels, setRowModels] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async ({ search = "" } = {}) => {
    try {
      setProductLoading(true);
      const trimmed = search.trim();
      const url = trimmed
        ? `${API_BASE_URL}/products/search?name=${encodeURIComponent(trimmed)}`
        : `${API_BASE_URL}/products?limit=500`;
      const res = await fetch(url);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.products)) list = data.products;
      setProducts(list);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setError("Failed to load products");
    } finally {
      setProductLoading(false);
    }
  };

  const fetchBrands = useCallback(async () => {
    try {
      setBrandLoading(true);
      const params = new URLSearchParams({ limit: 500 });
      const res = await fetch(`${API_BASE_URL}/mobile-brands?${params}`);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.brands)) list = data.brands;
      setBrands(list);
    } catch (err) {
      console.error(err);
      setBrands([]);
    } finally {
      setBrandLoading(false);
    }
  }, []);

  const fetchModelsForBrand = async (rowKey, brandId) => {
    if (!brandId) {
      setRowModels((prev) => ({ ...prev, [rowKey]: [] }));
      return;
    }
    try {
      const params = new URLSearchParams({ limit: 500, brandId });
      const res = await fetch(`${API_BASE_URL}/mobile-models?${params}`);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.models)) list = data.models;
      setRowModels((prev) => ({ ...prev, [rowKey]: list }));
    } catch (err) {
      console.error(err);
      setRowModels((prev) => ({ ...prev, [rowKey]: [] }));
    }
  };

  useEffect(() => {
    fetchProducts({ search: "" });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts({ search: productSearch }), 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleRowBrandChange = (rowKey, brandId) => {
    setRows((prev) =>
      prev.map((r) =>
        r.key === rowKey ? { ...r, brandId, modelId: "" } : r,
      ),
    );
    fetchModelsForBrand(rowKey, brandId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!productId) {
      setError("Select a product.");
      return;
    }

    const modelsPayload = rows
      .filter((r) => r.brandId && r.modelId)
      .map((r) => {
        const po = String(r.priceOverride || "").trim();
        return {
          brandId: parseInt(r.brandId, 10),
          modelId: parseInt(r.modelId, 10),
          priceOverride: po === "" ? null : po,
        };
      });

    if (modelsPayload.length === 0) {
      setError("Add at least one brand / model row.");
      return;
    }

    try {
      setLoading(true);
      await adminAPI.createProductAvailableModels({
        productId: parseInt(productId, 10),
        models: modelsPayload,
      });
      setSuccess("Compatible models saved. Duplicates are ignored by the server.");
      setTimeout(() => navigate("/admin/mobile-case"), 1600);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10 col-lg-11">
          <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-1">Assign compatible phone models</h4>
              <p className="text-muted small mb-0">
                For multi-model cases: map a product to many phones. Customers pick a model on the
                product page; optional per-model price overrides the product price.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/admin/mobile-case")}
            >
              Back
            </button>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-3 p-md-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4 position-relative">
                  <label className="form-label fw-semibold">Product</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        productLoading ? "Loading…" : "Search product by name…"
                      }
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductId("");
                      }}
                      onFocus={() => setProductDropdownOpen(true)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setProductDropdownOpen((open) => !open)
                      }
                    >
                      ▾
                    </button>
                  </div>
                  {productLoading && (
                    <div className="mt-2 placeholder-glow">
                      <span className="placeholder col-12" style={{ height: 40 }} />
                    </div>
                  )}
                  {productDropdownOpen && !productLoading && (
                    <div
                      className="border rounded mt-1 bg-white position-absolute w-100 shadow-sm"
                      style={{
                        maxHeight: 240,
                        overflowY: "auto",
                        zIndex: 1050,
                      }}
                    >
                      {products.length === 0 ? (
                        <div className="px-2 py-2 text-muted small">
                          No products
                        </div>
                      ) : (
                        products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`dropdown-item text-truncate w-100 text-start ${
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
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="table-responsive d-none d-md-block">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Price override (₹)</th>
                        <th style={{ width: 80 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key}>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={row.brandId}
                              disabled={brandLoading}
                              onChange={(e) =>
                                handleRowBrandChange(row.key, e.target.value)
                              }
                            >
                              <option value="">Select brand</option>
                              {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={row.modelId}
                              disabled={!row.brandId}
                              onChange={(e) =>
                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.key === row.key
                                      ? { ...r, modelId: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            >
                              <option value="">Select model</option>
                              {(rowModels[row.key] || []).map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="form-control form-control-sm"
                              placeholder="Optional"
                              value={row.priceOverride}
                              onChange={(e) =>
                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.key === row.key
                                      ? {
                                          ...r,
                                          priceOverride: e.target.value,
                                        }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                setRows((prev) =>
                                  prev.length > 1
                                    ? prev.filter((r) => r.key !== row.key)
                                    : prev,
                                )
                              }
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-md-none">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="border rounded p-3 mb-3 bg-light bg-opacity-50"
                    >
                      <div className="mb-2">
                        <label className="form-label small mb-1">Brand</label>
                        <select
                          className="form-select"
                          value={row.brandId}
                          disabled={brandLoading}
                          onChange={(e) =>
                            handleRowBrandChange(row.key, e.target.value)
                          }
                        >
                          <option value="">Select brand</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small mb-1">Model</label>
                        <select
                          className="form-select"
                          value={row.modelId}
                          disabled={!row.brandId}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.key === row.key
                                  ? { ...r, modelId: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        >
                          <option value="">Select model</option>
                          {(rowModels[row.key] || []).map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small mb-1">
                          Price override (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          placeholder="Optional"
                          value={row.priceOverride}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.key === row.key
                                  ? {
                                      ...r,
                                      priceOverride: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() =>
                          setRows((prev) =>
                            prev.length > 1
                              ? prev.filter((r) => r.key !== row.key)
                              : prev,
                          )
                        }
                      >
                        Remove row
                      </button>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      const nr = emptyRow();
                      setRows((prev) => [...prev, nr]);
                    }}
                  >
                    + Add model row
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving…" : "Save compatible models"}
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

export default AssignCompatibleModels;

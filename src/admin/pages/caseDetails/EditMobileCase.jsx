import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import {
  caseDetailsAPI,
  adminAPI,
  mobileBrandAPI,
  mobileModelAPI,
} from "../../../utils/api";

const HIGH_LIMIT = 500;

const EditMobileCase = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const [productId, setProductId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [caseType, setCaseType] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [initialCaseModel, setInitialCaseModel] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  useEffect(() => {
    if (brandId) {
      fetchModelsForBrand(brandId, initialCaseModel);
    } else {
      setModels([]);
    }
  }, [brandId]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setError("");

      const caseRes = await caseDetailsAPI.getById(id);
      const caseDetail = caseRes.caseDetail || caseRes;
      if (!caseDetail || !caseDetail.id) {
        setError("Case detail not found");
        setFetching(false);
        return;
      }

      const pid = caseDetail.productId != null ? String(caseDetail.productId) : "";
      const bid = caseDetail.brandId != null ? String(caseDetail.brandId) : "";
      const mid = caseDetail.modelId != null ? String(caseDetail.modelId) : "";

      setProductId(pid);
      setBrandId(bid);
      setModelId(mid);
      setColor(caseDetail.color || "");
      setMaterial(caseDetail.material || "");
      setCaseType(caseDetail.caseType || "");

      const [productsPayload, brandsPayload] = await Promise.all([
        adminAPI.getAllProductsForAdmin({ limit: HIGH_LIMIT }),
        mobileBrandAPI.getAll({ limit: HIGH_LIMIT }),
      ]);

      let productsList = [];
      if (Array.isArray(productsPayload)) {
        productsList = productsPayload;
      } else if (Array.isArray(productsPayload?.products)) {
        productsList = productsPayload.products;
      } else if (productsPayload?.data?.products) {
        productsList = productsPayload.data.products;
      }
      if (caseDetail.product && !productsList.some((p) => p.id === caseDetail.product.id)) {
        productsList = [caseDetail.product, ...productsList];
      }
      setProducts(productsList);

      let brandsList = [];
      if (Array.isArray(brandsPayload)) {
        brandsList = brandsPayload;
      } else if (Array.isArray(brandsPayload?.brands)) {
        brandsList = brandsPayload.brands;
      }
      if (caseDetail.brand && !brandsList.some((b) => b.id === caseDetail.brand.id)) {
        brandsList = [caseDetail.brand, ...brandsList];
      }
      setBrands(brandsList);

      setInitialCaseModel(caseDetail.model || null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load case details");
    } finally {
      setFetching(false);
    }
  };

  const fetchModelsForBrand = async (selectedBrandId, modelToInclude = null) => {
    if (!selectedBrandId) {
      setModels([]);
      return;
    }
    try {
      const modelsPayload = await mobileModelAPI.getAll({
        brandId: selectedBrandId,
        limit: HIGH_LIMIT,
      });
      let list = [];
      if (Array.isArray(modelsPayload)) {
        list = modelsPayload;
      } else if (Array.isArray(modelsPayload?.models)) {
        list = modelsPayload.models;
      }
      const bid = parseInt(selectedBrandId, 10);
      if (modelToInclude && modelToInclude.brandId === bid && !list.some((m) => m.id === modelToInclude.id)) {
        list = [modelToInclude, ...list];
      }
      setModels(list);
    } catch (err) {
      console.error(err);
      setModels([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pid = productId ? parseInt(productId, 10) : null;
    const bid = brandId ? parseInt(brandId, 10) : null;
    const mid = modelId ? parseInt(modelId, 10) : null;

    if (!pid || !bid || !mid) {
      setError("Product, Brand, and Model are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await adminAPI.updateCaseDetail(id, {
        productId: pid,
        brandId: bid,
        modelId: mid,
        color: color || null,
        material: material || null,
        caseType: caseType || null,
      });

      setSuccess("Case details updated successfully");
      setTimeout(() => navigate("/admin/mobile-case"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update case details");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Mobile Case Details</h4>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/admin/mobile-case")}
        >
          Back to Mobile Cases
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productId" className="form-label">
                Product *
              </label>
              <select
                className="form-select"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.title}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <small className="text-muted">No products available. Add products first.</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="brandId" className="form-label">
                Brand *
              </label>
              <select
                className="form-select"
                id="brandId"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setModelId("");
                }}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {brands.length === 0 && (
                <small className="text-muted">No brands available. Add mobile brands first.</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="modelId" className="form-label">
                Model *
              </label>
              <select
                className="form-select"
                id="modelId"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                required
                disabled={!brandId}
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.id} value={String(model.id)}>
                    {model.name}
                  </option>
                ))}
              </select>
              {brandId && models.length === 0 && (
                <small className="text-muted">No models for this brand. Add mobile models first.</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="color" className="form-label">
                Color
              </label>
              <input
                type="text"
                className="form-control"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="material" className="form-label">
                Material
              </label>
              <input
                type="text"
                className="form-control"
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="caseType" className="form-label">
                Case Type
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={caseType}
                  onChange={(val) => setCaseType(val || "")}
                  preview="edit"
                  height={180}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update Case Details"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/mobile-case")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMobileCase;

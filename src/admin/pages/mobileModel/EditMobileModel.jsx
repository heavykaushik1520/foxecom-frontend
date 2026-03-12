import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mobileModelAPI, mobileBrandAPI, adminAPI } from "../../../utils/api";

const EditMobileModel = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [modelData, brandsData] = await Promise.all([
        mobileModelAPI.getById(id),
        mobileBrandAPI.getAll(),
      ]);
      setName(modelData.name || "");
      setBrandId(modelData.brandId || "");
      setBrands(brandsData.brands || []);
      
      // console.log("modelData", modelData);
      console.log("brandsData", brandsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load mobile model");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !brandId) {
      setError("Name and brand are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await adminAPI.updateMobileModel(id, { name, brandId: parseInt(brandId) });

      setSuccess("Mobile model updated successfully");
      setTimeout(() => {
        navigate("/admin/mobile-model");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update mobile model");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Mobile Model</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/mobile-model")}
        >
          Back to Mobile Models
        </button>
      </div>

      <div className="card">
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
              <label htmlFor="brandId" className="form-label">
                Brand *
              </label>
              <select
                className="form-select"
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Model Name *
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Model"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/mobile-model")}
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

export default EditMobileModel;

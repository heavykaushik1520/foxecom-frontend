import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mobileBrandAPI, adminAPI } from "../../../utils/api";

const MobileBrandDashboard = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [search, setSearch] = useState("");

  /* =========================
     FETCH BRANDS
  ========================== */
  useEffect(() => {
    fetchBrands();
  }, [pagination.page, search]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) {
        params.search = search;
      }

      const data = await mobileBrandAPI.getAll(params);
      // Handle response format
      const brandsList = data.brands || (Array.isArray(data) ? data : []);
      setBrands(brandsList);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load brands");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?\n\nNote: Brands with associated models or case details cannot be deleted.")) {
      return;
    }

    try {
      await adminAPI.deleteMobileBrand(id);
      setSuccessMessage("Brand deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete brand. Make sure it has no associated models or case details.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) {
      alert("Please select brands to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedBrands.length} brand(s)?\n\nNote: Brands with associated models or case details cannot be deleted.`)) {
      return;
    }

    try {
      const result = await adminAPI.bulkDeleteMobileBrands(selectedBrands);
      if (result.brandsWithDependencies && result.brandsWithDependencies.length > 0) {
        alert(`Some brands have dependencies and cannot be deleted:\n${result.brandsWithDependencies.map(b => b.name).join(', ')}`);
      } else {
        setSuccessMessage(`${selectedBrands.length} brand(s) deleted successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      setSelectedBrands([]);
      fetchBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete brands");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBrands(brands.map(b => b.id));
    } else {
      setSelectedBrands([]);
    }
  };

  const handleSelectBrand = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };
  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0 text-uppercase">Brands</h4>
        <div className="d-flex gap-2">
          {selectedBrands.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedBrands.length})
            </button>
          )}
          <Link to={"/admin/mobile-brand/add"} className="btn btn-primary">
            + Add Brand
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search brands by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <div className="col-md-6 text-end">
              {/* Intentionally hide "Showing X of Y brands" summary. */}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Content Card */}
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-3 mb-0 text-muted">Loading brands...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && brands.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No brands found</p>
              <Link to={"/admin/mobile-brand/add"} className="btn btn-sm btn-primary">
                Add Your First Brand
              </Link>
            </div>
          )}

          {/* Table */}
          {!loading && !error && brands.length > 0 && (
            <>
              <div className="d-flex justify-content-end align-items-center mb-3">
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedBrands.length === brands.length && brands.length > 0}
                    onChange={handleSelectAll}
                  />
                  <small className="text-muted">Select All</small>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedBrands.length === brands.length && brands.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Brand Name</th>
                      <th>Models</th>
                      <th>Creation Date</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {brands.map((brand, index) => (
                      <tr key={brand.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedBrands.includes(brand.id)}
                            onChange={() => handleSelectBrand(brand.id)}
                          />
                        </td>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td className="fw-medium">{brand.name}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {brand.mobileModels?.length || 0} models
                          </span>
                        </td>
                        <td className="text-muted small">
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-center">
                          <Link 
                            to={`/admin/mobile-brand/details/${brand.id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="View Brand Details"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/admin/mobile-brand/edit/${brand.id}`}
                            className="btn btn-sm btn-outline-secondary me-2"
                            title="Edit Brand"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(brand.id)}
                            title="Delete Brand"
                            disabled={brand.mobileModels && brand.mobileModels.length > 0}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div />
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-primary"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileBrandDashboard;

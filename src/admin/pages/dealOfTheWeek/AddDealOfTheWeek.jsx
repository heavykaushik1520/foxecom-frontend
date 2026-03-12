import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, dealOfTheWeekAPI, getImageUrl } from "../../../utils/api";

const AddDealOfTheWeek = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "Deal of the Week",
    description: "",
    isActive: true,
    startDate: "",
    endDate: "",
    productIds: [],
  });

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };
      if (searchTerm) {
        params.search = searchTerm;
      }

      const data = await adminAPI.getAllProductsForAdmin(params);
      const productsList = data.products || data.data?.products || [];
      setProducts(productsList);

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageIds = products.map((p) => p.id);
      setSelectedProducts((prev) => {
        const combined = [...new Set([...prev, ...currentPageIds])];
        return combined;
      });
    } else {
      const currentPageIds = products.map((p) => p.id);
      setSelectedProducts((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await dealOfTheWeekAPI.create({
        title: formData.title,
        description: formData.description || null,
        isActive: formData.isActive,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        productIds: selectedProducts,
      });

      setSuccess("Deal of the Week created successfully!");
      setTimeout(() => {
        navigate("/admin/deal-of-the-week");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Add Deal of the Week</h4>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin/deal-of-the-week")}
        >
          Back
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-primary bg-opacity-10">
                <h5 className="mb-0">Deal Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active (visible on homepage)
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="startDate" className="form-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="endDate" className="form-label">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-success bg-opacity-10">
                <h5 className="mb-0">
                  Select Products <span className="text-danger">*</span>
                  {selectedProducts.length > 0 && (
                    <span className="badge bg-primary ms-2">
                      {selectedProducts.length} selected
                    </span>
                  )}
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>

                {loadingProducts ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-muted text-center py-3">No products found</p>
                ) : (
                  <>
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAll"
                          checked={
                            products.length > 0 &&
                            products.every((p) => selectedProducts.includes(p.id))
                          }
                          onChange={handleSelectAll}
                        />
                        <label className="form-check-label" htmlFor="selectAll">
                          Select All (Current Page)
                        </label>
                      </div>
                    </div>

                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.375rem",
                        padding: "0.5rem",
                      }}
                    >
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="d-flex align-items-center gap-2 p-2 border-bottom"
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductToggle(product.id)}
                          />
                          <img
                            src={getImageUrl(product.thumbnailImage)}
                            alt={product.title}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "0.25rem",
                            }}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{product.title}</div>
                            <small className="text-muted">
                              Rs. {parseFloat(product.price || 0).toFixed(2)}
                              {product.discountPrice &&
                                ` (Rs. ${parseFloat(product.discountPrice).toFixed(2)})`}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pagination.totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          Page {pagination.page} of {pagination.totalPages}
                        </small>
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.max(1, prev.page - 1),
                              }))
                            }
                            disabled={pagination.page === 1}
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.min(prev.totalPages, prev.page + 1),
                              }))
                            }
                            disabled={pagination.page === pagination.totalPages}
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
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin/deal-of-the-week")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creating...
              </>
            ) : (
              "Create Deal"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDealOfTheWeek;

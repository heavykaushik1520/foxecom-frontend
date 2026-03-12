import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI, getImageUrl } from "../../../utils/api";
import fallbackImage from '../../../assest/images/product-item1.jpg';

const ProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    sortBy: "createdAt",
    sortOrder: "DESC"
  });

  /* =========================
     FETCH PRODUCTS
  ========================== */
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = filters.inStock;

      const data = await adminAPI.getAllProductsForAdmin(params);
      
      // Handle response format
      const productsList = data.products || data.data?.products || [];
      setProducts(productsList);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      await adminAPI.bulkDeleteProducts(selectedProducts);
      alert("Products deleted successfully");
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete products");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteProduct = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingProductId(productId);
      await adminAPI.deleteProduct(productId);
      alert("Product deleted successfully");
      // Remove from selected products if it was selected
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      // Refresh the product list
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0 text-uppercase">PRODUCTS</h4>
        <div className="d-flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          <Link to={"/admin/products/add"} className="btn btn-primary">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Search</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by title or SKU..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Category</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Category ID"
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Min Price</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Max Price</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Stock</label>
              <select
                className="form-select form-select-sm"
                value={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.value)}
              >
                <option value="">All</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label small fw-semibold">Sort</label>
              <select
                className="form-select form-select-sm"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  handleFilterChange('sortBy', field);
                  handleFilterChange('sortOrder', order);
                }}
              >
                <option value="createdAt-DESC">Newest</option>
                <option value="createdAt-ASC">Oldest</option>
                <option value="title-ASC">Name A-Z</option>
                <option value="title-DESC">Name Z-A</option>
                <option value="price-ASC">Price Low-High</option>
                <option value="price-DESC">Price High-Low</option>
                <option value="stock-DESC">Stock High-Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-3 mb-0 text-muted">Loading products...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="alert alert-danger mb-0">{error}</div>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No products found</p>
              <p className="small">Try adjusting your filters</p>
            </div>
          )}

          {/* Products Table */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <small className="text-muted">
                    Showing {products.length} of {pagination.totalItems} products
                  </small>
                </div>
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedProducts.length === products.length && products.length > 0}
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
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Thumbnail</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Stock</th>
                      <th>Created</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </td>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>

                        <td>
                          <img
                            src={getImageUrl(product.thumbnailImage)}
                            alt={product.title}
                            width="50"
                            height="50"
                            className="rounded"
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src = fallbackImage;
                            }}
                          />
                        </td>

                        <td className="fw-medium">{product.title}</td>

                        <td>{product.category?.name || "-"}</td>

                        <td>₹{parseFloat(product.price || 0).toFixed(2)}</td>

                        <td>
                          {product.discountPrice ? (
                            <span className="text-success">₹{parseFloat(product.discountPrice).toFixed(2)}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        <td>
                          <span className={product.stock > 0 ? "text-success" : "text-danger"}>
                            {product.stock || 0}
                          </span>
                        </td>

                        <td className="text-muted small">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>

                        <td className="text-center">
                          <Link
                            to={`/admin/products/view/${product.id}`} 
                            className="btn btn-sm btn-outline-primary me-2"
                            title="View Details"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="btn btn-sm btn-outline-secondary me-2"
                            title="Edit Product"
                          >
                            Edit
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product.id, product.title)}
                            title="Delete Product"
                            disabled={deletingProductId === product.id}
                          >
                            {deletingProductId === product.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Page {pagination.page} of {pagination.totalPages}
                    </small>
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
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

export default ProductsDashboard;

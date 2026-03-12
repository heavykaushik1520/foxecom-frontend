import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryAPI, adminAPI } from "../../utils/api";

const CategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, search]);

  const fetchCategories = async () => {
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

      const data = await categoryAPI.getAll(params);
      // Handle both new format (with success) and legacy format
      const categoriesList = data.categories || data;
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await adminAPI.deleteCategory(id);
      setSuccessMessage("Category deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete category. Make sure it has no products.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      alert("Please select categories to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} category(ies)?\n\nNote: Categories with products cannot be deleted.`)) {
      return;
    }

    try {
      const result = await adminAPI.bulkDeleteCategories(selectedCategories);
      if (result.categoriesWithProducts && result.categoriesWithProducts.length > 0) {
        alert(`Some categories have products and cannot be deleted:\n${result.categoriesWithProducts.map(c => c.name).join(', ')}`);
      } else {
        setSuccessMessage(`${selectedCategories.length} category(ies) deleted successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      setSelectedCategories([]);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete categories");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(categories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0">Categories</h4>
        <div className="d-flex gap-2">
          {selectedCategories.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedCategories.length})
            </button>
          )}
          <Link to={"/admin/categories/add"} className="btn btn-primary">
            + Add New Category
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
                placeholder="Search categories by name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <div className="col-md-6 text-end">
              <p className="mb-0 text-muted">
                Showing {categories.length} of {pagination.totalItems} categories
              </p>
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
              <p className="mt-3 mb-0 text-muted">Loading categories...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No categories found</p>
              <Link to={"/admin/categories/add"} className="btn btn-sm btn-primary">
                Add Your First Category
              </Link>
            </div>
          )}

          {/* Table */}
          {!loading && !error && categories.length > 0 && (
            <>
              <div className="d-flex justify-content-end align-items-center mb-3">
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedCategories.length === categories.length && categories.length > 0}
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
                          checked={selectedCategories.length === categories.length && categories.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Products</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((cat, index) => (
                      <tr key={cat.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => handleSelectCategory(cat.id)}
                          />
                        </td>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td className="fw-medium">{cat.name}</td>
                        <td className="text-muted small">{cat.slug}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {cat.products?.length || 0} products
                          </span>
                        </td>
                        <td className="text-muted small">
                          {new Date(cat.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/admin/categories/edit/${cat.id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Category"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat.id)}
                            title={cat.products && cat.products.length > 0 ? "Cannot delete: Has products" : "Delete Category"}
                            disabled={cat.products && cat.products.length > 0}
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
                  <div className="text-muted">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total categories)
                  </div>
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

export default CategoryDashboard;

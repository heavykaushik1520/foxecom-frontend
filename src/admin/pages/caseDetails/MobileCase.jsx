import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { caseDetailsAPI, getImageUrl } from "../../../utils/api";
import fallbackImage from '../../../assest/images/product-item1.jpg';

const MobileCase = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalItems: 0,
  });

  /* =========================
         FETCH CASE DETAILS
      ========================== */
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };
        const data = await caseDetailsAPI.getAll(params);
        // Backend returns { caseDetails: [...], totalItems, totalPages, currentPage }
        // Handle both new format and legacy format
        const casesList = data.caseDetails || data.cases || data.data || data;
        setCases(Array.isArray(casesList) ? casesList : []);
        
        if (data.pagination || data.totalPages) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.pagination?.totalPages || data.totalPages || 1,
            totalItems: data.pagination?.totalItems || data.totalItems || 0,
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to fetch case details");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [pagination.page]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
        <h4 className="mb-0 text-uppercase">MOBILE CASES</h4>
        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-stretch justify-content-md-end">
          <Link
            to={"/admin/mobile-case/assign-models"}
            className="btn btn-outline-primary flex-grow-1 flex-md-grow-0"
          >
            Compatible models
          </Link>
          <Link to={"/admin/mobile-case/add"} className="btn btn-primary flex-grow-1 flex-md-grow-0">
            + Add Case
          </Link>
        </div>
      </div>

      {/* Info Bar */}
      {!loading && !error && cases.length > 0 && (
        <div className="card mb-3">
          <div className="card-body py-2">
            <p className="mb-0 text-muted text-end">
              Showing {cases.length} of {pagination.totalItems} cases
            </p>
          </div>
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
          {/* Empty State */}
          {!loading && !error && cases.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No mobile cases found</p>
              <Link to={"/admin/mobile-case/add"} className="btn btn-sm btn-primary">
                Add Your First Case
              </Link>
            </div>
          )}

          {/* Cases Grid */}
          {!loading && !error && cases.length > 0 && (
            <React.Fragment>
              <div className="row g-3">
                {cases.map((item) => (
                  <div key={item.id} className="col-xl-4 col-lg-6 col-md-6">
                    <div className="card h-100 shadow-sm border-0">
                      {/* PRODUCT THUMBNAIL */}
                      {item.product?.thumbnailImage && (
                        <img
                          src={getImageUrl(item.product.thumbnailImage)}
                          alt={item.product.title || "Product"}
                          className="card-img-top"
                          style={{ height: 200, objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = fallbackImage;
                          }}
                        />
                      )}

                      <div className="card-body">
                        <h6 className="fw-bold mb-3">{item.product?.title || "N/A"}</h6>

                        <div className="mb-2">
                          <strong>Brand:</strong>{" "}
                          <span className="badge bg-info">
                            {item.brand?.name || item.mobileBrands?.name || "N/A"}
                          </span>
                        </div>

                        <div className="mb-2">
                          <strong>Model:</strong>{" "}
                          <span className="badge bg-secondary">
                            {item.model?.name || item.mobileModels?.name || "N/A"}
                          </span>
                        </div>

                        <div className="mb-2">
                          <strong>Color:</strong> {item.color || "N/A"}
                        </div>

                        <div className="mb-2">
                          <strong>Material:</strong> {item.material || "N/A"}
                        </div>

                        <div className="mb-2">
                          <strong>Case Type:</strong>{" "}
                          <div className="case-type-preview d-inline">
                            {item.caseType ? (
                              <MarkdownPreview
                                source={item.caseType}
                                wrapperElement={{ 'data-color-mode': 'light' }}
                                style={{ fontSize: '0.9rem', lineHeight: '1.4', display: 'inline', margin: 0 }}
                              />
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card-footer bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {item.product?.discountPrice &&
                            parseFloat(item.product.discountPrice) < parseFloat(item.product?.price || 0) ? (
                              <>
                                <span className="text-muted text-decoration-line-through">
                                  ₹{parseFloat(item.product?.price || 0).toFixed(2)}
                                </span>
                                <strong className="text-success ms-2">
                                  ₹{parseFloat(item.product.discountPrice).toFixed(2)}
                                </strong>
                              </>
                            ) : (
                              <strong className="text-success">
                                ₹{parseFloat(item.product?.price || 0).toFixed(2)}
                              </strong>
                            )}
                          </div>
                          <div>
                            <span className={`badge ${(item.product?.stock || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                              Stock: {item.product?.stock || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer bg-white border-top">
                        <div className="d-flex gap-2">
                          <Link
                            to={`/admin/mobile-case/edit/${item.id}`}
                            className="btn btn-sm btn-outline-primary flex-fill"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/admin/products/view/${item.productId}`}
                            className="btn btn-sm btn-outline-secondary flex-fill"
                          >
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total cases)
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
            </React.Fragment>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileCase;

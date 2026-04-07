import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryAPI, productAPI, reviewAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

/**
 * Dedicated category listing at /category/:slug — category metadata + paginated filter API
 * (same product shape as shop). Layout and cards match home product sections (LatestProducts, etc.).
 */
const CategoryPage = () => {
  const { slug: slugParam } = useParams();
  const slug = slugParam != null ? String(slugParam).trim() : '';
  const { addToCart } = useCart();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
  });
  const [ratingsMap, setRatingsMap] = useState({});

  const loadCategory = useCallback(async () => {
    if (!slug) {
      setError('Invalid category link.');
      setCategory(null);
      setLoadingCategory(false);
      return;
    }

    setCategory(null);
    setProducts([]);
    setRatingsMap({});
    setPagination((p) => ({ ...p, page: 1, totalItems: 0, totalPages: 1 }));
    setLoadingCategory(true);
    setError(null);
    try {
      const data = await categoryAPI.getById(slug, { includeProducts: false });
      const cat = data?.category ?? data;
      if (!cat?.id) {
        setError('Category not found.');
        setCategory(null);
        return;
      }
      setCategory(cat);
      if (typeof document !== 'undefined' && cat.name) {
        document.title = `${cat.name} | Shop`;
      }
    } catch (err) {
      setCategory(null);
      setError(err?.message || 'Could not load this category.');
    } finally {
      setLoadingCategory(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const loadProducts = useCallback(async () => {
    if (!category?.id) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        categoryId: String(category.id),
      };

      const response = await productAPI.filterAndSort(params);

      if (response.success && response.data) {
        setProducts(response.data.products || []);
        if (response.data.pagination) {
          const pg = response.data.pagination;
          setPagination((prev) => ({
            ...prev,
            totalItems: pg.totalItems || 0,
            totalPages: pg.totalPages || 1,
            page: pg.currentPage ?? prev.page,
          }));
        }
      } else if (response.products) {
        setProducts(response.products || []);
        if (response.totalPages != null) {
          setPagination((prev) => ({
            ...prev,
            totalItems: response.totalItems || 0,
            totalPages: response.totalPages || 1,
            page: response.currentPage ?? prev.page,
          }));
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('CategoryPage: failed to load products', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [category?.id, pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    if (!category?.id) return;
    loadProducts();
  }, [category?.id, loadProducts]);

  useEffect(() => {
    if (products.length === 0) return;

    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (product) => {
            try {
              const data = await reviewAPI.getByProduct(product.id);
              return [
                product.id,
                {
                  averageRating: data.averageRating || 0,
                  reviewCount: data.totalCount ?? data.reviews?.length ?? 0,
                  fiveStarCount: Number(data?.distribution?.[5] || data?.distribution?.['5']) || 0,
                },
              ];
            } catch {
              return [product.id, { averageRating: 0, reviewCount: 0, fiveStarCount: 0 }];
            }
          })
        );
        setRatingsMap(Object.fromEntries(entries));
      } catch (e) {
        console.error('CategoryPage: ratings fetch failed', e);
      }
    };

    fetchRatings();
  }, [products]);

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const showGridSkeleton =
    (loadingCategory || loadingProducts) && products.length === 0 && category;

  const viewAllBtnStyle = {
    borderColor: '#547535',
    color: '#547535',
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
  };

  if (!slug) {
    return (
      <section className="latest-products padding-large bg-light">
        <div className="container text-center py-5">
          <p className="text-muted mb-3">Invalid category link.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse shop
          </Link>
        </div>
      </section>
    );
  }

  if (error && !category) {
    return (
      <section className="latest-products padding-large bg-light">
        <div className="container text-center py-5">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }} />
          <h1 className="h4 mt-3 fw-semibold">Something went wrong</h1>
          <p className="text-muted">{error}</p>
          <Link to="/shop" className="btn btn-primary mt-2">
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="latest-products padding-large bg-light shop-page">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/shop">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {loadingCategory ? '…' : category?.name || 'Category'}
            </li>
          </ol>
        </nav>

        <div className="row">
          <div className="display-header d-flex flex-wrap justify-content-between align-items-center mb-0 pb-3 border-bottom gap-3">
            <div className="flex-grow-1 min-w-0">
              {loadingCategory ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-12 col-md-8" style={{ height: '2rem' }} />
                </div>
              ) : (
                <>
                  <h1 className="display-7 text-dark text-uppercase mb-0">
                    {category?.name || 'Category'}
                  </h1>
                  {category && pagination.totalItems > 0 && (
                    <p className="text-muted mb-0 small mt-2">
                      {pagination.totalItems} product{pagination.totalItems === 1 ? '' : 's'}
                    </p>
                  )}
                </>
              )}
            </div>

            {category && (
              <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
                <Link
                  to="/shop"
                  className="btn text-uppercase btn-sm"
                  style={viewAllBtnStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#547535';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#547535';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#547535';
                    e.currentTarget.style.borderColor = '#547535';
                  }}
                >
                  All categories
                </Link>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 small text-nowrap" htmlFor="category-sort">
                    Sort by
                  </label>
                  <select
                    id="category-sort"
                    className="form-select form-select-sm"
                    style={{ width: 'auto', minWidth: '150px', fontSize: '0.9rem' }}
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                  >
                    <option value="createdAt-DESC">Newest First</option>
                    <option value="createdAt-ASC">Oldest First</option>
                    <option value="price-ASC">Price: Low to High</option>
                    <option value="price-DESC">Price: High to Low</option>
                    <option value="title-ASC">Name: A to Z</option>
                    <option value="title-DESC">Name: Z to A</option>
                    <option value="stock-DESC">Stock: High to Low</option>
                    <option value="discount-DESC">Best Discount</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {showGridSkeleton && (
            <div className="row mt-4">
              {Array.from({ length: pagination.limit }).map((_, i) => (
                <div key={i} className="col-lg-4 col-md-6 col-sm-6 mb-4">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && products.length > 0 && (
            <div className="row mt-4">
              {products.map((product) => {
                const productData = {
                  id: product.id,
                  title: product.title || product.name,
                  slug: product.slug,
                  price: parseFloat(product.price || 0),
                  discountPrice: product.discountPrice != null ? parseFloat(product.discountPrice) : null,
                  thumbnailImage: product.thumbnailImage,
                  images: product.images,
                  rating:
                    ratingsMap[product.id]?.averageRating ??
                    product.rating ??
                    product.averageRating ??
                    0,
                  reviewCount:
                    ratingsMap[product.id]?.reviewCount ??
                    product.reviewCount ??
                    product.reviewsCount ??
                    0,
                  fiveStarCount:
                    ratingsMap[product.id]?.fiveStarCount ??
                    product?.ratingSummary?.count5 ??
                    product?.count5 ??
                    0,
                  inStock: product.stock != null ? product.stock > 0 : product.inStock !== false,
                  category: product.category,
                  sku: product.sku ?? '',
                };

                return (
                  <div key={product.id} className="col-lg-4 col-md-6 col-sm-6 mb-4">
                    <ProductCard product={productData} onAddToCart={handleAddToCart} />
                  </div>
                );
              })}
            </div>
          )}

          {!loadingProducts && category && products.length === 0 && (
            <div className="text-center py-5 mt-4">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }} />
              <h2 className="h4 mt-3 fw-semibold" style={{ fontSize: '1.25rem' }}>
                No products in this category yet
              </h2>
              <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                Check back soon or browse our full catalog.
              </p>
              <Link
                to="/shop"
                className="btn text-uppercase mt-3"
                style={viewAllBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#547535';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#547535';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#547535';
                  e.currentTarget.style.borderColor = '#547535';
                }}
              >
                Browse shop
              </Link>
            </div>
          )}

          {!loadingProducts && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination shop-pagination">
                  <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => {
                        setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={pagination.page === 1}
                    >
                      <i className="bi bi-chevron-left" /> Previous
                    </button>
                  </li>

                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => {
                            setPagination((prev) => ({ ...prev, page: pageNum }));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => {
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next <i className="bi bi-chevron-right" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;

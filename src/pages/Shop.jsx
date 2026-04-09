import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { reviewAPI, productAPI, categoryAPI, getImageUrl } from '../utils/api'
import { getProductPathSegment } from '../utils/productPath'
import { useCart } from '../contexts/CartContext'
import fallbackImage from '../assest/images/product-item1.jpg'
import ProductRatingExpandable from '../components/ProductRatingExpandable'

/** Strip markdown to plain text for filter dropdown labels */
function stripMarkdownLabel(text) {
  if (!text || typeof text !== 'string') return text || ''
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*?(.*?)\*\*?/g, '$1')
    .replace(/__?(.*?)__?/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 80) || text
}

const Shop = () => {
  const { addToCart, buyNow } = useCart()
  const navigate = useNavigate()
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 576 : false
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const modelIdFromUrl = searchParams.get('modelId') || ''
  const categoryIdFromUrl = searchParams.get('categoryId') || ''
  const categorySlugFromUrl = searchParams.get('categorySlug') || ''
  const brandNameFromUrl = searchParams.get('brandName') || ''

  // State management
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filterOptions, setFilterOptions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states (modelId can come from URL when user clicks a model in navbar)
  const [filters, setFilters] = useState({
    categoryId: '',
    brandName: '',
    modelName: '',
    modelId: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    color: '',
    material: '',
    caseType: '',
    search: ''
  })

  // Sort states
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('DESC')

  // Pagination states - Initialize from URL params if available
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
    totalItems: 0,
    totalPages: 1
  })

  const [ratingsMap, setRatingsMap] = useState({})

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 576)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load filter options when category changes
  useEffect(() => {
    if (filters.categoryId) {
      loadFilterOptions(filters.categoryId)
    } else {
      loadFilterOptions()
    }
  }, [filters.categoryId])

  // Sync modelId from URL into filters (e.g. from navbar model click)
  useEffect(() => {
    if (modelIdFromUrl) {
      setFilters(prev => ({ ...prev, modelId: modelIdFromUrl }))
    }
  }, [modelIdFromUrl])

  // Sync categoryId from URL into filters (e.g. from FOXECOM Originals click)
  useEffect(() => {
    if (categoryIdFromUrl) {
      setFilters((prev) => ({ ...prev, categoryId: categoryIdFromUrl }))
    }
  }, [categoryIdFromUrl])

  // Sync categorySlug from URL into filters (SEO-friendly; we still filter by numeric categoryId internally)
  useEffect(() => {
    if (!categorySlugFromUrl) return
    if (categoryIdFromUrl) return // prefer numeric id when both exist

    const loadCategoryIdFromSlug = async () => {
      try {
        const data = await categoryAPI.getById(categorySlugFromUrl)
        const category = data.category || data
        if (category?.id != null) {
          setFilters((prev) => ({ ...prev, categoryId: String(category.id) }))
        }
      } catch (err) {
        console.error('Failed to resolve category slug:', err)
      }
    }

    loadCategoryIdFromSlug()
  }, [categorySlugFromUrl, categoryIdFromUrl])

  // Sync brandName from URL into filters (e.g. from homepage brand section CTA)
  useEffect(() => {
    if (brandNameFromUrl) {
      setFilters((prev) => ({ ...prev, brandName: brandNameFromUrl }))
    }
  }, [brandNameFromUrl])

  // Load products when filters, sort, or pagination changes
  useEffect(() => {
    loadProducts()
    // Update URL params when page changes
    const params = new URLSearchParams(searchParams)
    if (pagination.page > 1) {
      params.set('page', pagination.page.toString())
    } else {
      params.delete('page')
    }
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, sortOrder, pagination.page])

  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      // Handle both new format (with categories property) and legacy format (direct array)
      const categoriesArray = Array.isArray(data) ? data : (data?.categories || [])
      setCategories(categoriesArray)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }


  useEffect(() => {
    if (products.length === 0) return

    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (product) => {
            try {
              const data = await reviewAPI.getByProduct(product.id)
              return [
                product.id,
                {
                  averageRating: data.averageRating || 0,
                  reviewCount: data.totalCount ?? data.reviews?.length ?? 0,
                  fiveStarCount: Number(data?.distribution?.[5] || data?.distribution?.['5']) || 0,
                },
              ]
            } catch {
              return [product.id, { averageRating: 0, reviewCount: 0, fiveStarCount: 0 }]
            }
          })
        )

        setRatingsMap(Object.fromEntries(entries))
      } catch (err) {
        console.error('Failed to load ratings', err)
      }
    }

    fetchRatings()
  }, [products])


  const loadFilterOptions = async (categoryId = null) => {
    try {
      setLoadingFilters(true)
      const data = await productAPI.getFilterOptions(categoryId)
      // Handle both new API format and legacy format
      setFilterOptions(data.data || data)
    } catch (error) {
      console.error('Error loading filter options:', error)
    } finally {
      setLoadingFilters(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortBy,
        sortOrder: sortOrder
      }

      // Add filters
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.brandName) params.brandName = filters.brandName
      if (filters.modelName) params.modelName = filters.modelName
      if (filters.modelId || modelIdFromUrl) params.modelId = filters.modelId || modelIdFromUrl
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.inStock) params.inStock = filters.inStock
      if (filters.color) params.color = filters.color
      if (filters.material) params.material = filters.material
      if (filters.caseType) params.caseType = filters.caseType
      if (filters.search) params.search = filters.search

      const response = await productAPI.filterAndSort(params)

      // Handle both new API format and legacy format
      if (response.success && response.data) {
        setProducts(response.data.products || [])
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalItems: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 1,
            currentPage: response.data.pagination.currentPage || 1
          }))
        }
      } else if (response.products) {
        // Legacy format fallback
        setProducts(response.products || [])
        if (response.totalPages) {
          setPagination(prev => ({
            ...prev,
            totalItems: response.totalItems || 0,
            totalPages: response.totalPages || 1,
            currentPage: response.currentPage || 1
          }))
        }
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    // Keep URL in sync for SEO-friendly category browsing
    if (key === 'categoryId') {
      const params = new URLSearchParams(searchParams)
      if (value) {
        const selected = categories.find((c) => String(c.id) === String(value))
        if (selected?.slug) {
          params.set('categorySlug', selected.slug)
          params.delete('categoryId')
        } else {
          params.set('categoryId', value)
          params.delete('categorySlug')
        }
      } else {
        params.delete('categoryId')
        params.delete('categorySlug')
      }
      setSearchParams(params, { replace: true })
    }
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('DESC')
    }
  }

  const clearFilters = () => {
    setSearchParams({})
    setFilters({
      categoryId: '',
      brandName: '',
      modelName: '',
      modelId: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      color: '',
      material: '',
      caseType: '',
      search: ''
    })
    setSortBy('createdAt')
    setSortOrder('DESC')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleAddToCart = async (product, e) => {
    e.preventDefault()
    const success = await addToCart(product, 1)
    // Success handled by CartContext toast
  }

  const handleBuyNow = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.stock || product.stock <= 0) return
    
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to proceed with Buy Now')
      localStorage.setItem('redirectAfterLogin', `/product/${getProductPathSegment(product)}`)
      navigate('/login')
      return
    }

    const success = await buyNow(product, 1)
    if (success) {
      navigate('/checkout')
    }
  }

  const hasActiveFilters =
    Object.values(filters).some((val) => val !== '' && val != null) || sortBy !== 'createdAt'

  // Mobile UX: show how many filters are currently active (excluding search text).
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search') return false
    return val !== '' && val != null
  }).length

  return (
    <div className="padding-large shop-page">
      <div className="container">
        {/* Header */}
        <div className="row mb-0">
          <div className="col-12">
            <h1 className="text-uppercase mb-3 fw-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Shop</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4 shop-mobile-search-row">
          <div className="col-12">
            <div className="input-group shop-search-bar">
              <span className="input-group-text bg-light shop-search-icon">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              {filters.search && (
                <button
                  className="btn btn-outline-secondary shop-search-clear"
                  onClick={() => handleFilterChange('search', '')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 col-md-4 mb-4 shop-filters-col">
            <div className="card shadow-sm shop-filters-card">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold shop-filters-title" style={{ fontSize: '1.1rem' }}>
                  <i className="bi bi-funnel me-2"></i>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="shop-filters-active-badge ms-2">
                      {activeFiltersCount}
                    </span>
                  )}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary d-lg-none"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i>
                </button>
              </div>

              <div className={`card-body shop-filters-body ${showFilters ? '' : 'd-none d-lg-block'}`}>
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    className="btn btn-outline-danger btn-sm w-100 mb-3"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Clear All Filters
                  </button>
                )}

                {/* Category Filter */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-grid me-2"></i>
                    Category
                  </label>
                  <select
                    className="form-select"
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                {filterOptions?.brands && filterOptions.brands.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tag me-2"></i>
                      Brand
                    </label>
                    <select
                      className="form-select"
                      value={filters.brandName}
                      onChange={(e) => handleFilterChange('brandName', e.target.value)}
                    >
                      <option value="">All Brands</option>
                      {filterOptions.brands.map((brand, idx) => (
                        <option key={idx} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Model Filter */}
                {filterOptions?.models && filterOptions.models.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-phone me-2"></i>
                      Model
                    </label>
                    <select
                      className="form-select"
                      value={filters.modelName}
                      onChange={(e) => handleFilterChange('modelName', e.target.value)}
                    >
                      <option value="">All Models</option>
                      {filterOptions.models.map((model, idx) => (
                        <option key={idx} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                {filterOptions?.priceRange && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-rupee me-2"></i>
                      Price Range
                    </label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    <small className="text-muted">
                      Range: ₹{filterOptions.priceRange.min} - ₹{filterOptions.priceRange.max}
                    </small>
                  </div>
                )}

                {/* Stock Filter */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-box-seam me-2"></i>
                    Availability
                  </label>
                  <select
                    className="form-select"
                    value={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.value)}
                  >
                    <option value="">All Products</option>
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>

                {/* Color Filter */}
                {filterOptions?.colors && filterOptions.colors.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-palette me-2"></i>
                      Color
                    </label>
                    <select
                      className="form-select"
                      value={filters.color}
                      onChange={(e) => handleFilterChange('color', e.target.value)}
                    >
                      <option value="">All Colors</option>
                      {filterOptions.colors.map((color, idx) => (
                        <option key={idx} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Material Filter */}
                {filterOptions?.materials && filterOptions.materials.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-box me-2"></i>
                      Material
                    </label>
                    <select
                      className="form-select"
                      value={filters.material}
                      onChange={(e) => handleFilterChange('material', e.target.value)}
                    >
                      <option value="">All Materials</option>
                      {filterOptions.materials.map((material, idx) => (
                        <option key={idx} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Case Type Filter */}
                {/** 
                  {filterOptions?.caseTypes && filterOptions.caseTypes.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-shield-check me-2"></i>
                        Case Type
                      </label>
                      <select
                        className="form-select"
                        value={filters.caseType}
                        onChange={(e) => handleFilterChange('caseType', e.target.value)}
                      >
                        <option value="">All Types</option>
                        {filterOptions.caseTypes.map((type, idx) => (
                          <option key={idx} value={type}>{stripMarkdownLabel(type)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  */}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9 col-md-8">
            {/* Sort and Results Info */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6 mb-2 mb-md-0">
                    {/* <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                      {pagination.totalItems > 0 ? (
                        <>
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} products
                          {pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
                        </>
                      ) : (
                        'No products found'
                      )}
                    </span> */}
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center justify-content-md-end">
                      <label className="form-label me-2 mb-0" style={{ fontSize: '0.95rem' }}>Sort by:</label>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto', minWidth: '150px', fontSize: '0.9rem' }}
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-')
                          setSortBy(field)
                          setSortOrder(order)
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
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <div className="row g-3 shop-product-grid">
                {products.map((product) => {
                  // console.log("product rating and review count", product.averageRating, product.reviewCount)
                  const imagePath = product.thumbnailImage || product.images?.[0]?.imageUrl
                  const imageUrl = getImageUrl(imagePath)
                  const finalPrice = parseFloat(product.discountPrice || product.price)
                  const originalPrice = product.discountPrice ? parseFloat(product.price) : null
                  const hasDiscount =
                    Boolean(product.discountPrice) &&
                    originalPrice != null &&
                    finalPrice < originalPrice
                  const discountPercentage =
                    hasDiscount && originalPrice
                      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
                      : 0
                  const inStock = product.stock && product.stock > 0
                  const rating = ratingsMap[product.id]?.averageRating
                  const reviewCount = ratingsMap[product.id]?.reviewCount
                  const fiveStarCount = Math.max(
                    0,
                    parseInt(
                      ratingsMap[product.id]?.fiveStarCount ??
                      product?.count5 ??
                        product?.fiveStarCount ??
                        product?.ratingSummary?.count5 ??
                        0,
                      10
                    ) || 0
                  )

                  return (
                    <div key={product.id} className="col-6 col-md-6 col-lg-4">
                      <div className="card h-100 shadow-sm product-card">
                        <Link to={`/product/${getProductPathSegment(product)}`} className="text-decoration-none">
                          <div className="position-relative product-card-image-wrap" style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="img-fluid w-100 h-100"
                              style={{ objectFit: 'contain', padding: '10px' }}
                              loading="lazy"
                              decoding="async"
                              width="500"
                              height="500"
                              onError={(e) => {
                                e.target.src = fallbackImage
                              }}
                            />
                            {hasDiscount && discountPercentage > 0 && (
                              <span className="badge bg-danger position-absolute top-0 end-0 m-2 product-card-discount-badge">
                                -{discountPercentage}%
                              </span>
                            )}
                            {!inStock && (
                              <span className="badge bg-secondary position-absolute top-0 start-0 m-2">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </Link>

                        <div className="card-body d-flex flex-column">
                          <Link to={`/product/${getProductPathSegment(product)}`} className="text-decoration-none text-dark">
                            <h3 className="h5 card-title mb-2 fw-semibold product-card-title">{product.title}</h3>
                          </Link>

                          {/* Case Details */}
                          {product.caseDetails && !isMobileView && (
                            <p className="text-muted small mb-2 product-card-model-line">
                              <i className="bi bi-tag me-1"></i>
                              {product.caseDetails.brand?.name} {product.caseDetails.model?.name}
                            </p>
                          )}

                          <div className="mt-auto product-card-rating-compact-md-mt">
                            {rating !== undefined &&
                              (rating > 0 || reviewCount > 0 || fiveStarCount > 0) && (
                                <div className="mb-2 product-card-rating-compact">
                                  <ProductRatingExpandable
                                    averageRating={rating}
                                    totalCount={reviewCount || 0}
                                    displayCount={fiveStarCount || 0}
                                    productId={product.id}
                                    productLinkSegment={getProductPathSegment(product)}
                                    starSize="0.86rem"
                                    showCount
                                    disableExpand={isMobileView}
                                  />
                                </div>
                              )}
                            <div className="d-flex justify-content-between align-items-center mb-0">
                              <div>
                                {hasDiscount ? (
                                  <div className="d-flex align-items-baseline gap-2 product-card-price-row">
                                    <span
                                      className="h5 product-card-discount-inline"
                                      style={{
                                        fontWeight: 900,
                                        lineHeight: 1,
                                        color: '#dc3545',
                                      }}
                                    >
                                      -{discountPercentage}%
                                    </span>
                                    <span
                                      className="h5 mb-0 product-card-main-price"
                                      style={{ fontWeight: 600, color: '#000' }}
                                    >
                                      ₹{finalPrice.toFixed(2)}
                                    </span>
                                    <span
                                      className="small product-card-mrp"
                                      style={{ fontWeight: 300, color: '#000' }}
                                    >
                                      <span
                                        className="text-decoration-line-through product-card-mrp-value"
                                        style={{ color: '#000' }}
                                      >
                                        ₹{originalPrice.toFixed(2)}
                                      </span>
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className="h5 mb-0 product-card-main-price"
                                    style={{ color: '#000' }}
                                  >
                                    ₹{finalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-muted mt-0 mb-0 product-card-shipping">
                              FREE SHIPPING
                            </p>

                            <div className="d-flex flex-column gap-2">
                              <button
                                className="btn btn-primary w-100 btn-add-to-cart"
                                onClick={(e) => handleAddToCart(product, e)}
                                disabled={!inStock}
                              >
                                {inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                              {inStock && !isMobileView && (
                                <button
                                  className="btn btn-primary w-100 btn-buy-now"
                                  onClick={(e) => handleBuyNow(product, e)}
                                >
                                  Buy Now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* No Products Found */}
            {!loading && products.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3 fw-semibold" style={{ fontSize: '1.25rem' }}>No products found</h4>
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary mt-3" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                  <ul className="pagination shop-pagination">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          const newPage = Math.max(1, pagination.page - 1)
                          setPagination(prev => ({ ...prev, page: newPage }))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={pagination.page === 1}
                      >
                        <i className="bi bi-chevron-left"></i> Previous
                      </button>
                    </li>

                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              setPagination(prev => ({ ...prev, page: pageNum }))
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}

                    <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          const newPage = Math.min(pagination.totalPages, pagination.page + 1)
                          setPagination(prev => ({ ...prev, page: newPage }))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop

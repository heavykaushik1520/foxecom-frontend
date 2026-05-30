import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { productAPI, reviewAPI, getImageUrl } from '../utils/api';
import ProductCard from './ProductCard';
import { isMultiModelProduct } from '../utils/cartLinePrice';
import { getProductPathSegment } from '../utils/productPath';
import ProductRatingExpandable from './ProductRatingExpandable';
import fallbackImage from '../assest/images/product-item1.jpg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const VariantProducts = ({ title = 'Variant Products', limit = 12, showViewAll = true }) => {
  const [products, setProducts] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 576 : false
  );

  useEffect(() => {
    loadProducts();
  }, [limit]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (p) => {
            try {
              const data = await reviewAPI.getByProduct(p.id);
              return [p.id, {
                averageRating: data.averageRating || 0,
                reviewCount: data.totalCount ?? data.reviews?.length ?? 0,
                fiveStarCount: Number(data?.distribution?.[5]) || 0,
              }];
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0, fiveStarCount: 0 }];
            }
          })
        );
        setRatingsMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Failed to load ratings for variant products', err);
      }
    };
    fetchRatings();
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productAPI.getAll({
        limit,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      const list = Array.isArray(productsData) ? productsData : [];
      const variants = list.filter(
        (p) => isMultiModelProduct(p) || p.productType === 'multi-model'
      );
      setProducts(variants);
    } catch (error) {
      console.error('Error loading variant products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0 && !loading) return null;

  return (
    <section className="featured-products padding-large">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between align-items-center mb-0 pb-3 border-bottom">
            <h2 className="display-7 text-center text-dark text-uppercase mb-0">{title}</h2>
            {showViewAll && (
              <Link
                to="/shop/variants"
                className="btn text-uppercase"
                style={{
                  borderColor: '#547535',
                  color: '#547535',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
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
                View All
              </Link>
            )}
          </div>

          {loading ? (
            <div className="row g-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <div className="card product-card h-100">
                    <div className="skeleton-image" style={{ height: '250px', backgroundColor: '#e9ecef' }} />
                    <div className="card-body">
                      <div className="skeleton-line mb-2" style={{ height: '20px', backgroundColor: '#e9ecef', borderRadius: '4px', width: '80%' }} />
                      <div className="skeleton-line mb-3" style={{ height: '24px', backgroundColor: '#e9ecef', borderRadius: '4px', width: '40%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isMobileView ? (
            <div className="row g-3">
              {products.map((product) => {
                const imagePath = product.thumbnailImage || product.images?.[0]?.imageUrl;
                const imageUrl = getImageUrl(imagePath);
                const finalPrice = parseFloat(product.discountPrice || product.price || 0);
                const originalPrice = product.discountPrice ? parseFloat(product.price || 0) : null;
                const hasDiscount =
                  Boolean(product.discountPrice) &&
                  originalPrice != null &&
                  finalPrice < originalPrice;
                const discountPercentage =
                  hasDiscount && originalPrice
                    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
                    : 0;
                const inStock = product.stock && product.stock > 0;
                const rating = ratingsMap[product.id]?.averageRating;
                const reviewCount = ratingsMap[product.id]?.reviewCount;
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
                );

                const productData = {
                  id: product.id,
                  title: product.title || product.name,
                  price: parseFloat(product.price || 0),
                  discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
                  thumbnailImage: product.thumbnailImage,
                  images: product.images,
                  rating: ratingsMap[product.id]?.averageRating ?? product.rating ?? product.averageRating ?? 0,
                  reviewCount: ratingsMap[product.id]?.reviewCount ?? product.reviewCount ?? product.reviewsCount ?? 0,
                  fiveStarCount: ratingsMap[product.id]?.fiveStarCount ?? product?.ratingSummary?.count5 ?? product?.count5 ?? 0,
                  inStock: product.inStock !== false,
                  category: product.category,
                  sku: product.sku ?? '',
                };

                return (
                  <div key={product.id} className="col-6">
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
                              e.target.src = fallbackImage;
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
                                  disableExpand
                                />
                              </div>
                            )}
                          <div className="d-flex justify-content-between align-items-center mb-0">
                            <div>
                              {hasDiscount ? (
                                <div className="d-flex align-items-baseline gap-2 product-card-price-row">
                                  <span
                                    className="h5 product-card-discount-inline"
                                    style={{ fontWeight: 900, lineHeight: 1, color: '#dc3545' }}
                                  >
                                    -{discountPercentage}%
                                  </span>
                                  <span
                                    className="h5 mb-0 product-card-main-price"
                                    style={{ fontWeight: 600, color: '#000' }}
                                  >
                                    ₹{finalPrice.toFixed(2)}
                                  </span>
                                  <span className="small product-card-mrp" style={{ fontWeight: 300, color: '#000' }}>
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Swiper
              className="product-swiper"
              modules={[Navigation, Pagination]}
              slidesPerView={4}
              spaceBetween={20}
              navigation={true}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                576: {
                  slidesPerView: 2,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                992: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
              }}
            >
              {products.map((product) => {
                const productData = {
                  id: product.id,
                  title: product.title || product.name,
                  price: parseFloat(product.price || 0),
                  discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
                  thumbnailImage: product.thumbnailImage,
                  images: product.images,
                  rating: ratingsMap[product.id]?.averageRating ?? product.rating ?? product.averageRating ?? 0,
                  reviewCount: ratingsMap[product.id]?.reviewCount ?? product.reviewCount ?? product.reviewsCount ?? 0,
                  fiveStarCount: ratingsMap[product.id]?.fiveStarCount ?? product?.ratingSummary?.count5 ?? product?.count5 ?? 0,
                  inStock: product.inStock !== false,
                  category: product.category,
                  sku: product.sku ?? '',
                };

                return (
                  <SwiperSlide key={product.id}>
                    <ProductCard
                      product={productData}
                      showAddToCart={false}
                      showBuyNow={false}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default VariantProducts;

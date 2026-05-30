import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { productAPI, reviewAPI, categoryAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';
import { isMultiModelProduct } from '../utils/cartLinePrice';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const FeaturedProducts = ({
  title = 'Featured Products',
  categoryId = null,
  limit = 8,
  showViewAll = true,
  onlyVariants = false,
  showAddToCart = true,
  showBuyNow = false,
}) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [categorySlug, setCategorySlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 576 : false
  );

  useEffect(() => {
    loadProducts();
  }, [categoryId, onlyVariants, limit]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCategorySlug = async () => {
      if (!categoryId) {
        setCategorySlug(null);
        return;
      }
      try {
        const data = await categoryAPI.getById(categoryId);
        const category = data.category || data;
        if (!cancelled) {
          setCategorySlug(category?.slug || null);
        }
      } catch (err) {
        if (!cancelled) setCategorySlug(null);
      }
    };
    loadCategorySlug();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

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
        console.error('Failed to load ratings for featured products', err);
      }
    };
    fetchRatings();
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      if (categoryId) {
        params.categoryId = categoryId;
      }

      const productsData = await productAPI.getAll(params);
      const list = Array.isArray(productsData) ? productsData : [];
      const filtered = onlyVariants
        ? list.filter((p) => isMultiModelProduct(p) || p.productType === 'multi-model')
        : list;
      setProducts(filtered);
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product, 1);
    if (success) {
      // Optional: Show toast notification instead of alert
      // For now, we'll use a subtle visual feedback
    }
  };

  if (error && products.length === 0) {
    return null; // Don't show section if there's an error and no products
  }

  return (
    <section className="featured-products padding-large">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between align-items-center mb-0 pb-3 border-bottom">
            <h2 className="display-7 text-center text-dark text-uppercase mb-0">{title}</h2>
            {showViewAll && (
              <Link 
                to={categorySlug ? `/shop?categorySlug=${categorySlug}` : (categoryId ? `/shop?categoryId=${categoryId}` : '/shop')} 
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
          ) : products.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">
                {onlyVariants
                  ? 'No variant products available at the moment.'
                  : 'No products available at the moment.'}
              </p>
            </div>
          ) : isMobileView ? (
            <div className="row g-3">
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
                  <div key={product.id} className="col-6">
                    <ProductCard
                      product={productData}
                      onAddToCart={handleAddToCart}
                      showAddToCart={showAddToCart}
                      showBuyNow={showBuyNow}
                    />
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
                      onAddToCart={handleAddToCart}
                      showAddToCart={showAddToCart}
                      showBuyNow={showBuyNow}
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

export default FeaturedProducts;

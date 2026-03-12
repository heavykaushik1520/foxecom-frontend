import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { dealOfTheWeekAPI, reviewAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const DealOfTheWeek = () => {
  const { addToCart } = useCart();
  const [deal, setDeal] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDeal();
  }, []);

  useEffect(() => {
    if (!deal || !deal.products || deal.products.length === 0) return;
    
    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          deal.products.map(async (p) => {
            try {
              const data = await reviewAPI.getByProduct(p.id);
              return [p.id, { averageRating: data.averageRating || 0, reviewCount: data.totalCount ?? data.reviews?.length ?? 0 }];
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0 }];
            }
          })
        );
        setRatingsMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Failed to load ratings for deal products', err);
      }
    };
    fetchRatings();
  }, [deal]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const dealData = await dealOfTheWeekAPI.getActive();
      
      // Only set deal if it exists and is active
      if (dealData && dealData.isActive && dealData.products && dealData.products.length > 0) {
        setDeal(dealData);
      } else {
        setDeal(null);
      }
    } catch (err) {
      console.error('Error loading Deal of the Week:', err);
      setError('Failed to load Deal of the Week');
      setDeal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product, 1);
    if (success) {
      // Optional: Show toast notification
    }
  };

  // Don't render anything if no active deal
  if (loading) {
    return null; // Return null during loading to avoid layout shift
  }

  if (error || !deal || !deal.products || deal.products.length === 0) {
    return null; // Return null if no active deal - section won't appear at all
  }

  return (
    <section className="deal-of-the-week mt-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="display-7 text-center text-dark text-uppercase mb-0">
                {deal.title || 'Deal of the Week'}
              </h2>
              {deal.description && (
                <p className="text-muted small mt-2 mb-0">{deal.description}</p>
              )}
            </div>
            <Link 
              to="/deal-of-the-week" 
              className="btn text-uppercase"
              style={{
                borderColor: '#89bb56',
                color: '#89bb56',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#89bb56';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#89bb56';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#89bb56';
                e.currentTarget.style.borderColor = '#89bb56';
              }}
            >
              View Deal
            </Link>
          </div>
          
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
            {deal.products.map((product) => {
              const productData = {
                id: product.id,
                title: product.title || product.name,
                price: parseFloat(product.price || 0),
                discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
                thumbnailImage: product.thumbnailImage,
                images: product.images || [],
                rating: ratingsMap[product.id]?.averageRating ?? product.rating ?? product.averageRating ?? 0,
                reviewCount: ratingsMap[product.id]?.reviewCount ?? product.reviewCount ?? product.reviewsCount ?? 0,
                inStock: product.stock !== null && product.stock > 0,
                category: product.category,
                sku: product.sku ?? '',
              };

              return (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={productData}
                    onAddToCart={handleAddToCart}
                    showAddToCart={true}
                    showBuyNow={false}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheWeek;

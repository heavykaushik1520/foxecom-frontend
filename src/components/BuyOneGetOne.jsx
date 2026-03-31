import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { buyOneGetOneAPI, reviewAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BuyOneGetOne = () => {
  const { addToCart } = useCart();
  const [deal, setDeal] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSection();
  }, []);

  useEffect(() => {
    if (!deal || !deal.products || deal.products.length === 0) return;

    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          deal.products.map(async (p) => {
            try {
              const data = await reviewAPI.getByProduct(p.id);
              return [
                p.id,
                {
                  averageRating: data.averageRating || 0,
                  reviewCount: data.totalCount ?? data.reviews?.length ?? 0,
                  fiveStarCount: Number(data?.distribution?.[5]) || 0,
                },
              ];
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0, fiveStarCount: 0 }];
            }
          })
        );
        setRatingsMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Failed to load ratings for BOGO products', err);
      }
    };

    fetchRatings();
  }, [deal]);

  const loadSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buyOneGetOneAPI.getActive();

      if (data && data.isActive && Array.isArray(data.products) && data.products.length > 0) {
        setDeal(data);
      } else {
        setDeal(null);
      }
    } catch (err) {
      console.error('Error loading Buy One Get One section:', err);
      setError('Failed to load Buy One Get One section');
      setDeal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product, 1);
    if (success) {
      // Optional: toast
    }
  };

  if (loading) {
    return null;
  }

  if (error || !deal || !deal.products || deal.products.length === 0) {
    return null;
  }

  return (
    <section className="bogo-section mt-5" style={{ backgroundColor: '#fff5f5' }}>
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="display-7 text-center text-dark text-uppercase mb-0">
                {deal.title || 'Buy One Get One'}
              </h2>
              <p className="text-muted small mt-2 mb-0">
                {deal.description || 'Add any of these products to your cart to enjoy a Buy One Get One offer.'}
              </p>
            </div>
          </div>

          <Swiper
            className="product-swiper"
            modules={[Navigation, Pagination]}
            slidesPerView={4}
            spaceBetween={20}
            navigation
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
                inStock: product.stock !== null && product.stock > 0,
                category: product.category,
                sku: product.sku ?? '',
              };

              return (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={productData}
                    onAddToCart={handleAddToCart}
                    showAddToCart
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

export default BuyOneGetOne;


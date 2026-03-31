import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { productAPI, categoryAPI, reviewAPI } from '../utils/api'
import { useCart } from '../contexts/CartContext'
import ProductCard from './ProductCard'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const MobileProducts = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [ratingsMap, setRatingsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (p) => {
            try {
              const data = await reviewAPI.getByProduct(p.id)
              return [p.id, {
                averageRating: data.averageRating || 0,
                reviewCount: data.totalCount ?? data.reviews?.length ?? 0,
                fiveStarCount: Number(data?.distribution?.[5]) || 0,
              }]
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0, fiveStarCount: 0 }]
            }
          })
        )
        setRatingsMap(Object.fromEntries(entries))
      } catch (err) {
        console.error('Failed to load ratings for mobile products', err)
      }
    }
    fetchRatings()
  }, [products])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Get mobile case category products
      const data = await categoryAPI.getAll()
      // Handle both new format (with categories property) and legacy format (direct array)
      const categories = Array.isArray(data) ? data : (data?.categories || [])
      
      const mobileCategory = categories.find(cat => 
        cat.name && (
          cat.name.toLowerCase().includes('mobile') || 
          cat.name.toLowerCase().includes('case') ||
          cat.name.toLowerCase().includes('phone')
        )
      )
      
      if (mobileCategory) {
        const params = {
          categoryId: mobileCategory.id,
          limit: 8,
          page: 1
        }
        const productsData = await productAPI.getAll(params)
        setProducts(Array.isArray(productsData) ? productsData : [])
      } else {
        // If no mobile category found, just load general products
        const productsData = await productAPI.getAll({ limit: 8, page: 1 })
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
    } catch (error) {
      console.error('Error loading mobile products:', error)
      // On error, try to load general products anyway
      try {
        const productsData = await productAPI.getAll({ limit: 8, page: 1 })
        setProducts(Array.isArray(productsData) ? productsData : [])
      } catch (fallbackError) {
        console.error('Error loading fallback products:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product) => {
    await addToCart(product, 1)
  }

  return (
    <section id="mobile-products" className="product-store position-relative padding-large">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between pb-3">
            <h2 className="display-7 text-dark text-uppercase">Mobile Products</h2>
            <div className="btn-right">
              <Link 
                to="/shop" 
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
                 Shop
              </Link>
            </div>
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
              <p className="text-muted">No mobile products available at the moment.</p>
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
                      showAddToCart={true}
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
  )
}

export default MobileProducts


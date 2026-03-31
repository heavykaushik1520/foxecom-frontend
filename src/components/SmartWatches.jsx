import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { getProductsByCategory } from '../data/products'
import { getProductPathSegment } from '../utils/productPath'
import { useCart } from '../contexts/CartContext'
import 'swiper/css'
import 'swiper/css/pagination'

const SmartWatches = () => {
  const { addToCart } = useCart()
  const watches = getProductsByCategory('watch')

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    addToCart(product, 1)
    alert(`${product.name} added to cart!`)
  }

  return (
    <section id="smart-watches" className="product-store padding-large position-relative">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between pb-3">
            <h2 className="display-7 text-dark text-uppercase">Smart Watches</h2>
            <div className="btn-right">
              <Link to="/shop" className="btn btn-medium btn-normal text-uppercase">Go to Shop</Link>
            </div>
          </div>
          <Swiper
            className="product-watch-swiper"
            modules={[Pagination]}
            slidesPerView={4}
            spaceBetween={10}
            pagination={{
              el: '#smart-watches .swiper-pagination',
              clickable: true,
            }}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              980: {
                slidesPerView: 4,
                spaceBetween: 20,
              }
            }}
          >
            {watches.map((watch) => (
              <SwiperSlide key={watch.id}>
                <div className="product-card position-relative">
                  <Link to={`/product/${getProductPathSegment(watch)}`}>
                    <div className="image-holder">
                      <img src={watch.image} alt="product-item" className="img-fluid" />
                    </div>
                  </Link>
                  <div className="cart-concern position-absolute">
                    <div className="cart-button d-flex">
                      <button
                        className="btn btn-medium btn-black"
                        onClick={(e) => handleAddToCart(watch, e)}
                        disabled={!watch.inStock}
                      >
                        Add to Cart
                        <svg className="cart-outline">
                          <use xlinkHref="#cart-outline"></use>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="card-detail d-flex justify-content-between align-items-baseline pt-3">
                    <h3 className="card-title text-uppercase">
                      <Link to={`/product/${getProductPathSegment(watch)}`} className="text-decoration-none text-dark">
                        {watch.name}
                      </Link>
                    </h3>
                    <span className="item-price text-primary">${watch.price}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <div className="swiper-pagination position-absolute text-center"></div>
    </section>
  )
}

export default SmartWatches


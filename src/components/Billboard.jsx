import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { bannersAPI, getImageUrl } from '../utils/api'

const Billboard = () => {
  const swiperRef = useRef(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const list = await bannersAPI.getAll()
        setBanners(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to load billboard banners:', err)
        setBanners([])
      } finally {
        setLoading(false)
      }
    }
    loadBanners()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Per-banner: use mobile or desktop image based on viewport
  const BANNERS = banners.map((b) => ({
    src: getImageUrl(isMobile ? b.mobileImageUrl : b.desktopImageUrl),
    alt: 'Billboard banner',
  }))

  // Skeleton loader while banners are fetching
  if (loading) {
    return (
      <section id="billboard" className="billboard-section position-relative overflow-hidden" aria-busy="true" aria-label="Loading banners">
        <div className="billboard-inner">
          <div className="billboard-skeleton-wrap">
            <div className="billboard-skeleton" />
          </div>
        </div>
        <style>{`
          .billboard-skeleton-wrap {
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            background: #f0f0f0;
          }
          .billboard-skeleton {
            width: 100%;
            height: 0;
            padding-bottom: 33.93%;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #e8e8e8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 200% 100%;
            animation: billboard-skeleton-shimmer 1.2s ease-in-out infinite;
          }
          @media (max-width: 767px) {
            .billboard-skeleton { padding-bottom: 59.51%; }
          }
          @media (min-width: 768px) {
            .billboard-inner { max-width: 1500px; padding: 40px 36px; }
          }
          @media (max-width: 767px) {
            .billboard-inner { padding: 0 16px; }
          }
          @keyframes billboard-skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </section>
    )
  }

  if (BANNERS.length === 0) {
    return null
  }

  return (
    <section id="billboard" className="billboard-section position-relative overflow-hidden">
      <div className="billboard-inner">
        <Swiper
          ref={swiperRef}
          className="billboard-swiper"
          modules={[Autoplay, Pagination]}
          speed={500}
          loop={BANNERS.length > 1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'billboard-pagination-bullet',
            bulletActiveClass: 'billboard-pagination-bullet-active',
          }}
          grabCursor
          threshold={5}
          slidesPerView={1}
          spaceBetween={0}
        >
          {BANNERS.map((banner, index) => (
            <SwiperSlide key={index}>
              <Link to="/shop" className="billboard-slide-link d-block">
                <div className="billboard-slide-img-wrap">
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="billboard-slide-img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className="billboard-arrow billboard-arrow-prev"
          aria-label="Previous slide"
          onClick={() => swiperRef.current?.swiper?.slidePrev()}
        >
          <i className="bi bi-chevron-left" />
        </button>
        <button
          type="button"
          className="billboard-arrow billboard-arrow-next"
          aria-label="Next slide"
          onClick={() => swiperRef.current?.swiper?.slideNext()}
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>

      <style>{`
        .billboard-section {
          min-height: 0;
          margin-top: 0;
          margin-bottom: 0;
        }
        .billboard-inner {
          position: relative;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
        }
        .billboard-swiper { 
          width: 100%; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        .billboard-slide-link { width: 100%; }
        .billboard-slide-img-wrap {
          width: 100%;
          background: #111;
          overflow: hidden;
          border-radius: 12px;
        }
        @media (min-width: 768px) {
          .billboard-inner {
            max-width: 1500px;
            padding: 40px 36px;
          }
          .billboard-slide-img-wrap {
            aspect-ratio: 1521 / 516;
            width: 100%;
            height: auto;
            max-height: calc(100vh - 100px);
            border-radius: 12px;
          }
        }
        @media (max-width: 767px) {
          .billboard-inner {
            padding: 0 16px;
          }
          .billboard-slide-img-wrap {
            aspect-ratio: 531 / 316;
            width: 100%;
            height: auto;
            max-height: none;
            min-height: auto;
            border-radius: 10px;
          }
        }
        .billboard-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }
        @media (min-width: 768px) {
          .billboard-slide-img {
            object-fit: contain;
            width: 100%;
            height: 100%;
          }
        }
        @media (max-width: 767px) {
          .billboard-slide-img-wrap {
            display: block;
          }
          .billboard-slide-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .billboard-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s, box-shadow 0.2s;
          opacity: 0.9;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .billboard-arrow:hover { 
          background: #fff; 
          opacity: 1; 
          box-shadow: 0 4px 16px rgba(0,0,0,0.2); 
        }
        .billboard-arrow-prev { left: 20px; }
        .billboard-arrow-next { right: 20px; }
        .billboard-arrow .bi { font-size: 1.5rem; }
        .billboard-swiper .swiper-pagination { bottom: 20px; display:none; }
        .billboard-pagination-bullet {
          width: 10px; 
          height: 10px;
          background: transparent;
          border: 2px solid rgba(255,255,255,0.8);
          opacity: 1;
          transition: background 0.2s, transform 0.2s, border-color 0.2s;
        }
        .billboard-pagination-bullet-active {
          background: #fff;
          border-color: #fff;
          transform: scale(1.15);
        }
        @media (min-width: 768px) {
          .billboard-arrow-prev { left: 30px; }
          .billboard-arrow-next { right: 30px; }
        }
        @media (max-width: 767px) {
          .billboard-arrow { 
            width: 40px; 
            height: 40px; 
          }
          .billboard-arrow-prev { left: 15px; }
          .billboard-arrow-next { right: 15px; }
          .billboard-arrow .bi { font-size: 1.15rem; }
          .billboard-swiper .swiper-pagination { bottom: 15px; }
          .billboard-pagination-bullet { 
            width: 8px; 
            height: 8px; 
            border-width: 1.5px; 
          }
        }
        @media (max-width: 480px) {
          .billboard-arrow { 
            width: 34px; 
            height: 34px; 
          }
          .billboard-arrow-prev { left: 10px; }
          .billboard-arrow-next { right: 10px; }
          .billboard-arrow .bi { font-size: 1rem; }
          .billboard-swiper .swiper-pagination { bottom: 10px; }
        }
      `}</style>
    </section>
  )
}

export default Billboard

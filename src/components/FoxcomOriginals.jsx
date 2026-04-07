import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { foxcomOriginalsAPI, getImageUrl } from "../utils/api";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FoxcomOriginals = () => {
  const [originals, setOriginals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await foxcomOriginalsAPI.getActive();
        setOriginals(data);
      } catch (err) {
        console.error("Failed to load FOXECOM Originals:", err);
        setError("Failed to load FOXECOM Originals");
        setOriginals(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const products = originals?.products;
  const hasProducts = Array.isArray(products) && products.length > 0;
  const isSingleProduct = hasProducts && products.length === 1;

  const titleBlock = (opts = {}) => {
    const { skeleton } = opts;
    return (
      <div
        className={`foxcom-orig-head-inner text-center ${
          skeleton ? "foxcom-orig-head-inner--skeleton" : ""
        }`}
      >
        <div
          className="foxcom-orig-title text-dark text-uppercase"
          style={
            skeleton
              ? undefined
              : {
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: "clamp(2.9rem, 3vw, 3.3rem)",
                  lineHeight: 0.85,
                }
          }
        >
          {skeleton ? (
            <span
              className="d-inline-block rounded-2 skeleton"
              style={{ width: "min(280px, 70vw)", height: "2.5rem" }}
              aria-hidden
            />
          ) : (
            "FOXECOM"
          )}
        </div>
        <div
          className="foxcom-orig-subtitle foxcom-cursive-word"
          style={
            skeleton
              ? undefined
              : {
                  fontWeight: 500,
                  fontSize: "clamp(2.8rem, 4.9vw, 4.7rem)",
                  lineHeight: 1.05,
                  marginTop: -6,
                  textTransform: "lowercase",
                  letterSpacing: "-0.02em",
                }
          }
        >
          {skeleton ? (
            <span
              className="d-inline-block rounded-2 skeleton mt-2"
              style={{ width: "min(200px, 55vw)", height: "2.25rem" }}
              aria-hidden
            />
          ) : (
            "Originals"
          )}
        </div>
        {!skeleton && <div className="foxcom-orig-head-rule" aria-hidden />}
      </div>
    );
  };

  if (loading) {
    const skeletonCount = 8;
    const skeletons = Array.from({ length: skeletonCount });

    return (
      <section className="foxcom-originals padding-large foxcom-orig-bg">
        <style>{`
          .foxcom-orig-bg{
            position: relative;
            overflow: hidden;
            isolation: isolate;
            --primary: #547535;
            --primary2: #4e79ff;
            --primary3: #19d3c5;
            /* Must match src/styles/header.css main/.page-content padding-top */
            --foxcom-header-offset: 100px;
            /* Keep left/right spacing like #billboard */
            /* billboard: mobile 16px, desktop 36px */
            --sidePad: 16px;
            padding-left: var(--sidePad);
            padding-right: var(--sidePad);
          }

          section.foxcom-originals.foxcom-orig-bg{
            min-height: calc(100vh - var(--foxcom-header-offset));
            min-height: calc(100dvh - var(--foxcom-header-offset));
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }

          .foxcom-orig-bg .foxcom-orig-layout{
            flex: 1 1 auto;
            min-height: 0;
          }

          .foxcom-orig-bg .foxcom-orig-products-col{
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }

          .foxcom-orig-bg .foxcom-orig-swiper-outer{
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }

          .foxcom-orig-bg .foxcom-orig-swiper-outer .product-swiper{
            flex: 1 1 auto;
            min-height: 0;
            width: 100%;
            height: 100%;
          }

          .foxcom-orig-bg .product-swiper .swiper-wrapper{
            align-items: stretch;
          }

          .foxcom-orig-bg .product-swiper .swiper-slide{
            height: auto;
            align-self: stretch;
            display: flex;
          }

          .foxcom-orig-bg .product-swiper .swiper-slide > a{
            width: 100%;
            max-width: 100%;
            display: flex !important;
            flex: 1 1 auto;
            min-height: 0;
          }

          .foxcom-orig-bg .product-swiper .swiper-slide .product-card{
            flex: 1 1 auto;
            min-height: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
          }

          .foxcom-orig-bg .product-swiper .swiper-slide .product-thumb{
            flex: 1 1 auto;
            min-height: 0;
          }

          .foxcom-orig-bg::before{
            content: "";
            position: absolute;
            inset: 0;
            z-index: -2;
            pointer-events: none;

            background:
              radial-gradient(circle at 15% 20%, rgba(84,117,53,0.55) 0%, rgba(84,117,53,0) 48%),
              radial-gradient(circle at 85% 10%, rgba(78,121,255,0.40) 0%, rgba(78,121,255,0) 52%),
              radial-gradient(circle at 55% 92%, rgba(25,211,197,0.38) 0%, rgba(25,211,197,0) 55%),
              linear-gradient(135deg, rgba(84,117,53,0.22) 0%, rgba(78,121,255,0.18) 50%, rgba(25,211,197,0.16) 100%);

            background-size: 200% 200%;
            filter: blur(34px) saturate(140%);
            opacity: 0.95;

            animation: foxcomAurora 14s ease-in-out infinite;
            will-change: transform, opacity;
            transform: translate3d(0,0,0);
          }

          .foxcom-orig-bg::after{
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;

            background:
              linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0.06) 100%);

            animation: foxcomShimmer 9s linear infinite;
            will-change: opacity, transform;
            opacity: 0.9;
          }

          .foxcom-cursive-word{
            font-family: "Brush Script MT","Lucida Handwriting","Segoe Script","Apple Chancery","Snell Roundhand",cursive !important;
          }

          .foxcom-orig-bg .container{
            position: relative;
            z-index: 1;
            padding-left: 0 !important;
            padding-right: 0 !important;
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          @media (max-width: 768px){
            section.foxcom-originals.foxcom-orig-bg.padding-large{
              padding-top: 1.25rem !important;
              padding-bottom: 1.25rem !important;
            }
          }

          .foxcom-orig-bg .row{
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          .foxcom-orig-bg .product-card{
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 18px 50px rgba(0,0,0,0.15);
            transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
            backdrop-filter: blur(10px);
            padding: 0 !important;
          }

          /* Grid (no absolute img): avoids flex collapse; cover fills frame */
          .foxcom-orig-bg .product-thumb{
            width: 100%;
            max-width: 100%;
            display: grid;
            place-items: stretch;
            overflow: hidden;
            background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
            height: clamp(300px, min(44vw, calc(100dvh - var(--foxcom-header-offset) - 9.5rem)), 760px);
            padding: 0;
            box-sizing: border-box;
          }

          .foxcom-orig-bg .product-thumb-img{
            grid-area: 1 / 1;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            max-width: none !important;
            padding: 0 !important;
            object-fit: cover;
            object-position: center;
            box-sizing: border-box;
            display: block;
          }

          .foxcom-orig-head-top {
            width: 100%;
          }

          .foxcom-orig-head-rule {
            width: 3rem;
            height: 3px;
            border-radius: 999px;
            margin-top: 0.6rem;
            margin-left: auto;
            margin-right: auto;
            background: linear-gradient(90deg, var(--primary), var(--primary2));
            opacity: 0.9;
          }

          @media (max-width: 991.98px) {
            .foxcom-orig-head-top {
              border-bottom: 1px solid rgba(0, 0, 0, 0.08);
              padding-bottom: 0.85rem;
              margin-bottom: 0.5rem;
            }
            .foxcom-orig-bg.foxcom-orig--single .product-thumb {
              min-height: 280px;
              height: clamp(300px, min(62dvh, calc(100dvh - var(--foxcom-header-offset) - 9rem)), 680px);
            }
          }

          @media (min-width: 992px) {
            section.foxcom-originals.foxcom-orig-bg.padding-large {
              padding-top: 2.25rem !important;
              padding-bottom: 2.5rem !important;
            }
            .foxcom-orig-head-top {
              border-bottom: 1px solid rgba(0, 0, 0, 0.08);
              padding-bottom: 0.9rem;
              margin-bottom: 1rem;
            }
            .foxcom-orig-layout {
              align-items: stretch !important;
            }
            .foxcom-orig-head-inner .foxcom-orig-title {
              font-size: clamp(1.85rem, 2.5vw, 2.5rem) !important;
              line-height: 0.9 !important;
              letter-spacing: 0.06em !important;
            }
            .foxcom-orig-head-inner .foxcom-orig-subtitle {
              font-size: clamp(2.1rem, 3.25vw, 3.1rem) !important;
              line-height: 1 !important;
              margin-top: 0.12rem !important;
            }
            .foxcom-orig-head-rule {
              width: 3.35rem;
              margin-top: 0.65rem;
            }
            .foxcom-orig-swiper-outer {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: stretch;
            }
            .foxcom-orig-bg .product-swiper .swiper-pagination {
              margin-top: 0.55rem !important;
            }
            .foxcom-orig-bg .product-swiper .swiper-pagination-bullet {
              width: 8px;
              height: 8px;
            }
            .foxcom-orig--single .foxcom-orig-swiper-outer .product-swiper {
              max-width: min(1120px, 99vw);
              width: 100%;
              align-self: center;
            }
            .foxcom-orig-bg .product-card {
              border-radius: 20px;
              overflow: hidden;
            }
            /* ~catalog portrait (3:4), not phone-silhouette (10:19) */
            .foxcom-orig-bg .product-thumb {
              height: auto;
              flex: 1 1 auto;
              aspect-ratio: 3 / 4;
              max-height: min(860px, calc(100dvh - var(--foxcom-header-offset) - 7.5rem));
              min-height: min(420px, calc(100dvh - var(--foxcom-header-offset) - 10rem));
              border-radius: 18px;
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
            }
            .foxcom-orig-bg.foxcom-orig--single .product-thumb {
              aspect-ratio: 3 / 4;
              max-height: min(980px, calc(100dvh - var(--foxcom-header-offset) - 5rem));
              min-height: min(520px, calc(100dvh - var(--foxcom-header-offset) - 9rem));
            }
            .foxcom-orig-bg .product-thumb-img {
              filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.1));
            }
          }

          @keyframes foxcomAurora{
            0%   { transform: translate3d(-2%, -2%, 0) scale(1.02); background-position: 0% 40%; }
            35%  { transform: translate3d(3%, -1%, 0) scale(1.06);  background-position: 70% 10%; }
            70%  { transform: translate3d(2%, 4%, 0) scale(1.07);   background-position: 30% 90%; }
            100% { transform: translate3d(-2%, -2%, 0) scale(1.02); background-position: 0% 40%; }
          }

          @keyframes foxcomShimmer{
            0%   { transform: translate3d(0,0,0); opacity: 0.70; }
            50%  { transform: translate3d(-2%, 1%, 0); opacity: 0.95; }
            100% { transform: translate3d(0,0,0); opacity: 0.70; }
          }

          @media (max-width: 576px){
            .foxcom-orig-bg::before{ filter: blur(26px) saturate(140%); }
            .foxcom-orig-bg .product-swiper{ margin-top: 4px; }
          }

          @media (min-width: 768px){
            .foxcom-orig-bg{
              --sidePad: 36px;
            }
          }

          @media (prefers-reduced-motion: reduce){
            .foxcom-orig-bg::before,
            .foxcom-orig-bg::after{
              animation: none !important;
            }
          }

          @media (max-width: 575.98px){
            .foxcom-orig-bg .product-thumb{
              height: clamp(280px, min(58vw, calc(100dvh - var(--foxcom-header-offset) - 9rem)), 560px);
            }
            .foxcom-orig-title{
              font-size: clamp(1.9rem, 7vw, 2.35rem) !important;
              line-height: 0.95 !important;
            }
          }
          @media (min-width: 576px) and (max-width: 767.98px){
            .foxcom-orig-bg .product-thumb{
              height: clamp(320px, min(46vw, calc(100dvh - var(--foxcom-header-offset) - 8.5rem)), 620px);
            }
          }
          @media (min-width: 768px) and (max-width: 991.98px){
            .foxcom-orig-bg .product-thumb{
              height: clamp(340px, min(38vw, calc(100dvh - var(--foxcom-header-offset) - 8rem)), 680px);
            }
          }
        `}</style>

        <div className="container">
          <header className="foxcom-orig-head-top">
            {titleBlock({ skeleton: true })}
          </header>
          <div className="row foxcom-orig-layout gx-3 gx-lg-4 justify-content-center">
            <div className="col-12 foxcom-orig-products-col">
              <div className="foxcom-orig-swiper-outer">
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
                    0: { slidesPerView: 1, spaceBetween: 10 },
                    576: { slidesPerView: 2, spaceBetween: 15 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    992: { slidesPerView: 3, spaceBetween: 20 },
                  }}
                >
                  {skeletons.map((_, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="card shadow-sm product-card" style={{ border: "none", width: "100%" }}>
                        <div className="position-relative product-thumb">
                          <div
                            className="product-thumb-img skeleton"
                            style={{ borderRadius: "14px" }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !hasProducts) {
    return null;
  }

  return (
    <section
      className={`foxcom-originals padding-large foxcom-orig-bg${
        isSingleProduct ? " foxcom-orig--single" : ""
      }`}
    >
      <style>{`
        .foxcom-orig-bg{
          position: relative;
          overflow: hidden;
          isolation: isolate;
          --primary: #547535;
          --primary2: #4e79ff;
          --primary3: #19d3c5;
          /* Must match src/styles/header.css main/.page-content padding-top */
          --foxcom-header-offset: 100px;
          /* Keep left/right spacing like #billboard */
          /* billboard: mobile 16px, desktop 36px */
          --sidePad: 16px;
          padding-left: var(--sidePad);
          padding-right: var(--sidePad);
        }

        section.foxcom-originals.foxcom-orig-bg{
          min-height: calc(100vh - var(--foxcom-header-offset));
          min-height: calc(100dvh - var(--foxcom-header-offset));
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .foxcom-orig-bg .foxcom-orig-layout{
          flex: 1 1 auto;
          min-height: 0;
        }

        .foxcom-orig-bg .foxcom-orig-products-col{
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .foxcom-orig-bg .foxcom-orig-swiper-outer{
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .foxcom-orig-bg .foxcom-orig-swiper-outer .product-swiper{
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          height: 100%;
        }

        .foxcom-orig-bg .product-swiper .swiper-wrapper{
          align-items: stretch;
        }

        .foxcom-orig-bg .product-swiper .swiper-slide{
          height: auto;
          align-self: stretch;
          display: flex;
        }

        .foxcom-orig-bg .product-swiper .swiper-slide > a{
          width: 100%;
          max-width: 100%;
          display: flex !important;
          flex: 1 1 auto;
          min-height: 0;
        }

        .foxcom-orig-bg .product-swiper .swiper-slide .product-card{
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .foxcom-orig-bg .product-swiper .swiper-slide .product-thumb{
          flex: 1 1 auto;
          min-height: 0;
        }

        .foxcom-orig-bg::before{
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;

          background:
            radial-gradient(circle at 15% 20%, rgba(84,117,53,0.55) 0%, rgba(84,117,53,0) 48%),
            radial-gradient(circle at 85% 10%, rgba(78,121,255,0.40) 0%, rgba(78,121,255,0) 52%),
            radial-gradient(circle at 55% 92%, rgba(25,211,197,0.38) 0%, rgba(25,211,197,0) 55%),
            linear-gradient(135deg, rgba(84,117,53,0.22) 0%, rgba(78,121,255,0.18) 50%, rgba(25,211,197,0.16) 100%);

          background-size: 200% 200%;
          filter: blur(34px) saturate(140%);
          opacity: 0.95;

          animation: foxcomAurora 14s ease-in-out infinite;
          will-change: transform, opacity;
          transform: translate3d(0,0,0);
        }

        .foxcom-orig-bg::after{
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;

          background:
            linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0.06) 100%);

          animation: foxcomShimmer 9s linear infinite;
          will-change: opacity, transform;
          opacity: 0.9;
        }

        /* Global CSS uses font-family: ... !important on all elements, so we must override with !important */
        .foxcom-cursive-word{
          font-family: "Brush Script MT","Lucida Handwriting","Segoe Script","Apple Chancery","Snell Roundhand",cursive !important;
        }

        .foxcom-orig-bg .container{
          position: relative;
          z-index: 1;
          /* Avoid double padding (container already has its own side padding) */
          padding-left: 0 !important;
          padding-right: 0 !important;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        @media (max-width: 768px){
          section.foxcom-originals.foxcom-orig-bg.padding-large{
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }
        }

        /* Bootstrap rows use negative gutters; since we removed container padding,
           neutralize them so left/right spacing stays consistent (like #billboard). */
        .foxcom-orig-bg .row{
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        /* Subtle lift + “magic” sheen on thumbnails (cheap transform/opacity only) */
        .foxcom-orig-bg .product-card{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 18px 50px rgba(0,0,0,0.15);
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          backdrop-filter: blur(10px);
          padding: 0 !important;
        }
        .foxcom-orig-bg .product-card:hover{
          transform: translateY(-6px);
          box-shadow: 0 26px 70px rgba(0,0,0,0.22);
          border-color: rgba(255,255,255,0.22);
        }

        /* Grid + cover: image fills card; avoids flex width collapse */
        .foxcom-orig-bg .product-thumb{
          width: 100%;
          max-width: 100%;
          display: grid;
          place-items: stretch;
          overflow: hidden;
          background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
          height: clamp(300px, min(44vw, calc(100dvh - var(--foxcom-header-offset) - 9.5rem)), 760px);
          padding: 0;
          box-sizing: border-box;
        }

        .foxcom-orig-bg .product-thumb-img{
          grid-area: 1 / 1;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          max-width: none !important;
          padding: 0 !important;
          object-fit: cover;
          object-position: center;
          box-sizing: border-box;
          display: block;
        }

        .foxcom-orig-head-top {
          width: 100%;
        }

        .foxcom-orig-head-rule {
          width: 3rem;
          height: 3px;
          border-radius: 999px;
          margin-top: 0.6rem;
          margin-left: auto;
          margin-right: auto;
          background: linear-gradient(90deg, var(--primary), var(--primary2));
          opacity: 0.9;
        }

        @media (max-width: 991.98px) {
          .foxcom-orig-head-top {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            padding-bottom: 0.85rem;
            margin-bottom: 0.5rem;
          }
          .foxcom-orig-bg.foxcom-orig--single .product-thumb {
            min-height: 280px;
            height: clamp(300px, min(62dvh, calc(100dvh - var(--foxcom-header-offset) - 9rem)), 680px);
          }
        }

        @media (min-width: 992px) {
          section.foxcom-originals.foxcom-orig-bg.padding-large {
            padding-top: 2.25rem !important;
            padding-bottom: 2.5rem !important;
          }
          .foxcom-orig-head-top {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            padding-bottom: 0.9rem;
            margin-bottom: 1rem;
          }
          .foxcom-orig-layout {
            align-items: stretch !important;
          }
          .foxcom-orig-head-inner .foxcom-orig-title {
            font-size: clamp(1.85rem, 2.5vw, 2.5rem) !important;
            line-height: 0.9 !important;
            letter-spacing: 0.06em !important;
          }
          .foxcom-orig-head-inner .foxcom-orig-subtitle {
            font-size: clamp(2.1rem, 3.25vw, 3.1rem) !important;
            line-height: 1 !important;
            margin-top: 0.12rem !important;
          }
          .foxcom-orig-head-rule {
            width: 3.35rem;
            margin-top: 0.65rem;
          }
          .foxcom-orig-swiper-outer {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: stretch;
          }
          .foxcom-orig-bg .product-swiper .swiper-pagination {
            margin-top: 0.55rem !important;
          }
          .foxcom-orig-bg .product-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }
          .foxcom-orig--single .foxcom-orig-swiper-outer .product-swiper {
            max-width: min(1120px, 99vw);
            width: 100%;
            align-self: center;
          }
          .foxcom-orig-bg .product-card {
            border-radius: 20px;
            overflow: hidden;
          }
          .foxcom-orig-bg .product-thumb {
            height: auto;
            flex: 1 1 auto;
            aspect-ratio: 3 / 4;
            max-height: min(860px, calc(100dvh - var(--foxcom-header-offset) - 7.5rem));
            min-height: min(420px, calc(100dvh - var(--foxcom-header-offset) - 10rem));
            border-radius: 18px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
          }
          .foxcom-orig-bg.foxcom-orig--single .product-thumb {
            aspect-ratio: 3 / 4;
            max-height: min(980px, calc(100dvh - var(--foxcom-header-offset) - 5rem));
            min-height: min(520px, calc(100dvh - var(--foxcom-header-offset) - 9rem));
          }
          .foxcom-orig-bg .product-thumb-img {
            filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.1));
          }
        }

        @keyframes foxcomAurora{
          0%   { transform: translate3d(-2%, -2%, 0) scale(1.02); background-position: 0% 40%; }
          35%  { transform: translate3d(3%, -1%, 0) scale(1.06);  background-position: 70% 10%; }
          70%  { transform: translate3d(2%, 4%, 0) scale(1.07);   background-position: 30% 90%; }
          100% { transform: translate3d(-2%, -2%, 0) scale(1.02); background-position: 0% 40%; }
        }

        @keyframes foxcomShimmer{
          0%   { transform: translate3d(0,0,0); opacity: 0.70; }
          50%  { transform: translate3d(-2%, 1%, 0); opacity: 0.95; }
          100% { transform: translate3d(0,0,0); opacity: 0.70; }
        }

        @media (max-width: 576px){
          .foxcom-orig-bg::before{ filter: blur(26px) saturate(140%); }
          .foxcom-orig-bg .product-swiper{ margin-top: 4px; }
        }

        @media (min-width: 768px){
          .foxcom-orig-bg{
            --sidePad: 36px;
          }
        }

        @media (prefers-reduced-motion: reduce){
          .foxcom-orig-bg::before,
          .foxcom-orig-bg::after{
            animation: none !important;
          }
          .foxcom-orig-bg .product-card{
            transition: none !important;
          }
        }

        /* Fine-tune for smaller screens so the whole section doesn't look oversized */
        @media (max-width: 575.98px){
          .foxcom-orig-bg .product-thumb{
            height: clamp(280px, min(58vw, calc(100dvh - var(--foxcom-header-offset) - 9rem)), 560px);
          }
          .foxcom-orig-title{
            font-size: clamp(1.9rem, 7vw, 2.35rem) !important;
            line-height: 0.95 !important;
          }
        }

        @media (min-width: 576px) and (max-width: 767.98px){
          .foxcom-orig-bg .product-thumb{
            height: clamp(320px, min(46vw, calc(100dvh - var(--foxcom-header-offset) - 8.5rem)), 620px);
          }
        }

        @media (min-width: 768px) and (max-width: 991.98px){
          .foxcom-orig-bg .product-thumb{
            height: clamp(340px, min(38vw, calc(100dvh - var(--foxcom-header-offset) - 8rem)), 680px);
          }
        }
      `}</style>
      <div className="container">
        <header className="foxcom-orig-head-top">
          {titleBlock()}
        </header>
        <div className="row foxcom-orig-layout gx-3 gx-lg-4 justify-content-center">
          <div className="col-12 foxcom-orig-products-col">
            <div className="foxcom-orig-swiper-outer">
              <Swiper
                className="product-swiper"
                modules={isSingleProduct ? [] : [Navigation, Pagination]}
                slidesPerView={4}
                spaceBetween={20}
                navigation={!isSingleProduct}
                pagination={
                  isSingleProduct
                    ? false
                    : {
                        clickable: true,
                        dynamicBullets: true,
                      }
                }
                breakpoints={{
                  0: { slidesPerView: 1, spaceBetween: 10 },
                  576: { slidesPerView: isSingleProduct ? 1 : 2, spaceBetween: 15 },
                  768: { slidesPerView: isSingleProduct ? 1 : 3, spaceBetween: 20 },
                  992: { slidesPerView: isSingleProduct ? 1 : 3, spaceBetween: 20 },
                }}
              >
                {originals.products.map((product) => {
                  const categoryId = product?.category?.id || null;
                  const categorySlug = product?.category?.slug || null;
                  const to = categorySlug
                    ? `/shop?categorySlug=${categorySlug}`
                    : categoryId
                      ? `/shop?categoryId=${categoryId}`
                      : "/shop";

                  return (
                    <SwiperSlide key={product.id}>
                      <Link to={to} className="text-decoration-none text-dark d-block w-100">
                        <div className="card shadow-sm product-card" style={{ border: "none", width: "100%" }}>
                          <div className="position-relative product-thumb">
                            <img
                              src={getImageUrl(product.thumbnailImage)}
                              alt={product.title}
                              className="product-thumb-img"
                              loading="lazy"
                              width="500"
                              height="500"
                              onError={(e) => {
                                e.currentTarget.src = getImageUrl("");
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoxcomOriginals;


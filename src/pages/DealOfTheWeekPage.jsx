import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import { productAPI, dealOfTheWeekAPI, getImageUrl, reviewAPI } from "../utils/api";
import { useCart } from "../contexts/CartContext";
import SimilarProducts from "../components/SimilarProducts";
import fallbackImage from "../assest/images/product-item1.jpg";

const DealOfTheWeekPage = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart, buyNow } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const mainImageRef = useRef(null);
  const scrollWrapRef = useRef(null);
  const accordionRef = useRef(null);
  const layoutRowRef = useRef(null);
  const [zoomState, setZoomState] = useState({
    isZoomed: false,
    mouseX: 0,
    mouseY: 0,
    bgX: 50,
    bgY: 50,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Review state (admin-managed reviews; display only)
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [distributionPercent, setDistributionPercent] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  const maskDisplayName = (value) => {
    const v = String(value || "").trim();
    if (!v) return "Customer";
    if (v.includes("*")) return v;
    if (!v.includes("@")) {
      if (v.length <= 2) return `${v[0] || ""}***`;
      const first = v[0];
      const last = v[v.length - 1];
      const starCount = v.length - 2 >= 7 ? 7 : Math.max(1, v.length - 2);
      return `${first}${"*".repeat(starCount)}${last}`;
    }
    const [userPart, domain] = v.split("@");
    if (!domain) return v;
    const first = userPart?.[0] || "";
    const last = userPart?.[userPart.length - 1] || "";
    const starCount =
      (userPart?.length || 0) - 2 >= 7
        ? 7
        : Math.max(1, (userPart?.length || 0) - 2);
    return `${first}${"*".repeat(starCount)}${last}@${domain}`;
  };

  useEffect(() => {
    const loadDealProduct = async () => {
      try {
        setLoading(true);
        const dealData = await dealOfTheWeekAPI.getActive();

        if (
          !dealData ||
          !dealData.isActive ||
          !dealData.products ||
          dealData.products.length === 0
        ) {
          navigate("/shop");
          return;
        }

        // Assume only one product is in the active deal; if multiple, take the first
        const firstProduct = dealData.products[0];
        const productId = firstProduct.id;

        const productData = await productAPI.getById(productId);
        setProduct(productData);
        setSelectedImage(0);
      } catch (error) {
        console.error("Error loading Deal of the Week product:", error);
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    loadDealProduct();
  }, [navigate]);

  useEffect(() => {
    if (!product?.id) return;

    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await reviewAPI.getByProduct(product.id);
        const revs = data.reviews || [];
        setReviews(revs);
        setAverageRating(data.averageRating || 0);
        const total = data.totalCount ?? revs.length;
        setTotalReviewCount(total);
        if (data.distribution && typeof data.distribution === "object" && total > 0) {
          setDistributionPercent(
            [1, 2, 3, 4, 5].reduce((acc, star) => {
              const count = data.distribution[star] || 0;
              acc[star] = (count / total) * 100;
              return acc;
            }, {})
          );
        } else if (revs.length > 0) {
          setDistributionPercent(
            [5, 4, 3, 2, 1].reduce((acc, star) => {
              const count = revs.filter(
                (r) => Math.min(5, Math.max(1, Number(r.rating))) === star
              ).length;
              acc[star] = (count / revs.length) * 100;
              return acc;
            }, {})
          );
        } else {
          setDistributionPercent({});
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
        setTotalReviewCount(0);
        setDistributionPercent({});
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [product]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll accordion into view when opened
  useEffect(() => {
    const accordionElement = accordionRef.current;
    const scrollContainer = scrollWrapRef.current;

    if (!accordionElement || !scrollContainer) return;

    const handleAccordionOpen = () => {
      const collapseElement = document.getElementById("collapseDescription");
      if (!collapseElement) return;

      setTimeout(() => {
        if (scrollContainer && accordionElement) {
          const accordionTop = accordionElement.offsetTop;
          const scrollTop = scrollContainer.scrollTop;
          const containerHeight = scrollContainer.clientHeight;

          const accordionVisibleTop = accordionTop - scrollTop;
          const accordionVisibleBottom =
            accordionVisibleTop + accordionElement.offsetHeight;

          if (
            accordionVisibleTop < 0 ||
            accordionVisibleBottom > containerHeight - 20
          ) {
            scrollContainer.scrollTo({
              top: Math.max(0, accordionTop - 30),
              behavior: "smooth",
            });
          }
        }
      }, 150);
    };

    const collapseElement = document.getElementById("collapseDescription");
    if (collapseElement) {
      collapseElement.addEventListener("shown.bs.collapse", handleAccordionOpen);

      return () => {
        collapseElement.removeEventListener(
          "shown.bs.collapse",
          handleAccordionOpen
        );
      };
    }
  }, [product]);

  // Scroll lock for right column (desktop only)
  useEffect(() => {
    const scrollContainer = scrollWrapRef.current;
    const layoutRow = layoutRowRef.current;
    if (!scrollContainer || !layoutRow) return;

    const handleWheel = (e) => {
      if (window.innerWidth < 768) return;

      const rowRect = layoutRow.getBoundingClientRect();
      const rowInView = rowRect.top < window.innerHeight && rowRect.bottom > 0;
      if (!rowInView) return;

      const isOverRightColumn = scrollContainer.contains(e.target);
      if (!isOverRightColumn) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
      const canScrollUp = scrollTop > 1;
      const delta = e.deltaY;

      if (e.deltaY > 0) {
        if (canScrollDown) {
          e.preventDefault();
          e.stopPropagation();
          const newScrollTop = Math.min(
            scrollTop + delta,
            scrollHeight - clientHeight
          );
          scrollContainer.scrollTop = newScrollTop;
        } else {
          e.preventDefault();
          window.scrollBy({ top: delta, left: 0, behavior: "auto" });
        }
      } else if (e.deltaY < 0) {
        if (canScrollUp) {
          e.preventDefault();
          e.stopPropagation();
          const newScrollTop = Math.max(scrollTop + delta, 0);
          scrollContainer.scrollTop = newScrollTop;
        } else {
          e.preventDefault();
          window.scrollBy({ top: delta, left: 0, behavior: "auto" });
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, [product]);

  const handleAddToCart = async () => {
    if (product) {
      const success = await addToCart(product, quantity);
      if (success) {
        alert(`${product.title} added to cart!`);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!product || !inStock) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to proceed with Buy Now");
      localStorage.setItem("redirectAfterLogin", `/deal-of-the-week`);
      navigate("/login");
      return;
    }

    const success = await buyNow(product, quantity);
    if (success) {
      navigate("/checkout");
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < (product.stock || 999)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatPrice = (price) => {
    return `Rs.${parseFloat(price).toFixed(2)}`;
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setZoomState((prev) => ({ ...prev, isZoomed: true }));
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setZoomState((prev) => ({ ...prev, isZoomed: false }));
    }
  };

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const el = mainImageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setZoomState((prev) => ({
      ...prev,
      mouseX: e.clientX,
      mouseY: e.clientY,
      bgX: percentX,
      bgY: percentY,
    }));
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const imagePaths = [];

  if (product.thumbnailImage) {
    imagePaths.push(product.thumbnailImage);
  }

  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img.imageUrl && img.imageUrl !== product.thumbnailImage) {
        imagePaths.push(img.imageUrl);
      }
    });
  }

  if (imagePaths.length === 0) {
    imagePaths.push(fallbackImage);
  }

  const images = imagePaths.map((path) => getImageUrl(path));
  const price = parseFloat(product.discountPrice || product.price);
  const originalPrice = product.discountPrice ? parseFloat(product.price) : null;
  const inStock = product.stock && product.stock > 0;

  return (
    <div className="padding-large">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/shop">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Deal of the Week
            </li>
          </ol>
        </nav>

        <div className="row product-detail-layout-row" ref={layoutRowRef}>
          <div className="col-md-6 product-images-col">
            <div className="product-images">
              {isMobile ? (
                <div className="product-swiper-mobile">
                  <Swiper
                    key={`swiper-${product?.id}-${images.length}`}
                    modules={[Navigation, Pagination, Zoom]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation={images.length > 1}
                    pagination={{ clickable: true }}
                    zoom={{
                      maxRatio: 3,
                      minRatio: 1,
                    }}
                    className="product-detail-swiper"
                    onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                    initialSlide={selectedImage}
                  >
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="swiper-zoom-container">
                          <img
                            src={img}
                            alt={`${product.title} ${index + 1}`}
                            className="img-fluid w-100"
                            style={{
                              borderRadius: "8px",
                              objectFit: "contain",
                              maxHeight: "500px",
                            }}
                            onError={(e) => {
                              e.target.src = fallbackImage;
                            }}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <>
                  <div
                    ref={mainImageRef}
                    className="product-detail-main-image-wrap main-image mb-3 position-relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <img
                      src={images[selectedImage] || images[0]}
                      alt={product.title}
                      className="product-detail-main-image img-fluid w-100"
                      style={{
                        borderRadius: "8px",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>
                  {zoomState.isZoomed && (
                    <div
                      className="magnifying-glass"
                      style={{
                        position: "fixed",
                        top: zoomState.mouseY,
                        left: zoomState.mouseX,
                        width: "240px",
                        height: "240px",
                        borderRadius: "50%",
                        border: "3px solid rgba(0,0,0,0.15)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        backgroundImage: `url(${images[selectedImage] || images[0]})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "250%",
                        backgroundPosition: `${zoomState.bgX}% ${zoomState.bgY}%`,
                        pointerEvents: "none",
                        zIndex: 1050,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                  {images.length > 1 && (
                    <div className="thumbnail-images-scroll">
                      <div className="thumbnail-images d-flex gap-2">
                        {images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${product.title} ${index + 1}`}
                            className={`product-detail-thumb img-thumbnail flex-shrink-0 ${
                              selectedImage === index ? "border-primary" : ""
                            }`}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "contain",
                              cursor: "pointer",
                            }}
                            onClick={() => setSelectedImage(index)}
                            onError={(e) => {
                              e.target.src = fallbackImage;
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <style>{`
                .product-images-col {
                  min-width: 0;
                }
                .product-images {
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                  max-height: calc(100vh - 120px);
                }
                .product-detail-main-image-wrap {
                  overflow: hidden;
                  border-radius: 8px;
                  cursor: crosshair;
                  flex: 1;
                  min-height: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 1rem;
                }
                .product-detail-main-image {
                  display: block;
                  max-height: calc(100vh - 250px);
                  width: 100%;
                  object-fit: contain;
                }
                .thumbnail-images-scroll {
                  overflow-x: auto;
                  overflow-y: hidden;
                  -webkit-overflow-scrolling: touch;
                  scrollbar-width: thin;
                  max-width: 100%;
                  flex-shrink: 0;
                  padding-bottom: 0.5rem;
                }
                .thumbnail-images-scroll::-webkit-scrollbar {
                  height: 6px;
                }
                .thumbnail-images-scroll::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 3px;
                }
                .thumbnail-images-scroll::-webkit-scrollbar-thumb {
                  background: #c1c1c1;
                  border-radius: 3px;
                }
                .product-detail-thumb {
                  transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .product-detail-thumb:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .product-swiper-mobile {
                  width: 100%;
                  margin-bottom: 1rem;
                }
                .product-detail-swiper {
                  width: 100%;
                  height: auto;
                }
                .product-detail-swiper .swiper-slide {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f8f9fa;
                  border-radius: 8px;
                }
                .product-detail-swiper .swiper-zoom-container {
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .product-detail-swiper .swiper-button-next,
                .product-detail-swiper .swiper-button-prev {
                  color: var(--primary-color, #89bb56);
                  background: rgba(255, 255, 255, 0.9);
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                .product-detail-swiper .swiper-button-next:after,
                .product-detail-swiper .swiper-button-prev:after {
                  font-size: 18px;
                  font-weight: bold;
                }
                .product-detail-swiper .swiper-pagination-bullet {
                  background: var(--primary-color, #89bb56);
                  opacity: 0.5;
                }
                .product-detail-swiper .swiper-pagination-bullet-active {
                  opacity: 1;
                }
                @media (max-width: 767px) {
                  .product-images {
                    max-height: none;
                  }
                  .product-detail-main-image-wrap {
                    cursor: default !important;
                  }
                  .product-detail-main-image {
                    max-height: 500px;
                  }
                }
              `}</style>
          </div>

          <div className="col-md-6 product-details-col">
            <div className="product-details-scroll-wrap" ref={scrollWrapRef}>
              <h1
                className="h2 h-md-3 text-uppercase mb-3 fw-bold product-detail-title"
                style={{ fontSize: "clamp(1.1rem, 3.5vw + 0.5rem, 1.5rem)" }}
              >
                {product.title}
              </h1>

              {product.sku && (
                <p className="text-muted mb-2 product-detail-sku">
                  <span className="fw-medium">{product.sku}</span>
                </p>
              )}

              <div className="price-section mb-3 product-detail-price-block">
                <div className="product-detail-price-line">
                  {originalPrice && (
                    <span
                      className="text-danger me-2 fw-semibold"
                      style={{
                        fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                      }}
                    >
                      -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                    </span>
                  )}
                  <span
                    className="discounted-price text-primary fw-bold"
                    style={{
                      fontSize: "clamp(1.1rem, 3.5vw + 0.5rem, 1.8rem)",
                    }}
                  >
                    {formatPrice(price)}
                  </span>
                </div>
                {originalPrice && (
                  <div className="product-detail-price-line product-detail-price-mrp">
                    <span
                      className="text-muted"
                      style={{
                        fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                      }}
                    >
                      M.R.P:{" "}
                      <span className="text-decoration-line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    </span>
                  </div>
                )}
                <p className="product-detail-price-tax text-muted small mb-0">
                  Inclusive of all taxes
                </p>
              </div>

              {product.caseDetails && (
                <div className="case-details mb-4">
                  <h5
                    className="mb-2 fw-semibold"
                    style={{ fontSize: "1.1rem" }}
                  >
                    PRODUCT SPECIFICATIONS:
                  </h5>
                  <div className="card">
                    <div className="card-body">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <th style={{ width: "150px" }}>Case Brand</th>
                            <td> FOXECOM</td>
                          </tr>
                          <tr>
                            <th style={{ width: "150px" }}>Brand</th>
                            <td>{product.caseDetails.brand?.name || "N/A"}</td>
                          </tr>
                          <tr>
                            <th>Model</th>
                            <td>{product.caseDetails.model?.name || "N/A"}</td>
                          </tr>
                          {product.caseDetails.color && (
                            <tr>
                              <th>Color</th>
                              <td className="text-capitalize">
                                {product.caseDetails.color}
                              </td>
                            </tr>
                          )}
                          {product.caseDetails.material && (
                            <tr>
                              <th>Material</th>
                              <td className="text-capitalize">
                                {product.caseDetails.material}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="quantity-section mb-4">
                <label className="form-label">Quantity:</label>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center mx-2"
                    style={{ width: "80px" }}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(
                        Math.min(Math.max(1, val), product.stock || 999)
                      );
                    }}
                    min="1"
                    max={product.stock || 999}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={increaseQuantity}
                    disabled={!inStock || quantity >= (product.stock || 999)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="selling-points mb-4">
                <ul className="selling-points-list list-unstyled mb-0">
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      Free delivery across India
                    </span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      We deliver within 4-7 business days
                    </span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      Rated <span className="stars">★★★★★</span> by 3M+ happy
                      customers
                    </span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      100% satisfaction guarantee
                    </span>
                  </li>

                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      Pan-India delivery to 25,000+ pincodes
                    </span>
                  </li>
                </ul>
              </div>

              <div className="action-buttons d-flex flex-column gap-3">
                <button
                  className="btn btn-lg w-100 btn-primary btn-add-to-cart btn-add-to-cart-product-detail"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  {isInCart(product.id) ? "Add to Cart" : "Add to Cart"}
                </button>
                <button
                  className="btn btn-lg w-100 btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  Buy Now
                </button>
              </div>

              <div
                className="product-description-accordion-section mt-4 mt-md-5"
                ref={accordionRef}
              >
                <div
                  className="accordion product-details-accordion"
                  id="productDetailsAccordion"
                >
                  {product.caseDetails?.caseType && (
                    <div className="accordion-item product-accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button product-accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseAboutThisItem"
                          aria-expanded="false"
                          aria-controls="collapseAboutThisItem"
                        >
                          <span className="accordion-icon-wrapper me-3">
                            <i className="bi bi-info-circle" aria-hidden="true" />
                          </span>
                          <span className="accordion-title-text">
                            About this item
                          </span>
                        </button>
                      </h2>
                      <div
                        id="collapseAboutThisItem"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingAboutThisItem"
                        data-bs-parent="#productDetailsAccordion"
                      >
                        <div className="accordion-body product-accordion-body">
                          <div className="about-this-item-markdown">
                            <MarkdownPreview
                              source={product.caseDetails.caseType}
                              className="product-details-markdown"
                              style={{
                                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                                lineHeight: "1.6",
                              }}
                              wrapperElement={{ "data-color-mode": "light" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="accordion-item product-accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button product-accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseDescription"
                        aria-expanded="false"
                        aria-controls="collapseDescription"
                      >
                        <span className="accordion-icon-wrapper me-3">
                          <i className="bi bi-file-text" aria-hidden="true" />
                        </span>
                        <span className="accordion-title-text">
                          Product Description
                        </span>
                      </button>
                    </h2>
                    <div
                      id="collapseDescription"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingDescription"
                      data-bs-parent="#productDetailsAccordion"
                    >
                      <div className="accordion-body product-accordion-body">
                        {product.description ? (
                          <div className="description product-description-markdown">
                            <MarkdownPreview
                              source={product.description}
                              className="product-details-markdown"
                              style={{
                                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                                lineHeight: "1.6",
                              }}
                              wrapperElement={{ "data-color-mode": "light" }}
                            />
                          </div>
                        ) : (
                          <p className="text-muted mb-0">
                            No description available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="reviews"
          className="row mt-4 mt-md-5 customer-reviews-section"
        >
          <div className="col-12">
            <h3
              className="mb-3 mb-md-4 fw-bold"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
            >
              Customer reviews
            </h3>

            <div className="customer-reviews-rating-breakdown mb-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const percent = distributionPercent[star] ?? 0;
                return (
                  <div
                    key={star}
                    className="customer-reviews-rating-row d-flex align-items-center gap-2 gap-sm-3 mb-2"
                  >
                    <span className="customer-reviews-star-label text-nowrap">
                      {star} star
                    </span>
                    <div className="customer-reviews-bar-wrap rounded">
                      <div
                        className="customer-reviews-bar-fill h-100 rounded"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="customer-reviews-percent text-muted small text-nowrap">
                      {Math.round(percent)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="row customer-reviews-grid row-cols-1 row-cols-lg-4 g-3">
                {reviews.map((r) => (
                  <div key={r.id} className="col">
                    <div className="list-group-item list-group-item-action p-3 p-md-4 review-list-item h-100">
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-1 review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`bi ${
                                  star <= r.rating
                                    ? "bi-star-fill text-warning"
                                    : "bi-star text-muted"
                                }`}
                                style={{
                                  fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-muted review-customer-name fw-medium">
                            {maskDisplayName(r.reviewerName || "Customer")}
                          </span>
                        </div>
                        {r.reviewText && (
                          <p className="mb-0 review-text">{r.reviewText}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : totalReviewCount > 0 ? (
              <p
                className="text-muted"
                style={{
                  fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)",
                }}
              >
                Rating summary is shown above. Written reviews from customers will appear here when
                submitted.
              </p>
            ) : (
              <p
                className="text-muted"
                style={{
                  fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)",
                }}
              >
                No reviews yet for this product.
              </p>
            )}
          </div>
        </div>

        {product && <SimilarProducts product={product} limit={8} />}
      </div>
    </div>
  );
};

export default DealOfTheWeekPage;


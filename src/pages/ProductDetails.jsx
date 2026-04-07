import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { productAPI, getImageUrl, reviewAPI, orderAPI } from "../utils/api";
import { getProductPathSegment } from "../utils/productPath";
import { useCart } from "../contexts/CartContext";
import SimilarProducts from "../components/SimilarProducts";
import ProductDetailsTrustStrip from "../components/ProductDetailsTrustStrip";
import ProductSellerReviews from "../components/ProductSellerReviews";
import { StarDisplay } from "../components/RatingBreakdownModal";
import fallbackImage from "../assest/images/product-item1.jpg";

const ProductDetails = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = typeof window !== "undefined" ? !!localStorage.getItem("token") : false;
  const { addToCart, isInCart, buyNow } = useCart();
  const [product, setProduct] = useState(null);

  const upsertCanonical = (slug) => {
    try {
      if (typeof document === "undefined" || !slug) return;
      const href = `${window.location.origin}/product/${slug}`;
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    } catch {
      // No-op: SEO meta updates shouldn't break the product page
    }
  };

  const numericProductId = useMemo(() => {
    if (!slugOrId) return null;
    const s = String(slugOrId).trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    return product?.id ?? null;
  }, [slugOrId, product?.id]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const mainImageRef = useRef(null);
  const scrollWrapRef = useRef(null);
  const accordionRef = useRef(null);
  const layoutRowRef = useRef(null);
  const lastTrackedProductIdRef = useRef(null);
  const reviewFormRef = useRef(null);
  const ratingOverlayWrapRef = useRef(null);
  const [zoomState, setZoomState] = useState({
    isZoomed: false,
    mouseX: 0,
    mouseY: 0,
    bgX: 50,
    bgY: 50,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isRatingOverlayOpen, setIsRatingOverlayOpen] = useState(false);

  // Review state (admin-managed reviews; display only)
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [distributionPercent, setDistributionPercent] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Customer review form state
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");

  const [canReviewProduct, setCanReviewProduct] = useState(false);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  const maskDisplayName = (value) => {
    const v = String(value || "").trim();
    if (!v) return "Customer";
    if (v.includes("*")) return v; // already masked by backend
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
    loadProduct();
  }, [slugOrId]);

  useEffect(() => {
    if (numericProductId != null) loadReviews();
  }, [numericProductId]);

  // Deep-link support: /product/:id?writeReview=1
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    if (params.get("writeReview") !== "1") return;

    // Give the DOM a moment to paint before scrolling.
    setTimeout(() => {
      if (reviewFormRef.current) {
        reviewFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 250);
  }, [location.search]);

  // Load the currently logged-in user's review (if any) to prefill the form.
  useEffect(() => {
    if (numericProductId == null) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const loadMyReview = async () => {
      try {
        const data = await reviewAPI.getMyReviews();
        const reviewsList = data?.reviews || [];
        const match = reviewsList.find(
          (r) => String(r?.product?.id) === String(numericProductId)
        );

        if (match) {
          setMyReview(match);
          setReviewRating(match.rating || 5);
          setReviewText(match.reviewText || "");
        } else {
          setMyReview(null);
          setReviewRating(5);
          setReviewText("");
        }
      } catch (err) {
        console.error("Failed to load my reviews:", err);
      }
    };

    loadMyReview();
  }, [numericProductId]);

  // Only show the review form if the logged-in customer has purchased this product.
  useEffect(() => {
    const checkEligibility = async () => {
      if (numericProductId == null || !isLoggedIn) {
        setCanReviewProduct(false);
        return;
      }

      setLoadingEligibility(true);
      try {
        const orders = await orderAPI.getMyOrders({
          page: 1,
          limit: 50,
        });

        const match = (orders || []).some((o) => {
          const st = o?.status;
          if (st !== "paid" && st !== "delivered") return false;
          const items = o?.orderItems || [];
          return items.some((it) => String(it?.product?.id || it?.productId) === String(numericProductId));
        });

        setCanReviewProduct(Boolean(match));
      } catch (err) {
        console.error("Failed to check review eligibility:", err);
        setCanReviewProduct(false);
      } finally {
        setLoadingEligibility(false);
      }
    };

    checkEligibility();
  }, [numericProductId, isLoggedIn]);

  // Fire Meta Pixel ViewContent when the product finishes loading.
  useEffect(() => {
    if (!product) return;
    if (typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    const resolvedProductId = String(product.id);

    if (lastTrackedProductIdRef.current === resolvedProductId) return;
    lastTrackedProductIdRef.current = resolvedProductId;

    const valueRaw = parseFloat(product.discountPrice || product.price || 0);
    const value = Number.isFinite(valueRaw) ? valueRaw : 0;

    window.fbq("track", "ViewContent", {
      content_ids: [resolvedProductId],
      content_name: product.title || "",
      content_type: "product",
      value,
      currency: "INR",
    });
  }, [product]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || !isRatingOverlayOpen) return;

    const handleOutsidePointer = (event) => {
      if (!ratingOverlayWrapRef.current) return;
      if (!ratingOverlayWrapRef.current.contains(event.target)) {
        setIsRatingOverlayOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [isMobile, isRatingOverlayOpen]);

  // Auto-scroll accordion into view when opened
  useEffect(() => {
    const accordionElement = accordionRef.current;
    const scrollContainer = scrollWrapRef.current;

    if (!accordionElement || !scrollContainer) return;

    const handleAccordionOpen = (e) => {
      // Check if it's the description accordion (by checking the collapse element)
      const collapseElement = document.getElementById('collapseDescription');
      if (!collapseElement) return;

      // Wait for Bootstrap animation to complete
      setTimeout(() => {
        if (scrollContainer && accordionElement) {
          // Get the accordion section position relative to scroll container
          const accordionRect = accordionElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();

          // Calculate positions
          const accordionTop = accordionElement.offsetTop;
          const scrollTop = scrollContainer.scrollTop;
          const containerHeight = scrollContainer.clientHeight;

          // Check if accordion is visible in viewport
          const accordionVisibleTop = accordionTop - scrollTop;
          const accordionVisibleBottom = accordionVisibleTop + accordionElement.offsetHeight;

          // If accordion is not fully visible or partially hidden, scroll it into view
          if (accordionVisibleTop < 0 || accordionVisibleBottom > containerHeight - 20) {
            scrollContainer.scrollTo({
              top: Math.max(0, accordionTop - 30), // 30px padding from top
              behavior: 'smooth'
            });
          }
        }
      }, 150); // Delay to allow Bootstrap animation to start
    };

    // Listen for Bootstrap collapse shown event on the accordion container
    const collapseElement = document.getElementById('collapseDescription');
    if (collapseElement) {
      collapseElement.addEventListener('shown.bs.collapse', handleAccordionOpen);

      return () => {
        collapseElement.removeEventListener('shown.bs.collapse', handleAccordionOpen);
      };
    }
  }, [product]);

  // Scroll lock: right column scrolls first when in view (desktop only). Smooth wheel handling.
  useEffect(() => {
    const scrollContainer = scrollWrapRef.current;
    const layoutRow = layoutRowRef.current;
    if (!scrollContainer || !layoutRow) return;

    const handleWheel = (e) => {
      if (window.innerWidth < 768) return;

      const rowRect = layoutRow.getBoundingClientRect();
      const rowInView = rowRect.top < window.innerHeight && rowRect.bottom > 0;
      if (!rowInView) return;

      // Only capture wheel when pointer is over the right column – else let page scroll natively
      const isOverRightColumn = scrollContainer.contains(e.target);
      if (!isOverRightColumn) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
      const canScrollUp = scrollTop > 1;

      // Use native-feel delta (no big multiplier) so trackpad/laptop scroll is smooth
      const delta = e.deltaY;

      if (e.deltaY > 0) {
        // Scrolling down: scroll right column first, then page
        if (canScrollDown) {
          e.preventDefault();
          e.stopPropagation();
          const newScrollTop = Math.min(scrollTop + delta, scrollHeight - clientHeight);
          scrollContainer.scrollTop = newScrollTop;
        } else {
          // At bottom of right column – let the page scroll down
          e.preventDefault();
          window.scrollBy({ top: delta, left: 0, behavior: "auto" });
        }
      } else if (e.deltaY < 0) {
        // Scrolling up: scroll right column first; when at top, scroll page up
        if (canScrollUp) {
          e.preventDefault();
          e.stopPropagation();
          const newScrollTop = Math.max(scrollTop + delta, 0);
          scrollContainer.scrollTop = newScrollTop;
        } else {
          // At top of right column – scroll the page up
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

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productAPI.getById(slugOrId);

      // SEO/canonical safeguard:
      // If the user opened the numeric ID URL but this product has a slug,
      // immediately move them to the slug-based URL and do not render content on /product/:id.
      const isNumericRouteParam = /^\d+$/.test(String(slugOrId || "").trim());
      const slug = productData?.slug ? String(productData.slug).trim() : "";
      if (isNumericRouteParam && slug && slug !== String(slugOrId)) {
        upsertCanonical(slug);
        navigate(`/product/${slug}${location.search || ""}`, { replace: true });
        return;
      }

      setProduct(productData);
      setSelectedImage(0);
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      const success = await addToCart(product, quantity);
      if (success) {
        if (typeof window !== "undefined" && typeof window.fbq === "function") {
          const resolvedProductId = product.id;
          const unitValueRaw = parseFloat(
            product.discountPrice || product.price || 0
          );
          const unitValue = Number.isFinite(unitValueRaw) ? unitValueRaw : 0;

          window.fbq("track", "AddToCart", {
            content_ids: [String(resolvedProductId)],
            content_name: product.title || "",
            content_type: "product",
            value: unitValue * quantity,
            currency: "INR",
          });
        }

        // Success handled by CartContext toast
      }
    }
  };

  const handleBuyNow = async () => {
    if (!product || !inStock) return;

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to proceed with Buy Now');
      localStorage.setItem('redirectAfterLogin', `/product/${getProductPathSegment(product)}`);
      navigate('/login');
      return;
    }

    const success = await buyNow(product, quantity);
    if (success) {
      navigate('/checkout');
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
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const handleMouseEnter = () => {
    // Only enable zoom on desktop
    if (!isMobile) {
      setZoomState((prev) => ({ ...prev, isZoomed: true }));
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setZoomState((prev) => ({ ...prev, isZoomed: false }));
    }
  };

  const loadReviews = async () => {
    if (numericProductId == null) return;
    try {
      setLoadingReviews(true);
      const data = await reviewAPI.getByProduct(numericProductId);
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
            const count = revs.filter((r) => Math.min(5, Math.max(1, Number(r.rating))) === star).length;
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

  const handleLoginForReview = () => {
    const redirectTo = `/product/${product ? getProductPathSegment(product) : slugOrId}?writeReview=1`;
    localStorage.setItem("redirectAfterLogin", redirectTo);
    navigate("/login");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitError("");

    const token = localStorage.getItem("token");
    if (!token) {
      handleLoginForReview();
      return;
    }

    if (numericProductId == null) {
      setReviewSubmitError("Product is still loading. Try again in a moment.");
      return;
    }

    if (!canReviewProduct && !myReview) {
      setReviewSubmitError("You can only review products you have purchased.");
      return;
    }

    const safeRating = Math.min(5, Math.max(1, parseInt(reviewRating, 10)));
    if (!Number.isFinite(safeRating)) {
      setReviewSubmitError("Please select a star rating.");
      return;
    }

    const trimmedText = String(reviewText || "").trim();

    try {
      setReviewSubmitting(true);
      await reviewAPI.createOrUpdateCustomerReview(numericProductId, {
        rating: safeRating,
        reviewText: trimmedText,
      });

      // Refresh the public review list (includes your just-submitted review).
      await loadReviews();
      setMyReview({
        product: { id: product?.id ?? numericProductId },
        rating: safeRating,
        reviewText: trimmedText,
        isVerifiedPurchase: true,
      });
      setReviewSubmitError("");
    } catch (err) {
      setReviewSubmitError(err?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMouseMove = (e) => {
    // Only enable zoom on desktop
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

  // Build image array with thumbnail first, then all other images
  const imagePaths = [];

  // Add thumbnail image first if it exists
  if (product.thumbnailImage) {
    imagePaths.push(product.thumbnailImage);
  }

  // Add all other product images (excluding thumbnail if it's already in the array)
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      // Only add if it's different from thumbnail to avoid duplicates
      if (img.imageUrl && img.imageUrl !== product.thumbnailImage) {
        imagePaths.push(img.imageUrl);
      }
    });
  }

  // Fallback to default image if no images found
  if (imagePaths.length === 0) {
    imagePaths.push(fallbackImage);
  }

  const images = imagePaths.map((path) => getImageUrl(path));
  const price = parseFloat(product.discountPrice || product.price);
  const originalPrice = product.discountPrice
    ? parseFloat(product.price)
    : null;
  const inStock = product.stock && product.stock > 0;

  const formattedReviewCount = totalReviewCount
    ? totalReviewCount.toLocaleString("en-IN")
    : "0";
  const hasRatings = totalReviewCount > 0;

  const goToReviews = () => {
    setIsRatingOverlayOpen(false);
    if (typeof document === "undefined") return;
    const el = document.getElementById("reviews");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="padding-large product-detail-page">
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
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="row product-detail-layout-row" ref={layoutRowRef}>
          <div className="col-md-6 product-images-col">
            <div className="product-images">
              {/* Mobile: Swiper Gallery with Touch/Swipe */}
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
                            loading="lazy"
                            width="1000"
                            height="1000"
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
                  {/* Desktop: Main Image with Zoom */}
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
                      loading="eager"
                      fetchpriority="high"
                      width="1000"
                      height="1000"
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
                  {/* Desktop: Thumbnails */}
                  {images.length > 1 && (
                    <div className="thumbnail-images-scroll">
                      <div className="thumbnail-images d-flex gap-2">
                        {images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${product.title} ${index + 1}`}
                            className={`product-detail-thumb img-thumbnail flex-shrink-0 ${selectedImage === index ? "border-primary" : ""}`}
                            loading="lazy"
                            width="80"
                            height="80"
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
                  margin-top : 10px;
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
                  color: var(--primary-color, #547535);
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
                  background: var(--primary-color, #547535);
                  opacity: 0.5;
                  width: 8px;
                  height: 8px;
                  border-radius: 4px;
                }
                .product-detail-swiper .swiper-pagination-bullet-active {
                  opacity: 1;
                  width: 16px;
                  height: 8px;
                  border-radius: 4px;
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
                  .product-detail-page {
                    padding-bottom: 100px;
                  }
                  .product-mobile-sticky-actions {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1040;
                    display: grid !important;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem !important;
                    padding: 0.6rem 0.75rem calc(0.6rem + env(safe-area-inset-bottom, 0px));
                    margin: 0 !important;
                    background: #ffffff;
                    border-top: 1px solid #e9ecef;
                    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
                  }
                  .product-mobile-sticky-actions .btn {
                    width: 100% !important;
                    min-height: 44px;
                    margin: 0 !important;
                    font-size: 0.95rem;
                  }
                }
              `}</style>
          </div>

          <div className="col-md-6 product-details-col">
            <div className="product-details-scroll-wrap" ref={scrollWrapRef}>
              <h1
                className="h-md-3 text-uppercase mb-3 fw-bold product-detail-title"
                style={{ fontSize: "clamp(1.1rem, 3.5vw + 0.5rem, 1.5rem)" }}
              >
                {product.title}
              </h1>

              {hasRatings && (
                <div
                  ref={ratingOverlayWrapRef}
                  className={`product-detail-rating-hover-wrap${
                    isRatingOverlayOpen ? " is-open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="product-detail-rating-trigger"
                    aria-label={`Rated ${Number(averageRating).toFixed(1)} out of 5 stars by ${formattedReviewCount} customers`}
                    onClick={(e) => {
                      // On mobile, there is no hover; toggle overlay on tap.
                      if (!isMobile) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRatingOverlayOpen((v) => !v);
                    }}
                  >
                    <StarDisplay
                      rating={averageRating}
                      size="var(--product-detail-rating-star-size)"
                      className="product-detail-rating-stars"
                    />
                    <span className="product-detail-rating-count">
                      ({formattedReviewCount})
                    </span>
                  </button>

                  <div
                    className="product-detail-rating-hover-overlay"
                    role="tooltip"
                  >
                    {isMobile && (
                      <button
                        type="button"
                        className="product-detail-rating-overlay-close-mobile"
                        aria-label="Close"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsRatingOverlayOpen(false);
                          if (document.activeElement && typeof document.activeElement.blur === "function") {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        X
                      </button>
                    )}
                    <div className="product-detail-rating-overlay-header">
                      <div className="product-detail-rating-overlay-header-top">
                        <StarDisplay
                          rating={averageRating}
                          size="var(--product-detail-rating-overlay-star-size)"
                        />
                        <span className="product-detail-rating-overlay-average">
                          {Number(averageRating).toFixed(1)} out of 5
                        </span>
                      </div>
                      <div className="product-detail-rating-overlay-sub">
                        {formattedReviewCount} global ratings
                      </div>
                    </div>

                    <div className="product-detail-rating-overlay-bars">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percent = distributionPercent[star] ?? 0;
                        return (
                          <div
                            key={star}
                            className="product-detail-rating-overlay-row"
                          >
                            <span className="product-detail-rating-overlay-star-label">
                              {star} star
                            </span>
                            <div className="product-detail-rating-overlay-bar-wrap">
                              <div
                                className="product-detail-rating-overlay-bar-fill"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="product-detail-rating-overlay-percent">
                              {Math.round(percent)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="product-detail-rating-overlay-cta-row">
                      <button
                        type="button"
                        className="product-detail-rating-overlay-cta btn btn-primary btn-sm"
                        onClick={goToReviews}
                      >
                        See customer reviews
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="price-section mb-3 product-detail-price-block">
                <div className="product-detail-price-line">
                  {originalPrice && (
                    <span
                      className="text-danger me-2"
                      style={{
                        fontSize: "clamp(1.1rem, 3.5vw + 0.5rem, 1.5rem)",
                        fontWeight: 900,
                      }}
                    >
                      -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                    </span>
                  )}
                  <span
                    className="discounted-price text-black"
                    style={{ fontSize: "clamp(1.1rem, 3.5vw + 0.5rem, 1.8rem)" ,
                      fontWeight: 300,
                    }}
                  >
                    {formatPrice(price)}
                  </span>
                </div>
                {originalPrice && (
                  <div className="product-detail-price-line product-detail-price-mrp">
                    <span style={{ fontSize: "clamp(0.6rem, 2.5vw, 0.8rem)", color: "#495057" }}>
                      M.R.P: <span className="text-decoration-line-through" style={{ color: "#212529" }}>{formatPrice(originalPrice)}</span>
                    </span>
                  </div>
                )}
                <p className="product-detail-price-tax text-muted small mb-0 font-10">
                  Inclusive of all taxes
                </p>

                <p className="product-detail-emi-text text-muted small mb-0 mt-1 font-10">
                  EMI options available during payment checkout
                </p>
              </div>

              {/* Display Case Details for Mobile Cases */}
              {product.caseDetails && (
                <div className="case-details mb-4">
                  <h2 className="mb-2 fw-semibold" style={{ fontSize: "1.1rem" }}>
                    PRODUCT SPECIFICATIONS:
                  </h2>
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
                          {/* {product.caseDetails.caseType && (
                          <tr>
                            <th>Case Type</th>
                            <td>
                              <div className="product-case-type-markdown">
                                <MarkdownPreview
                                  source={product.caseDetails.caseType}
                                  wrapperElement={{
                                    "data-color-mode": "light",
                                  }}
                                  style={{
                                    fontSize: "0.8rem",
                                    lineHeight: "0.8",
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )} */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}



              <div className="quantity-section mb-4">
                <label htmlFor="product-quantity-input" className="form-label">Quantity:</label>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    id="product-quantity-input"
                    type="number"
                    className="form-control text-center mx-2"
                    style={{ width: "80px" }}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(
                        Math.min(Math.max(1, val), product.stock || 999),
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

              {/* Selling Points */}
              <div className="selling-points mb-4">
                <ul className="selling-points-list list-unstyled mb-0">
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">Free delivery across India</span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">We deliver within 4-7 business days</span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">
                      Rated <span className="stars">★★★★★</span> by 3M+ happy customers
                    </span>
                  </li>
                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">100% satisfaction guarantee</span>
                  </li>

                  <li className="selling-point-item">
                    <span className="selling-point-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    <span className="selling-point-text">Pan-India delivery to 25,000+ pincodes</span>
                  </li>
                </ul>
              </div>

              <div className="action-buttons d-flex flex-column gap-3 product-mobile-sticky-actions">
                <button
                  className="btn btn-lg w-100 btn-primary btn-add-to-cart btn-add-to-cart-product-detail"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  {/* <svg className="cart-outline me-2" width="20" height="20">
                  <use xlinkHref="#cart-outline"></use>
                </svg> */}
                  {isInCart(product.id) ? "Add to Cart" : "Add to Cart"}
                </button>
                <button
                  className="btn btn-lg w-100 btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  {/* <i className="bi bi-lightning-fill me-2"></i> */}
                  Buy Now
                </button>
              </div>

              {/* Product Description Accordion - inside right column for laptop layout */}
              <div className="product-description-accordion-section mt-4 mt-md-5" ref={accordionRef}>
                <div className="accordion product-details-accordion" id="productDetailsAccordion">
                  {/* About this item - case type (for products with caseDetails) */}
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
                          <span className="accordion-title-text">About this item</span>
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
                              style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", lineHeight: "1.6" }}
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
                        <span className="accordion-title-text">Product Description</span>
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
                              style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", lineHeight: "1.6" }}
                              wrapperElement={{ "data-color-mode": "light" }}
                            />
                          </div>
                        ) : (
                          <p className="text-muted mb-0">No description available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip - service guarantees */}
        {/* <div className="container">
          <ProductDetailsTrustStrip />
        </div> */}

        {/* Featured seller reviews (curated) — before customer reviews */}
        <ProductSellerReviews productId={numericProductId} productTitle={product?.title} />

        {/* Customer Reviews Section - below product details */}
        <div id="reviews" className="row mt-4 mt-md-5 customer-reviews-section">
          <div className="col-12">
            <h3 className="mb-3 mb-md-4 fw-bold" style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
              RATINGS
            </h3>

            {/* Star rating breakdown - all percentages, no expand */}
            <div className="customer-reviews-rating-breakdown mb-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const percent = distributionPercent[star] ?? 0;
                return (
                  <div key={star} className="customer-reviews-rating-row d-flex align-items-center gap-2 gap-sm-3 mb-2">
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
                {/* {reviews.map((r) => (
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
                ))} */}
              </div>
            ) : 
            totalReviewCount > 0 ? (
              <div
                className="text-muted"
                style={{ fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)" }}
              >
                <hr className="mb-0" />
              </div>
            ) : (
              <div
                className="text-muted"
                style={{ fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)" }}
              >
                <hr className="mb-0" />
              </div>
            )
            }
          </div>
        </div>

        {/* Customer review write form */}
        {!isLoggedIn ? (
          <div ref={reviewFormRef} className="mt-4 mt-md-5 review-write-section">
            {/* <h4 className="mb-3 fw-bold" style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}>
              Write a review
            </h4> */}

            {/* <div className="alert alert-warning mb-0">
              Please login to write a review.
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleLoginForReview}
                >
                  Login
                </button>
              </div>
            </div> */}
          </div>
        ) : canReviewProduct || myReview ? (
          <div ref={reviewFormRef} className="mt-4 mt-md-5 review-write-section">
            {/* <h4 className="mb-3 fw-bold" style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}>
              Write a review
            </h4> */}

            {loadingEligibility ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : myReview ? (
              <div className="alert alert-success mb-0 text-dark">
                <div className="fw-semibold">Thanks for your review!</div>
                <div className="small mt-1" style={{ color: "#1f2937" }}>
                  {myReview.rating} / 5 stars
                </div>
                {myReview.reviewText ? (
                  <div className="review-text mt-2">{myReview.reviewText}</div>
                ) : null}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your rating</label>
                  <div className="d-flex align-items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Set rating to ${star}`}
                      >
                        <i
                          className={`bi ${
                            star <= reviewRating
                              ? "bi-star-fill text-warning"
                              : "bi-star text-muted"
                          }`}
                          style={{ fontSize: "1.4rem" }}
                        />
                      </button>
                    ))}
                    <span className="text-muted ms-2">{reviewRating} / 5</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Your review</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product."
                    maxLength={5000}
                  />
                </div>

                {reviewSubmitError ? (
                  <div className="text-danger small mb-3">{reviewSubmitError}</div>
                ) : null}

                <button
                  className="btn btn-success"
                  type="submit"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* Similar Products Section */}
        {product && (
          <SimilarProducts product={product} limit={8} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

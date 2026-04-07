import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/api';
import { getProductPathSegment } from '../utils/productPath';
import { useCart } from '../contexts/CartContext';
import ProductRatingExpandable from './ProductRatingExpandable';

/**
 * Memoized Product Card Component
 * Prevents unnecessary re-renders when parent component updates
 */
const ProductCard = memo(({ product, onAddToCart, showAddToCart = true, showBuyNow = true }) => {
  const navigate = useNavigate();
  const { buyNow } = useCart();
  const {
    id,
    title,
    price,
    discountPrice,
    thumbnailImage,
    images,
    rating,
    reviewCount,
    inStock,
  } = product;

  const pathSegment = getProductPathSegment(product);

  // console.log("From Product card Page : ",product);
  

  const imageUrl = getImageUrl(thumbnailImage || images?.[0]?.imageUrl);
  const finalPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const fiveStarCount = Math.max(
    0,
    parseInt(
      product?.count5 ??
        product?.fiveStarCount ??
        product?.ratingSummary?.count5 ??
        product?.distribution?.[5] ??
        product?.distribution?.["5"] ??
        0,
      10
    ) || 0
  );
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to proceed with Buy Now');
      localStorage.setItem('redirectAfterLogin', `/product/${pathSegment}`);
      navigate('/login');
      return;
    }

    const success = await buyNow(product, 1);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="card h-100 shadow-sm product-card">
      <Link to={`/product/${pathSegment}`} className="text-decoration-none">
        <div
          className="position-relative product-card-image-wrap"
          style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="img-fluid w-100 h-100"
            style={{ objectFit: 'contain', padding: '10px' }}
            loading="lazy"
            width="500"
            height="500"
          />
          {hasDiscount && discountPercentage > 0 && (
            <span
              className="badge bg-danger position-absolute top-0 end-0 m-2 product-card-discount-badge"
            >
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
        <Link to={`/product/${pathSegment}`} className="text-decoration-none text-dark">
          <h3 className="h5 card-title mb-2 fw-semibold product-card-title">
            {title}
          </h3>
        </Link>

        <div className="mt-auto product-card-rating-compact-md-mt" >
          {rating !== undefined && (rating > 0 || reviewCount > 0 || fiveStarCount > 0) && (
            <div className="mb-2 product-card-rating-compact">
              <ProductRatingExpandable
                averageRating={rating}
                productLinkSegment={pathSegment}
                totalCount={reviewCount || 0}
                displayCount={fiveStarCount || 0}
                productId={id}
                starSize="0.86rem"
                showCount
              />
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mb-0">
            <div>
              {hasDiscount ? (
                <div className="d-flex align-items-baseline gap-2 product-card-price-row">
                  <span
                    className="h5 product-card-discount-inline"
                    style={{ fontWeight: 900, lineHeight: 1, color: "#dc3545" }}
                  >
                    -{discountPercentage}%
                  </span>
                  <span
                    className="h5 mb-0 product-card-main-price"
                    style={{ fontWeight: 600, color: "#000" }}
                  >
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="small product-card-mrp" style={{ fontWeight: 300, color: "#000" }}>
                    <span
                      className="text-decoration-line-through product-card-mrp-value"
                      style={{ color: "#000" }}
                    >
                      ₹{price.toFixed(2)}
                    </span>
                  </span>
                </div>
              ) : (
                <span className="h5 mb-0 product-card-main-price" style={{ color: "#000" }}>
                  ₹{price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <p className="text-muted mt-0 mb-0 product-card-shipping">FREE SHIPPING</p>

          {showAddToCart && (
            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-primary w-100 btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              {showBuyNow && inStock && (
                <button
                  className="btn btn-primary w-100 btn-buy-now"
                  onClick={handleBuyNow}
                >
                  {/* <i className="bi bi-lightning-fill me-2"></i> */}
                  Buy Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

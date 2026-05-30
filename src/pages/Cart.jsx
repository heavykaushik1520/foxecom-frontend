import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { checkoutAPI, getImageUrl } from '../utils/api'
import { getProductPathSegment } from '../utils/productPath'
import { cartLineKey, getSelectedModelLabel, getUnitPriceForLine } from '../utils/cartLinePrice'
import { CartPageSkeleton } from '../components/PageSkeletons'
import fallbackImage from '../assest/images/product-item1.jpg'

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, loading, loadCart, isLoggedIn } = useCart()
  const navigate = useNavigate()
  const [centerToast, setCenterToast] = useState({ open: false, message: '', variant: 'warning' })
  const [serverUnitPriceMap, setServerUnitPriceMap] = useState({})
  const [serverModelNameMap, setServerModelNameMap] = useState({})
  const navigationTimeoutRef = React.useRef(null)

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    if (!centerToast.open) return
    const t = setTimeout(() => setCenterToast((prev) => ({ ...prev, open: false })), 3000)
    return () => clearTimeout(t)
  }, [centerToast.open])

  useEffect(() => {
    const loadServerPricing = async () => {
      if (!isLoggedIn || !cartItems.length) {
        setServerUnitPriceMap({})
        setServerModelNameMap({})
        return
      }
      try {
        const data = await checkoutAPI.getSummary('OTHER')
        const lines = data?.summary?.products || []
        const nextPriceMap = {}
        const nextModelMap = {}

        lines.forEach((line) => {
          const sid = line.selectedModelId ?? ''
          const key = `${line.id}-${sid}`
          const qty = Number(line.quantity) || 1
          const total = parseFloat(line.total)
          if (Number.isFinite(total) && qty > 0) {
            nextPriceMap[key] = total / qty
          }
          if (line.selectedModelName) {
            nextModelMap[key] = line.selectedModelName
          }
        })

        setServerUnitPriceMap(nextPriceMap)
        setServerModelNameMap(nextModelMap)
      } catch {
        // Keep local fallback pricing if checkout summary cannot be fetched.
        setServerUnitPriceMap({})
        setServerModelNameMap({})
      }
    }

    loadServerPricing()
  }, [isLoggedIn, cartItems])

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    // Check if user is logged in before proceeding to checkout
    if (!isLoggedIn) {
      // Store the intended destination to redirect after login
      localStorage.setItem('redirectAfterLogin', '/checkout')
      setCenterToast({ open: true, message: 'Please login to proceed with checkout', variant: 'warning' })
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current)
      navigationTimeoutRef.current = setTimeout(() => {
        navigate('/login')
      }, 1200)
      return
    }
    
    navigate('/checkout')
  }

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`
  }

  const resolvedCartTotal = cartItems.reduce((sum, item) => {
    const sid = item.selectedModelId ?? ''
    const lineKey = `${item.id}-${sid}`
    const serverUnit = serverUnitPriceMap[lineKey]
    const unit = Number.isFinite(serverUnit)
      ? serverUnit
      : getUnitPriceForLine(item, item.selectedModelId)
    return sum + unit * item.quantity
  }, 0)

  if (loading) {
    return <CartPageSkeleton />
  }

  if (cartItems.length === 0) {
    return (
      <div className="padding-large text-center" style={{ minHeight: '60vh' }}>
        <div className="container">
          <div className="py-4 py-md-5 px-3">
            <svg className="cart-outline mb-3 mb-md-4" width="80" height="80" style={{ opacity: 0.3 }}>
              <use xlinkHref="#cart-outline"></use>
            </svg>
            <h2 className="mb-2 mb-md-3 fw-semibold" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>Your cart is empty</h2>
            <p className="mb-3 mb-md-4" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="btn btn-primary btn-add-to-cart" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 1.5vw, 0.75rem) 1.5rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="padding-large cart-page">
      {centerToast.open && (
        <div className="checkout-center-toast-overlay" role="status" aria-live="polite" aria-atomic="true">
          <div className={`checkout-center-toast checkout-center-toast--${centerToast.variant}`}>
            {centerToast.message}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .cart-mobile-item-row {
            align-items: flex-start;
            gap: 0.75rem;
          }
          .cart-mobile-image-link {
            width: 92px;
            height: 92px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border: 1px solid #eef1f4;
            border-radius: 10px;
            flex-shrink: 0;
            overflow: hidden;
          }
          .cart-mobile-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .cart-mobile-title {
            font-size: 0.95rem;
            font-weight: 600;
            line-height: 1.3;
            margin-bottom: 0.35rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .cart-mobile-meta {
            margin-bottom: 0.15rem !important;
          }
          /* Mobile: hide category name to keep cart compact */
          .cart-mobile-category {
            display: none !important;
          }
          .cart-mobile-price {
            margin-top: 0.3rem;
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            flex-wrap: nowrap;
          }
          .cart-mobile-price .text-primary {
            color: #000 !important;
          }
          .cart-mobile-price small {
            color: #000 !important;
          }
          .cart-mobile-price p,
          .cart-mobile-price small {
            margin: 0 !important;
          }
          .cart-mobile-footer {
            padding-top: 0.2rem;
          }
          .cart-mobile-qty-input {
            width: 56px !important;
            font-size: 0.85rem !important;
            padding: 0.2rem !important;
          }
          .cart-action-row .btn {
            min-height: 34px;
            font-size: 0.85rem;
            padding: 0.35rem 0.65rem;
          }

          .cart-action-row {
            flex-direction: column !important;
          }

          .cart-action-row .w-50 {
            width: 100% !important;
          }

          .cart-total-price {
            color: #000 !important;
          }
        }
      `}</style>
        <div className="container">
          <h1 className="h2 h-md-3 text-uppercase mb-3 mb-md-4 fw-bold" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>Shopping Cart</h1>

          <div className="row">
            <div className="col-12 col-lg-8 mb-4 mb-lg-0">
              <div className="card">
                <div className="card-body p-3 p-md-4">
                  {cartItems.map((item) => {
                    const sid = item.selectedModelId ?? ''
                    const lineKey = `${item.id}-${sid}`
                    const serverUnit = serverUnitPriceMap[lineKey]
                    const itemPrice = Number.isFinite(serverUnit)
                      ? serverUnit
                      : getUnitPriceForLine(item, item.selectedModelId)
                    const itemTotal = itemPrice * item.quantity
                    const modelLabel =
                      serverModelNameMap[lineKey] ||
                      getSelectedModelLabel(item, item.selectedModelId) ||
                      (item.caseDetails
                        ? `${item.caseDetails.brand?.name || ''} ${item.caseDetails.model?.name || ''}`.trim()
                        : null)
                    
                    return (
                      <div key={cartLineKey(item)} className="cart-item mb-4 pb-4 border-bottom">
                        {/* Mobile Layout: Stack vertically */}
                        <div className="d-flex d-md-none flex-column">
                          <div className="d-flex mb-3 cart-mobile-item-row">
                            <Link to={`/product/${getProductPathSegment(item)}`} className="text-decoration-none cart-mobile-image-link">
                              <img
                                src={getImageUrl(item.thumbnailImage || item.image)}
                                alt={item.title}
                                className="img-fluid cart-mobile-image"
                                loading="lazy"
                                width="92"
                                height="92"
                                style={{ 
                                  width: '92px', 
                                  height: '92px', 
                                  objectFit: 'contain',
                                  flexShrink: 0
                                }}
                                onError={(e) => {
                                  e.target.src = fallbackImage
                                }}
                              />
                            </Link>
                            <div className="flex-grow-1">
                              <Link to={`/product/${getProductPathSegment(item)}`} className="text-decoration-none text-dark">
                                <h2 className="cart-mobile-title" style={{ color: '#212529' }}>{item.title}</h2>
                              </Link>
                              {item.category && (
                                <p className="text-muted small cart-mobile-meta cart-mobile-category" style={{ fontSize: '0.78rem' }}>
                                  Category: <span className="text-capitalize">{item.category}</span>
                                </p>
                              )}
                              {modelLabel && (
                                <p className="text-muted small cart-mobile-meta" style={{ fontSize: '0.75rem' }}>
                                  Model: {modelLabel}
                                </p>
                              )}
                              <div className="mb-2 cart-mobile-price">
                                <p className="text-primary mb-0 fw-bold" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{formatPrice(itemPrice)}</p>
                                {item.discountPrice && itemPrice === item.discountPrice && (
                                  <small className="text-decoration-line-through" style={{ fontSize: '0.75rem', color: '#495057' }}>{formatPrice(item.price)}</small>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center cart-mobile-footer">
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedModelId)}
                                style={{ minWidth: '36px', padding: '0.25rem 0.5rem' }}
                              >
                                -
                              </button>
                              <label htmlFor={`cart-mobile-qty-${cartLineKey(item)}`} className="visually-hidden">
                                Quantity for {item.title}
                              </label>
                              <input
                                id={`cart-mobile-qty-${cartLineKey(item)}`}
                                type="number"
                                className="form-control text-center mx-2 cart-mobile-qty-input"
                                style={{ width: '60px', fontSize: '0.9rem', padding: '0.25rem' }}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1
                                  updateQuantity(item.id, val, item.selectedModelId)
                                }}
                                min="1"
                              />
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedModelId)}
                                style={{ minWidth: '36px', padding: '0.25rem 0.5rem' }}
                              >
                                +
                              </button>
                            </div>
                            <div className="text-end">
                              <p className="mb-1 fw-bold" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>{formatPrice(itemTotal)}</p>
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => removeFromCart(item.id, item.selectedModelId)}
                                style={{ fontSize: '0.85rem' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout: Horizontal */}
                        <div className="d-none d-md-flex align-items-center">
                          <Link to={`/product/${getProductPathSegment(item)}`} className="text-decoration-none">
                            <img
                              src={getImageUrl(item.thumbnailImage || item.image)}
                              alt={item.title}
                              className="img-fluid"
                              loading="lazy"
                              width="120"
                              height="120"
                              style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
                              onError={(e) => {
                                e.target.src = fallbackImage
                              }}
                            />
                          </Link>

                          <div className="flex-grow-1 ms-3 ms-md-4">
                            <Link to={`/product/${getProductPathSegment(item)}`} className="text-decoration-none text-dark">
                              <h2 className="mb-2 fw-semibold" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', color: '#212529' }}>{item.title}</h2>
                            </Link>
                            {item.category && (
                              <p className="text-muted mb-2 small">Category: <span className="text-capitalize">{item.category}</span></p>
                            )}
                            {modelLabel && (
                              <p className="text-muted mb-2 small">
                                Model: {modelLabel}
                              </p>
                            )}
                            <p className="text-primary mb-0 fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>{formatPrice(itemPrice)}</p>
                            {item.discountPrice && itemPrice === item.discountPrice && (
                              <small className="text-decoration-line-through" style={{ fontSize: '0.85rem', color: '#495057' }}>{formatPrice(item.price)}</small>
                            )}
                          </div>

                          <div className="d-flex align-items-center me-3 me-md-4">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedModelId)}
                              style={{ minWidth: '40px' }}
                            >
                              -
                            </button>
                            <label htmlFor={`cart-desktop-qty-${cartLineKey(item)}`} className="visually-hidden">
                              Quantity for {item.title}
                            </label>
                            <input
                              id={`cart-desktop-qty-${cartLineKey(item)}`}
                              type="number"
                              className="form-control text-center mx-2"
                              style={{ width: '80px', fontSize: '0.95rem' }}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1
                                updateQuantity(item.id, val, item.selectedModelId)
                              }}
                              min="1"
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedModelId)}
                              style={{ minWidth: '40px' }}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-end me-3 me-md-4" style={{ minWidth: '100px' }}>
                            <p className="mb-2 fw-bold" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.25rem)' }}>{formatPrice(itemTotal)}</p>
                            <button
                              className="btn btn-link text-danger p-0"
                              onClick={() => removeFromCart(item.id, item.selectedModelId)}
                              style={{ fontSize: '0.9rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="d-flex flex-row justify-content-between gap-2 mt-3 cart-action-row">
                    <Link to="/shop" className="btn btn-primary btn-add-to-cart btn-sm w-50">
                      Continue Shopping
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm w-50"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="mb-0 fw-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Order Summary</h2>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <strong>{formatPrice(resolvedCartTotal)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Total</strong>
                    <strong className="text-primary fw-bold cart-total-price" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                      {formatPrice(resolvedCartTotal)}
                    </strong>
                  </div>

                  <button
                    className="btn btn-primary w-100 mb-3 btn-checkout"
                    style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  {/* <Link to="/shop" className="btn btn-primary btn-add-to-cart w-100" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}>
                    Continue Shopping
                  </Link> */}
                </div>
              </div>

              {/* <div className="card">
                <div className="card-body p-3">
                  <h6 className="mb-3" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Why shop with us?</h6>
                  <ul className="list-unstyled small mb-0">
                    <li className="mb-2" style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                      <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                      Free delivery
                    </li>
                    <li className="mb-2" style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                      <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                      Quality guarantee
                    </li>
                    <li className="mb-0" style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                      <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                      Secure payment
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    
  )
}

export default Cart

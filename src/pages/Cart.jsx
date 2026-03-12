import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { getImageUrl } from '../utils/api'
import fallbackImage from '../assest/images/product-item1.jpg'

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, loading, loadCart, isLoggedIn } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    // Check if user is logged in before proceeding to checkout
    if (!isLoggedIn) {
      alert('Please login to proceed with checkout')
      // Store the intended destination to redirect after login
      localStorage.setItem('redirectAfterLogin', '/checkout')
      navigate('/login')
      return
    }
    
    navigate('/checkout')
  }

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="padding-large text-center" style={{ minHeight: '60vh' }}>
        <div className="container">
          <div className="py-4 py-md-5">
            <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Loading cart...</p>
          </div>
        </div>
      </div>
    )
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
    <div className="padding-large">
        <div className="container">
          <h1 className="h2 h-md-3 text-uppercase mb-3 mb-md-4 fw-bold" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>Shopping Cart</h1>

          <div className="row">
            <div className="col-12 col-lg-8 mb-4 mb-lg-0">
              <div className="card">
                <div className="card-body p-3 p-md-4">
                  {cartItems.map((item) => {
                    const itemPrice = item.discountPrice || item.price
                    const itemTotal = itemPrice * item.quantity
                    
                    return (
                      <div key={item.id} className="cart-item mb-4 pb-4 border-bottom">
                        {/* Mobile Layout: Stack vertically */}
                        <div className="d-flex d-md-none flex-column">
                          <div className="d-flex mb-3">
                            <Link to={`/product/${item.id}`} className="text-decoration-none me-3">
                              <img
                                src={getImageUrl(item.thumbnailImage || item.image)}
                                alt={item.title}
                                className="img-fluid"
                                style={{ 
                                  width: '100px', 
                                  height: '100px', 
                                  objectFit: 'contain', 
                                  borderRadius: '8px',
                                  flexShrink: 0
                                }}
                                onError={(e) => {
                                  e.target.src = fallbackImage
                                }}
                              />
                            </Link>
                            <div className="flex-grow-1">
                              <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">
                                <h5 className="mb-1 fw-semibold" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>{item.title}</h5>
                              </Link>
                              {item.category && (
                                <p className="text-muted mb-1 small" style={{ fontSize: '0.8rem' }}>Category: <span className="text-capitalize">{item.category}</span></p>
                              )}
                              {item.caseDetails && (
                                <p className="text-muted mb-1 small" style={{ fontSize: '0.75rem' }}>
                                  {item.caseDetails.brand?.name} {item.caseDetails.model?.name}
                                </p>
                              )}
                              <div className="mb-2">
                                <p className="text-primary mb-0 fw-bold" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{formatPrice(itemPrice)}</p>
                                {item.discountPrice && (
                                  <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>{formatPrice(item.price)}</small>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ minWidth: '36px', padding: '0.25rem 0.5rem' }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="form-control text-center mx-2"
                                style={{ width: '60px', fontSize: '0.9rem', padding: '0.25rem' }}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1
                                  updateQuantity(item.id, val)
                                }}
                                min="1"
                              />
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ minWidth: '36px', padding: '0.25rem 0.5rem' }}
                              >
                                +
                              </button>
                            </div>
                            <div className="text-end">
                              <p className="mb-1 fw-bold" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>{formatPrice(itemTotal)}</p>
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => removeFromCart(item.id)}
                                style={{ fontSize: '0.85rem' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout: Horizontal */}
                        <div className="d-none d-md-flex align-items-center">
                          <Link to={`/product/${item.id}`} className="text-decoration-none">
                            <img
                              src={getImageUrl(item.thumbnailImage || item.image)}
                              alt={item.title}
                              className="img-fluid"
                              style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
                              onError={(e) => {
                                e.target.src = fallbackImage
                              }}
                            />
                          </Link>

                          <div className="flex-grow-1 ms-3 ms-md-4">
                            <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">
                              <h5 className="mb-2 fw-semibold" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)' }}>{item.title}</h5>
                            </Link>
                            {item.category && (
                              <p className="text-muted mb-2 small">Category: <span className="text-capitalize">{item.category}</span></p>
                            )}
                            {item.caseDetails && (
                              <p className="text-muted mb-2 small">
                                {item.caseDetails.brand?.name} {item.caseDetails.model?.name}
                              </p>
                            )}
                            <p className="text-primary mb-0 fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>{formatPrice(itemPrice)}</p>
                            {item.discountPrice && (
                              <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>{formatPrice(item.price)}</small>
                            )}
                          </div>

                          <div className="d-flex align-items-center me-3 me-md-4">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ minWidth: '40px' }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control text-center mx-2"
                              style={{ width: '80px', fontSize: '0.95rem' }}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1
                                updateQuantity(item.id, val)
                              }}
                              min="1"
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ minWidth: '40px' }}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-end me-3 me-md-4" style={{ minWidth: '100px' }}>
                            <p className="mb-2 fw-bold" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.25rem)' }}>{formatPrice(itemTotal)}</p>
                            <button
                              className="btn btn-link text-danger p-0"
                              onClick={() => removeFromCart(item.id)}
                              style={{ fontSize: '0.9rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 gap-sm-1 mt-3">
                    <Link to="/shop" className="btn btn-primary btn-add-to-cart btn-sm w-100 w-sm-auto">
                      Continue Shopping
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm w-100 w-sm-auto"
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
                  <h5 className="mb-0 fw-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <strong>{formatPrice(getCartTotal())}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Total</strong>
                    <strong className="text-primary fw-bold" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>{formatPrice(getCartTotal())}</strong>
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

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { checkoutAPI, orderAPI, paymentAPI, userAuthAPI } from '../utils/api'

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, isLoggedIn, updateQuantity } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkoutSummary, setCheckoutSummary] = useState(null)
  const [isBuyNowMode, setIsBuyNowMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    emailAddress: '',
    flatNumber: '',
    buildingName: '',
    fullAddress: '',
    townOrCity: '',
    country: 'India',
    state: '',
    pinCode: '',
  })
  const [errors, setErrors] = useState({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('OTHER')

  // Auto-fill email from logged-in customer profile (but keep it editable).
  useEffect(() => {
    const fillEmail = async () => {
      if (!isLoggedIn) return
      try {
        const user = await userAuthAPI.getCurrentUser()
        const email = user?.email
        if (!email) return

        setFormData((prev) => {
          // Only fill if empty so customer's manual edits aren't overwritten.
          if (prev.emailAddress && prev.emailAddress.trim() !== "") return prev
          return { ...prev, emailAddress: email }
        })
      } catch (err) {
        console.error('Failed to fetch customer email:', err)
      }
    }

    fillEmail()
  }, [isLoggedIn])

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout");
    }
  }, []);
  
  useEffect(() => {
    // Check login status and cart items whenever they change
    if (!isLoggedIn) {
      alert('Please login to proceed with checkout')
      localStorage.setItem('redirectAfterLogin', '/checkout')
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }

    // Check for buy-now mode
    const buyNowFlag = localStorage.getItem('buyNowMode')
    if (buyNowFlag === 'true') {
      setIsBuyNowMode(true)
    }

    loadCheckoutSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, cartItems.length, preferredPaymentMethod])

  const loadCheckoutSummary = async () => {
    try {
      setLoading(true)
      const data = await checkoutAPI.getSummary(preferredPaymentMethod)
      setCheckoutSummary(data)
    } catch (error) {
      console.error('Error loading checkout summary:', error)
      alert('Failed to load checkout details. Please try again.')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    const phone = formData.mobileNumber.trim()
    if (!phone || phone.length < 10) {
      newErrors.mobileNumber = 'Invalid mobile number for PayU'
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) newErrors.emailAddress = 'Valid email is required'
    if (!formData.buildingName.trim()) newErrors.buildingName = 'Building / house name is required'
    if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Address is required'
    if (!formData.townOrCity.trim()) newErrors.townOrCity = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = 'Pin code must be 6 digits'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Validate address first
      const addressValidation = await checkoutAPI.validateAddress(formData)
      if (!addressValidation.isValid) {
        alert('Please check your shipping address')
        return
      }

      // Create order (include preferred payment method for UPI discount)
      const orderResult = await orderAPI.create({ ...formData, preferredPaymentMethod })
      const orderId = orderResult.order.id

      // Clear buy-now mode flag after order creation
      if (isBuyNowMode) {
        localStorage.removeItem('buyNowMode')
        localStorage.removeItem('buyNowProductId')
        setIsBuyNowMode(false)
      }

      // Initiate payment
      await initiatePayuPayment(orderId)

    } catch (error) {
      console.error('Error processing order:', error)
      alert(error.message || 'Failed to process order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayuPayment = async (orderId) => {
    try {
      setProcessingPayment(true)

      // Validate phone number before PayU payment
      const phone = formData.mobileNumber.trim()
      if (!phone || phone.length < 10) {
        throw new Error("Invalid mobile number for PayU")
      }

      // Create PayU payment via SDK (returns auto-submit HTML form)
      const payuResponse = await paymentAPI.createPayuPayment(orderId)

      if (!payuResponse.paymentFormHtml) {
        throw new Error('Failed to initialize payment gateway')
      }

      // Render the SDK-generated form and auto-submit (same window goes to PayU, then back to our success/failure URL)
      document.open()
      document.write(payuResponse.paymentFormHtml)
      document.close()
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert(error.message || 'Failed to initiate payment. Please try again.')
      setProcessingPayment(false)
    }
  }

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`
  }

  if (loading && !checkoutSummary) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    navigate('/login')
    return null
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  const summary = checkoutSummary?.summary

  return (
    <div className="padding-large">
      <div className="container">
        <h1 className="h2 h-md-3 text-uppercase mb-4 fw-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Checkout</h1>

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 fw-semibold" style={{ fontSize: '1.1rem' }}>Shipping Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.emailAddress ? 'is-invalid' : ''}`}
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        required
                      />
                      {errors.emailAddress && <div className="invalid-feedback">{errors.emailAddress}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number *</label>
                      <input
                        type="tel"
                        className={`form-control ${errors.mobileNumber ? 'is-invalid' : ''}`}
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        maxLength="10"
                        required
                      />
                      {errors.mobileNumber && <div className="invalid-feedback">{errors.mobileNumber}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Flat / House No.*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="flatNumber"
                        value={formData.flatNumber}
                        onChange={handleChange}
                        maxLength="100"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Building / House Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.buildingName ? 'is-invalid' : ''}`}
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleChange}
                        maxLength="150"
                        required
                      />
                      {errors.buildingName && <div className="invalid-feedback">{errors.buildingName}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Full Address *</label>
                    <textarea
                      className={`form-control ${errors.fullAddress ? 'is-invalid' : ''}`}
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                    {errors.fullAddress && <div className="invalid-feedback">{errors.fullAddress}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.townOrCity ? 'is-invalid' : ''}`}
                        name="townOrCity"
                        value={formData.townOrCity}
                        onChange={handleChange}
                        required
                      />
                      {errors.townOrCity && <div className="invalid-feedback">{errors.townOrCity}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pin Code *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.pinCode ? 'is-invalid' : ''}`}
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        maxLength="6"
                        required
                      />
                      {errors.pinCode && <div className="invalid-feedback">{errors.pinCode}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">State *</label>
                      <select
                        className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES_AND_UTS.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country *</label>
                      <select
                        className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="India">India</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                      {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 btn-proceed-payment"
                    disabled={loading || processingPayment}
                  >
                    {processingPayment ? 'Processing Payment...' : loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold" style={{ fontSize: '1.1rem' }}>Order Summary</h5>
                  {isBuyNowMode && (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-lightning-fill me-1"></i>
                      Buy Now
                    </span>
                  )}
                </div>
                {isBuyNowMode && (
                  <small className="text-muted mt-1 d-block">
                    You can adjust quantity before checkout
                  </small>
                )}
              </div>
              <div className="card-body">
                {cartItems.map((item) => (
                  <div key={item.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <strong>{item.title}</strong>
                        {isBuyNowMode && (
                          <div className="mt-2">
                            <div className="d-flex align-items-center gap-2">
                              <label className="small text-muted mb-0">Quantity:</label>
                              <div className="d-flex align-items-center border rounded">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    const newQty = Math.max(1, item.quantity - 1)
                                    updateQuantity(item.id, newQty)
                                  }}
                                  style={{ border: 'none', borderRadius: 0 }}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="px-3" style={{ minWidth: '40px', textAlign: 'center' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    const maxStock = item.stock || 999
                                    const newQty = Math.min(maxStock, item.quantity + 1)
                                    updateQuantity(item.id, newQty)
                                  }}
                                  style={{ border: 'none', borderRadius: 0 }}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {!isBuyNowMode && (
                          <small className="text-muted">Qty: {item.quantity}</small>
                        )}
                      </div>
                      <strong className="ms-2">{formatPrice((item.discountPrice || item.price) * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatPrice(summary?.subtotal || getCartTotal())}</strong>
                </div>
                {Number(summary?.discountAmount) > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>{summary?.discountLabel || 'UPI discount'}</span>
                    <strong>-{formatPrice(summary.discountAmount)}</strong>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Payment method</label>
                  <div className="d-flex gap-2 flex-wrap">
                    <label className="d-flex align-items-center gap-2 border rounded px-3 py-2 cursor-pointer flex-grow-1" style={{ minWidth: '140px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={preferredPaymentMethod === 'UPI'}
                        onChange={() => setPreferredPaymentMethod('UPI')}
                        className="form-check-input"
                      />
                      <span>UPI</span>
                      {summary?.nextOrderNumber === 2 && (
                        <span className="badge bg-success">10% off</span>
                      )}
                      {summary?.nextOrderNumber === 3 && (
                        <span className="badge bg-success">20% off</span>
                      )}
                    </label>
                    <label className="d-flex align-items-center gap-2 border rounded px-3 py-2 cursor-pointer flex-grow-1" style={{ minWidth: '140px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={preferredPaymentMethod === 'OTHER'}
                        onChange={() => setPreferredPaymentMethod('OTHER')}
                        className="form-check-input"
                      />
                      <span>Card / Net Banking / Other</span>
                    </label>
                  </div>
                  {summary?.nextOrderNumber >= 2 && summary?.nextOrderNumber <= 3 && (
                    <small className="text-muted d-block mt-1">
                      {summary.nextOrderNumber === 2 && 'Pay with UPI on your 2nd order to get 10% off.'}
                      {summary.nextOrderNumber === 3 && 'Pay with UPI on your 3rd order to get 20% off.'}
                      {summary.nextOrderNumber >= 4 && 'No repeat-purchase discount on 4th order onwards.'}
                    </small>
                  )}
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong className="h4 text-primary">{formatPrice(summary?.totalAmount || getCartTotal())}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Checkout

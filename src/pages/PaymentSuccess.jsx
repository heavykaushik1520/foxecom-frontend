import React, { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    // Clear cart once on successful payment
    if (orderId) {
      clearCart()
    }
    // We intentionally omit clearCart from deps to avoid re-running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handleContinue = () => {
    if (orderId) {
      navigate(`/order-success/${orderId}`)
    } else {
      navigate('/my-orders')
    }
  }

  return (
    <div className="padding-large">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card text-center">
              <div className="card-body p-5">
                <div className="mb-4">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-success mx-auto"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path
                      d="M8 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="h2 h-md-3 text-success mb-3 fw-bold">Payment Successful!</h1>
                <p className="text-muted mb-4">
                  Your payment has been processed successfully. Your order is being processed.
                </p>
                {orderId && (
                  <p className="mb-3">
                    <strong>Order ID:</strong> #{orderId}
                  </p>
                )}
                {paymentId && (
                  <p className="mb-4 text-muted small">
                    <strong>Payment ID:</strong> {paymentId}
                  </p>
                )}
                <div className="d-grid gap-2">
                  {orderId && (
                    <button onClick={handleContinue} className="btn btn-primary btn-lg">
                      View Order Details
                    </button>
                  )}
                  <Link to="/my-orders" className="btn btn-outline-primary">
                    View All Orders
                  </Link>
                  <Link to="/shop" className="btn btn-outline-secondary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess

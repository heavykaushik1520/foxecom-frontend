import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'

const PaymentFailure = () => {
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('orderId')
  const errorMessage = searchParams.get('message') || 'Payment could not be processed. Please try again.'

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
                    className="text-danger mx-auto"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h1 className="h2 h-md-3 text-danger mb-3 fw-bold">Payment Failed</h1>
                <p className="text-muted mb-4">
                  {errorMessage}
                </p>
                {orderId && (
                  <p className="mb-4 text-muted">
                    <strong>Order ID:</strong> #{orderId}
                  </p>
                )}
                <div className="alert alert-warning">
                  <strong>Note:</strong> If your payment was deducted, it will be refunded within 5-7 business days.
                  Please contact support if you have any concerns.
                </div>
                <div className="d-grid gap-2">
                  <Link to="/checkout" className="btn btn-primary btn-lg">
                    Try Again
                  </Link>
                  {orderId && (
                    <Link to={`/order-success/${orderId}`} className="btn btn-outline-primary">
                      View Order Status
                    </Link>
                  )}
                  <Link to="/cart" className="btn btn-outline-secondary">
                    Back to Cart
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

export default PaymentFailure

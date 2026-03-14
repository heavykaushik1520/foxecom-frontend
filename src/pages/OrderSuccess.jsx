import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI, getImageUrl, API_BASE_URL } from '../utils/api'

const OrderSuccess = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const GST_RATE = 0.18

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await orderAPI.getById(id)
      setOrder(data.order || data)
    } catch (err) {
      console.error('Error loading order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`
  }

  const getInvoiceLinesAndTotals = () => {
    if (!order || !order.orderItems) {
      return {
        lines: [],
        subtotal: 0,
        gstTotal: 0,
        rawGrandTotal: 0,
        discountAmount: 0,
        discountLabel: '',
        finalGrandTotal: 0,
      }
    }

    const lines = []
    let subtotal = 0
    let gstTotal = 0
    let rawGrandTotal = 0

    order.orderItems.forEach((item) => {
      const quantity = Number(item.quantity) || 0
      const sellingPricePerUnit = Number(item.priceAtPurchase) || 0
      if (!quantity || !sellingPricePerUnit) return

      const basePrice = sellingPricePerUnit / (1 + GST_RATE)
      const gstPerUnit = sellingPricePerUnit - basePrice
      const lineBase = basePrice * quantity
      const lineGst = gstPerUnit * quantity
      const lineTotal = sellingPricePerUnit * quantity

      subtotal += lineBase
      gstTotal += lineGst
      rawGrandTotal += lineTotal

      lines.push({
        id: item.id,
        quantity,
        title: item.product?.title || 'Product',
        sku: item.product?.sku || '',
        unitPrice: basePrice,
        gstRate: GST_RATE * 100,
        lineTotal,
      })
    })

    // Use backend-calculated totals/discounts when available so UI invoice matches PDF & final order
    const orderTotal = Number(order.totalAmount) || rawGrandTotal
    const backendDiscount = Number(order.discountAmount) || 0
    let discountAmount = backendDiscount

    if (!discountAmount && rawGrandTotal && orderTotal && rawGrandTotal > orderTotal) {
      discountAmount = rawGrandTotal - orderTotal
    }

    // Build a human-friendly label similar to PDF
    let discountLabel = ''
    if (discountAmount > 0) {
      const pct = Number(order.upiDiscountPercent) || null
      const nth =
        order.orderNumberForUser === 2
          ? '2nd'
          : order.orderNumberForUser === 3
          ? '3rd'
          : ''
      if (pct) {
        discountLabel = nth ? `UPI Discount (${pct}% - ${nth} purchase)` : `UPI Discount (${pct}%)`
      } else {
        discountLabel = 'Offer / Discount'
      }
    }

    const finalGrandTotal = orderTotal

    return {
      lines,
      subtotal,
      gstTotal,
      rawGrandTotal,
      discountAmount,
      discountLabel,
      finalGrandTotal,
    }
  }

  const handleDownloadInvoice = () => {
    if (!order?.id) return
    const url = `${API_BASE_URL}/order/${order.id}/invoice/pdf`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      paid: 'success',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    }
    return statusColors[status] || 'secondary'
  }

  if (loading) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="alert alert-danger">
            {error || 'Order not found'}
            <div className="mt-3">
              <Link to="/shop" className="btn btn-primary me-2">Continue Shopping</Link>
              <Link to="/" className="btn btn-secondary">Go Home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="padding-large">
      <div className="container">
        {/* Success Header */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-success"
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
          <h1 className="h2 h-md-3 text-success mb-3 fw-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Order Placed Successfully!</h1>
          <p className="text-muted mb-2" style={{ fontSize: '1rem' }}>
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Order ID: <strong>#{order.orderNumber || order.id}</strong>
          </p>
        </div>

        <div className="row g-4">
          {/* Order Summary */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Order Details</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Order ID:</strong> #{order.orderNumber || order.id}
                  </div>
                  <div className="col-md-6">
                    <strong>Order Date:</strong> {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Status:</strong>{' '}
                    <span className={`badge bg-${getStatusBadge(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
                  </div>
                </div>
                {(order.payuPaymentId || order.payuTxnId) && (
                  <div className="row mb-3">
                    {order.payuPaymentId && (
                      <div className="col-md-6">
                        <strong>Payment ID:</strong> {order.payuPaymentId}
                      </div>
                    )}
                    {order.payuTxnId && (
                      <div className="col-md-6">
                        <strong>Transaction ID:</strong> {order.payuTxnId}
                      </div>
                    )}
                    {order.paymentMode && (
                      <div className="col-md-6">
                        <strong>Payment Mode:</strong> {order.paymentMode}
                      </div>
                    )}
                    {order.bankRefNo && (
                      <div className="col-md-6">
                        <strong>Bank Ref:</strong> {order.bankRefNo}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Order Items</h5>
              </div>
              <div className="card-body">
                {order.orderItems && order.orderItems.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.product?.images?.[0] && (
                                  <img
                                    src={getImageUrl(item.product.images[0].imageUrl)}
                                    alt={item.product.title}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      objectFit: 'cover',
                                      marginRight: '10px',
                                    }}
                                    className="rounded"
                                  />
                                )}
                                <div>
                                  <strong>{item.product?.title || 'Product'}</strong>
                                </div>
                              </div>
                            </td>
                            <td>{formatCurrency(item.priceAtPurchase)}</td>
                            <td>{item.quantity}</td>
                            <td>
                              {formatCurrency(item.priceAtPurchase * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end">
                            <strong>Total:</strong>
                          </td>
                          <td>
                            <strong>{formatCurrency(order.totalAmount)}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No items found</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-semibold" style={{ fontSize: '1.1rem' }}>Shipping Address</h5>
              </div>
              <div className="card-body">
                <p className="mb-1">
                  <strong>{order.firstName} {order.lastName}</strong>
                </p>
                {order.flatNumber && (
                  <p className="mb-1">Flat: {order.flatNumber}</p>
                )}
                {order.buildingName && (
                  <p className="mb-1">{order.buildingName}</p>
                )}
                <p className="mb-1">{order.fullAddress}</p>
                <p className="mb-1">
                  {order.townOrCity}, {order.state} - {order.pinCode}
                </p>
                <p className="mb-1">{order.country}</p>
                <p className="mb-0">
                  <strong>Phone:</strong> {order.mobileNumber}
                </p>
                <p className="mb-0">
                  <strong>Email:</strong> {order.emailAddress}
                </p>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="card mb-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Invoice</h5>
                {/* <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleDownloadInvoice}
                >
                  Download PDF
                </button> */}
              </div>
              <div className="card-body">
                {(() => {
                  const {
                    lines,
                    subtotal,
                    gstTotal,
                    rawGrandTotal,
                    discountAmount,
                    discountLabel,
                    finalGrandTotal,
                  } = getInvoiceLinesAndTotals()
                  if (!lines.length) {
                    return <p className="text-muted mb-0">Invoice details are not available.</p>
                  }

                  // Prefer first non-empty SKU as FOXECOM IP, otherwise fall back to order id
                  const foxecomIp = (lines.find(line => line.sku)?.sku) || (order?.id ? `ORD-${order.id}` : '')
                  

                  return (
                    <>
                      <div className="row mb-3 small text-muted">
                        <div className="col-md-6 mb-2">
                          <div><strong>Shipped By:</strong></div>
                          <div>
                            REDECOM Tech Labs Pvt. Ltd., Delhi NCR<br />
                            GSTN: 09AANCR6672DIZY<br />
                            Email: foxecom99@gmail.com
                          </div>
                        </div>
                        <div className="col-md-6 mb-2">
                          <div className="d-flex flex-column align-items-md-end">
                            <div>
                              <strong>Invoice Date:</strong>{' '}
                              {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                            </div>
                            <div>
                              <strong>Order Number:</strong> #{order.orderNumber || order.id}
                            </div>
                            <div>
                              <strong>FOXECOM IP:</strong> {foxecomIp || 'N/A'}
                            </div>
                            {order.awbCode && (
                              <div>
                                <strong>AWB / Waybill:</strong> {order.awbCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '10%' }}>Qty</th>
                              <th style={{ width: '40%' }}>Item Description</th>
                              <th style={{ width: '20%' }} className="text-end">
                                Unit Price (excl. GST)
                              </th>
                              <th style={{ width: '10%' }} className="text-end">
                                GST %
                              </th>
                              <th style={{ width: '20%' }} className="text-end">
                                Line Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {lines.map((line) => (
                              <tr key={line.id}>
                                <td>{line.quantity}</td>
                                <td>
                                  <div className="fw-semibold">{line.title}</div>
                                  {line.sku && (
                                    <div className="text-muted small">SKU: {line.sku}</div>
                                  )}
                                </td>
                                <td className="text-end">
                                  {formatCurrency(line.unitPrice)}
                                </td>
                                <td className="text-end">
                                  {line.gstRate.toFixed(0)}%
                                </td>
                                <td className="text-end">
                                  {formatCurrency(line.lineTotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="4" className="text-end fw-semibold">
                                Subtotal
                              </td>
                              <td className="text-end fw-semibold">
                                {formatCurrency(subtotal)}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="4" className="text-end fw-semibold">
                                GST (18%)
                              </td>
                              <td className="text-end fw-semibold">
                                {formatCurrency(gstTotal)}
                              </td>
                            </tr>
                            {discountAmount > 0 && (
                              <tr>
                                <td colSpan="4" className="text-end fw-semibold text-success">
                                  {discountLabel || 'Offer / Discount'}
                                </td>
                                <td className="text-end fw-semibold text-success">
                                  -{formatCurrency(discountAmount)}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td colSpan="4" className="text-end fw-bold">
                                Grand Total
                              </td>
                              <td className="text-end fw-bold">
                                {formatCurrency(finalGrandTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4 fw-semibold" style={{ fontSize: '1.1rem' }}>What's Next?</h5>
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <strong>1. Order Confirmation</strong>
                    <p className="text-muted small mb-0">
                      You will receive an email confirmation shortly.
                    </p>
                  </li>
                  <li className="mb-3">
                    <strong>2. Processing</strong>
                    <p className="text-muted small mb-0">
                      We'll start processing your order right away.
                    </p>
                  </li>
                  <li className="mb-3">
                    <strong>3. Shipping</strong>
                    <p className="text-muted small mb-0">
                      You'll receive tracking information once your order ships.
                    </p>
                  </li>
                </ul>
                <hr />
                <div className="d-grid gap-2">
                  {(order.awbCode || order.shipmentId) && (
                    <Link to={`/order/${order.id}/track`} className="btn btn-info">
                      Track this order
                    </Link>
                  )}
                  <Link to="/my-orders" className="btn btn-primary">
                    View All Orders
                  </Link>
                  <Link to="/shop" className="btn btn-outline-primary">
                    Continue Shopping
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary">
                    Go to Home
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

export default OrderSuccess

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orderAPI, getImageUrl } from '../utils/api'

const MyOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })
  const [statusFilter, setStatusFilter] = useState('paid')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [pagination.page, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      }
      // Always request only paid orders by default
      params.status = statusFilter || 'paid'
      const data = await orderAPI.getAll(params)
      setOrders(data.orders || [])
      setPagination((prev) => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.totalItems || 0,
      }))
    } catch (err) {
      console.error('Error fetching orders:', err)
      if (err.isTokenError) {
        navigate('/login')
      } else {
        setError('Failed to load orders')
      }
    } finally {
      setLoading(false)
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      await orderAPI.cancel(orderId)
      alert('Order cancelled successfully')
      fetchOrders()
    } catch (err) {
      console.error('Error cancelling order:', err)
      alert(err.message || 'Failed to cancel order')
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="padding-large">
      <div className="container">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-2">
          <h1 className="h2 h-md-3 text-uppercase fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>My Orders</h1>
          <Link to="/shop" className="btn btn-primary btn-sm my-orders-action-btn my-orders-continue-btn w-100 w-sm-auto p-2">
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Info: only paid orders are shown */}
        <div className="card mb-3 mb-md-4 border-0 shadow-sm">
          <div className="card-body p-3 p-md-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
            <div>
              <p className="mb-1 fw-semibold" style={{ fontSize: 'clamp(0.9rem, 2.1vw, 1rem)' }}>
                Showing only <span className="text-success">paid</span> orders
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                Orders that are pending or failed payment are hidden from this list.
              </p>
            </div>
            <div className="text-muted small">
              Total paid orders: <strong>{pagination.total}</strong>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-4 py-md-5 px-3">
                <h5 className="text-muted fw-semibold mb-2 mb-md-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}>No paid orders yet</h5>
                <p className="text-muted mb-3 mb-md-4" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                  Once your payments complete successfully, your orders will appear here.
                </p>
              <Link to="/shop" className="btn btn-primary" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 1.5vw, 0.75rem) 1.5rem' }}>
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <div key={order.id} className="card mb-3 mb-md-4 my-orders-card">
                <div className="card-header bg-light p-3 p-md-4">
                  <div className="row align-items-center g-2">
                    <div className="col-12 col-md-6">
                      <h5 className="mb-0 mb-md-0" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
                        Order #{order.orderNumber || order.id}
                        <span className={`badge bg-${getStatusBadge(order.status)} ms-2`} style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)' }}>
                          {order.status?.toUpperCase()}
                        </span>
                      </h5>
                    </div>
                    <div className="col-12 col-md-6 text-start text-md-end">
                      <small className="text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                        Placed on {formatDate(order.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-3 p-md-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      {order.orderItems && order.orderItems.length > 0 && (
                        <div className="mb-3 mb-md-3">
                          {order.orderItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="d-flex align-items-start mb-3 mb-md-2 order-item">
                              {item.product?.images?.[0] && (
                                <img
                                  src={getImageUrl(item.product.images[0].imageUrl)}
                                  alt={item.product.title}
                                  style={{
                                    width: 'clamp(45px, 12vw, 50px)',
                                    height: 'clamp(45px, 12vw, 50px)',
                                    objectFit: 'contain',
                                    marginRight: '10px',
                                    flexShrink: 0,
                                  }}
                                  className="rounded"
                                />
                              )}
                              <div className="flex-grow-1 min-w-0">
                                <strong 
                                  className="d-block order-item-title" 
                                  style={{ 
                                    fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                  title={item.product?.title || 'Product'}
                                >
                                  {item.product?.title || 'Product'}
                                </strong>
                                <small className="text-muted d-block mt-1" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                                  Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                                </small>
                              </div>
                            </div>
                          ))}
                          {order.orderItems.length > 3 && (
                            <p className="text-muted small mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                              +{order.orderItems.length - 3} more item(s)
                            </p>
                          )}
                        </div>
                      )}
                      <div className="shipping-address">
                        <strong style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)' }}>Shipping Address:</strong>
                        <p className="mb-0 text-muted small mt-1" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', wordBreak: 'break-word' }}>
                          {order.flatNumber ? `Flat: ${order.flatNumber}, ` : ''}
                          {order.buildingName ? `${order.buildingName}, ` : ''}
                          {order.fullAddress}, {order.townOrCity}, {order.state} - {order.pinCode}
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="mb-3 text-start text-md-end">
                        <h4 className="text-primary mb-1 mb-md-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                          {formatCurrency(order.totalAmount)}
                        </h4>
                        <small className="text-muted d-block" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                          {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} item(s)
                        </small>
                      </div>
                      <div className="d-grid gap-2 d-md-block text-md-end">
                        <Link
                          to={`/order-success/${order.id}`}
                          className="btn btn-primary btn-sm my-orders-action-btn w-100 w-md-auto"
                          style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                        >
                          View Details
                        </Link>
                        {(order.awbCode || order.shipmentId) && (
                          <Link
                            to={`/order/${order.id}/track`}
                            className="btn btn-outline-info btn-sm my-orders-action-btn w-100 w-md-auto"
                            style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                          >
                            Track Order
                          </Link>
                        )}
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-outline-danger btn-sm my-orders-action-btn w-100 w-md-auto"
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 mt-md-4 gap-3">
                <div className="text-center text-sm-start" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                  Showing page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total orders)
                </div>
                <div className="btn-group w-100 w-sm-auto">
                  <button
                    className="btn btn-primary btn-sm my-orders-pagination-btn"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-primary btn-sm my-orders-pagination-btn"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyOrders

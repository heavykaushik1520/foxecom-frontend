import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI, API_BASE_URL, BASE_URL } from '../utils/api'
import OrderTimeline from '../components/OrderTimeline'

const TrackOrder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [labelUrl, setLabelUrl] = useState(null)
  const [labelLoading, setLabelLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState('')

  useEffect(() => {
    if (id) loadOrderAndTracking()
  }, [id])

  const loadOrderAndTracking = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true)
      else setRefreshing(true)
      setError('')
      setCancelError('')
      setCancelSuccess('')

      const orderData = await orderAPI.getById(id)
      const orderObj = orderData.order || orderData
      setOrder(orderObj)

      // Always fetch tracking payload (stage + timeline + cancel window).
      // Backend gracefully handles cases where AWB isn't available yet.
      try {
        const tracking = await orderAPI.trackOrder(id)
        setTrackingData(tracking)
      } catch (trackError) {
        console.error('Tracking not available:', trackError)
        setTrackingData(null)
      }
    } catch (err) {
      console.error('Error loading order:', err)
      if (err.isTokenError) navigate('/login')
      else setError('Failed to load order details')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => loadOrderAndTracking(true)

  const handleCancelOrder = async () => {
    if (!order?.id) return
    if (cancelLoading) return

    const stage = trackingData?.stage
    const cancellationWindow = trackingData?.cancellationWindow

    const canCancel =
      Boolean(stage?.isCancellable) &&
      Boolean(cancellationWindow)

    if (!canCancel) {
      setCancelError('Cancellation is not available for this order right now.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?\n\nRefunds (full/partial) are subject to admin review.'
    )
    if (!confirmed) return

    setCancelLoading(true)
    setCancelError('')
    setCancelSuccess('')
    try {
      await orderAPI.cancel(order.id)
      setCancelSuccess('Order cancelled successfully.')
      // Refresh stage/timeline/cancel-window after cancellation.
      await loadOrderAndTracking(true)
    } catch (err) {
      console.error('Error cancelling order:', err)
      setCancelError(err?.message || 'Failed to cancel order')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleGetShippingLabel = async () => {
    if (!order?.id || !order?.awbCode) return
    setLabelLoading(true)
    try {
      const data = await orderAPI.getShippingLabel(order.id)

      // Backend returns either a direct labelUrl or a backend downloadUrl (usually starting with /api/...)
      const rawUrl = data?.labelUrl || data?.downloadUrl
      if (rawUrl) {
        const normalizedPath = String(rawUrl)
        const isAbsolute =
          normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')

        let fullUrl = normalizedPath
        if (!isAbsolute) {
          if (normalizedPath.startsWith('/api/')) {
            // Hit backend API root directly (BASE_URL has no /api suffix)
            fullUrl = `${BASE_URL}${normalizedPath}`
          } else {
            // Relative to API_BASE_URL (which already includes /api)
            fullUrl = `${API_BASE_URL}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`
          }
        }

        setLabelUrl(fullUrl)
        window.open(fullUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error('Get shipping label failed:', err)
    } finally {
      setLabelLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(d.getTime())) return String(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year}, ${hours}:${minutes}`
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

  const getScansList = () => {
    if (!trackingData) return []
    const scans = trackingData.scans && Array.isArray(trackingData.scans)
      ? trackingData.scans
      : trackingData.tracking?.scan && Array.isArray(trackingData.tracking.scan)
        ? trackingData.tracking.scan
        : []
    return scans.map((s) => ({
      text: s.status || s.scan || s.activity || s.detail || (typeof s === 'string' ? s : null),
      date: s.date || s.timestamp,
    })).filter((s) => s.text || s.date)
  }

  const scansList = getScansList()
  const hasTracking = scansList.length > 0
  const hasAwbOrShipment = order?.shipmentId || order?.awbCode
  const resolvedLabelUrl = labelUrl || order?.shippingLabelUrl || trackingData?.labelUrl

  if (loading) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0 text-muted">Loading order &amp; tracking...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="padding-large">
        <div className="container">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>⚠</div>
              <h5 className="text-danger">{error || 'Order not found'}</h5>
              <p className="text-muted mb-4">We could not load this order. It may not exist or you may not have access.</p>
              <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="padding-large">
      <div className="container">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
          <h1 className="h2 text-uppercase fw-bold mb-0" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Track Order
          </h1>
          <div className="d-flex gap-2">
            {hasAwbOrShipment && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? <span className="spinner-border spinner-border-sm me-1" role="status" /> : null}
                Refresh
              </button>
            )}
            <Link to="/my-orders" className="btn btn-outline-secondary btn-sm">Back to Orders</Link>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-header bg-light border-0 py-3">
                <h5 className="mb-0 fw-semibold">Order Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6 col-md-4">
                    <span className="text-muted small d-block">Order ID</span>
                    <strong>#{order.orderNumber || order.id}</strong>
                  </div>
                  <div className="col-6 col-md-4">
                    <span className="text-muted small d-block">Status</span>
                    <span className={`badge bg-${getStatusBadge(order.status)}`}>{order.status?.toUpperCase()}</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <span className="text-muted small d-block">Order Date</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  {order.awbCode && (
                    <div className="col-6 col-md-4">
                      <span className="text-muted small d-block">AWB / Waybill</span>
                      <strong className="text-primary">{order.awbCode}</strong>
                    </div>
                  )}
                  {order.shipmentId && (
                    <div className="col-6 col-md-4">
                      <span className="text-muted small d-block">Shipment ID</span>
                      <strong>{order.shipmentId}</strong>
                    </div>
                  )}
                  {order.courierName && (
                    <div className="col-6 col-md-4">
                      <span className="text-muted small d-block">Courier</span>
                      <strong>{order.courierName}</strong>
                    </div>
                  )}
                </div>
                {resolvedLabelUrl && (
                  <div className="mt-3 pt-3 border-top">
                    <a href={resolvedLabelUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                      View / Print shipping label
                    </a>
                  </div>
                )}
                {hasAwbOrShipment && order?.awbCode && !resolvedLabelUrl && (
                  <div className="mt-3 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleGetShippingLabel}
                      disabled={labelLoading}
                    >
                      {labelLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                          Loading...
                        </>
                      ) : (
                        'Get shipping label'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {trackingData?.stage &&
              Array.isArray(trackingData?.timeline) &&
              trackingData.timeline.length > 0 && (
                <div className="card mb-4 shadow-sm border-0">
                  <div className="card-body">
                    <OrderTimeline
                      timeline={trackingData.timeline}
                      stage={trackingData.stage}
                      cancellationWindow={trackingData.cancellationWindow}
                      onCancel={handleCancelOrder}
                      isCanceling={cancelLoading}
                    />
                    {cancelError && (
                      <div className="alert alert-danger mt-3 mb-0" role="alert">
                        {cancelError}
                      </div>
                    )}
                    {cancelSuccess && (
                      <div className="alert alert-success mt-3 mb-0" role="alert">
                        {cancelSuccess}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {!hasAwbOrShipment && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body text-center py-5">
                  <div className="text-info mb-3" style={{ fontSize: '2.5rem' }}>📦</div>
                  <h6 className="fw-semibold">Shipment not created yet</h6>
                  <p className="text-muted small mb-0">
                    {order.status === 'paid'
                      ? <>Shipment is usually created automatically after payment. Wait a minute and <strong>refresh</strong>, or contact support for order #{order.orderNumber || order.id}.</>
                      : 'Check back after payment or contact support.'}
                  </p>
                  <button type="button" className="btn btn-outline-primary btn-sm mt-3" onClick={handleRefresh}>Refresh</button>
                </div>
              </div>
            )}

            {hasAwbOrShipment && !hasTracking && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body text-center py-5">
                  <div className="text-warning mb-3" style={{ fontSize: '2.5rem' }}>🕐</div>
                  <h6 className="fw-semibold">No tracking updates yet</h6>
                  <p className="text-muted small mb-0">Your shipment has been created. Tracking will appear here once the courier scans the package.</p>
                  <button type="button" className="btn btn-outline-primary btn-sm mt-3" onClick={handleRefresh}>Refresh</button>
                </div>
              </div>
            )}

            {hasAwbOrShipment && hasTracking && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="mb-0 fw-semibold">Tracking timeline</h5>
                </div>
                <div className="card-body">
                  {scansList.map((item, idx) => (
                    <div key={idx} className="d-flex position-relative pb-3">
                      {idx < scansList.length - 1 && (
                        <div className="position-absolute start-0 bg-primary rounded" style={{ width: '2px', left: '11px', top: '22px', height: 'calc(100% + 0.5rem)' }} />
                      )}
                      <div className="rounded-circle bg-primary text-white flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '0.65rem', zIndex: 1 }}>●</div>
                      <div className="ms-3 flex-grow-1">
                        <div className="fw-medium">{item.text}</div>
                        {item.date && <small className="text-muted">{formatDate(item.date)}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light border-0 py-3">
                <h5 className="mb-0 fw-semibold">Shipping Address</h5>
              </div>
              <div className="card-body">
                <p className="mb-1 fw-medium">{order.firstName} {order.lastName}</p>
              {order.flatNumber && (
                <p className="mb-1 text-muted small">Flat: {order.flatNumber}</p>
              )}
              {order.buildingName && (
                <p className="mb-1 text-muted small">{order.buildingName}</p>
              )}
              <p className="mb-1 text-muted small">{order.fullAddress}</p>
              <p className="mb-1 text-muted small">{order.townOrCity}, {order.state} - {order.pinCode}</p>
                <p className="mb-0 text-muted small">{order.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackOrder

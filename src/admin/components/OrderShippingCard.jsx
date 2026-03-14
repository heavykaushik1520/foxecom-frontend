/**
 * OrderShippingCard – Delhivery shipping actions for admin order view.
 * Modular: create shipment, check pincode, TAT, print label, track.
 */
import React, { useState, useEffect } from 'react';
import { shippingAPI, API_BASE_URL, BASE_URL } from "../../utils/api";

export default function OrderShippingCard({ order, onShipmentCreated }) {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pincodeResult, setPincodeResult] = useState(null);
  const [tatResult, setTatResult] = useState(null);
  const [trackingResult, setTrackingResult] = useState(null);

  const orderPin = order?.pinCode ? String(order.pinCode).replace(/\D/g, '').slice(0, 6) : '';
  const hasAwb = Boolean(order?.awbCode);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingConfig(true);
        const data = await shippingAPI.getConfig();
        if (!cancelled) setConfig(data);
      } catch {
        if (!cancelled) setConfig({ configured: false });
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const clearMessage = () => setMessage({ type: '', text: '' });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(clearMessage, 5000);
  };

  const handleCreateShipment = async () => {
    if (!order?.id) return;
    if (!config?.configured) {
      showMessage('danger', 'Delhivery is not configured. Check backend .env.');
      return;
    }
    if (order.status !== 'paid' && order.status !== 'processing') {
      showMessage('warning', 'Create shipment usually after order is Paid or Processing.');
    }
    setActionLoading('create');
    setMessage({ type: '', text: '' });
    try {
      const data = await shippingAPI.createShipment(order.id, { fetchWaybill: false });
      if (data?.waybill || data?.awb) {
        // Backend now returns a labelDownloadUrl pointing to /api/orders/:id/shipping-label/download
        const rawPath = data.labelDownloadUrl || data.labelUrl || '';
        let fullLabelUrl = null;
        if (rawPath) {
          const normalized = String(rawPath);
          const isAbsolute = normalized.startsWith('http://') || normalized.startsWith('https://');
          if (isAbsolute) {
            fullLabelUrl = normalized;
          } else if (normalized.startsWith('/api/')) {
            fullLabelUrl = `${BASE_URL}${normalized}`;
          } else {
            fullLabelUrl = `${API_BASE_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
          }
        }

        showMessage('success', `Shipment created. AWB: ${data.waybill || data.awb}`);
        onShipmentCreated?.({ waybill: data.waybill, awb: data.awb, labelUrl: fullLabelUrl });
      } else {
        showMessage('info', data?.message || 'Shipment request sent.');
        onShipmentCreated?.();
      }
    } catch (err) {
      showMessage('danger', err.message || 'Create shipment failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckPincode = async () => {
    if (!orderPin || orderPin.length !== 6) {
      showMessage('warning', 'Order has no valid 6-digit pincode.');
      return;
    }
    setActionLoading('pincode');
    setPincodeResult(null);
    setMessage({ type: '', text: '' });
    try {
      const data = await shippingAPI.checkPincode(orderPin);
      setPincodeResult(data);
      if (data?.serviceable) {
        showMessage('success', `Pincode ${orderPin} is serviceable. Prepaid: ${data.prepaid ? 'Yes' : 'No'}, COD: ${data.cod ? 'Yes' : 'No'}`);
      } else {
        showMessage('warning', data?.error || `Pincode ${orderPin} is not serviceable by Delhivery.`);
      }
    } catch (err) {
      showMessage('danger', err.message || 'Pincode check failed');
      setPincodeResult(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGetTat = async () => {
    if (!orderPin || orderPin.length !== 6) {
      showMessage('warning', 'Order has no valid 6-digit pincode.');
      return;
    }
    setActionLoading('tat');
    setTatResult(null);
    setMessage({ type: '', text: '' });
    try {
      const data = await shippingAPI.getTat(null, orderPin);
      setTatResult(data);
      if (data?.tatDays != null) {
        showMessage('success', `Estimated delivery: ${data.tatDays} day(s) to pincode ${orderPin}`);
      } else {
        showMessage('info', data?.error || 'TAT not available for this pincode.');
      }
    } catch (err) {
      showMessage('danger', err.message || 'TAT fetch failed');
      setTatResult(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintLabel = async () => {
    const wb = order?.awbCode;
    if (!wb || !order?.id) {
      showMessage('warning', 'No AWB for this order. Create shipment first.');
      return;
    }
    setActionLoading('label');
    setMessage({ type: '', text: '' });
    try {
      // Prefer backend shipping-label download route so we never expose Delhivery tokenized URLs directly.
      const path = `/orders/${order.id}/shipping-label/download`;
      const url = `${API_BASE_URL}${path}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showMessage('success', 'Label download opened in new tab.');
    } catch (err) {
      showMessage('danger', err.message || 'Label open failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrack = async () => {
    const wb = order?.awbCode;
    if (!wb) {
      showMessage('warning', 'No AWB for this order.');
      return;
    }
    setActionLoading('track');
    setTrackingResult(null);
    setMessage({ type: '', text: '' });
    try {
      const data = await shippingAPI.trackShipment(wb);
      setTrackingResult(data);
      if (data?.scans?.length) {
        showMessage(
          'success',
          `${data.scans.length} scan(s) found.${data.status ? ` Current status: ${data.status}.` : ''}`
        );
      } else if (data?.tracking || data?.status) {
        showMessage('info', data.status ? `Current status: ${data.status}` : 'Tracking data loaded.');
      } else {
        showMessage('info', 'No scans yet. Check back later.');
      }
    } catch (err) {
      showMessage('danger', err.message || 'Tracking failed');
      setTrackingResult(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (loadingConfig) {
    return (
      <div className="card">
        <div className="card-header bg-secondary bg-opacity-10">
          <h5 className="mb-0">Shipping (Delhivery)</h5>
        </div>
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0 mt-2 small text-muted">Checking config...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-primary">
      <div className="card-header bg-primary bg-opacity-10 border-primary d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="mb-0 fw-semibold">Shipping (Delhivery)</h5>
        {config?.configured ? (
          <span className="badge bg-success">Configured</span>
        ) : (
          <span className="badge bg-warning text-dark">Not configured</span>
        )}
      </div>
      <div className="card-body">
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible py-2 mb-3`} role="alert">
            {message.text}
            <button type="button" className="btn-close btn-close-sm" onClick={clearMessage} aria-label="Close" />
          </div>
        )}

        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateShipment}
            disabled={actionLoading || !config?.configured || !order?.id}
            title={!config?.configured ? 'Delhivery not configured in backend' : 'Create shipment in Delhivery and get AWB'}
          >
            {actionLoading === 'create' ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                Creating...
              </>
            ) : (
              'Create Shipment'
            )}
          </button>
          {orderPin.length === 6 && (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCheckPincode}
                disabled={actionLoading}
              >
                {actionLoading === 'pincode' ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Check Pincode'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleGetTat}
                disabled={actionLoading}
              >
                {actionLoading === 'tat' ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Get TAT'
                )}
              </button>
            </>
          )}
          {hasAwb && (
            <>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handlePrintLabel}
                disabled={actionLoading}
              >
                {actionLoading === 'label' ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Print Label'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={handleTrack}
                disabled={actionLoading}
              >
                {actionLoading === 'track' ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Track'
                )}
              </button>
            </>
          )}
        </div>

        {(pincodeResult != null || tatResult != null || (trackingResult?.scans?.length > 0)) && (
          <div className="mt-3 pt-3 border-top">
            {pincodeResult != null && (
              <div className="small mb-2">
                <strong>Pincode {orderPin}:</strong>{' '}
                {pincodeResult.serviceable ? (
                  <>Serviceable — Prepaid: {pincodeResult.prepaid ? 'Yes' : 'No'}, COD: {pincodeResult.cod ? 'Yes' : 'No'}</>
                ) : (
                  <span className="text-muted">Not serviceable</span>
                )}
              </div>
            )}
            {tatResult != null && tatResult.tatDays != null && (
              <div className="small mb-2">
                <strong>Estimated delivery:</strong> {tatResult.tatDays} day(s)
              </div>
            )}
            {trackingResult?.status && (
              <div className="small mb-2">
                <strong>Current status:</strong> {trackingResult.status}
                {trackingResult.statusLocation && (
                  <span className="text-muted"> — {trackingResult.statusLocation}</span>
                )}
              </div>
            )}
            {trackingResult?.scans?.length > 0 && (
              <div className="small">
                <strong>Tracking ({trackingResult.scans.length} scan(s)):</strong>
                <ul className="list-unstyled mt-1 mb-0 ps-2">
                  {trackingResult.scans.slice(0, 5).map((s, i) => (
                    <li key={i} className="text-muted">
                      {s.status || s.scan || s.detail || JSON.stringify(s)}
                      {(s.date || s.timestamp) && (
                        <small className="ms-1">
                          — {s.date || (typeof s.timestamp === 'string' ? s.timestamp : new Date(s.timestamp).toLocaleString())}
                        </small>
                      )}
                    </li>
                  ))}
                  {trackingResult.scans.length > 5 && (
                    <li className="text-muted">+{trackingResult.scans.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {!config?.configured && (
          <p className="small text-muted mb-0 mt-2">
            Set DELHIVERY_API_KEY, DELHIVERY_BASE_URL, DELHIVERY_CLIENT and DELHIVERY_PICKUP_LOCATION in backend .env, then restart.
          </p>
        )}
      </div>
    </div>
  );
}

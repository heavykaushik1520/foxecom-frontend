import React, { useState, useEffect } from 'react'
import { contactAPI } from '../utils/api';

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

/** Match backend: 10-digit Indian mobile; allows +91 or leading 0. */
function normalizeIndianMobile10(value) {
  let digits = onlyDigits(value);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function isValidIndianMobile10(digits) {
  return /^[6-9]\d{9}$/.test(digits);
}

/** Keep field at most 10 digits (Indian mobile); strips non-digits and optional +91 / leading zeros. */
function sanitizePhoneFieldInput(raw) {
  let d = onlyDigits(raw);
  if (d.startsWith("91") && d.length > 10) {
    d = d.slice(2);
  }
  d = d.replace(/^0+/, "");
  return d.slice(0, 10);
}

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (e) => {
    setForm({
      ...form,
      phone: sanitizePhoneFieldInput(e.target.value),
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
     
    // ✅ Basic validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.message.trim()
    ) {
      setError("All fields are required");
      setSuccess("");
      setToastMessage("All fields are required");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setError(""), 5000);
      return;
    }

    const phoneDigits = normalizeIndianMobile10(form.phone);
    if (!isValidIndianMobile10(phoneDigits)) {
      const msg =
        "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
      setError(msg);
      setSuccess("");
      setToastMessage(msg);
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setError(""), 5000);
      return;
    }
    
    // ✅ Clear errors
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await contactAPI.submit({
        ...form,
        phone: phoneDigits,
      });
      setLoading(false);
      setSuccess(res?.message || "Thank you! We will contact you soon.");
      setToastMessage(res?.message || "Thank you! Your message has been sent successfully.");
      setToastType("success");
      setShowToast(true);
      
      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setLoading(false);
      setSuccess("");
      setError(err?.message || "Failed to submit contact form. Please try again.");
      setToastMessage(err?.message || "Failed to submit contact form. Please try again.");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="padding-large contact-page">
      {/* Toast Notification */}
      {showToast && (
        <div 
          className="toast-container position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div 
            className={`toast show ${toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ minWidth: '300px', maxWidth: '400px' }}
          >
            <div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
              <i className={`bi ${toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`} style={{ fontSize: '1.25rem' }}></i>
              <strong className="me-auto">
                {toastType === 'success' ? 'Success' : 'Error'}
              </strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowToast(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">
              {toastMessage}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-7 col-xl-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-md-4 p-lg-4">
                {/* Header */}
                <div className="text-center contact-header mb-3 mb-md-4">
                  <h1 className="h3 fw-bold mb-3 contact-page-title">
                    CONTACT FOR B2B
                  </h1>
                 
                </div>

                {/* Alerts */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show mb-3 mb-md-4" role="alert">
                    <small>{error}</small>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}
                {success && (
                  <div className="alert alert-success alert-dismissible fade show mb-3 mb-md-4" role="alert">
                    <small>{success}</small>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccess("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="row g-3">
                    {/* Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold contact-form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text"
                        name="name"
                        className="form-control contact-input"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold contact-form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="email"
                        name="email"
                        className="form-control contact-input"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Phone */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold contact-form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="tel"
                        name="phone"
                        className="form-control contact-input"
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label fw-semibold contact-form-label">
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea 
                        name="message"
                        className="form-control contact-input"
                        rows="4"
                        placeholder="Write your message..."
                        value={form.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-2 mt-md-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary contact-submit-btn"
                        disabled={loading}
                        style={{ 
                          fontWeight: '600',
                          position: 'relative',
                          opacity: loading ? 0.7 : 1,
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill me-2"></i>
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs

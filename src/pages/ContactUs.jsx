import React, { useState, useEffect } from 'react'
import { contactAPI } from '../utils/api';

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
     
    // ✅ Basic validation
    if(
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.message.trim()
    ){
      setError("All fields are required");
      setSuccess("");
      setToastMessage("All fields are required");
      setToastType("error");
      setShowToast(true);

       // ⏱️ Error message hide after 5 seconds
         setTimeout(() => {
          setError("");
         }, 5000);
      return;
    }
    
    // ✅ Clear errors
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await contactAPI.submit(form);
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
    <div className="padding-large">
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
              <div className="card-body p-3 p-md-4 p-lg-5">
                {/* Header */}
                <div className="text-center mb-4 mb-md-5">
                  <h2 className="h3 h-md-2 fw-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                    CONTACT US
                  </h2>
                 
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
                  <div className="row g-3 g-md-4">
                    {/* Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 0.95rem)' }}>
                        Name <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text"
                        name="name"
                        className="form-control form-control-lg"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                      />
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 0.95rem)' }}>
                        Email <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="email"
                        name="email"
                        className="form-control form-control-lg"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                      />
                    </div>

                    {/* Phone */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 0.95rem)' }}>
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="tel"
                        name="phone"
                        className="form-control form-control-lg"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={handleChange}
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                      />
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 0.95rem)' }}>
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea 
                        name="message"
                        className="form-control form-control-lg"
                        rows="5"
                        placeholder="Write your message..."
                        value={form.message}
                        onChange={handleChange}
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', resize: 'vertical' }}
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-3 mt-md-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg px-4 px-md-5 py-2 py-md-3"
                        disabled={loading}
                        style={{ 
                          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                          minWidth: '150px',
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

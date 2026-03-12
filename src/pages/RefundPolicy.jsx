import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const RefundPolicy = () => {
  return (
    <div className="legal-container container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="text-center mb-4">
            <h1 className="h2 mb-1 text-dark">Refund and Cancellation Policy</h1>
            {/* <p className="mb-0 small text-muted">Last Updated: {new Date().toLocaleDateString()}</p> */}
          </div>

          <div className="legal-card card border shadow-sm mb-4">
            <div className="card-header py-3 py-md-4">
              <h2 className="h5 fw-bold mb-0 text-dark">FOXECOM Refund Policy</h2>
            </div>
            <div className="card-body p-3 p-md-4">
              <p className="mb-4">FOXECOM.IN is into ecommerce and online sales of mobile accessories and electronics, promoted by REDECOM TECH LABS PVT LTD. We focus on customer satisfaction. If you are displeased with the goods or products provided, we will refund the money, provided the reasons are genuine and proved after investigation.</p>

              <p className="small border p-3 mb-4">Please read the fine print of each deal before buying; it provides all details about the product you purchase.</p>

              <section className="legal-section mb-4">
                <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Cancellation Policy</h2>
                <p className="mb-2">For cancellation, please contact us via the &quot;Contact us&quot; link. Cancellation requests will be considered only if made <strong>within 24 hours</strong> of placing an order.</p>
                <p className="mb-2">Cancellation will not be entertained if the order has been communicated to vendors and they have initiated shipping.</p>
                <p className="mb-2">For damaged or defective items, report to Customer Service <strong>within 24 hours</strong> of receipt.</p>
                <p className="mb-0">If the product received is not as shown or as per your expectations, bring it to our customer service&apos;s notice <strong>within 24 hours</strong> of receipt. The team will review and take an appropriate decision.</p>
              </section>

              <section className="legal-section mb-4">
                <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Refund Policy</h2>
                <p className="border p-3 mb-3"><strong>Important:</strong> Orders once delivered and accepted by the customer cannot be refunded.</p>
                <p className="mb-2">If the order is cancelled before it is processed, the amount paid will be refunded in due time as per the standard cancellation policy of payment gateways and banking channels.</p>
                <ul className="custom-list small">
                  <li>Request cancellation within 24 hours of order.</li>
                  <li>Team reviews the request.</li>
                  <li>Refund is processed through the payment gateway.</li>
                </ul>
              </section>

              <section className="legal-section mb-0">
                <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Contact</h2>
                <p className="mb-1"><strong>Phone:</strong> +91 9625472793</p>
                <p className="mb-1"><strong>Email:</strong> foxecom99@gmail.com</p>
                <p className="mb-3"><strong>Registered Office:</strong><br />
                  FOXECOM.IN, C/O: REDECOM TECH LABS PVT LTD, 703, 7th floor, Ahinsa Knd 2, Charms, Solita, Indirapuram, Sahibabad, Ghaziabad- 201010, Uttar Pradesh</p>
                <Link to="/contact-us" className="small text-dark">Contact Us</Link>
              </section>
            </div>

            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <small className="text-muted">Your satisfaction is our priority</small>
                <div className="d-flex gap-2">
                  <Link to="/terms" className="small text-dark">Terms</Link>
                  <Link to="/privacy-policy" className="small text-dark">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="border p-3">
                <h3 className="h6 fw-bold mb-2">What you can do</h3>
                <ul className="custom-list small mb-0">
                  <li>Cancel within 24 hours of ordering</li>
                  <li>Report damaged items within 24 hours</li>
                  <li>Contact customer service for issues</li>
                  <li>Get refund if cancelled before processing</li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="border p-3">
                <h3 className="h6 fw-bold mb-2">What you cannot do</h3>
                <ul className="custom-list small mb-0">
                  <li>Cancel after shipping has started</li>
                  <li>Refund after accepting delivery</li>
                  <li>Report issues after 24 hours</li>
                  <li>Cancel without contacting us</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;

import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const TermsConditions = () => {
  return (
    <div className="legal-container container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="legal-card card border shadow-sm">
            <div className="card-header py-3 py-md-4">
              <h1 className="h2 mb-1 text-dark">Terms & Conditions</h1>
              <p className="mb-0 small text-muted">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="card-body p-3 p-md-4">
              <div className="legal-content">
                <div className="mb-4">
                  <h2 className="h5 fw-bold mb-2">Welcome to FOXECOM</h2>
                  <p className="mb-0">
                    These Terms and Conditions govern your use of FOXECOM.IN website and services. By accessing or using our services, you agree to be bound by these Terms.
                  </p>
                </div>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">General Terms</h2>
                  <p className="mb-2">FOXECOM.IN is promoted by REDECOM TECH LABS PVT LTD, dealing in mobile accessories and electronics under the brand name &quot;FOXECOM&quot;.</p>
                  <ul className="custom-list">
                    <li>By agreeing to these Terms, you represent that you are at least the age of majority in your state or province of residence.</li>
                    <li>You may not use our products for any illegal or unauthorized purpose.</li>
                    <li>You must not transmit any worms, viruses, or any code of a destructive nature.</li>
                  </ul>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Products and Services</h2>
                  <ul className="custom-list">
                    <li>All products are subject to availability.</li>
                    <li>We reserve the right to discontinue any product at any time.</li>
                    <li>Prices for our products are subject to change without notice.</li>
                    <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
                  </ul>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Payments and Transactions</h2>
                  <p className="mb-2">We accept payments through various gateways including RuPay, VISA, MasterCard, American Express, Discover. All transactions are secured with PCI-DSS compliance and SSL encryption.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Returns and Refunds</h2>
                  <ul className="custom-list">
                    <li>Returns must be initiated within 7 days of delivery.</li>
                    <li>Products must be in original condition with all accessories.</li>
                    <li>Refunds will be processed within 7-10 business days.</li>
                    <li>Shipping charges are non-refundable unless the return is due to our error.</li>
                  </ul>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Intellectual Property</h2>
                  <p className="mb-0">The FOXECOM brand and logo are registered trademarks of REDECOM TECH LABS PVT LTD. All content on this website is our property and protected by copyright laws.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Limitation of Liability</h2>
                  <p className="mb-0">FOXECOM shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Governing Law</h2>
                  <p className="mb-0">These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ghaziabad, Uttar Pradesh.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Changes to Terms</h2>
                  <p className="mb-0">We reserve the right to update, change, or replace any part of these Terms by posting updates to our website. Your continued use constitutes acceptance of those changes.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Contact Information</h2>
                  <div className="border p-3 bg-light">
                    <p className="mb-1"><strong>Customer Support:</strong> +91 9625472793</p>
                    <p className="mb-1"><strong>Email:</strong> foxecom99@gmail.com</p>
                    <p className="mb-0"><strong>Registered Office:</strong><br />
                      FOXECOM.IN, C/O: REDECOM TECH LABS PVT LTD, 703, 7th floor, Ahinsa Knd 2, Charms, Solita, Indirapuram, Sahibabad, Ghaziabad- 201010, Uttar Pradesh</p>
                  </div>
                </section>

                <p className="small border-top pt-3 mt-3 mb-0">By using FOXECOM services, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions.</p>
              </div>
            </div>

            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <small className="text-muted">© {new Date().getFullYear()} FOXECOM. All rights reserved.</small>
                <Link to="/privacy-policy" className="small text-dark">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;

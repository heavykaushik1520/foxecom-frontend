import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="legal-card card border shadow-sm">
            <div className="card-header py-3 py-md-4">
              <h1 className="h2 mb-1 text-dark">Privacy Policy</h1>
              {/* <p className="mb-0 small text-muted">Last Updated: {new Date().toLocaleDateString()}</p> */}
            </div>

            <div className="card-body p-3 p-md-4">
              <div className="legal-content">
                <p className="mb-4">FOXECOM.IN is promoted by REDECOM TECH LABS PVT LTD. We are committed to protecting your privacy. This Privacy Policy outlines how FOXECOM collects, uses, and safeguards your personal information.</p>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">1. KYC: What Do We Do With Your Information?</h2>
                  <p className="mb-2">When you purchase from our store, we collect the personal information you give us such as name, address, contact details, and email. When you browse our store, we also receive your computer&apos;s IP address.</p>
                  <p className="mb-0">With your permission, we may send you emails about our store, new products, and other updates.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">2. Consent</h2>
                  <p className="mb-2">When you provide personal information to complete a transaction or place an order, we imply that you consent to our collecting and using it for that reason. For marketing, we will ask for your expressed consent or give you a chance to say no.</p>
                  <p className="mb-2">You may withdraw your consent at any time by contacting us.</p>
                  <div className="border p-3 bg-light small">
                    <strong>Contact for consent withdrawal:</strong> Phone +91 9625472793, Email foxecom99@gmail.com. Address: FOXECOM.IN, C/O: REDECOM TECH LABS PVT LTD, 703, 7th floor, Ahinsa Knd 2, Charms, Solita, Indirapuram, Sahibabad, Ghaziabad- 201010, Uttar Pradesh.
                  </div>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">3. Disclosure</h2>
                  <p className="mb-0">We may disclose your personal information if required by law or if you violate our Terms of Service.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">4. Payment</h2>
                  <p className="mb-0">If you use a direct payment gateway, FOXECOM stores your credit card data. It is encrypted through PCI-DSS. We work with RuPay, VISA, MasterCard, American Express, Discover.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">5. Third-Party Services</h2>
                  <p className="mb-0">Third-party providers collect, use, and disclose your information only as needed to perform their services. Once you leave our site or are redirected to a third-party site, you are no longer governed by this Privacy Policy.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">6. Security</h2>
                  <p className="mb-0">We implement security measures including SSL encryption for data transmission and industry-standard encryption for data storage.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">7. Cookies</h2>
                  <p className="mb-2">We use cookies to enhance your browsing experience. We use session cookies (e.g. _session_id, _secure_session_id) to store session information.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">8. Age of Consent</h2>
                  <p className="mb-0">By using this site, you represent that you are at least the age of majority in your state or province of residence.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">9. Changes to This Privacy Policy</h2>
                  <p className="mb-0">We reserve the right to modify this privacy policy at any time. Changes take effect immediately upon posting on the website.</p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">10. Questions and Contact</h2>
                  <p className="mb-2">To access, correct, amend, or delete your personal information, or for complaints or more information, contact us:</p>
                  <div className="border p-3 bg-light">
                    <p className="mb-1"><strong>Phone:</strong> +91 9625472793</p>
                    <p className="mb-0"><strong>Email:</strong> foxecom99@gmail.com</p>
                  </div>
                </section>

                <p className="small border-top pt-3 mt-3 mb-0">By accessing or using our services, you agree to the practices described in this policy.</p>
              </div>
            </div>

            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <small className="text-muted">© {new Date().getFullYear()} FOXECOM</small>
                <Link to="/terms" className="small text-dark">Terms &amp; Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

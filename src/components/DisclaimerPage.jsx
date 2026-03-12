import React from "react";
import { Link } from "react-router-dom";
import "../pages/LegalPages.css";

const DisclaimerPage = () => {
  return (
    <div className="legal-container container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="legal-card card border shadow-sm">
            <div className="card-header py-3 py-md-4">
              <h1 className="h2 mb-1 text-dark">Disclaimer</h1>
              {/* <p className="mb-0 small text-muted">Last Updated: {new Date().toLocaleDateString()}</p> */}
            </div>

            <div className="card-body p-3 p-md-4">
              <div className="legal-content">
                <p className="mb-4">
                  Mobile accessories and electronics related products are potentially hazardous,
                  inflammable and require responsible usage with diligence. FOXECOM.IN makes no
                  warranties or representations, express or implied, on products offered through
                  the platform. It accepts no liability for any damage or losses, however caused,
                  in connection with the use of, or by reliance of its platforms or related
                  services. Terms and conditions of the website are applicable.
                </p>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Terms and Conditions</h2>
                  <p className="mb-2">
                    FOXECOM.IN is promoted by REDECOM TECH LABS PVT LTD registered under the
                    Companies Act, 2013 (18 of 2013), having its registered office at 703, 7th
                    Floor, Ahinsa Khand 2, Charms, Solita, Indirapuram, Sahibabad, Ghaziabad –
                    201010, Uttar Pradesh. By continuing to use the website www.foxecom.in
                    (&quot;Site&quot;), you consent to be bound by the terms and conditions of usage
                    of this website. If you find any of these terms unacceptable, do not continue
                    browsing this website. Your continued use shall operate as a legally
                    enforceable binding contract between you and the site.
                  </p>
                  <p className="mb-0">
                    In this User Agreement (&quot;Agreement&quot;), &quot;FOXECOM.IN&quot; and &quot;User&quot; or
                    &quot;Visitor&quot; are collectively referred to as the &quot;Parties&quot;. By accessing the
                    Site, you enter into the Agreement on the terms and conditions stated herein.
                    This Agreement is for an indefinite term; however, either Party may terminate
                    this Agreement subject to discharge of all contractual and statutory
                    obligations.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Disclaimer of Warranties and Liabilities</h2>
                  <p className="mb-2">
                    All information and materials on this Site are provided on an &quot;AS IS&quot; basis
                    without warranties of any kind. FOXECOM.IN disclaims all responsibility for
                    any loss, injury, liability or damage arising from:
                  </p>
                  <ul className="custom-list mb-3">
                    <li>Errors or omissions in the Site content.</li>
                    <li>Third-party websites or content accessed through links on the Site.</li>
                    <li>Your use of the Site.</li>
                  </ul>
                  <p className="mb-2">
                    Under no circumstances will FOXECOM.IN or its partners, employees, or
                    representatives be liable for any direct or consequential loss, including
                    special, incidental, punitive or exemplary damages arising from use or
                    inability to use the Site or its content.
                  </p>
                  <p className="mb-0">
                    FOXECOM.IN does not guarantee the accuracy, completeness or suitability of the
                    information on the Site and shall not be responsible for any errors or data
                    inaccuracies.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Non-Solicitation for Products</h2>
                  <p className="mb-0">
                    This Site is intended for informational purposes and sale of products. The
                    information does not constitute a solicitation to buy or sell any products.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Limited Permission to Copy</h2>
                  <p className="mb-0">
                    Users are permitted to print or download extracts from this Site for personal,
                    non-commercial use only. No part of the Site may be reproduced, stored,
                    transmitted or distributed without prior written consent of FOXECOM.IN.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Changes</h2>
                  <p className="mb-0">
                    FOXECOM.IN reserves the right to modify the content, services, and terms at
                    any time without notice. Continued use of the Site implies acceptance of such
                    changes.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Copyright and Trademarks</h2>
                  <p className="mb-0">
                    All intellectual property rights in the material on this Site, including
                    trademarks and logos, are the property of FOXECOM.IN and are protected by law.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Advertising Material</h2>
                  <p className="mb-0">
                    FOXECOM.IN is not responsible for claims or inaccuracies in advertising
                    material submitted by third parties.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Governing Laws</h2>
                  <p className="mb-0">
                    These Terms are governed by the laws of India, and disputes shall be subject
                    to Ghaziabad jurisdiction only.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Privacy Policy</h2>
                  <p className="mb-0">
                    FOXECOM.IN collects and uses information to provide services and improve user
                    experience. Information may be shared as required by law or for service
                    purposes. Credit card details are not stored.
                  </p>
                </section>

                <section className="legal-section mb-4">
                  <h2 className="h6 fw-bold mb-2 pb-1 border-bottom border-dark">Product Safety Policies</h2>
                  <ul className="custom-list mb-0">
                    <li>Mobile accessories may be flammable and must be used responsibly.</li>
                    <li>Use certified charging equipment and proper voltage.</li>
                    <li>
                      Products should not be left unattended while charging and must be kept
                      away from children and pets.
                    </li>
                  </ul>
                </section>
              </div>
            </div>

            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <small className="text-muted">© {new Date().getFullYear()} FOXECOM. All rights reserved.</small>
                <div className="d-flex gap-2">
                  <Link to="/terms" className="small text-dark">Terms &amp; Conditions</Link>
                  <Link to="/privacy-policy" className="small text-dark">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;

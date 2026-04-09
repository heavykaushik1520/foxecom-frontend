import React from 'react'
import { Link } from 'react-router-dom'
import mainLogo from '../assest/images/foxicom.webp'
import dhlLogo from '../assest/images/dhl.png'
import shippingCard from '../assest/images/shippingcard.png'
import visaLogo from '../assest/images/visa.jpg'
import mastercardLogo from '../assest/images/mastercard.jpg'
import paypalLogo from '../assest/images/paypal.jpg'

const Footer = () => {
  return (
    <>
      <footer id="footer" className="overflow-hidden">
        <div className="container">
          <div className="row">
            <div className="footer-top-area">
              <div className="row d-flex justify-center">
                {/* flex-wrap justify-content-between */}
                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu">
                    <img
                      src={mainLogo}
                      alt="FOXECOM"
                      width={300}
                      height={211}
                      loading="lazy"
                      style={{ maxWidth: '100px', width: '100%', height: 'auto' }}
                    />
                    <p>
                      FOXECOM brings you premium mobile accessories and gadgets with a focus on
                      quality, durability and everyday style. We ship across India with secure
                      payments and responsive customer support.
                    </p>
                   
                  </div>
                </div>
                <div className="col-lg-2 col-sm-6 pb-3">
                  <div className="footer-menu text-uppercase">
                    <h2 className="widget-title">Quick Links</h2>
                    <ul className="menu-list list-unstyled text-uppercase">
                      <li className="menu-item">
                        <Link className="footer-list" to="/">Home</Link>
                      </li>
                      {/* <li className="menu-item pb-2">
                        <Link to="/about-us">About</Link>
                      </li> */}
                      <li className="menu-item">
                        <Link className="footer-list" to="/shop">Shop</Link>
                      </li>
                      <li className="menu-item">
                        <Link className="footer-list" to="/blogs">Blogs</Link>
                      </li>
                      <li className="menu-item">
                        <Link className="footer-list" to="/contact-us">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu text-uppercase">
                    <h2 className="widget-title">Help & Info Help</h2>
                    <ul className="menu-list list-unstyled">
                    <li className="menu-item">
                        <Link className="footer-list" to="/disclaimer">Disclaimer</Link>
                      </li>
                      <li className="menu-item">
                        <Link className="footer-list" to="/privacy-policy">Privacy & Policy</Link>
                      </li>
                      <li className="menu-item">
                        <Link className="footer-list" to="/refund-policy">Returns Policies</Link>
                      </li>
                      {/* <li className="menu-item pb-2">
                        <Link to="/contact-us">Shipping + Delivery</Link>
                      </li> */}
                      <li className="menu-item">
                        <Link className="footer-list" to="/terms">Terms of Service</Link>
                      </li>
                     
                      
                    </ul>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu contact-item">
                    <h2 className="widget-title text-uppercase">Contact Us</h2>
                    <p className='footer-text'>Do you have any queries or suggestions? <a href="mailto:foxecom99@gmail.com">foxecom99@gmail.com</a>
                    </p>
                    <p className='footer-text'>If you need support? Just call us on  <a href="">+91 9289125523</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr />
      </footer>
      <div id="footer-bottom">
        <div className="container">
          <div className="row d-flex flex-wrap justify-content-center">
            {/* <div className="col-md-4 col-sm-6">
              <div className="Shipping d-flex">
                <p>We ship with:</p>
                <div className="card-wrap ps-2">
                  <img src={dhlLogo} alt="visa" />
                  <img src={shippingCard} alt="mastercard" />
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6">
              <div className="payment-method d-flex">
                <p>Payment options:</p>
                <div className="card-wrap ps-2">
                  <img src={visaLogo} alt="visa" />
                  <img src={mastercardLogo} alt="mastercard" />
                  <img src={paypalLogo} alt="paypal" />
                </div>
              </div>
            </div> */}
            <div className="col-md-6 col-sm-6">
              <div className="copyright">
                <p>© Copyright 2023 Foxecom. Design by <a href="https://www.ideatore.in" target='_blank'>IDEATORE INTERACTIVE PVT LTD</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer


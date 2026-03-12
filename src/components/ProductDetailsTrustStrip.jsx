import React from "react";

const items = [
  {
    icon: "bi-box-arrow-in-right",
    label: ["10 days", "Returnable"],
  },
  {
    icon: "bi-truck",
    label: ["Free Delivery"],
  },
  {
    icon: "bi-cash-stack",
    label: ["Pay on Delivery"],
  },
  {
    icon: "bi-truck",
    label: ["Foxecom", "Delivered"],
  },
  {
    icon: "bi-shield-lock",
    label: ["Secure", "transaction"],
  },
];

const ProductDetailsTrustStrip = () => {
  return (
    <div className="product-details-trust-strip">
      <div className="product-details-trust-strip-inner">
        {items.map((item, index) => (
          <div key={index} className="product-details-trust-strip-item">
            <div className="product-details-trust-strip-icon-wrap">
              <i className={`bi ${item.icon} product-details-trust-strip-icon`} aria-hidden />
            </div>
            <div className="product-details-trust-strip-text">
              {item.label.map((line, i) => (
                <span key={i} className="d-block">
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsTrustStrip;

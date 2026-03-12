import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/api";

const ProductView = () => {
  const { id } = useParams(); // get product id from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductById();
  }, [id]);
  const fetchProductById = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/products/${id}`,
      );
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h4 className="mb-0">Product Details</h4>
        </div>

        <div className="card-body">
          <div className="row g-4 align-items-start">
            {/* LEFT: Product Image */}
            <div className="col-12 col-md-4 text-center">
              <img
                src={`${BASE_URL}${product.thumbnailImage}`}
                alt={product.title}
                className="img-fluid rounded border"
                style={{ maxHeight: "250px", objectFit: "contain" }}
              />
            </div>

            {/* RIGHT: Product Info */}
            <div className="col-12 col-md-8">
              <h5 className="mb-3">{product.title}</h5>

              <div className="row">
                <div className="col-6 mb-2">
                  <strong>Category:</strong>
                  <div className="text-muted">{product.category?.name}</div>
                </div>

                <div className="col-6 mb-2">
                  <strong>Stock:</strong>
                  <div className="text-muted">{product.stock}</div>
                </div>

                <div className="col-6 mb-2">
                  <strong>Price:</strong>
                  <div className="text-muted">₹{product.price}</div>
                </div>

                <div className="col-6 mb-2">
                  <strong>Discount:</strong>
                  <div className="text-muted">₹{product.discount || 0}</div>
                </div>

                <div className="col-12 mt-2">
                  <strong>Created:</strong>
                  <div className="text-muted">
                    {new Date(product.createdAt).toDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2 flex-wrap">
                <Link
                  to={`/admin/products/edit/${product.id}`}
                  className="btn btn-sm btn-outline-secondary"
                  title="Edit Product"
                >
                  Edit
                </Link>
                <Link
                  to={`/admin/reviews/${product.id}`}
                  className="btn btn-sm btn-outline-primary"
                  title="Manage reviews"
                >
                  Manage reviews
                </Link>
                <Link to={"/admin/products"} className="btn btn-secondary">
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;

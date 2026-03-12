import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom';
import { mobileBrandAPI } from '../../../utils/api';

const MobileBrandDetails = () => {
  const { id } = useParams(); // 👈 brand id from URL
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await mobileBrandAPI.getById(id);
        // Handle both new format (with success) and legacy format
        const brandData = data.brand || data;
        setBrand(brandData);
      } catch (err) {
        console.error(err);
        setError(err.message || "Brand not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBrand();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="alert alert-danger">
        {error || "Brand not found"}
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={() => navigate("/admin/mobile-brand")}
        >
          Back to Brands
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0 text-uppercase">Brand Details</h4>
        <div className="d-flex gap-2">
          <Link to={`/admin/mobile-brand/edit/${id}`} className="btn btn-warning">
            Edit Brand
          </Link>
          <Link to={"/admin/mobile-brand"} className="btn btn-secondary">
            ← Back to Brands
          </Link>
        </div>
      </div>

      {/* Content Card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-4">Brand Information</h5>

          <div className="table-responsive">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: "200px" }}>Brand ID</th>
                  <td>#{brand.id}</td>
                </tr>

                <tr>
                  <th>Brand Name</th>
                  <td className="fw-medium">{brand.name}</td>
                </tr>

                <tr>
                  <th>Created At</th>
                  <td>
                    {new Date(brand.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>

                <tr>
                  <th>Last Updated</th>
                  <td>
                    {new Date(brand.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileBrandDetails
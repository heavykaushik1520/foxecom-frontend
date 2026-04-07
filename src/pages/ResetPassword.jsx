import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { userAuthAPI } from "../utils/api";
import "./auth.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await userAuthAPI.resetPassword(token, newPassword);
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                <div className="alert alert-danger">Invalid or missing reset link. Please request a new one.</div>
                <div className="text-center">
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request new link
                  </Link>
                  <span className="mx-2">or</span>
                  <Link to="/login">Back to Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h1 className="h4 fw-bold mb-1" style={{ fontSize: "1.5rem" }}>
                  Reset Password
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2">{error}</div>
              )}
              {success && (
                <div className="alert alert-success py-2">{success}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">New password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${error ? "is-invalid" : ""}`}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm password</label>
                  <input
                    type="password"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </div>
              </form>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  Back to Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

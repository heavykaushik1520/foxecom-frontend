import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAuthAPI } from "../utils/api";
import "./auth.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await userAuthAPI.signup(email, password);

      setSuccess("Signup successful! Please login to continue.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-signup-page container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-3 py-sm-4 py-md-5">
      <div className="row w-100 justify-content-center g-0 px-1 px-sm-2 px-md-0">
        <div className="col-12 col-sm-11 col-md-7 col-lg-5 col-xl-4">
          <div className="card shadow-sm border-0 auth-card auth-signup-card mx-auto w-100">
            <div className="card-body auth-signup-card-body p-3 p-sm-4 p-md-5">
              <div className="text-center mb-3 mb-md-4">
                <h1 className="h4 fw-bold mb-2 auth-title">Sign up</h1>
                {/* <p className="text-muted mb-0 auth-subtitle">
                  Create your account to get started
                </p> */}
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true" />
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success py-2 px-3 mb-3" role="status">
                  {success}
                </div>
              )}

              <form onSubmit={handleSignup} noValidate>
                <div className="mb-3 mb-md-4">
                  <label
                    htmlFor="signup-email"
                    className="form-label fw-semibold mb-2 auth-label"
                  >
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    className={`form-control auth-input ${error ? "is-invalid" : ""}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3 mb-md-4">
                  <label
                    htmlFor="signup-password"
                    className="form-label fw-semibold mb-2 auth-label"
                  >
                    Password
                  </label>
                  <div className="input-group auth-input-group">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      className={`form-control auth-input ${error ? "is-invalid" : ""}`}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <div className="d-grid mb-3 mb-md-4">
                  <button
                    type="submit"
                    className="btn btn-primary auth-btn auth-btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Creating account...
                      </>
                    ) : (
                      "Sign up"
                    )}
                  </button>
                </div>
              </form>

              <div className="auth-signup-footer">
                <p className="mb-0 auth-signup-footer-copy">
                  Already have an account?{" "}
                  <Link to="/login" className="auth-signup-footer-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

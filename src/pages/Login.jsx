import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userAuthAPI, API_BASE_URL } from "../utils/api";
import "./auth.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect back from Google OAuth (token in query string)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const provider = params.get("provider");
    const oauthError = params.get("error");

    if (oauthError && !token) {
      setError(
        oauthError === "google_auth_failed"
          ? "Google sign-in failed. Please try again or use email login."
          : "Unexpected error during Google sign-in. Please try again."
      );
    }

    if (token) {
      try {
        localStorage.setItem("token", token);
        window.dispatchEvent(new Event("loginStatusChanged"));

        const redirectTo =
          localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");

        // Remove token params from URL before navigating
        navigate(redirectTo, { replace: true });
      } catch (e) {
        console.error("Error handling OAuth login token:", e);
        setError("Unable to complete login. Please try again.");
      }
    }
  }, [location.search, navigate]);

  const handleGoogleLogin = () => {
    // Remember where user wanted to go after login
    const redirectTo =
      localStorage.getItem("redirectAfterLogin") ||
      (location.state && location.state.from) ||
      "/";
    localStorage.setItem("redirectAfterLogin", redirectTo);

    const url = new URL(`${API_BASE_URL}/auth/google`);
    url.searchParams.set("redirect", redirectTo);
    window.location.href = url.toString();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await userAuthAPI.signin(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);

        // Dispatch event to sync login state across components
        window.dispatchEvent(new Event("loginStatusChanged"));

        // CartContext will automatically handle cart merge when it detects login
        // No need to call mergeGuestCart here to avoid duplicate merges

        // Redirect to intended destination or home
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo);
      } else {
        setError(data.message || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-3 py-sm-4 py-md-5">
      <div className="row w-100 justify-content-center g-0 px-2 px-sm-0">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card shadow-sm border-0 auth-card mx-auto">
            <div className="card-body p-3 p-sm-4 p-md-5">
              {/* Title */}
              <div className="text-center mb-3 mb-md-4">
                <h4 className="fw-bold mb-2 auth-title">
                  {isSignup ? "Sign up" : "Sign in"}
                </h4>
                <p className="text-muted mb-0 auth-subtitle">
                  {isSignup
                    ? "Create your account to get started"
                    : "Sign in to your account"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              {/* Social login */}
              <div className="d-grid mb-3 mb-md-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary auth-btn auth-btn-google d-flex align-items-center justify-content-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <i className="bi bi-google" />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="d-flex align-items-center mb-3 mb-md-4">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted auth-divider-text text-nowrap">
                  or sign in with email
                </span>
                <hr className="flex-grow-1" />
              </div>

              {/* Email */}
              <div className="mb-3 mb-md-4">
                <label className="form-label fw-semibold mb-2 auth-label">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`form-control auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="mb-3 mb-md-4">
                <label className="form-label fw-semibold mb-2 auth-label">
                  Password
                </label>
                <div className="input-group auth-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control auth-input ${error ? "is-invalid" : ""}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="mb-3 mb-md-4 text-end">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none fw-medium auth-link-muted"
                    style={{ color: "#89bb56" }}
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Button */}
              <div className="d-grid mb-3 mb-md-4">
                <button
                  className="btn btn-primary auth-btn auth-btn-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Please wait...
                    </>
                  ) : isSignup ? (
                    "Sign up"
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              {/* Toggle */}
              <div className="text-center pt-2 border-top">
                <p className="mb-0 auth-footer-text">
                  {isSignup ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none fw-semibold auth-footer-text"
                        onClick={() => setIsSignup(false)}
                        style={{ color: "#89bb56" }}
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New user?{" "}
                      <Link
                        to="/sign-up"
                        className="text-decoration-none fw-semibold auth-footer-text"
                        style={{ color: "#89bb56" }}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

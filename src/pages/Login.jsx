import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { userAuthAPI, API_BASE_URL } from "../utils/api";
import "./auth.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate();
  const { mergeGuestCart } = useCart();
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
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
        localStorage.removeItem('redirectAfterLogin')
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
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 py-md-5">
        <div className="row w-100 justify-content-center g-0">
          <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div className="card shadow-sm border-0 auth-card">
              <div className="card-body p-4 p-md-5">

                {/* Title */}
                <div className="text-center mb-4 mb-md-5">
                  <h4 className="fw-bold mb-2 mb-md-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#212529' }}>
                    {isSignup ? "Sign up" : "Sign in"}
                  </h4>
                  <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)' }}>
                    {isSignup
                      ? "Create your account to get started"
                      : "Sign in to your account"}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-danger py-2 px-3 mb-3 mb-md-4" role="alert" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {/* Social login */}
                <div className="d-grid mb-3 mb-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                      padding: 'clamp(0.75rem, 2vw, 0.875rem)',
                      border:'1px solid #89bb56',
                      borderRadius: '8px',
                      color:'#89bb56',
                      borderColor: '#dee2e6',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <i className="bi bi-google" />
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="d-flex align-items-center mb-3 mb-md-4">
                  <hr className="flex-grow-1" />
                  <span
                    className="mx-2 text-muted"
                    style={{ fontSize: 'clamp(0.8rem, 2vw, 0.85rem)' }}
                  >
                    or sign in with email
                  </span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Email */}
                <div className="mb-3 mb-md-4">
                  <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', color: '#495057' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    style={{ 
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                      padding: 'clamp(0.625rem, 1.5vw, 0.75rem) 1rem',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Password */}
                <div className="mb-3 mb-md-4">
                  <label className="form-label fw-semibold mb-2" style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', color: '#495057' }}>
                    Password
                  </label>
                  <div className="input-group input-group-lg">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${error ? "is-invalid" : ""}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      style={{ 
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        padding: 'clamp(0.625rem, 1.5vw, 0.75rem) 1rem',
                        borderRadius: '8px 0 0 8px',
                        border: '1px solid #dee2e6',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary border-start-0" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        borderRadius: '0 8px 8px 0',
                        border: '1px solid #dee2e6',
                        borderLeft: 'none',
                        padding: 'clamp(0.625rem, 1.5vw, 0.75rem) 1rem',
                        minWidth: '50px'
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}></i>
                    </button>
                  </div>
                </div>
                
                {!isSignup && (
                  <div className="mb-3 mb-md-4 text-end">
                    <Link 
                      to="/forgot-password" 
                      className="text-decoration-none fw-medium"
                      style={{ 
                        fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                        color: '#89bb56',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#7aa84a'}
                      onMouseLeave={(e) => e.target.style.color = '#89bb56'}
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Button */}
                <div className="d-grid mb-3 mb-md-4">
                  <button
                    className="btn btn-primary btn-lg fw-semibold"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      fontSize: 'clamp(0.95rem, 2.2vw, 1rem)',
                      padding: 'clamp(0.75rem, 2vw, 0.875rem)',
                      borderRadius: '8px',
                      backgroundColor: '#89bb56',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#7aa84a', e.target.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#89bb56', e.target.style.transform = 'translateY(0)')}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Please wait...
                      </>
                    ) : (
                      isSignup ? "Sign up" : "Sign in"
                    )}
                  </button>
                </div>

                {/* Toggle */}
                <div className="text-center pt-2 border-top">
                  <p className="mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', color: '#6c757d' }}>
                    {isSignup ? (
                      <>
                        Already have an account?{' '}
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => setIsSignup(false)}
                          style={{ 
                            fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                            color: '#89bb56',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#7aa84a'}
                          onMouseLeave={(e) => e.target.style.color = '#89bb56'}
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        New user?{' '}
                        <Link 
                          to="/sign-up" 
                          className="text-decoration-none fw-semibold"
                          style={{ 
                            fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                            color: '#89bb56',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#7aa84a'}
                          onMouseLeave={(e) => e.target.style.color = '#89bb56'}
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

import React, { useState } from 'react'
import SVGSymbols from '../components/SVGSymbols'
import Header from '../components/Header'
import "./auth.css";
import { useNavigate } from 'react-router-dom';
import { userAuthAPI, API_BASE_URL } from '../utils/api';

const SignUp = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // const handleSignup = async () => {
  //   try{
  //     const res = await fetch(
  //       `${API_BASE_URL}/auth/user/signup`,
  //       {
  //         method: "POST",
  //         headers:{
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           email: email,
  //           password: password,
  //         })
  //       }
  //     )
  //   }
  // }

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      await userAuthAPI.signup(email, password);
      
      setSuccess("Signup successful! Please login to continue.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <SVGSymbols />
      <Header />
       <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4">

                {/* Header */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Sign up</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Create your account
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-danger py-2">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="alert alert-success py-2">
                    {success}
                  </div>
                )}

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-group">

                     <input
                    type={showPassword ?  "text" : "password"}
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                  className='btn btn-outline-secondary'
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                  </div>
                 
                </div>

                {/* Button */}
                <div className="d-grid mb-3">
                  <button
                    className="btn btn-primary"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign up"}
                  </button>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate("/login")}
                  >
                    Already have an account? Sign in
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp
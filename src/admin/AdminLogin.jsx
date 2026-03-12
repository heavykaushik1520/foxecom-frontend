import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { STORAGE_KEYS } from "../utils/constants";

const AdminLogin = ({ setIsAdmin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    const role = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);
    if (token && role === "superadmin") {
      navigate("/superadmin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await adminAPI.login(email, password);
      
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.IS_ADMIN, "true");
        const role = (data.role && String(data.role).toLowerCase()) || "admin";
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, role);
        if (role === "superadmin") {
          navigate("/superadmin/dashboard", { replace: true });
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold">Admin Login</h4>
                  <p className="text-muted mb-0">
                    Sign in to access admin dashboard
                  </p>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Button */}
                <div className="d-grid">
                  <button
                    className="btn btn-primary"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-3 text-muted small">
                  Authorized personnel only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

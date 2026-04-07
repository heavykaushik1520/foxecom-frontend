import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../utils/api';

const Auth = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { mergeGuestCart } = useCart();

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/user/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.status == 200) {
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
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again.");
    }
  };


  return (
    <>
        <h1 className="h2">Sign in page</h1>
        <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Sign in</button>
    </>
  )
}

export default Auth;
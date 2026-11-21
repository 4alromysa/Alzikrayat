import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Login form that uses the existing Express authentication API
export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep the text fields in React state
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Send credentials and keep the session cookie
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      onAuthenticated(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>Login</h1>
      <p className="auth-subtitle">Welcome back to Alzikrayat.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      <p className="auth-footer">New to Alzikrayat? <Link to="/register">Create an account</Link></p>
    </section>
  );
}

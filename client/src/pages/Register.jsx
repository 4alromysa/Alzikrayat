import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Registration form with the exact fields expected by the backend
export default function Register({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    location: "", occupation: "", description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update only the field that the user edited
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Submit the registration data to the existing Express route
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      onAuthenticated(data.user);
      navigate("/gallery");
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>Create Account</h1>
      <p className="auth-subtitle">Join Alzikrayat and share your memories.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row">
          <label>First Name *<input name="firstName" value={form.firstName} onChange={handleChange} required /></label>
          <label>Last Name *<input name="lastName" value={form.lastName} onChange={handleChange} required /></label>
        </div>
        <label>Email *<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
        <label>Password *<input type="password" name="password" minLength={6} value={form.password} onChange={handleChange} required /></label>
        <label>Location (optional)<input name="location" value={form.location} onChange={handleChange} /></label>
        <label>Occupation (optional)<input name="occupation" value={form.occupation} onChange={handleChange} /></label>
        <label>About You (optional)<textarea name="description" rows={3} value={form.description} onChange={handleChange} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
    </section>
  );
}

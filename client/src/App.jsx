import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import "./App.css";

// Shared navigation and application routes
function AppContent() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Restore the user's session after refreshing the page
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Could not check the current session:", error);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // Clear the server-side session when the user signs out
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      setUser(null);
      navigate("/login");
    } catch (error) {
      alert("Could not log out. Please try again.");
    }
  };

  if (checkingSession) return <p className="loading-message">Loading...</p>;

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Alzikrayat</Link>
        <nav aria-label="Main navigation">
          {user ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/gallery">Gallery</Link>
              <span className="welcome-name">Hi {user.firstName}</span>
              <button type="button" className="nav-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <span className="login-label">Please Login</span>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register onAuthenticated={setUser} />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onAuthenticated={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

// The router handles navigation without reloading the page
export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

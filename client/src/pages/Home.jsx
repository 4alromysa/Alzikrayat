import { Link } from "react-router-dom";

// A welcoming landing page required by the course specification.
export default function Home() {
  return (
    <section className="home-page page-container">
      <div className="home-hero">
        <span className="eyebrow">WELCOME TO ALZIKRAYAT</span>
        <h1>Every photo holds a memory.</h1>
        <p>A cozy corner to share the moments that matter and revisit stories worth remembering.</p>
        <Link className="primary-button hero-link" to="/gallery">Explore the gallery</Link>
      </div>
    </section>
  );
}

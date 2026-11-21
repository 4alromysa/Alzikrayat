import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Show a full-sized image and metadata from the existing photo API.
export default function PhotoDetail() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reload the record when the photo route parameter changes.
  useEffect(() => {
    const controller = new AbortController();

    const loadPhoto = async () => {
      setLoading(true);
      setError("");
      setPhoto(null);
      try {
        const response = await fetch(`/api/photos/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load the photo.");
        if (!controller.signal.aborted) setPhoto(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Could not load the photo.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadPhoto();
    return () => controller.abort();
  }, [id]);

  const author = photo
    ? [photo.userId?.firstName, photo.userId?.lastName].filter(Boolean).join(" ") || "Alzikrayat member"
    : "";
  const date = photo?.dateTime
    ? new Date(photo.dateTime).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "";

  return (
    <section className="page-container detail-page">
      <Link to="/gallery" className="subtle-link">← Back to gallery</Link>
      {loading && <p className="feedback-message" role="status">Loading photo...</p>}
      {!loading && error && <p className="feedback-message error-message" role="alert">{error}</p>}
      {!loading && photo && (
        <article className="detail-card">
          <div className="detail-image-wrap">
            <img src={`/uploads/${encodeURIComponent(photo.fileName || "")}`} alt={photo.title || "Shared memory"} />
          </div>
          <div className="detail-content">
            <h1>{photo.title}</h1>
            {photo.description && <p className="detail-description">{photo.description}</p>}
            <div className="photo-meta">
              <span>Shared by {author}</span>
              {date && <time dateTime={photo.dateTime}>{date}</time>}
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

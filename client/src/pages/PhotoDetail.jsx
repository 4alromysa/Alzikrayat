import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// Display the selected photo and allow its owner to delete it.
export default function PhotoDetail({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load the selected photo whenever its ID changes.
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
        if (fetchError.name !== "AbortError" && !controller.signal.aborted) {
          setError(fetchError.message || "Could not load the photo.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadPhoto();
    return () => controller.abort();
  }, [id]);

  // Compare the logged-in user with the photo owner.
  const ownerId = photo?.userId?._id || photo?.userId;
  const canDelete = Boolean(currentUser?.id && ownerId && String(currentUser.id) === String(ownerId));

  // Request deletion only after the owner confirms the action.
  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    if (!window.confirm("Delete this photo? This cannot be undone.")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/photos/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete the photo.");

      // Return to the gallery after successful deletion.
      navigate("/gallery", { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the photo.");
    } finally {
      setDeleting(false);
    }
  };

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
            {/* Only show the delete action to the photo owner. */}
            {canDelete && (
              <button
                type="button"
                className="delete-photo-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Photo"}
              </button>
            )}
          </div>
        </article>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import PhotoCard from "../components/PhotoCard";

// Display photos returned by the existing Express REST API.
export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load photo records when the gallery first opens.
  useEffect(() => {
    const controller = new AbortController();

    const loadPhotos = async () => {
      try {
        const response = await fetch("/api/photos", {
          signal: controller.signal,
          credentials: "include",
        });
        if (!response.ok) throw new Error("Could not load the photos.");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected photo response.");
        setPhotos(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadPhotos();
    return () => controller.abort();
  }, []);

  return (
    <section className="gallery-page page-container">
      <div className="gallery-intro">
        <span className="eyebrow">THE MEMORY COLLECTION</span>
        <h1>Moments worth keeping</h1>
        <p>A little place for the memories we love to revisit.</p>
      </div>

      <div className="gallery-toolbar">
        <p>{loading ? "Loading memories..." : `${photos.length} ${photos.length === 1 ? "memory" : "memories"}`}</p>
        <div className="view-switch" role="group" aria-label="Gallery display style">
          <button type="button" className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-pressed={view === "grid"}>Grid</button>
          <button type="button" className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-pressed={view === "list"}>List</button>
        </div>
      </div>

      {loading && <p className="feedback-message" role="status">Gathering your memories...</p>}
      {!loading && error && <p className="feedback-message error-message" role="alert">{error}</p>}
      {!loading && !error && photos.length === 0 && (
        <div className="empty-gallery"><h2>No photos yet</h2><p>Your first memory will appear here after you upload it.</p></div>
      )}
      {!loading && !error && photos.length > 0 && (
        <div className={`photo-collection ${view === "list" ? "list-view" : "grid-view"}`}>
          {photos.map((photo) => <PhotoCard key={photo._id} photo={photo} />)}
        </div>
      )}
    </section>
  );
}

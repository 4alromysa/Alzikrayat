// Reusable component for a single photo in the gallery.
export default function PhotoCard({ photo }) {
  // The backend exposes uploaded files through the /uploads route.
  const imageUrl = `/uploads/${encodeURIComponent(photo.fileName || "")}`;
  const author = [photo.userId?.firstName, photo.userId?.lastName]
    .filter(Boolean)
    .join(" ") || "Alzikrayat member";
  const uploadDate = photo.dateTime
    ? new Date(photo.dateTime).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

  return (
    <article className="photo-card">
      <div className="photo-image-wrap">
        <img src={imageUrl} alt={photo.title || "Shared memory"} loading="lazy" />
      </div>
      <div className="photo-card-body">
        <h2>{photo.title}</h2>
        {photo.description && <p className="photo-description">{photo.description}</p>}
        <div className="photo-meta">
          <span>{author}</span>
          {uploadDate && <time dateTime={photo.dateTime}>{uploadDate}</time>}
        </div>
      </div>
    </article>
  );
}

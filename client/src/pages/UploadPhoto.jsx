import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Upload a photo using the existing session-protected Express endpoint.
export default function UploadPhoto() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Accept only the image formats supported by the server.
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setError("");
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImage(null);
      event.target.value = "";
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    setImage(file);
  };

  // Send a multipart request without setting Content-Type manually.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!title.trim() || !image) {
      setError("A title and an image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    setSubmitting(true);
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Photo upload failed.");

      // Open the new photo after the database record is created.
      if (data.photo?._id) {
        navigate(`/photos/${data.photo._id}`);
      } else {
        navigate("/gallery");
      }
    } catch (uploadError) {
      setError(uploadError.message || "Could not upload the image.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container upload-page">
      <div className="section-heading">
        <span className="eyebrow">ADD A MEMORY</span>
        <h1>Upload a photo</h1>
        <p>Share a moment you want to remember.</p>
      </div>
      <form className="auth-form upload-form" onSubmit={handleSubmit}>
        <label>Photo *
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} required />
        </label>
        <p className="field-hint">Supported formats: JPG, PNG, WebP.</p>
        <label>Title *
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
        </label>
        <label>Description (optional)
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? "Uploading..." : "Upload photo"}
        </button>
        <Link to="/gallery" className="subtle-link">Back to gallery</Link>
      </form>
    </section>
  );
}

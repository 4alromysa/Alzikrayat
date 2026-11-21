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
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

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

  // Load comments for the selected photo without reloading the page.
  useEffect(() => {
    const controller = new AbortController();
    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentError("");
      setComments([]);

      try {
        const response = await fetch(`/api/photos/${encodeURIComponent(id)}/comments`, {
          signal: controller.signal,
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load comments.");
        if (!controller.signal.aborted) setComments(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError" && !controller.signal.aborted) {
          setCommentError(fetchError.message || "Could not load comments.");
        }
      } finally {
        if (!controller.signal.aborted) setCommentsLoading(false);
      }
    };

    loadComments();
    return () => controller.abort();
  }, [id]);

  // Submit a text comment and immediately add the response to the list.
  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!currentUser || !text || submittingComment) return;

    setSubmittingComment(true);
    setCommentError("");
    try {
      const response = await fetch(`/api/photos/${encodeURIComponent(id)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add comment.");

      // Update React state, not the whole page.
      setComments((previous) => [...previous, data.comment]);
      setCommentText("");
    } catch (submitError) {
      setCommentError(submitError.message || "Could not add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete one of the current user's comments without reloading the page.
  const handleDeleteComment = async (commentId) => {
    if (!currentUser?.id || deletingCommentId) return;
    if (!window.confirm("Delete this comment?")) return;

    setDeletingCommentId(commentId);
    setCommentError("");
    try {
      const response = await fetch(
        `/api/photos/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete comment.");

      // Remove only the deleted comment from the displayed list.
      setComments((previous) => previous.filter((item) => item._id !== commentId));
    } catch (deleteError) {
      setCommentError(deleteError.message || "Could not delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

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
      {!loading && photo && (
        <section className="comments-section" aria-labelledby="comments-title">
          <h2 id="comments-title">Comments</h2>
          {commentsLoading && <p role="status">Loading comments...</p>}
          {commentError && <p className="form-error" role="alert">{commentError}</p>}
          {!commentsLoading && comments.length === 0 && <p>No comments yet.</p>}
          {!commentsLoading && comments.length > 0 && (
            <ul className="comment-list">
              {comments.map((item) => {
                const authorName = [item.userId?.firstName, item.userId?.lastName]
                  .filter(Boolean).join(" ") || "Alzikrayat member";
                // Only show the delete button to the comment's author.
                const commentUserId = item.userId?._id || item.userId;
                const canDeleteComment = Boolean(
                  currentUser?.id && commentUserId &&
                  String(currentUser.id) === String(commentUserId)
                );
                return (
                  <li className="comment-item" key={item._id}>
                    <div className="comment-heading">
                      <strong>{authorName}</strong>
                      {item.dateTime && (
                        <time dateTime={item.dateTime}>
                          {new Date(item.dateTime).toLocaleString("en-US", {
                            dateStyle: "medium", timeStyle: "short",
                          })}
                        </time>
                      )}
                    </div>
                    <p>{item.comment}</p>
                    {canDeleteComment && (
                      <button
                        type="button"
                        className="delete-comment-button"
                        onClick={() => handleDeleteComment(item._id)}
                        disabled={Boolean(deletingCommentId)}
                      >
                        {deletingCommentId === item._id ? "Deleting..." : "Delete Comment"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {currentUser ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <label htmlFor="photo-comment">Add a comment</label>
              <textarea
                id="photo-comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                required
                rows={3}
              />
              <button
                className="primary-button"
                type="submit"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <p><Link className="subtle-link" to="/login">Login</Link> to add a comment.</p>
          )}
        </section>
      )}
    </section>
  );
}

import { useState, useEffect } from "react";
import { Star, X, CheckCircle2, AlertCircle } from "lucide-react";

function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", gap: "6px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px", transition: "transform 0.1s",
              transform: hovered >= star ? "scale(1.15)" : "scale(1)",
            }}
          >
            <Star
              size={26}
              fill={(hovered || value) >= star ? "#f4c542" : "none"}
              color={(hovered || value) >= star ? "#f4c542" : "#ccc"}
              strokeWidth={1.5}
            />
          </button>
        ))}
        {value > 0 && (
          <span style={{ fontSize: "13px", color: "#888", alignSelf: "center", marginLeft: "6px" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewModal({ course, onClose, existingReview }) {
  const [courseRating, setCourseRating] = useState(existingReview?.courseRating || 0);
  const [instructorRating, setInstructorRating] = useState(existingReview?.instructorRating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [status, setStatus] = useState(null); // "success" | "error"
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (courseRating === 0 || instructorRating === 0) {
      setStatus("error");
      setMsg("Please provide both a course rating and an instructor rating.");
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://unischedule2-production.up.railway.app/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseCode: course.courseCode,
          courseName: course.courseName,
          instructorName: course.instructor || "",
          courseRating,
          instructorRating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg(existingReview ? "Your review has been updated." : "Thank you! Your review has been submitted.");
        setTimeout(() => onClose(), 1800);
      } else {
        setStatus("error");
        setMsg(data.message || "Failed to submit review.");
      }
    } catch (e) {
      setStatus("error");
      setMsg("Connection error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, backdropFilter: "blur(3px)", padding: "16px",
      }}
    >
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#f8faf8",
        }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#1a1a1a" }}>
              {existingReview ? "Update Your Review" : "Rate This Course"}
            </div>
            <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              {course.courseName} — {course.courseCode}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", borderRadius: "6px", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <StarRating value={courseRating} onChange={setCourseRating} label="Course Quality" />
          <StarRating value={instructorRating} onChange={setInstructorRating}
            label={`Instructor${course.instructor ? ` (${course.instructor})` : ""}`} />

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "8px" }}>
              Comment <span style={{ fontWeight: "400", color: "#aaa" }}>(optional)</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Share your experience with this course..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "8px",
                border: "1px solid #ddd", fontSize: "14px", resize: "vertical",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.2s", lineHeight: "1.5",
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a431e"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
            <div style={{ fontSize: "11px", color: "#bbb", textAlign: "right", marginTop: "4px" }}>
              {comment.length}/500
            </div>
          </div>

          {status && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
              background: status === "success" ? "#f0faf0" : "#fff5f5",
              border: `1px solid ${status === "success" ? "#b2e8b2" : "#ffc0c0"}`,
              color: status === "success" ? "#1a6e1a" : "#c0392b",
              fontSize: "13px",
            }}>
              {status === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {msg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%", padding: "12px", background: submitting ? "#aaa" : "#1a2e1a",
              color: "white", border: "none", borderRadius: "8px",
              fontWeight: "600", fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Star, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import API_BASE_URL from "../../apiConfig";

function StarDisplay({ value }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14}
          fill={value >= s ? "#f4c542" : "none"}
          color={value >= s ? "#f4c542" : "#ddd"}
          strokeWidth={1.5}
        />
      ))}
      <span style={{ fontSize: "12px", color: "#888", marginLeft: "4px" }}>{value}</span>
    </span>
  );
}

export default function Reviews() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/reviews/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "80px", textAlign: "center", color: "#888" }}>Loading reviews...</div>
  );

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Course Reviews</h1>
        <div style={{ color: "#888", fontSize: "13px" }}>Student feedback on courses and instructors</div>
      </div>

      {data.length === 0 ? (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "80px 24px", textAlign: "center" }}>
          <MessageSquare size={36} color="#ddd" style={{ marginBottom: "16px" }} />
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#bbb" }}>No reviews yet</div>
          <div style={{ fontSize: "13px", color: "#ccc", marginTop: "8px" }}>Student reviews will appear here once submitted.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.map((course) => (
            <div key={course.courseCode} style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
              {/* Course row */}
              <div
                onClick={() => setExpanded(expanded === course.courseCode ? null : course.courseCode)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.8fr 0.5fr",
                  alignItems: "center", padding: "16px 20px", cursor: "pointer",
                  transition: "background 0.15s",
                  background: expanded === course.courseCode ? "#f8faf8" : "white",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{course.courseName}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{course.courseCode}
                    {course.instructorName && <span> · {course.instructorName}</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px", fontWeight: "600" }}>COURSE</div>
                  <StarDisplay value={course.avgCourseRating} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px", fontWeight: "600" }}>INSTRUCTOR</div>
                  <StarDisplay value={course.avgInstructorRating} />
                </div>
                <div>
                  <span style={{
                    background: "#e8f5e8", color: "#1a431e", borderRadius: "20px",
                    padding: "4px 12px", fontSize: "12px", fontWeight: "600",
                  }}>
                    {course.totalReviews} review{course.totalReviews !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", color: "#aaa" }}>
                  {expanded === course.courseCode ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded reviews */}
              {expanded === course.courseCode && (
                <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafcfa" }}>
                  {/* Table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr", padding: "10px 20px", borderBottom: "1px solid #f0f0f0" }}>
                    {["Student", "Course Rating", "Instructor Rating", "Comment", "Date"].map((h) => (
                      <div key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase" }}>{h}</div>
                    ))}
                  </div>
                  {course.reviews.map((r, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr",
                      alignItems: "center", padding: "12px 20px",
                      borderBottom: i < course.reviews.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}>
                      <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>{r.studentName}</div>
                      <div><StarDisplay value={r.courseRating} /></div>
                      <div><StarDisplay value={r.instructorRating} /></div>
                      <div style={{ fontSize: "13px", color: "#666", fontStyle: r.comment ? "normal" : "italic" }}>
                        {r.comment || <span style={{ color: "#ccc" }}>No comment</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "#aaa" }}>
                        {new Date(r.date).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

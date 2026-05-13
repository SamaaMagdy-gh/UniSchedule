import React, { useState, useEffect } from 'react';
import { Send, Clock, Check, X, BookOpen } from 'lucide-react';
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course: "", type: "Add", message: "" });
  const [loading, setLoading] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchCourses();
    fetchStatus();
    if (user.id || user._id) {
      fetchMyRequests();
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/requests/status");
      const data = await res.json();
      setIsRequestsOpen(data.isRequestsOpen);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/student/${user.id || user._id}`);
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course) return toast("Please select a course.", "warning");
    
    setLoading(true);
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: user.id || user._id,
          ...form
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast("Request submitted successfully!", "success");
        setForm({ course: "", type: "Add", message: "" });
        fetchMyRequests();
      } else {
        toast(data.message || "Failed to submit request.", "error");
      }
    } catch (e) {
      toast("Error submitting request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => ({
    Pending: { backgroundColor: "#fff8e1", color: "#b8860b", border: "1px solid #fde68a" },
    Approved: { backgroundColor: "#f0f7f0", color: "#2d6a2d", border: "1px solid #bbf7d0" },
    Rejected: { backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fecaca" },
  }[status] || {});

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} color="#1a2e1a" /> Submit Add/Drop Request
        </h2>
        {isRequestsOpen ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Course</label>
                <select 
                  value={form.course} 
                  onChange={e => setForm({...form, course: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontSize: "14px" }}
                >
                  <option value="">Select a Course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Request Type</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontSize: "14px" }}
                >
                  <option value="Add">Add Course</option>
                  <option value="Drop">Drop Course</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Message / Reason (Optional)</label>
              <textarea 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder="Why do you need this change?"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "80px", resize: "vertical", fontFamily: "inherit", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", padding: "12px", background: "#1a2e1a", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
            >
              {loading ? "Submitting..." : <><Send size={16} /> Submit Request</>}
            </button>
          </form>
        ) : (
          <div style={{ padding: "20px", background: "#fff5f5", color: "#c53030", borderRadius: "8px", border: "1px solid #fed7d7", fontSize: "14px", textAlign: "center", fontWeight: "600" }}>
            The Add/Drop requests window is currently closed. Please wait for the administration to open it.
          </div>
        )}
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#444" }}>My Requests</h3>
      
      {requests.length === 0 ? (
        <div style={{ background: "white", padding: "40px", textAlign: "center", borderRadius: "12px", border: "1px solid #eee", color: "#888", fontSize: "14px" }}>
          You have no requests yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {requests.map(req => (
            <div key={req._id} style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #eee", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "600", color: "#1a3f7a" }}>{req.course?.name} ({req.course?.code})</h4>
                  <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "600", color: req.type === 'Add' ? "#0369a1" : "#b91c1c" }}>{req.type}</span> • 
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ ...statusStyle(req.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  {req.status === 'Pending' && <Clock size={12} />}
                  {req.status === 'Approved' && <Check size={12} />}
                  {req.status === 'Rejected' && <X size={12} />}
                  {req.status}
                </span>
              </div>
              
              {req.message && (
                <div style={{ fontSize: "13px", color: "#555", background: "#f9f9f9", padding: "10px", borderRadius: "6px", marginBottom: "12px" }}>
                  <strong>Your message:</strong> {req.message}
                </div>
              )}
              
              {req.adminReply && (
                <div style={{ fontSize: "13px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "6px" }}>
                  <strong>Admin Reply:</strong> {req.adminReply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

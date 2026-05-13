import { useState, useEffect } from "react";
import { Check, X, FileText, Loader2, MessageSquare } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [actionStatus, setActionStatus] = useState(null); // 'Approved' | 'Rejected'
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStatus();
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

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("https://unischedule2-production.up.railway.app/api/requests/toggle-status", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setIsRequestsOpen(data.isRequestsOpen);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/requests");
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = async (req, status) => {
    setSelectedRequest(req);
    setActionStatus(status);
    setAdminReply("");
    setAvailableSections([]);
    setSelectedSections([]);

    if (req.type === 'Add' && status === 'Approved') {
      try {
        const res = await fetch(`https://unischedule2-production.up.railway.app/api/courses/${req.course._id}`);
        const courseData = await res.json();
        setAvailableSections(courseData.sections || []);
      } catch (e) {
        console.error("Failed to fetch course sections", e);
      }
    }
    setShowReplyModal(true);
  };

  const handleSectionToggle = (secId) => {
    setSelectedSections(prev => 
      prev.includes(secId) ? prev.filter(id => id !== secId) : [...prev, secId]
    );
  };

  const handleAction = async () => {
    if (selectedRequest.type === 'Add' && actionStatus === 'Approved' && selectedSections.length === 0) {
      toast("You must select at least one section/lecture to add.", "warning");
      return;
    }
    try {
      const res = await fetch(`https://unischedule2-production.up.railway.app/api/requests/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionStatus, adminReply, selectedSections })
      });
      if (res.ok) {
        setShowReplyModal(false);
        fetchRequests();
      } else {
        const err = await res.json();
        toast(`Error: ${err.message}`, "error");
      }
    } catch (e) {
      console.error(e);
      toast("Failed to update request.", "error");
    }
  };

  const statusStyle = (status) => ({
    Pending: { backgroundColor: "#fff8e1", color: "#b8860b", border: "1px solid #fde68a" },
    Approved: { backgroundColor: "#f0f7f0", color: "#2d6a2d", border: "1px solid #bbf7d0" },
    Rejected: { backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fecaca" },
  }[status] || {});

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a2e1a", margin: "0 0 8px" }}>Course Requests</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Manage student add/drop requests.</p>
        </div>
        <button 
          onClick={toggleStatus}
          style={{ 
            display: "flex", alignItems: "center", gap: "8px", 
            padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", 
            cursor: "pointer", border: "none", transition: "all 0.2s",
            background: isRequestsOpen ? "#fee2e2" : "#e0f2fe", 
            color: isRequestsOpen ? "#991b1b" : "#0369a1" 
          }}>
          {isRequestsOpen ? <X size={18} /> : <Check size={18} />}
          {isRequestsOpen ? "Close Requests Window" : "Open Requests Window"}
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
        <div className="responsive-table-wrapper">
          <div className="responsive-table" style={{ minWidth: "900px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
              {["STUDENT", "COURSE", "TYPE", "STATUS", "ACTIONS"].map(h => (
                <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.5px" }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#aaa" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                No requests found.
              </div>
            ) : (
              requests.map(req => (
                <div key={req._id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{req.student?.name || "Unknown"}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{req.student?.studentId || "-"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a3f7a" }}>{req.course?.name || "Unknown"}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{req.course?.code || "-"}</div>
                  </div>
                  <div>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", background: req.type === 'Add' ? "#e0f2fe" : "#fee2e2", color: req.type === 'Add' ? "#0369a1" : "#b91c1c" }}>
                      {req.type}
                    </span>
                  </div>
                  <div>
                    <span style={{ ...statusStyle(req.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {req.status === 'Pending' ? (
                      <>
                        <button onClick={() => openReplyModal(req, 'Approved')} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => openReplyModal(req, 'Rejected')} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
                          <X size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic" }}>Processed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showReplyModal && selectedRequest && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>{actionStatus} Request</h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              You are about to {actionStatus.toLowerCase()} the {selectedRequest.type.toLowerCase()} request for <strong>{selectedRequest.course?.name}</strong> by <strong>{selectedRequest.student?.name}</strong>.
            </p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#444" }}>Admin Reply (Optional)</label>
              <textarea 
                value={adminReply} 
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Add a comment or reason..."
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "80px", resize: "vertical", fontFamily: "inherit", fontSize: "13px" }}
              />
            </div>

            {selectedRequest.type === 'Add' && actionStatus === 'Approved' && (
              <div style={{ marginBottom: "24px", padding: "16px", background: "#f8faf8", borderRadius: "8px", border: "1px solid #e8f5e8" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "12px", color: "#1a431e" }}>Select Slots to Assign</label>
                {availableSections.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}>No sections available for this course.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                    {availableSections.map(sec => {
                      const isFull = sec.currentEnrollment >= sec.maxCapacity;
                      return (
                        <label key={sec._id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: isFull ? "not-allowed" : "pointer", opacity: isFull ? 0.6 : 1, padding: "8px", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
                          <input 
                            type="checkbox" 
                            checked={selectedSections.includes(sec._id)} 
                            onChange={() => handleSectionToggle(sec._id)} 
                            disabled={isFull}
                            style={{ accentColor: "#1a431e" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "600", color: "#333" }}>{sec.sectionName} <span style={{ fontSize: "11px", color: "#888", fontWeight: "400" }}>({sec.type})</span></div>
                            <div style={{ color: "#666", fontSize: "12px" }}>{sec.day} • {sec.startTime} - {sec.endTime}</div>
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: isFull ? "red" : "#2d6a2d" }}>
                            {sec.currentEnrollment}/{sec.maxCapacity} {isFull && "Full"}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowReplyModal(false)} style={{ flex: 1, padding: "10px", background: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#555" }}>
                Cancel
              </button>
              <button onClick={handleAction} style={{ flex: 1, padding: "10px", background: actionStatus === 'Approved' ? "#2d6a2d" : "#e53e3e", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                Confirm {actionStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

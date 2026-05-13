import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Plus, X, Edit2, Trash2, CalendarDays, Loader2, Eye } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";
const departments = ["Computer Science", "Mathematics", "Physics", "Biology"];
const statuses = ["Active", "Inactive", "Pending"];
const academicYears = ["Year 1", "Year 2", "Year 3", "Year 4"];
const statusStyle = (status) => ({
  Active: { backgroundColor: "#f0f7f0", color: "#2d6a2d" },
  Inactive: { backgroundColor: "#f5f5f5", color: "#888" },
  Pending: { backgroundColor: "#fff8e1", color: "#b8860b" },
}[status] || {});
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "";
export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", studentId: "", department: "Computer Science", academicYear: "Year 1", major: "CS", status: "Active" });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [studentScheduleData, setStudentScheduleData] = useState([]);
  const [fetchingSchedule, setFetchingSchedule] = useState(false);
  useEffect(() => {
    fetch("https://unischedule2-production.up.railway.app/api/students")
      .then(async res => {
          if(!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
              throw new Error("Received non-JSON response from server");
          }
          return res.json();
      })
      .then(data => setStudents(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);
  const filtered = students.filter(s =>
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );
  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: "", email: "", studentId: "", department: "Computer Science", academicYear: "Year 1", major: "CS", status: "Active" });
    setShowModal(true);
  };
  const openEdit = (student) => {
    setEditStudent(student);
    setForm({ name: student.name, email: student.email, studentId: student.studentId, department: student.department, academicYear: student.academicYear || "Year 1", major: student.major || "CS", status: student.status });
    setShowModal(true);
    setOpenMenu(null);
  };
  const handleSave = async () => {
    if (!form.name || !form.email || !form.studentId) {
        toast("Please fill all required fields.", "warning");
        return;
    }
    try {
      const url = editStudent 
        ? `https://unischedule2-production.up.railway.app/api/students/${editStudent._id}` 
        : "https://unischedule2-production.up.railway.app/api/students";
      const res = await fetch(url, {
        method: editStudent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
          if (contentType && contentType.includes("application/json")) {
              const errorData = await res.json();
              toast("Validation Error: " + (errorData.message || "Failed to save"), "error");
          } else {
              const text = await res.text();
              throw new Error("Server Error: " + text.substring(0, 100));
          }
          return;
      }
      if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
      }
      const savedData = await res.json();
      if (editStudent) {
        setStudents(students.map(s => s._id === editStudent._id ? savedData : s));
      } else {
        setStudents([savedData, ...students]);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast("System Connection Error: " + error.message, "error");
    }
  };
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`https://unischedule2-production.up.railway.app/api/students/${id}`, { method: "DELETE" });
      if(res.ok) {
          setStudents(students.filter(s => s._id !== id));
      }
      setOpenMenu(null);
    } catch (error) {
      console.error(error);
    }
  };
  const openViewSchedule = async (student) => {
    setOpenMenu(null);
    setSelectedStudentName(student.name);
    setFetchingSchedule(true);
    setShowScheduleModal(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://unischedule2-production.up.railway.app/api/registration/student-schedule/${student._id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setStudentScheduleData(data);
        } else {
            const err = await res.json();
            toast("Error fetching schedule: " + (err.message || "Unknown error"), "error");
        }
    } catch (e) {
        console.error(e);
        toast("Failed to connect to server.", "error");
    }
    setFetchingSchedule(false);
  };
  const handleClearRegistration = async (studentId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this student's schedule? This will free the seats for others.")) return;
    setFetchingSchedule(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`https://unischedule2-production.up.railway.app/api/registration/clear-student-schedule/${studentId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setStudentScheduleData([]);
            toast("Registration cleared successfully.", "success");
        } else {
            const errorData = await res.json();
            toast("Failed to clear registration: " + (errorData.message || "Unknown error"), "error");
        }
    } catch (e) {
        console.error(e);
    }
    setFetchingSchedule(false);
  };
  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Students</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Student Management</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Manage student records and information</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ background: "#f0f7f0", color: "#2d6a2d", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>System Online</span>
          <button onClick={openAdd} style={{
            display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#1a2e1a",
            color: "white", border: "none", borderRadius: "8px", padding: "10px 18px",
            fontSize: "14px", fontWeight: "600", cursor: "pointer"
          }}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{
                width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px",
                border: "1px solid #e0e0e0", fontSize: "14px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        </div>
        <div className="responsive-table-wrapper">
          <div className="responsive-table">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr 0.5fr", padding: "10px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          {["USER", "STUDENT ID", "DEPARTMENT", "LEVEL", "STATUS", "ACTIONS"].map(h => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", letterSpacing: "0.5px" }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
            No students found.
          </div>
        ) : filtered.map(student => (
          <div key={student._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr 0.5fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e8f5e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", color: "#2d6a2d", flexShrink: 0 }}>
                {initials(student.name)}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>{student.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{student.email}</div>
              </div>
            </div>
            <span style={{ fontSize: "14px", color: "#555" }}>{student.studentId}</span>
            <span style={{ fontSize: "14px", color: "#555" }}>{student.department}</span>
            <div style={{ display: "flex" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2d6a2d", background: "#e8f5e8", padding: "4px 10px", borderRadius: "20px", border: "1px solid #d0e6d0" }}>
                {student.academicYear || "Year 1"}
              </span>
            </div>
            <span style={{ ...statusStyle(student.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", textAlign: "center" }}>{student.status}</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpenMenu(openMenu === student._id ? null : student._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <MoreHorizontal size={18} color="#888" />
              </button>
              {openMenu === student._id && (
                <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px" }}>
                  <div onClick={() => { setSelectedDetailsItem(student); setShowDetailsModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#1a431e", borderBottom: "1px solid #f5f5f5" }}>
                    <Eye size={14} /> View Details
                  </div>
                  <div onClick={() => openViewSchedule(student)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#2d6a2d", borderBottom: "1px solid #f5f5f5" }}>
                    <CalendarDays size={14} /> View Timetable
                  </div>
                  <div onClick={() => openEdit(student)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#333" }}>
                    <Edit2 size={14} /> Edit
                  </div>
                  <div onClick={() => handleDelete(student._id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#e53e3e" }}>
                    <Trash2 size={14} /> Delete
                  </div>
                </div>
              )}
            </div>
            </div>
          ))}
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>Showing {filtered.length} of {students.length} students</span>
        </div>
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{editStudent ? "Edit Student" : "Add New Student"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "e.g. John Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "e.g. john@university.edu" },
              { label: "Student ID", key: "studentId", type: "text", placeholder: "e.g. 2227349" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            {[
              { label: "Department", key: "department", options: departments },
              { label: "Academic Year", key: "academicYear", options: academicYears },
              { label: "Status", key: "status", options: statuses },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", backgroundColor: "white" }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Major</label>
              <input
                type="text" placeholder="e.g. CS" value={form.major}
                onChange={e => setForm({ ...form, major: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                {editStudent ? "Save Changes" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showScheduleModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "680px", maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{selectedStudentName}'s Schedule</h2>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Currently registered sections and timings</div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}><X size={24} /></button>
            </div>
            {fetchingSchedule ? (
              <div style={{ padding: "60px", textAlign: "center" }}><Loader2 className="lucide-spin" size={32} color="#1a431e" /></div>
            ) : studentScheduleData.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", background: "#fcfcfc", borderRadius: "12px", border: "1px dashed #ddd" }}>
                <CalendarDays size={48} color="#eee" style={{ marginBottom: "16px" }} />
                <p style={{ color: "#888", margin: 0 }}>This student has not registered for any schedule yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {studentScheduleData.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px 100px", gap: "16px", padding: "16px", background: item.type === "Section" ? "#e8f0ff" : "#f0f7f0", borderRadius: "10px", border: `1px solid ${item.type === "Section" ? "#c4d8ff" : "#c8e6c9"}` }}>
                    <div>
                        <div style={{ fontWeight: "700", fontSize: "14px" }}>{item.courseCode}: {item.courseName}</div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{item.sectionName} ({item.type})</div>
                    </div>
                    <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: "600" }}>{item.day}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#444" }}>{item.startTime} - {item.endTime}</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", textAlign: "right" }}>Room {item.room}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {studentScheduleData.length > 0 && (
                    <button 
                        onClick={() => {
                            const student = students.find(s => s.name === selectedStudentName);
                            if(student) handleClearRegistration(student._id);
                        }} 
                        style={{ color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        <Trash2 size={16} /> Delete This Registration
                    </button>
                )}
                <div style={{ marginLeft: "auto" }}>
                    <button onClick={() => setShowScheduleModal(false)} style={{ padding: "10px 24px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "600" }}>Close Preview</button>
                </div>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedDetailsItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Student Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Name</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Email</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Student ID</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.studentId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Department</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Major</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.major || "General"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Academic Year</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.academicYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Status</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.status}</span>
              </div>
            </div>
            <button onClick={() => setShowDetailsModal(false)} style={{ width: "100%", padding: "12px", background: "#f0f7f0", color: "#1a431e", border: "1px solid #c8e6c9", borderRadius: "8px", fontWeight: "600", marginTop: "20px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

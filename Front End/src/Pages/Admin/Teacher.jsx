import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Plus, X, Edit2, Trash2, GraduationCap, Eye } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";
const departments = ["Computer Science", "Mathematics", "Physics", "Biology"];
const statuses = ["Active", "Inactive", "Pending"];
const statusStyle = (status) => ({
  Active: { backgroundColor: "#f0f7f0", color: "#2d6a2d" },
  Inactive: { backgroundColor: "#f5f5f5", color: "#888" },
  Pending: { backgroundColor: "#fff8e1", color: "#b8860b" },
}[status] || {});
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "";
export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", teacherId: "", department: "Computer Science", status: "Active" });
  useEffect(() => {
    fetch("https://unischedule2-production.up.railway.app/api/teachers")
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error(err));
  }, []);
  const filtered = teachers.filter(t => 
    (t.name?.toLowerCase().includes(search.toLowerCase())) || 
    (t.email?.toLowerCase().includes(search.toLowerCase()))
  );
  const handleSave = async () => {
    const url = editTeacher ? `https://unischedule2-production.up.railway.app/api/teachers/${editTeacher._id}` : "https://unischedule2-production.up.railway.app/api/teachers";
    const res = await fetch(url, {
      method: editTeacher ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      if (editTeacher) setTeachers(teachers.map(t => t._id === editTeacher._id ? data : t));
      else setTeachers([data, ...teachers]);
      setShowModal(false);
      setEditTeacher(null);
      setForm({ name: "", email: "", teacherId: "", department: "Computer Science", status: "Active" });
    } else {
      toast(data.message, "error");
    }
  };
  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Teachers</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Teachers Management</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Manage instructor records and schedules</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ background: "#f0f7f0", color: "#2d6a2d", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>System Online</span>
          <button onClick={() => { setEditTeacher(null); setShowModal(true); }} style={{ backgroundColor: "#1a2e1a", color: "white", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px", border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.8fr 0.5fr", padding: "10px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          {["USER", "TEACHER ID", "DEPARTMENT", "STATUS", "ACTIONS"].map(h => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa" }}>{h}</span>
          ))}
        </div>
        {filtered.map(t => (
          <div key={t._id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.8fr 0.5fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e8f5e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#2d6a2d" }}>{initials(t.name)}</div>
              <div><div style={{ fontWeight: "600", fontSize: "14px" }}>{t.name}</div><div style={{ fontSize: "12px", color: "#888" }}>{t.email}</div></div>
            </div>
            <span style={{ fontSize: "14px" }}>{t.teacherId}</span>
            <span style={{ fontSize: "14px" }}>{t.department}</span>
            <span style={{ ...statusStyle(t.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", width: "fit-content" }}>{t.status}</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpenMenu(openMenu === t._id ? null : t._id)} style={{ background: "none", border: "none", cursor: "pointer" }}><MoreHorizontal size={18} color="#888" /></button>
              {openMenu === t._id && (
                <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px" }}>
                  <div onClick={() => { setSelectedDetailsItem(t); setShowDetailsModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#1a431e", borderBottom: "1px solid #f5f5f5" }}><Eye size={14} /> View Details</div>
                  <div onClick={() => { setEditTeacher(t); setForm(t); setShowModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px" }}><Edit2 size={14} /> Edit</div>
                  <div onClick={async () => { await fetch(`https://unischedule2-production.up.railway.app/api/teachers/${t._id}`, { method: "DELETE" }); setTeachers(teachers.filter(item => item._id !== t._id)); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "red" }}><Trash2 size={14} /> Delete</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{editTeacher ? "Edit Teacher" : "Add New Teacher"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. Dr. Ahmed" },
              { label: "Email", key: "email", placeholder: "e.g. ahmed@uni.edu" },
              { label: "Teacher ID", key: "teacherId", placeholder: "e.g. 112233" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{f.label}</label>
                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
              </div>
            ))}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", fontWeight: "600" }}>{editTeacher ? "Save Changes" : "Add Teacher"}</button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedDetailsItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Teacher Details</h2>
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
                <span style={{ color: "#888", fontSize: "13px" }}>Teacher ID</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.teacherId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Department</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.department}</span>
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

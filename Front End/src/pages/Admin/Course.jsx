import { useState, useEffect } from "react";
import { Search, Plus, X, Edit2, Trash2, BookOpen, MoreHorizontal, Eye } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

const departments = ["Computer Science", "Mathematics", "Physics", "Biology"];
const statuses = ["Active", "Inactive", "Pending"];
const academicYears = ["Year 1", "Year 2", "Year 3", "Year 4"];
const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const sectionTypes = ["Lecture", "Section"];

const statusStyle = (status) => ({
  Active: { backgroundColor: "#f0f7f0", color: "#2d6a2d" },
  Inactive: { backgroundColor: "#f5f5f5", color: "#888" },
  Pending: { backgroundColor: "#fff8e1", color: "#b8860b" },
}[status] || {});

const sectionTypeColors = {
  Lecture: { bg: "#fcfdcf", border: "#f0f0e0", badge: "#c6a61f", badgeBg: "#fff8e1" },
  Section: { bg: "#e8f0ff", border: "#c4d8ff", badge: "#3366cc", badgeBg: "#e0ecff" },
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [form, setForm] = useState({ 
    name: "", code: "", department: "Computer Science", academicYear: "Year 1", major: "CS", status: "Active", creditHours: 3
  });

  useEffect(() => {
    fetch("https://unischedule2-production.up.railway.app/api/courses").then(res => res.json()).then(data => setCourses(data));
  }, []);

  const filtered = courses.filter(c => 
    (c.name?.toLowerCase().includes(search.toLowerCase())) || 
    (c.code?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast("Please fill name and code!", "warning");
      return;
    }

    const payload = { ...form };

    if (!editCourse) payload.sections = [];

    const url = editCourse ? `https://unischedule2-production.up.railway.app/api/courses/${editCourse._id}` : "https://unischedule2-production.up.railway.app/api/courses";
    const res = await fetch(url, {
      method: editCourse ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      if (editCourse) setCourses(courses.map(c => c._id === editCourse._id ? data : c));
      else setCourses([data, ...courses]);
      setShowModal(false);
      setEditCourse(null);
      setForm({ name: "", code: "", department: "Computer Science", academicYear: "Year 1", major: "CS", status: "Active", creditHours: 3 });
    } else {
      toast(data.message, "error");
    }
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({ 
        name: course.name, 
        code: course.code, 
        department: course.department, 
        academicYear: course.academicYear || "Year 1",
        major: course.major || "CS",
        status: course.status,
        creditHours: course.creditHours || 3
    });
    setShowModal(true);
    setOpenMenu(null);
  };

  const lectureCount = (secs) => (secs || []).filter(s => (s.type || 'Lecture') === 'Lecture').length;
  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Course Catalog</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Course Catalog</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Define core course metadata for registration</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ background: "#f0f7f0", color: "#2d6a2d", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>Catalog Access</span>
          <button onClick={() => { setEditCourse(null); setForm({ name: "", code: "", department: "Computer Science", academicYear: "Year 1", major: "CS", status: "Active", creditHours: 3 }); setShowModal(true); }} style={{ backgroundColor: "#1a2e1a", color: "white", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px", border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.2fr 0.6fr 1fr 0.4fr", padding: "12px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
          {["COURSE NAME", "CODE", "LEVEL / MAJOR", "HRS", "STATUS", ""].map((h, i) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textAlign: (i === 3) ? "center" : "left" }}>{h}</span>
          ))}
        </div>

        {filtered.map(c => (
          <div key={c._id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.2fr 0.6fr 1fr 0.4fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", position: "relative", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#e8f5e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BookOpen size={20} color="#2d6a2d" />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{c.department}</div>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>{c.code}</span>
            <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
                <div style={{ fontWeight: "500" }}>{c.academicYear || '-'}</div>
                <div style={{ fontSize: "11px", color: "#999" }}>{c.major || 'General'}</div>
            </div>
            <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "13px", color: "#2d6a2d", fontWeight: "700", background: "#e8f5e8", padding: "2px 8px", borderRadius: "6px" }}>{c.creditHours || 3}</span>
            </div>
            <span style={{ ...statusStyle(c.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", width: "fit-content", textAlign: "center" }}>{c.status}</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpenMenu(openMenu === c._id ? null : c._id)} style={{ background: "none", border: "none", cursor: "pointer" }}><MoreHorizontal size={18} color="#888" /></button>
              {openMenu === c._id && (
                <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px" }}>
                  <div onClick={() => { setSelectedDetailsItem(c); setShowDetailsModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#1a431e", borderBottom: "1px solid #f5f5f5" }}><Eye size={14} /> View Details</div>
                  <div onClick={() => openEdit(c)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px" }}><Edit2 size={14} /> Edit</div>
                  <div onClick={async () => { if(window.confirm("Delete course?")) { await fetch(`https://unischedule2-production.up.railway.app/api/courses/${c._id}`, { method: "DELETE" }); setCourses(courses.filter(item => item._id !== c._id)); } }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "red" }}><Trash2 size={14} /> Delete</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "0", width: "480px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{editCourse ? "Edit Course Catalog Meta" : "Add New Course to Catalog"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "24px 28px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Course Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Course Code</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Department</label>
                        <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>
                            {departments.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Academic Year</label>
                        <select value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>
                            {academicYears.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Credit Hours</label>
                        <input type="number" value={form.creditHours} onChange={e => setForm({ ...form, creditHours: Number(e.target.value) })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
                    </div>
                </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Major</label>
                        <input placeholder="e.g. CS" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
                    </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
            </div>

            <div style={{ padding: "20px 28px", borderTop: "1px solid #eee", display: "flex", gap: "10px", background: "#f9f9f9", borderRadius: "0 0 16px 16px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", fontWeight: "600", cursor: "pointer" }}>{editCourse ? "Save Changes" : "Create Course"}</button>
            </div>
          </div>
        </div>
      )}
      
      {showDetailsModal && selectedDetailsItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Course Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Course Name</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Course Code</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Department</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Academic Year</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.academicYear || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Major</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.major || "General"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Credit Hours</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.creditHours || 3}</span>
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

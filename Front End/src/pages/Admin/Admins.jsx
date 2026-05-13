import { useState, useEffect } from "react";
import { Search, Plus, X, ShieldCheck, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "";
export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isRegOpen, setIsRegOpen] = useState(false);
  useEffect(() => {
    fetch("https://unischedule2-production.up.railway.app/api/auth/admins")
      .then(res => res.json())
      .then(data => setAdmins(data))
      .catch(err => console.error(err));
    fetch("https://unischedule2-production.up.railway.app/api/registration/status")
      .then(res => res.json())
      .then(data => setIsRegOpen(data.isRegistrationOpen))
      .catch(err => console.error(err));
  }, []);
  const filtered = admins.filter(a => 
    (a.name?.toLowerCase().includes(search.toLowerCase())) || 
    (a.email?.toLowerCase().includes(search.toLowerCase()))
  );
  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      toast("Please fill all fields!", "warning");
      return;
    }
    const res = await fetch("https://unischedule2-production.up.railway.app/api/auth/add-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setAdmins([data, ...admins]);
      setShowModal(false);
      setForm({ name: "", email: "", password: "" });
    } else {
      toast(data.message, "error");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin account?")) return;
    const res = await fetch(`${API_BASE_URL}/api/auth/admins/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAdmins(admins.filter(a => a._id !== id));
      setOpenMenu(null);
    }
  };
  const toggleRegistration = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/registration/toggle-status", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsRegOpen(data.isRegistrationOpen);
      } else {
        toast("Action forbidden or server error.", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Admins</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0" }}>Admin Management</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={toggleRegistration} style={{ backgroundColor: isRegOpen ? "#ffebee" : "#e8f5e8", color: isRegOpen ? "#c62828" : "#1a431e", border: `1px solid ${isRegOpen ? "#ef9a9a" : "#c8e6c9"}`, borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
            <ShieldCheck size={16} /> {isRegOpen ? "Close Registration" : "Open Registration"}
          </button>
          <button onClick={() => setShowModal(true)} style={{ backgroundColor: "#1a2e1a", color: "white", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Add Admin
          </button>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px", border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 0.5fr", padding: "10px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          {["ADMIN USER", "ROLE", "ACTIONS"].map(h => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa" }}>{h}</span>
          ))}
        </div>
        {filtered.map(admin => (
          <div key={admin._id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 0.5fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e8f5e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#2d6a2d" }}>{initials(admin.name)}</div>
              <div><div style={{ fontWeight: "600", fontSize: "14px" }}>{admin.name}</div><div style={{ fontSize: "12px", color: "#888" }}>{admin.email}</div></div>
            </div>
            <span style={{ backgroundColor: "#f0f7f0", color: "#2d6a2d", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", width: "fit-content" }}>{admin.role.toUpperCase()}</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpenMenu(openMenu === admin._id ? null : admin._id)} style={{ background: "none", border: "none", cursor: "pointer" }}><MoreHorizontal size={18} color="#888" /></button>
              {openMenu === admin._id && (
                <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px" }}>
                  <div onClick={() => handleDelete(admin._id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "red" }}><Trash2 size={14} /> Delete</div>
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
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Add New Admin</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Full Name</label>
              <input placeholder="e.g. Admin Abdo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Email Address</label>
              <input placeholder="e.g. admin@uni.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #ddd", background: "white" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", fontWeight: "600" }}>Create Admin Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

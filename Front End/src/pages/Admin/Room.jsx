import { useState, useEffect } from "react";
import { Search, Plus, X, Edit2, Trash2, DoorOpen, MoreHorizontal, Eye } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";
const roomTypes = ["Lecture Hall", "Laboratory", "Seminar Room"];
export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [form, setForm] = useState({ name: "", capacity: "", type: "Lecture Hall" });
  useEffect(() => {
    fetch("https://unischedule2-production.up.railway.app/api/rooms")
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);
  const handleSave = async () => {
    if (!form.name || !form.capacity) {
      toast("Please fill in the Room Name and Capacity!", "warning");
      return;
    }
    try {
      const url = editRoom ? `https://unischedule2-production.up.railway.app/api/rooms/${editRoom._id}` : "https://unischedule2-production.up.railway.app/api/rooms";
      const res = await fetch(url, {
        method: editRoom ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (editRoom) {
          setRooms(rooms.map(r => r._id === editRoom._id ? data : r));
        } else {
          setRooms([data, ...rooms]);
        }
        setShowModal(false);
        setEditRoom(null);
        setForm({ name: "", capacity: "", type: "Lecture Hall" });
      } else {
        toast("Server Error: " + data.message, "error");
      }
    } catch (error) {
      toast("Connection Error: Make sure your Backend is running.", "error");
    }
  };
  const filtered = rooms.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Rooms</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0" }}>Room Management</h1>
        </div>
        <button onClick={() => { setEditRoom(null); setForm({ name: "", capacity: "", type: "Lecture Hall" }); setShowModal(true); }} style={{ backgroundColor: "#1a2e1a", color: "white", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Add Room
        </button>
      </div>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px", border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.5fr", padding: "10px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          {["ROOM NAME", "CAPACITY", "TYPE", "ACTIONS"].map(h => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa" }}>{h}</span>
          ))}
        </div>
        {filtered.map(r => (
          <div key={r._id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.5fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#e8f5e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DoorOpen size={20} color="#2d6a2d" />
              </div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{r.name}</div>
            </div>
            <span style={{ fontSize: "14px" }}>{r.capacity} Seats</span>
            <span style={{ fontSize: "14px" }}>{r.type}</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpenMenu(openMenu === r._id ? null : r._id)} style={{ background: "none", border: "none", cursor: "pointer" }}><MoreHorizontal size={18} color="#888" /></button>
              {openMenu === r._id && (
                <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px" }}>
                  <div onClick={() => { setSelectedDetailsItem(r); setShowDetailsModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#1a431e", borderBottom: "1px solid #f5f5f5" }}><Eye size={14} /> View Details</div>
                  <div onClick={() => { setEditRoom(r); setForm({ name: r.name, capacity: r.capacity, type: r.type }); setShowModal(true); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px" }}><Edit2 size={14} /> Edit</div>
                  <div onClick={async () => { if(window.confirm("Delete room?")) { await fetch(`https://unischedule2-production.up.railway.app/api/rooms/${r._id}`, { method: "DELETE" }); setRooms(rooms.filter(item => item._id !== r._id)); } }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "red" }}><Trash2 size={14} /> Delete</div>
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
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{editRoom ? "Edit Room" : "Add New Room"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Room Name / No</label>
              <input placeholder="e.g. Hall 101" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Capacity</label>
              <input type="number" placeholder="e.g. 100" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Room Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontSize: "14px" }}>
                {roomTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", fontWeight: "600", cursor: "pointer" }}>{editRoom ? "Save Changes" : "Add Room"}</button>
            </div>
          </div>
        </div>
      )}
      
      {showDetailsModal && selectedDetailsItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Room Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Room Name</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Capacity</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.capacity} Seats</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>Room Type</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{selectedDetailsItem.type}</span>
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

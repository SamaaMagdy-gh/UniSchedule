import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, BookOpen, LogOut, ShieldCheck, DoorOpen, Sparkles, Settings, Clock, MessageSquare, Star, User } from "lucide-react";
import SettingsModal from "./SettingsModal";
export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin User");
  const [avatar, setAvatar] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.name) setAdminName(user.name);
      if (user.profileImage) setAvatar(user.profileImage);
      else if (user.avatar) setAvatar(user.avatar);
    }
  }, [showSettings]); // Reload when settings modal closes
  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };
  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/profile", name: "My Profile", icon: User },
    { path: "/admin/students", name: "Students", icon: Users },
    { path: "/admin/teachers", name: "Teachers", icon: GraduationCap },
    { path: "/admin/admins", name: "Admins", icon: ShieldCheck },
    { path: "/admin/courses", name: "Course Catalog", icon: BookOpen },
    { path: "/admin/sections", name: "Section Scheduling", icon: Clock },
    { path: "/admin/rooms", name: "Rooms", icon: DoorOpen },
    { path: "/admin/requests", name: "Requests", icon: MessageSquare },
    { path: "/admin/reviews", name: "Reviews", icon: Star },
    { path: "/admin/GenerateTimetable", name: "Generate Timetable", icon: Sparkles }
  ];
  return (
    <aside className={className} style={{ width: "240px", backgroundColor: "#1a2e1a", color: "white", height: "100vh", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ padding: "0 20px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
        <GraduationCap size={28} />
        <span style={{ fontWeight: "700", fontSize: "18px" }}>UniSchedule</span>
      </div>
      <nav style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", margin: "2px 12px", borderRadius: "10px",
              textDecoration: "none", fontSize: "14px", fontWeight: location.pathname === item.path ? "600" : "400",
              color: location.pathname === item.path ? "white" : "#9abeaa",
              backgroundColor: location.pathname === item.path ? "#1a431e" : "transparent",
              transition: "all 0.15s"
            }}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div style={{ padding: "0 12px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px 14px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", overflow: "hidden", border: "2px solid #3d8a3d" }}>
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{adminName}</div>
              <div style={{ fontSize: "11px", color: "#9abeaa" }}>Administrator</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,136,136,0.2)", borderRadius: "10px", color: "#ff8a8a", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
            <LogOut size={16} /> Sign Out
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#9abeaa", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </aside>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, User, BookOpen, LogOut } from "lucide-react";
const TeacherSidebar = ({ teacherName = "Teacher", activePage, setActivePage }) => {
  const navigate = useNavigate();
  const navItems = [
    { key: "schedule", label: "My Schedule", icon: <CalendarDays size={18} /> },
    { key: "profile",  label: "Profile",     icon: <User size={18} />,      disabled: true },
    { key: "courses",  label: "Courses",     icon: <BookOpen size={18} />,  disabled: true },
  ];
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      background: "#1a2e1a",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      {}
      <div style={{ padding: "0 20px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CalendarDays size={18} color="white" />
        </div>
        <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>Teacher Portal</span>
      </div>
      {}
      <nav style={{ flex: 1 }}>
        {navItems.map(item => {
          const isActive = activePage === item.key;
          return (
            <div
              key={item.key}
              onClick={() => setActivePage && setActivePage(item.key)}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#1a431e"; e.currentTarget.style.color = "white"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9abeaa"; }}}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 20px", margin: "2px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "white" : "#9abeaa",
                background: isActive ? "#1a431e" : "transparent",
                transition: "all 0.15s",
                userSelect: "none",
              }}
            >
              {item.icon}
              {item.label}
            </div>
          );
        })}
      </nav>
      {}
      <div style={{ padding: "0 12px" }}>
        <div style={{ borderTop: "1px solid #2a3e2a", paddingTop: "16px", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px 14px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "#2d6a2d", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "14px", fontWeight: "700",
              color: "white", flexShrink: 0,
            }}>
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: "white", fontSize: "13px", fontWeight: "600", lineHeight: 1.3 }}>Dr. {teacherName}</div>
              <div style={{ color: "#9abeaa", fontSize: "11px" }}>Instructor</div>
            </div>
          </div>
        </div>
        <div
          onClick={handleLogout}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.10)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "11px 8px", borderRadius: "10px",
            cursor: "pointer", fontSize: "14px", fontWeight: "500",
            color: "#ff8a8a", transition: "background 0.15s",
          }}
        >
          <LogOut size={18} />
          Sign Out
        </div>
      </div>
    </aside>
  );
};
export default TeacherSidebar;
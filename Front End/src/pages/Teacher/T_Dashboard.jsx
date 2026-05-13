import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Settings, CalendarDays, BookOpen, Clock, Loader2, CheckCircle2, Menu, User, Plus, Trash2 } from 'lucide-react';
import SettingsModal from "../../components/SettingsModal";
import Chatbot from "../../components/Chatbot";
import ProfilePage from "../../components/ProfilePage";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const T_Dashboard = () => {
  const [preferredCourses, setPreferredCourses] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const [courseInput, setCourseInput] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [teacherName, setTeacherName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [teacherId, setTeacherId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayTeacherId, setDisplayTeacherId] = useState("N/A");
  const [availableCoursesList, setAvailableCoursesList] = useState([]);
  const [activePage, setActivePage] = useState("schedule");
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setTeacherName(user.name);
      if (user.profileImage) setAvatar(user.profileImage);
      else if (user.avatar) setAvatar(user.avatar);
      setTeacherId(user._id || user.id);

      fetch(`https://unischedule2-production.up.railway.app/api/teachers/${user._id || user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setPreferredCourses(data.preferredCourses || []);
            setAvailableTimes(data.availableTimes || []);
            setDisplayTeacherId(data.teacherId || "N/A");
          }
        })
        .catch(err => console.error("Error loading teacher:", err));

      fetch(`${API_BASE_URL}/api/courses`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAvailableCoursesList(data); })
        .catch(err => console.error("Error loading courses:", err));
    }
  }, [showSettings]);

  const savePreferences = async (updatedCourses, updatedTimes) => {
    try {
      const res = await fetch(`https://unischedule2-production.up.railway.app/api/teachers/${teacherId}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCourses: updatedCourses, availableTimes: updatedTimes })
      });
      if (res.ok) {
        return true;
      } else {
        const data = await res.json();
        toast("Server Error: " + (data.message || "Failed to save preferences"), "error");
        return false;
      }
    } catch {
      toast("Connection Error: Check if your Backend is running.", "error");
      return false;
    }
  };

  const addCourse = async () => {
    if (!courseInput) return toast("Please select a course.", "warning");
    if (preferredCourses.includes(courseInput)) return toast("Course already added.", "warning");

    const updated = [...preferredCourses, courseInput];
    if (await savePreferences(updated, availableTimes)) {
      setPreferredCourses(updated);
      setCourseInput("");
    }
  };

  const deleteCourse = async (courseName) => {
    const updated = preferredCourses.filter(c => c !== courseName);
    if (await savePreferences(updated, availableTimes)) {
      setPreferredCourses(updated);
    }
  };

  const addTime = async () => {
    if (!day || !startTime || !endTime) return toast("Please fill all time fields.", "warning");
    if (startTime >= endTime) return toast("End time must be after start time.", "warning");

    const updated = [...availableTimes, { day, startTime, endTime }];
    if (await savePreferences(preferredCourses, updated)) {
      setAvailableTimes(updated);
      setDay(""); setStartTime(""); setEndTime("");
    }
  };

  const deleteTime = async (index) => {
    const updated = availableTimes.filter((_, i) => i !== index);
    if (await savePreferences(preferredCourses, updated)) {
      setAvailableTimes(updated);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const navItems = [
    { key: "schedule", label: "My Preferences", icon: <CalendarDays size={18} /> },
    { key: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  const selectStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontSize: "14px", outline: "none", cursor: "pointer", color: "#333" };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "fixed", top: "16px", left: "16px", zIndex: 1000, background: "#1a2e1a", border: "none", color: "white", padding: "8px", borderRadius: "8px" }}>
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ width: "240px", height: "100vh", background: "#1a2e1a", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, zIndex: 999, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ padding: "0 20px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarDays size={18} color="white" />
          </div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>Teacher Portal</span>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          {navItems.map(item => {
            const isActive = activePage === item.key;
            return (
              <div key={item.key} onClick={() => setActivePage(item.key)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", margin: "2px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: isActive ? "600" : "400", color: isActive ? "white" : "#9abeaa", background: isActive ? "#1a431e" : "transparent", transition: "all 0.15s", userSelect: "none" }}>
                {item.icon}{item.label}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "0 12px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px 14px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "white", flexShrink: 0, overflow: "hidden", border: "2px solid #3d8a3d" }}>
                {avatar ? (
                  <img src={avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  teacherName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ color: "white", fontSize: "13px", fontWeight: "600", lineHeight: 1.3 }}>Dr. {teacherName}</div>
                <div style={{ color: "#9abeaa", fontSize: "11px" }}>Instructor</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,136,136,0.2)", borderRadius: "10px", color: "#ff8a8a", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
              <LogOut size={16} /> Sign Out
            </button>
            <button onClick={() => setShowSettings(true)}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#9abeaa", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, overflowX: "hidden", overflowY: "auto", background: "#f5f7f5" }}>
        <div className="page-header" style={{ padding: "24px 32px 20px" }}>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Teacher Portal</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Welcome, Dr. {teacherName}</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0" }}>
            {activePage === "profile" ? "View your profile details." : "Manage your preferred courses and available time slots."}
          </p>
        </div>

        {activePage === "profile" ? (
          <div style={{ padding: "0 32px 32px" }}>
            <ProfilePage
              role="teacher"
              extraFields={[
                { label: "Teacher ID", value: displayTeacherId },
              ]}
            />
          </div>
        ) : (
          <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

            { }
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={18} color="#1a431e" />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Add Preferred Course</h2>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#666", textTransform: "uppercase" }}>Available Courses</label>
                    <select value={courseInput} onChange={e => setCourseInput(e.target.value)} style={selectStyle}>
                      <option value="">Select Course...</option>
                      {availableCoursesList.map(c => <option key={c._id} value={c.name}>{c.name} ({c.code})</option>)}
                    </select>
                  </div>
                  <button onClick={addCourse} style={{ padding: "10px 20px", background: "#1a431e", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", height: "42px" }}>
                    Add Course
                  </button>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>My Desired Courses</h2>
                </div>
                {preferredCourses.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>No courses selected.</div>
                ) : (
                  preferredCourses.map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 24px", borderBottom: i === preferredCourses.length - 1 ? "none" : "1px solid #f5f5f5", alignItems: "center" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>{c}</div>
                      <button onClick={() => deleteCourse(c)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#e53e3e", padding: "6px" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            { }
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={18} color="#1a73e8" />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Add Available Time Slot</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#666", textTransform: "uppercase" }}>Day</label>
                    <select value={day} onChange={e => setDay(e.target.value)} style={selectStyle}>
                      <option value="">Select Day...</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#666", textTransform: "uppercase" }}>Start Time</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#666", textTransform: "uppercase" }}>End Time</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <button onClick={addTime} style={{ padding: "10px 20px", background: "#1a73e8", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", marginTop: "4px" }}>
                    Add Time Slot
                  </button>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>My Availability</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", padding: "10px 24px", borderBottom: "1px solid #f0f0f0" }}>
                  {["DAY", "DURATION", ""].map((h, i) => <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa" }}>{h}</span>)}
                </div>
                {availableTimes.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>No time slots added.</div>
                ) : (
                  availableTimes.map((t, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", padding: "14px 24px", borderBottom: i === availableTimes.length - 1 ? "none" : "1px solid #f5f5f5", alignItems: "center" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>{t.day}</div>
                      <div style={{ fontSize: "14px", color: "#1a73e8", fontWeight: "600" }}>{t.startTime} - {t.endTime}</div>
                      <button onClick={() => deleteTime(i)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#e53e3e", padding: "6px" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <Chatbot />
    </div>
  );
};

export default T_Dashboard;

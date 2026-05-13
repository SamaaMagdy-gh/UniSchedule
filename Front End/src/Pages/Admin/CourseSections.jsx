import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Plus, X, Trash2, BookOpen, Clock, CalendarDays } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const sectionTypes = ["Lecture", "Section"];

const sectionTypeColors = {
  Lecture: { bg: "#fcfdcf", border: "#f0f0e0", badge: "#c6a61f", badgeBg: "#fff8e1" },
  Section: { bg: "#e8f0ff", border: "#c4d8ff", badge: "#3366cc", badgeBg: "#e0ecff" },
};

export default function CourseSections() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/courses`).then(res => res.json()).then(data => setCourses(data));
    fetch(`${API_BASE_URL}/api/teachers`).then(res => res.json()).then(data => setTeachers(data));
    fetch(`${API_BASE_URL}/api/rooms`).then(res => res.json()).then(data => setRooms(data));
  };

  const handleResetSections = async () => {
    if (!window.confirm("WARNING: Are you sure you want to WIPE ALL SCHEDULING CONFIGURATIONS? This will delete all Lecture and Section timings across ALL courses, but will NOT delete the courses themselves.")) {
      return;
    }
    if (!window.confirm("DOUBLE CHECK: This action is PERMANENT and will instantly empty all registered sections from the database. Type 'OK' to proceed?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/reset-sections`, {
        method: "POST"
      });
      if (res.ok) {
        toast("All sections have been successfully wiped from the schedule.", "success");
        fetchData(); 
      } else {
        toast("Failed to wipe sections.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Error connecting to server.", "error");
    }
  };

  const filtered = courses.filter(c =>
    (c.name?.toLowerCase().includes(search.toLowerCase())) ||
    (c.code?.toLowerCase().includes(search.toLowerCase()))
  );

  const openScheduling = (course) => {
    setSelectedCourse(course);

    const sanitized = (course.sections || []).map(sec => ({
      ...sec,
      day: days.includes(sec.day) ? sec.day : days[0],
    }));
    setSections(sanitized);
    setShowModal(true);
  };

  const addSection = (type = "Lecture") => {
    setSections([...sections, {
      sectionName: "",
      type,
      day: "",
      startTime: "",
      endTime: "",
      instructor: "",
      room: "",
      maxCapacity: 40,
      currentEnrollment: 0
    }]);
  };

  const updateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const url = `${API_BASE_URL}/api/courses/${selectedCourse._id}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections })
    });

    if (res.ok) {
      const data = await res.json();
      setCourses(courses.map(c => c._id === selectedCourse._id ? data : c));
      setShowModal(false);
    } else {
      const err = await res.json();
      toast(err.message || "Update failed", "error");
    }
  };

  const lectureCount = (secs) => (secs || []).filter(s => (s.type || 'Lecture') === 'Lecture').length;
  const sectionCount = (secs) => (secs || []).filter(s => s.type === 'Section').length;

  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Section Scheduling</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Scheduling & Sections</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Configure timings, rooms and instructors for course sections</p>
        </div>
        <div>
          <span style={{ background: "#e8f0ff", color: "#3366cc", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginRight: "12px" }}>Scheduling Active</span>
          <button onClick={handleResetSections} style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#e53e3e", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Trash2 size={14} /> Wipe All Configured Timings
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search courses to schedule..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "24px", border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.6fr 1fr 1fr 1fr", padding: "12px 20px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
          {["COURSE", "CODE", "HRS", "LECTURES", "SECTIONS", "ACTION"].map((h, i) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textAlign: (i === 2) ? "center" : "left" }}>{h}</span>
          ))}
        </div>
        {filtered.map(c => (
          <div key={c._id} style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.6fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid #f5f5f5", alignItems: "center", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CalendarDays size={16} color="#2d6a2d" /></div>
              <span style={{ fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
            </div>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>{c.code}</span>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#2d6a2d", fontWeight: "700", background: "#e8f5e8", padding: "2px 8px", borderRadius: "4px" }}>{c.creditHours || 3}</span>
            </div>
            <span style={{ fontSize: "13px", color: "#555" }}>{lectureCount(c.sections)} Lectures</span>
            <span style={{ fontSize: "13px", color: "#555" }}>{sectionCount(c.sections)} Sections</span>
            <button onClick={() => openScheduling(c)} style={{ width: "fit-content", padding: "6px 16px", borderRadius: "6px", border: "1px solid #1a2e1a", color: "#1a2e1a", background: "white", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>
              Manage Timing
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedCourse && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "0", width: "760px", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Manage Sections: {selectedCourse.name}</h2>
                <div style={{ fontSize: "12px", color: "#888" }}>Code: {selectedCourse.code} | {selectedCourse.department}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", color: "#1a431e", margin: 0, fontWeight: "700" }}>Lectures & Sections Configuration</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => addSection("Lecture")} style={{ fontSize: "12px", background: "#fff8e1", color: "#c6a61f", border: "1px solid #f0e8c0", padding: "6px 12px", borderRadius: "20px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Lecture</button>
                  <button onClick={() => addSection("Section")} style={{ fontSize: "12px", background: "#e0ecff", color: "#3366cc", border: "1px solid #c4d8ff", padding: "6px 12px", borderRadius: "20px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Section</button>
                </div>
              </div>

              {sections.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", background: "#fafafa", borderRadius: "12px", border: "1px dashed #ddd" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>No timings configured for this course yet.</p>
                </div>
              ) : (
                sections.map((sec, idx) => {
                  const isLecture = (sec.type || 'Lecture') === 'Lecture';
                  const colors = sectionTypeColors[sec.type || 'Lecture'];
                  const selectedTeacher = teachers.find(t => t.name === sec.instructor);
                  const availability = (selectedTeacher?.availableTimes || []);

                  return (
                    <div key={idx} style={{ background: colors.bg, padding: "16px", borderRadius: "12px", marginBottom: "16px", border: `1.5px solid ${colors.border}`, position: "relative" }}>
                      <button onClick={() => removeSection(idx)} style={{ position: "absolute", top: "12px", right: "12px", background: "white", border: "1px solid #eee", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "red", cursor: "pointer" }}><Trash2 size={12} /></button>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: colors.badgeBg, color: colors.badge }}>
                          {isLecture ? 'LECTURE' : 'SECTION'}
                        </span>
                        <input value={sec.sectionName} onChange={e => updateSection(idx, "sectionName", e.target.value)} placeholder={isLecture ? "Lec A" : "Section 1"} style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(0,0,0,0.1)", fontSize: "14px", fontWeight: "600", outline: "none" }} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>{isLecture ? 'PROFESSOR' : 'TA'}</label>
                          <select value={sec.instructor || ''} onChange={e => {
                            const name = e.target.value;
                            const updated = [...sections];
                            updated[idx].instructor = name;

                            // Auto-assign first available slot for this teacher
                            const teacherObj = teachers.find(t => t.name === name);
                            if (teacherObj?.availableTimes?.length > 0) {
                              const firstFree = teacherObj.availableTimes.find(at => {
                                // Global check
                                let isGlobalUsed = false;
                                courses.forEach(c => {
                                    if (c._id === selectedCourse._id) return;
                                    (c.sections || []).forEach(s => {
                                        if (s.instructor === name && s.day === at.day && s.startTime === at.startTime) isGlobalUsed = true;
                                    });
                                });
                                if (isGlobalUsed) return false;
                                // Local check
                                const isLocalUsed = updated.some((s, sIdx) => sIdx !== idx && s.instructor === name && s.day === at.day && s.startTime === at.startTime);
                                return !isLocalUsed;
                              });
                              if (firstFree) {
                                updated[idx].day = firstFree.day;
                                updated[idx].startTime = firstFree.startTime;
                                updated[idx].endTime = firstFree.endTime;
                              }
                            }
                            setSections(updated);
                          }} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", background: "white" }}>
                            <option value="">Select Staff</option>
                            {teachers.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>ROOM</label>
                          <select value={sec.room || ''} onChange={e => {
                            const rName = e.target.value;
                            updateSection(idx, "room", rName);
                            const rObj = rooms.find(r => r.name === rName);
                            if (rObj) updateSection(idx, "maxCapacity", rObj.capacity);
                          }} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", background: "white" }}>
                            <option value="">Select Room</option>
                            {rooms.map(r => <option key={r._id} value={r.name}>{r.name} (Cap: {r.capacity})</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>MAX CAPACITY</label>
                          <input type="number" value={sec.maxCapacity} onChange={e => updateSection(idx, "maxCapacity", Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: availability.length > 0 ? "1fr" : "1fr 1fr 1fr", gap: "12px", background: "rgba(255,255,255,0.4)", padding: "12px", borderRadius: "8px" }}>
                        {availability.length > 0 ? (
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a431e", display: "block", marginBottom: "4px" }}>CHOOSE FROM INSTRUCTOR'S AVAILABILITY</label>
                            <select
                              value={`${sec.day}|${sec.startTime}|${sec.endTime}`}
                              onChange={e => {
                                const [d, s, en] = e.target.value.split('|');
                                updateSection(idx, "day", d);
                                updateSection(idx, "startTime", s);
                                updateSection(idx, "endTime", en);
                              }}
                              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #8fbc8f", fontSize: "13px", background: "#f0f7f0", color: "#1a431e", fontWeight: "600" }}
                            >
                              <option value="">-- Select Slot --</option>
                              {availability.filter(at => {
                                // 1. Check if this slot is used in OTHER courses
                                let isGlobalUsed = false;
                                courses.forEach(c => {
                                    if (c._id === selectedCourse._id) return;
                                    (c.sections || []).forEach(s => {
                                        if (s.instructor === sec.instructor && s.day === at.day && s.startTime === at.startTime) {
                                            isGlobalUsed = true;
                                        }
                                    });
                                });
                                if (isGlobalUsed) return false;

                                // 2. Check if this slot is used in other sections of the SAME course (Local check)
                                const isLocalUsed = sections.some((otherSec, sIdx) => 
                                    sIdx !== idx && 
                                    otherSec.instructor === sec.instructor && 
                                    otherSec.day === at.day && 
                                    otherSec.startTime === at.startTime
                                );
                                if (isLocalUsed) return false;

                                return true;
                              }).map((at, i) => (
                                <option key={i} value={`${at.day}|${at.startTime}|${at.endTime}`}>
                                  {at.day}: {at.startTime} - {at.endTime}
                                </option>
                              ))}
                              {/* Always include CURRENT selected slot if it doesn't pass the filter (to avoid empty select) */}
                              {sec.day && sec.startTime && (
                                <option value={`${sec.day}|${sec.startTime}|${sec.endTime}`} hidden>
                                    {sec.day}: {sec.startTime} - {sec.endTime} (Selected)
                                </option>
                              )}
                            </select>
                          </div>
                        ) : (
                          <>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>DAY</label>
                              <select value={sec.day} onChange={e => updateSection(idx, "day", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", background: "white" }}>
                                {days.map(d => <option key={d}>{d}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>START</label>
                              <input type="time" value={sec.startTime} onChange={e => updateSection(idx, "startTime", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", display: "block", marginBottom: "4px" }}>END</label>
                              <input type="time" value={sec.endTime} onChange={e => updateSection(idx, "endTime", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: "20px 28px", borderTop: "1px solid #eee", display: "flex", gap: "10px", background: "#f9f9f9", borderRadius: "0 0 16px 16px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#1a2e1a", color: "white", fontWeight: "600", cursor: "pointer" }}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

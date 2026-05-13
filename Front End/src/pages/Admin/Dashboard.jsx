import { useState, useEffect } from "react";
import { Users, GraduationCap, DoorOpen, BookOpen } from "lucide-react";
import API_BASE_URL from "../../apiConfig";
export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, rooms: 0, courses: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resStudents, resTeachers, resCourses, resRooms] = await Promise.all([
          fetch("https://unischedule2-production.up.railway.app/api/students"),
          fetch("https://unischedule2-production.up.railway.app/api/teachers"),
          fetch("https://unischedule2-production.up.railway.app/api/courses"),
          fetch("https://unischedule2-production.up.railway.app/api/rooms")
        ]);
        const students = await resStudents.json();
        const teachers = await resTeachers.json();
        const courses = await resCourses.json();
        const rooms = await resRooms.json();
        setStats({
          students: students.length,
          teachers: teachers.length,
          rooms: rooms.length,
          courses: courses.length
        });
        const combined = [
          ...students.map(s => ({ name: s.name, dept: s.department, type: "student", date: new Date(s.createdAt) })),
          ...teachers.map(t => ({ name: t.name, dept: t.department, type: "teacher", date: new Date(t.createdAt) })),
          ...courses.map(c => ({ name: c.name, dept: c.department, type: "course", date: new Date(c.createdAt) })),
          ...rooms.map(r => ({ name: r.name, dept: "System", type: "room", date: new Date(r.createdAt) }))
        ];
        combined.sort((a, b) => b.date - a.date);
        setRecentActivity(combined.slice(0, 5));
      } catch (error) {
        console.error("Dashboard sync error:", error);
      }
    };
    fetchStats();
  }, []);
  const cards = [
    { title: "Total Students", value: stats.students, icon: Users, desc: "Enrolled this semester" },
    { title: "Total Instructors", value: stats.teachers, icon: GraduationCap, desc: "Currently teaching" },
    { title: "Total Rooms", value: stats.rooms, icon: DoorOpen, desc: "Ready for scheduling" },
    { title: "Total Courses", value: stats.courses, icon: BookOpen, desc: "Active this semester" },
  ];
  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Dashboard</h1>
        <div style={{ color: "#2d6a2d", fontSize: "13px", marginTop: "4px" }}>System Online</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #eee" }}>
            <card.icon size={24} color="#2d6a2d" style={{ marginBottom: "16px" }} />
            <div style={{ fontSize: "13px", color: "#888" }}>{card.title}</div>
            <div style={{ fontSize: "28px", fontWeight: "700" }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{card.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #eee" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Recent Activity</h2>
          <button onClick={() => window.location.reload()} style={{ background: "none", border: "none", color: "#2d6a2d", fontSize: "13px", cursor: "pointer" }}>Refresh Now</button>
        </div>
        {recentActivity.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>No activity yet.</div>
        ) : (
          recentActivity.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: i === recentActivity.length - 1 ? "none" : "1px solid #f5f5f5" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2d6a2d" }}></div>
              <div style={{ fontSize: "14px" }}>
                New {item.type} <b>{item.name}</b> was added to <b>{item.dept}</b>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

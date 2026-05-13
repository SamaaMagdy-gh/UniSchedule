import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import Login from "./pages/Login/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import Students from "./pages/Admin/Student.jsx";
import Teachers from "./pages/Admin/Teacher.jsx";
import Courses from "./pages/Admin/Course.jsx";
import CourseSections from "./pages/Admin/CourseSections.jsx";
import Rooms from "./pages/Admin/Room.jsx";
import GenerateTimetable from "./pages/Admin/GenerateTimetable.jsx";
import Admins from "./pages/Admin/Admins.jsx";
import Requests from "./pages/Admin/Requests.jsx";
import Reviews from "./pages/Admin/Reviews.jsx";
import AdminProfile from "./pages/Admin/AdminProfile.jsx";
import S_Dashboard from "./pages/Student/S_Dashboard.jsx";
import T_Dashboard from "./pages/Teacher/T_Dashboard.jsx";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token && user && user.role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  }

  return children;
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }}
        />
      )}
      <Sidebar className={`sidebar ${sidebarOpen ? "open" : ""}`} />
      <main className="main-content" style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto', backgroundColor: '#f5f7f5' }}>
        <Outlet />
      </main>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

         <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="courses" element={<Courses />} />
          <Route path="sections" element={<CourseSections />} />
          <Route path="admins" element={<Admins />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="requests" element={<Requests />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="GenerateTimetable" element={<GenerateTimetable />} />
        </Route>

         <Route path="/student" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <S_Dashboard />
          </ProtectedRoute>
        } />

         <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <T_Dashboard />
          </ProtectedRoute>
        } />

         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

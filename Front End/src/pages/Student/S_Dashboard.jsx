import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, CalendarDays, LogOut, Settings, ChevronLeft, ChevronRight, CheckCircle2, Filter, Loader2, RefreshCw, Menu, MessageSquare, Star } from 'lucide-react';
import SettingsModal from "../../components/SettingsModal";
import StudentRequests from "./StudentRequests";
import Chatbot from "../../components/Chatbot";
import ReviewModal from "../../components/ReviewModal";
import ProfilePage from "../../components/ProfilePage";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

const allDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const typeColors = {
    Lecture: { bg: "#e8f5e8", border: "#c8e6c9", text: "#1a431e", sub: "#2d6a2d" },
    Section: { bg: "#e8f0ff", border: "#b3ccff", text: "#1a3f7a", sub: "#4a6abf" },
};

const S_Dashboard = () => {
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [studentName, setStudentName] = useState("Student");
    const [avatar, setAvatar] = useState(null);
    const [activePage, setActivePage] = useState("schedule");
    const [showSettings, setShowSettings] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [realStudentId, setRealStudentId] = useState("N/A");

    const [mySchedule, setMySchedule] = useState(null);
    const [options, setOptions] = useState([]);
    const [currentOptionIdx, setCurrentOptionIdx] = useState(0);
    const [excludedDays, setExcludedDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");
    const [editingSchedule, setEditingSchedule] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [myReviews, setMyReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setStudentName(parsed.name);
            if (parsed.profileImage) setAvatar(parsed.profileImage);
            else if (parsed.avatar) setAvatar(parsed.avatar);
            fetch(`${API_BASE_URL}/api/students/${parsed._id || parsed.id}`)
                .then(r => r.json())
                .then(d => { if (d && d.studentId) setRealStudentId(d.studentId) })
                .catch(e => console.error("Could not fetch student ID"));
        }
        fetchData();
    }, [showSettings]);

     useEffect(() => {
        const token = localStorage.getItem('token');
        fetch("https://unischedule2-production.up.railway.app/api/reviews/my", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(d => setMyReviews(Array.isArray(d) ? d : []))
            .catch(() => { });
    }, []);

    const parseGeneratorResponse = (data) => {

        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.schedules)) {
                setOptions(data.schedules);
            } else {
                setOptions([]);
            }

            if (data.blocked) {
                setIsBlocked(true);
                setInfoMessage(data.message || 'Cannot build a complete schedule. Please contact Student Affairs.');
            } else if (!data.schedules || data.schedules.length === 0) {
                setInfoMessage(data.message || 'No valid schedule combinations were found.');
            }
        } else if (Array.isArray(data)) {

            setOptions(data.map(sch => ({ schedule: sch, registrationsLeft: '?' })));
            if (data.length === 0) setInfoMessage('No valid schedule combinations were found.');
        } else {
            setOptions([]);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setInfoMessage("");
        setIsBlocked(false);
        const token = localStorage.getItem('token');
        try {
            const statusRes = await fetch("https://unischedule2-production.up.railway.app/api/registration/status");
            const statusData = await statusRes.json();
            setIsRegistrationOpen(statusData.isRegistrationOpen);

            const mySchedRes = await fetch("https://unischedule2-production.up.railway.app/api/registration/my-schedule", { headers: { Authorization: `Bearer ${token}` } });
            if (mySchedRes.ok) {
                const mySchedData = await mySchedRes.json();
                setMySchedule(mySchedData && mySchedData.length > 0 ? mySchedData : null);

                if (statusData.isRegistrationOpen && (!mySchedData || mySchedData.length === 0 || editingSchedule)) {
                    const optRes = await fetch("https://unischedule2-production.up.railway.app/api/registration/generate-options", { headers: { Authorization: `Bearer ${token}` } });
                    if (optRes.ok) {
                        const optData = await optRes.json();
                        parseGeneratorResponse(optData);
                    } else {
                        const errData = await optRes.json();
                        setInfoMessage(errData.message || "Could not generate schedules. Please contact admin.");
                        setOptions([]);
                    }
                }
            } else {
                setMySchedule(null);
            }
        } catch (e) {
            console.error(e);
            setInfoMessage("Could not connect to the server. Please try again later.");
        }
        setLoading(false);
    };

    const handleChangeSchedule = async () => {
        setEditingSchedule(true);
        setMySchedule(null);
        setLoading(true);
        setInfoMessage("");
        setIsBlocked(false);
        const token = localStorage.getItem('token');
        try {
            const optRes = await fetch("https://unischedule2-production.up.railway.app/api/registration/generate-options", { headers: { Authorization: `Bearer ${token}` } });
            if (optRes.ok) {
                const optData = await optRes.json();
                parseGeneratorResponse(optData);
            } else {
                const errData = await optRes.json();
                setInfoMessage(errData.message || "Could not generate schedules.");
                setOptions([]);
            }
        } catch (e) {
            console.error(e);
            setInfoMessage("Could not connect to the server.");
        }
        setCurrentOptionIdx(0);
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const toggleExcludeDay = (day) => {
        setExcludedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
        setCurrentOptionIdx(0);
    };

    const filteredOptions = options.filter(optObj => {
        const sch = optObj.schedule || optObj;
        if (excludedDays.length === 0) return true;
        for (let item of sch) {
            const dayNorm = item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase();
            if (excludedDays.includes(dayNorm)) return false;
        }
        return true;
    });

    const handleRegister = async () => {
        if (filteredOptions.length === 0) return;
        setRegistering(true);
        const token = localStorage.getItem('token');
        const selectedOp = filteredOptions[currentOptionIdx];
        const selectedSchedule = selectedOp.schedule || selectedOp;

        try {
            const res = await fetch("https://unischedule2-production.up.railway.app/api/registration/register", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ schedule: selectedSchedule })
            });
            if (res.ok) {
                toast("Successfully registered for schedule!", "success");
                setEditingSchedule(false);
                fetchData();
            } else {
                const err = await res.json();
                toast(err.message || "Registration failed.", "error");
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
        setRegistering(false);
    };

    const navItems = [
        { key: "home", label: "Home", icon: <Home size={18} /> },
        { key: "profile", label: "Profile", icon: <User size={18} /> },
        { key: "schedule", label: "My Schedule", icon: <CalendarDays size={18} /> },
        { key: "requests", label: "Add/Drop Requests", icon: <MessageSquare size={18} /> },
        { key: "reviews", label: "Rate Courses", icon: <Star size={18} /> },
    ];


     const GLOBAL_MIN_H = 8;
    const GLOBAL_MAX_H = 20;

    const masterSlots = useMemo(() => {
        const intervals = [];
        for (let h = GLOBAL_MIN_H; h < GLOBAL_MAX_H; h++) {
            const hStart = h.toString().padStart(2, '0') + ":00";
            const hEnd = (h + 1).toString().padStart(2, '0') + ":00";
            intervals.push({
                start: hStart,
                end: hEnd,
                label: `${hStart} - ${hEnd}`
            });
        }
        return intervals;
    }, []);

     const displayScheduleGrid = (scheduleArray, forcedSlots) => {
        if (!scheduleArray || scheduleArray.length === 0) return <div style={{ padding: "20px", color: "#888", textAlign: "center" }}>No items found.</div>;

        let linearSlots = forcedSlots;
        if (!linearSlots || linearSlots.length === 0) {
            linearSlots = [];
            for (let h = GLOBAL_MIN_H; h < GLOBAL_MAX_H; h++) {
                const s = h.toString().padStart(2, '0') + ":00";
                const e = (h + 1).toString().padStart(2, '0') + ":00";
                linearSlots.push({ start: s, end: e, label: `${s} - ${e}` });
            }
        }

        if (!linearSlots || linearSlots.length === 0) return <div style={{ padding: "20px", color: "#888", textAlign: "center" }}>No valid time data.</div>;

        return (
            <div style={{ overflow: "hidden", borderRadius: "12px", border: "1px solid #e0e0e0", background: "white", height: "450px", position: "relative", padding: "16px", boxSizing: "border-box" }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "11px",
                    tableLayout: "fixed",
                    height: "418px"
                }}>
                    <thead>
                        <tr style={{ background: "#f0f7f0", borderBottom: "2px solid #e0e0e0", height: "40px" }}>
                            <th style={{ padding: "0 8px", textAlign: "left", color: "#1a431e", fontWeight: "800", borderRight: "1px solid #e8e8e8", width: "75px" }}>Day</th>
                            {linearSlots.map((slot, idx) => (
                                <th key={idx} style={{
                                    padding: "0 4px",
                                    textAlign: "center",
                                    color: "#1a431e",
                                    fontWeight: "800",
                                    fontSize: "10px",
                                    borderRight: "1px solid #f0f0f0"
                                }}>{slot.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allDays.map((day, rowIdx) => {
                            let skipCount = 0;
                            return (
                                <tr key={day} style={{ borderBottom: "1px solid #f0f0f0", background: rowIdx % 2 === 0 ? "white" : "#fafcfa", height: "63px" }}>
                                    <td style={{ padding: "0 10px", fontWeight: "700", color: "#2d6a2d", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", fontSize: "11px", height: "63px" }}>{day}</td>
                                    {linearSlots.map((slot, sIdx) => {
                                        if (skipCount > 0) {
                                            skipCount--;
                                            return null;
                                        }

                                        const item = scheduleArray.find(s =>
                                            s.day && s.day.toLowerCase() === day.toLowerCase() &&
                                            s.startTime.trim() === slot.start
                                        );

                                        if (item) {
                                            const startH = parseInt(item.startTime.split(':')[0]);
                                            const endH = parseInt(item.endTime.split(':')[0]);
                                            const span = endH - startH;
                                            skipCount = span - 1;

                                            const colors = typeColors[item.type] || typeColors.Lecture;
                                            return (
                                                <td key={sIdx} colSpan={span} style={{ padding: "4px", borderRight: "1px solid #f5f5f5", verticalAlign: "middle", height: "63px", boxSizing: "border-box" }}>
                                                    <div style={{
                                                        background: colors.bg,
                                                        border: `1.5px solid ${colors.border}`,
                                                        padding: "4px",
                                                        borderRadius: "8px",
                                                        textAlign: "center",
                                                        height: "55px",
                                                        maxHeight: "55px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        boxSizing: "border-box",
                                                        overflow: "hidden",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                                                    }}>
                                                        <div style={{ fontWeight: "900", color: colors.text, fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.courseCode}</div>
                                                        <div style={{ fontSize: "10px", color: colors.sub, marginTop: "1px", fontWeight: "700", opacity: 0.9 }}>
                                                            {item.type}·{item.sectionName}
                                                        </div>
                                                        <div style={{ fontSize: "8px", color: "#666", marginTop: "1px", fontWeight: "500" }}>
                                                            {item.room} {item.instructor ? `· ${item.instructor.split(' ').pop()}` : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        } else {
                                            return <td key={sIdx} style={{ borderRight: "1px solid #f9f9f9", height: "63px" }}><div style={{ height: "55px", minHeight: "55px" }} /></td>;
                                        }
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };


    const renderPageContent = () => {
        if (activePage === "requests") {
            return <StudentRequests />;
        }

        if (activePage === "reviews") {
            if (!mySchedule || mySchedule.length === 0) {
                return (
                    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "72px 24px", textAlign: "center" }}>
                        <Star size={36} color="#ddd" style={{ marginBottom: "16px" }} />
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#bbb" }}>No enrolled courses yet</div>
                        <div style={{ fontSize: "13px", color: "#ccc", marginTop: "8px" }}>Register a schedule first to be able to rate your courses.</div>
                    </div>
                );
            }
             const seenCodes = new Set();
            const uniqueCourses = mySchedule.filter(item => {
                if (seenCodes.has(item.courseCode)) return false;
                seenCodes.add(item.courseCode);
                return true;
            });
            return (
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px" }}>Rate Your Courses</h2>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 24px" }}>Share your feedback on your enrolled courses and instructors.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {uniqueCourses.map((item) => {
                            const existing = myReviews.find(r => r.courseCode === item.courseCode);
                            return (
                                <div key={item.courseCode} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "16px 20px", borderRadius: "10px", border: "1px solid #eee",
                                    background: existing ? "#f8fdf8" : "#fafafa",
                                    transition: "box-shadow 0.2s",
                                }}>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{item.courseName || item.courseCode}</div>
                                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                            {item.courseCode}{item.instructor ? ` · ${item.instructor}` : ""}
                                        </div>
                                        {existing && (
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px", padding: "2px 10px", background: "#e8f5e8", borderRadius: "12px" }}>
                                                <CheckCircle2 size={12} color="#2d6a2d" />
                                                <span style={{ fontSize: "11px", color: "#2d6a2d", fontWeight: "600" }}>Reviewed</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setReviewTarget({ ...item, existingReview: existing || null })}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "6px",
                                            padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
                                            cursor: "pointer", transition: "all 0.2s",
                                            background: existing ? "white" : "#1a2e1a",
                                            color: existing ? "#1a431e" : "white",
                                            border: existing ? "1px solid #c8e6c9" : "none",
                                        }}
                                    >
                                        <Star size={14} fill={existing ? "#f4c542" : "none"} color={existing ? "#f4c542" : "white"} strokeWidth={1.5} />
                                        {existing ? "Update Review" : "Rate Now"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {reviewTarget && (
                        <ReviewModal
                            course={reviewTarget}
                            existingReview={reviewTarget.existingReview}
                            onClose={() => {
                                setReviewTarget(null);
                                 const token = localStorage.getItem('token');
                                fetch("https://unischedule2-production.up.railway.app/api/reviews/my", { headers: { Authorization: `Bearer ${token}` } })
                                    .then(r => r.json()).then(d => setMyReviews(Array.isArray(d) ? d : [])).catch(() => { });
                            }}
                        />
                    )}
                </div>
            );
        }
        if (activePage === "home") {
            return (
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "48px 32px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 12px" }}>Welcome, {studentName}!</h2>
                    <p style={{ color: "#888", fontSize: "15px", lineHeight: "1.75", maxWidth: "500px", margin: "0 auto 28px" }}>
                        This is your UniSchedule Student Portal. Use the sidebar to navigate to your schedule, view your profile, or manage your settings.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ background: isRegistrationOpen ? "#e8f5e8" : "#fff3e0", borderRadius: "12px", padding: "20px 28px", minWidth: "180px" }}>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: isRegistrationOpen ? "#2d6a2d" : "#e65100" }}>{isRegistrationOpen ? "Open" : "Closed"}</div>
                            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>Registration Status</div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activePage === "profile") {
            return (
                <ProfilePage
                    role="student"
                    extraFields={[
                        { label: "Student ID", value: realStudentId },
                    ]}
                />
            );
        }

         if (loading) {
            return <div style={{ padding: "100px", textAlign: "center" }}><Loader2 className="lucide-spin" size={40} color="#1a431e" /></div>;
        }

         if (mySchedule && !editingSchedule) {
            return (
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>Your Enrolled Schedule</h2>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            {isRegistrationOpen && (
                                <button onClick={handleChangeSchedule} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#fff8e1", color: "#c6a61f", border: "1px solid #f0e8c0", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                                    <RefreshCw size={14} /> Change Schedule
                                </button>
                            )}
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#e8f5e8", color: "#1a431e", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                                <CheckCircle2 size={16} /> Officially Registered
                            </span>
                        </div>
                    </div>
                    {displayScheduleGrid(mySchedule)}
                </div>
            );
        }

        if (!isRegistrationOpen && !mySchedule) {
            return (
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "72px 24px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 12px" }}>Registration is Closed</h3>
                    <p style={{ color: "#888", fontSize: "15px", lineHeight: "1.75", maxWidth: "460px", margin: "0 auto" }}>
                        The scheduling system is currently locked. Please log in when the administration opens the registration window.
                    </p>
                </div>
            );
        }

         return (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 4px", color: "#1a1a1a" }}>
                            {editingSchedule ? "Change Your Schedule" : "Registration Open: Choose Your Schedule"}
                        </h2>
                        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                            {editingSchedule
                                ? "Your previous schedule will be replaced when you register a new one."
                                : "Review the generated, conflict-free options below. Each includes both Lectures and Sections where applicable."}
                        </p>
                    </div>
                    {editingSchedule && (
                        <button onClick={() => { setEditingSchedule(false); fetchData(); }} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", background: "white", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
                            Cancel
                        </button>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#fcfdcf", borderRadius: "8px", border: "1px solid #f0f0e0", marginBottom: "24px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c6a61f", fontWeight: "600", fontSize: "14px" }}>
                        <Filter size={18} /> Filters:
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "13px", color: "#666" }}>Exclude Day:</span>
                        {allDays.map(day => (
                            <button key={day} onClick={() => toggleExcludeDay(day)}
                                style={{
                                    padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
                                    background: excludedDays.includes(day) ? "#c6a61f" : "white",
                                    color: excludedDays.includes(day) ? "white" : "#666",
                                    border: `1px solid ${excludedDays.includes(day) ? "#c6a61f" : "#ddd"}`
                                }}>
                                {day.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOptions.length > 0 ? (
                    <>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#f8faf8", borderRadius: "8px", marginBottom: "20px", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button onClick={() => setCurrentOptionIdx(prev => Math.max(0, prev - 1))} disabled={currentOptionIdx === 0} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", background: "white", cursor: currentOptionIdx > 0 ? "pointer" : "not-allowed", opacity: currentOptionIdx > 0 ? 1 : 0.5 }}>
                                    <ChevronLeft size={16} />
                                </button>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a431e" }}>
                                    Option {currentOptionIdx + 1} of {filteredOptions.length}
                                    {filteredOptions[currentOptionIdx]?.registrationsLeft !== undefined && (
                                        <span style={{ marginLeft: "12px", padding: "4px 10px", background: "#e8f5e8", borderRadius: "12px", fontSize: "12px", color: "#2d6a2d", border: "1px solid #c8e6c9" }}>
                                            {filteredOptions[currentOptionIdx].registrationsLeft} seats left
                                        </span>
                                    )}
                                </span>
                                <button onClick={() => setCurrentOptionIdx(prev => Math.min(filteredOptions.length - 1, prev + 1))} disabled={currentOptionIdx === filteredOptions.length - 1} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", background: "white", cursor: currentOptionIdx < filteredOptions.length - 1 ? "pointer" : "not-allowed", opacity: currentOptionIdx < filteredOptions.length - 1 ? 1 : 0.5 }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                            <button onClick={handleRegister} disabled={registering} style={{ padding: "10px 24px", borderRadius: "8px", background: "#1a431e", color: "white", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(26,67,30,0.2)" }}>
                                {registering ? <Loader2 size={16} className="lucide-spin" /> : <CheckCircle2 size={16} />}
                                {editingSchedule ? "Confirm New Schedule" : "Register This Schedule"}
                            </button>
                        </div>

                        {displayScheduleGrid(filteredOptions[currentOptionIdx]?.schedule || filteredOptions[currentOptionIdx], masterSlots)}

                        <div style={{ minHeight: "80px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "24px", gap: "16px", background: "white", padding: "12px 24px", borderRadius: "12px", border: "1px solid #eaeaea", width: "fit-content", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                                <button onClick={() => setCurrentOptionIdx(prev => Math.max(0, prev - 1))} disabled={currentOptionIdx === 0} style={{ padding: "6px 12px", borderRadius: "16px", border: "1px solid #ddd", background: "white", cursor: currentOptionIdx > 0 ? "pointer" : "not-allowed", opacity: currentOptionIdx > 0 ? 1 : 0.4, fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }}>
                                    Prev
                                </button>

                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#888", width: "20px", textAlign: "right" }}>1</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={filteredOptions.length - 1}
                                    value={currentOptionIdx}
                                    onChange={(e) => setCurrentOptionIdx(Number(e.target.value))}
                                    style={{ width: "240px", cursor: "pointer", accentColor: "#1a431e" }}
                                />
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#888", width: "26px", textAlign: "left" }}>{filteredOptions.length}</span>

                                <button onClick={() => setCurrentOptionIdx(prev => Math.min(filteredOptions.length - 1, prev + 1))} disabled={currentOptionIdx === filteredOptions.length - 1} style={{ padding: "6px 12px", borderRadius: "16px", border: "1px solid #ddd", background: "white", cursor: currentOptionIdx < filteredOptions.length - 1 ? "pointer" : "not-allowed", opacity: currentOptionIdx < filteredOptions.length - 1 ? 1 : 0.4, fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "40px", textAlign: "center", background: isBlocked ? "#fff5f5" : "#fafafa", borderRadius: "8px", border: `1px ${isBlocked ? 'solid #f5c6cb' : 'dashed #ddd'}` }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "17px", color: isBlocked ? "#c0392b" : "#555" }}>
                            {isBlocked ? "Schedule Cannot Be Completed" : "No schedule combinations available"}
                        </h3>
                        <p style={{ fontSize: "14px", color: isBlocked ? "#a94442" : "#888", margin: 0, whiteSpace: "pre-line", lineHeight: "1.8", maxWidth: "540px", marginLeft: "auto", marginRight: "auto" }}>
                            {infoMessage || "Try removing some day filters."}
                        </p>
                    </div>
                )}
            </div>
        );
    };


    const pageTitles = { home: "Home", profile: "My Profile", schedule: "My Schedule" };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f8fafb" }}>
            <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "fixed", top: "16px", left: "16px", zIndex: 1000, background: "#1a2e1a", border: "none", color: "white", padding: "8px", borderRadius: "8px" }}>
                <Menu size={24} />
            </button>
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }}
                />
            )}
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{
                width: "240px", height: "100vh", background: "#1a2e1a", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, zIndex: 999, boxSizing: "border-box", overflow: "hidden"
            }}>
                <div style={{ padding: "0 20px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CalendarDays size={18} color="white" />
                    </div>
                    <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>Student Portal</span>
                </div>

                <nav style={{ flex: 1, overflowY: "auto" }}>
                    {navItems.map(item => {
                        const isActive = activePage === item.key;
                        return (
                            <div key={item.key} onClick={() => setActivePage(item.key)}
                                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", margin: "2px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: isActive ? "600" : "400", color: isActive ? "white" : "#9abeaa", background: isActive ? "#1a431e" : "transparent", transition: "all 0.15s", userSelect: "none" }}>
                                {item.icon} {item.label}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ padding: "0 12px" }}>
                    <div style={{ borderTop: "1px solid #2a3e2a", paddingTop: "16px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px 14px" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#2d6a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "white", flexShrink: 0, overflow: "hidden", border: "2px solid #3d8a3d" }}>
                                {avatar ? (
                                    <img src={avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    studentName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{studentName}</div>
                                <div style={{ color: "#9abeaa", fontSize: "11px" }}>Student</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,136,136,0.2)", borderRadius: "10px", color: "#ff8a8a", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                        <button onClick={() => setShowSettings(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#9abeaa", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
                            <Settings size={16} /> Settings
                        </button>
                    </div>
                </div>
            </aside>

            {}
            <main className="main-content" style={{ flex: 1, background: "#f5f7f5", padding: "0 32px 32px", overflowY: "auto" }}>
                <div className="page-header" style={{ padding: "24px 0 20px" }}>
                    <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / Student Portal</div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>{pageTitles[activePage] || "My Schedule"}</h1>
                </div>
                {renderPageContent()}
            </main>
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            <Chatbot />
        </div>
    );
};

export default S_Dashboard;

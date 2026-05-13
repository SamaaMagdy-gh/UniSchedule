import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, Users, Database, Clock, Settings2 } from "lucide-react";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";

export default function GenerateTimetable() {
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
        const res = await fetch("https://unischedule2-production.up.railway.app/api/registration/status");
        const data = await res.json();
        setIsRegOpen(data.isRegistrationOpen);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  const handleToggle = async () => {
    setToggling(true);
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
        toast("Action forbidden. Ensure you are logged in as Admin.", "error");
      }
    } catch (err) {
      console.error(err);
    }
    setToggling(false);
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to RESET ALL registrations? This will clear all student schedules and set section enrollments to zero. This cannot be undone.")) {
      return;
    }

    setToggling(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch("https://unischedule2-production.up.railway.app/api/registration/reset", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast("All registrations have been reset successfully.", "success");
      } else {
        toast("Failed to reset registrations.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error connecting to server.", "error");
    }
    setToggling(false);
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}><Loader2 className="lucide-spin" size={40} color="#1a431e" /></div>;

  return (
    <div style={{ padding: "0 32px 32px", background: "#f5f7f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0 20px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>UniSchedule / System Settings</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0" }}>Registration Control Center</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>

        {}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: isRegOpen ? "#e8f5e8" : "#ffebee", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", transition: "all 0.3s" }}>
             <ShieldCheck size={40} color={isRegOpen ? "#2d6a2d" : "#c62828"} />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px", color: "#1a1a1a" }}>
              Student Registration Gateway
          </h2>
          <p style={{ fontSize: "15px", color: "#888", marginBottom: "32px", maxWidth: "340px", lineHeight: "1.6" }}>
              {isRegOpen 
                ? "The system is actively generating combinatorial schedules for students based on the Course sections configured." 
                : "The gateway is locked. Students can view their existing registered schedules but cannot browse or register for new combinations."}
          </p>

          <button onClick={handleToggle} disabled={toggling}
            style={{ 
                padding: "16px 32px", borderRadius: "12px", border: "none", 
                background: isRegOpen ? "#c62828" : "#1a431e", color: "white", 
                fontSize: "16px", fontWeight: "700", cursor: toggling ? "not-allowed" : "pointer", 
                display: "flex", alignItems: "center", gap: "10px", 
                transition: "all 0.2s", boxShadow: `0 8px 24px ${isRegOpen ? 'rgba(198,40,40,0.2)' : 'rgba(26,67,30,0.2)'}` 
            }}>
            {toggling ? <Loader2 size={20} className="lucide-spin" /> : <Settings2 size={20} />}
            {isRegOpen ? "Close Registration Gateway" : "Open Registration Gateway"}
          </button>

          <button onClick={handleReset} disabled={toggling}
            style={{ 
                marginTop: "16px", padding: "12px 24px", borderRadius: "10px", border: "1px solid #ffcdd2", 
                background: "rgba(255,205,210,0.1)", color: "#c62828", 
                fontSize: "14px", fontWeight: "600", cursor: toggling ? "not-allowed" : "pointer", 
                display: "flex", alignItems: "center", gap: "8px", 
                transition: "all 0.2s"
            }}>
            <Database size={16} /> Reset All Registrations
          </button>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Database size={18} color="#2d6a2d" />
                    </div>
                    <span style={{ fontWeight: "700", fontSize: "15px" }}>Architecture Logic</span>
                </div>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                    The system uses a Node.js Brute-force Cartesian Product algorithm. When the gateway is OPEN, any student logging in will trigger a live calculation of all possible non-conflicting schedules based entirely on the sections you provided in the <strong>Courses</strong> tab.
                </p>
            </div>

            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fcfdcf", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Users size={18} color="#c6a61f" />
                    </div>
                    <span style={{ fontWeight: "700", fontSize: "15px" }}>Seat Capacity</span>
                </div>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                    Capacities are handled completely automatically using MongoDB $inc validation. If a section's enrollment reaches its Max Capacity, it will instantaneously be mathematically excluded from any future student's possible schedule variations.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}

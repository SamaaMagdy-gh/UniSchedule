import { useState, useRef, useEffect } from "react";
import { Camera, Mail, IdCard, Shield, X, CheckCircle2, AlertCircle, Expand, Trash2 } from "lucide-react";
import API_BASE_URL from "../apiConfig";

 
export default function ProfilePage({ role = "student", extraFields = [] }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);  
  const fileRef = useRef();

   useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u.profileImage) setProfileImage(u.profileImage);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: "error", text: "Image must be smaller than 5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setUploading(true);
      setStatusMsg(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://unischedule2-production.up.railway.app/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profileImage: base64 }),
        });
        const data = await res.json();
        if (res.ok) {
          setProfileImage(base64);
          const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), profileImage: data.user.profileImage };
          localStorage.setItem("user", JSON.stringify(updated));
          setStatusMsg({ type: "success", text: "Profile photo updated successfully!" });
        } else {
          setStatusMsg({ type: "error", text: data.message || "Failed to upload photo." });
        }
      } catch {
        setStatusMsg({ type: "error", text: "Connection error. Please try again." });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

    setUploading(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://unischedule2-production.up.railway.app/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileImage: "" }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileImage(null);
        const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), profileImage: "" };
        localStorage.setItem("user", JSON.stringify(updated));
        setStatusMsg({ type: "success", text: "Profile photo removed successfully!" });
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to remove photo." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Connection error. Please try again." });
    }
    setUploading(false);
  };

  const roleLabels = { admin: "Administrator", student: "Student", teacher: "Instructor" };
  const roleColors = { admin: "#1a431e", student: "#1a3f7a", teacher: "#7a3a1a" };
  const roleBg = { admin: "#e8f5e8", student: "#e8f0ff", teacher: "#fff3e0" };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
      { }
      <div style={{
        height: "120px",
        background: "linear-gradient(135deg, #1a2e1a 0%, #2d6a2d 60%, #4a9a4a 100%)",
        position: "relative",
      }} />

       
      <div style={{ padding: "0 32px 32px", position: "relative" }}>
        
        <div style={{ position: "relative", display: "inline-block", marginTop: "-52px", marginBottom: "16px" }}>
          <div
            onClick={() => profileImage && setLightboxOpen(true)}
            style={{
              width: "104px", height: "104px", borderRadius: "50%",
              border: "4px solid white", background: profileImage ? "transparent" : "#2d6a2d",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", fontWeight: "700", color: "white",
              overflow: "hidden", cursor: profileImage ? "pointer" : "default",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              transition: "transform 0.2s",
            }}
            title={profileImage ? "Click to view full photo" : ""}
          >
            {profileImage
              ? <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initial
            }
          </div>
          
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            title="Change photo"
            style={{
              position: "absolute", bottom: "4px", right: "4px",
              width: "30px", height: "30px", borderRadius: "50%",
              background: uploading ? "#aaa" : "#1a2e1a",
              border: "2px solid white", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)", transition: "all 0.2s",
              zIndex: 10
            }}
          >
            <Camera size={14} color="white" />
          </button>

          {profileImage && (
            <button
              onClick={handleDeletePhoto}
              disabled={uploading}
              title="Delete photo"
              style={{
                position: "absolute", bottom: "4px", left: "-10px",
                width: "30px", height: "30px", borderRadius: "50%",
                background: "#e53e3e",
                border: "2px solid white", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: uploading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)", transition: "all 0.2s",
                zIndex: 10
              }}
            >
              <Trash2 size={14} color="white" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

          
          {profileImage && (
            <div
              onClick={() => setLightboxOpen(true)}
              style={{
                position: "absolute", top: "4px", right: "4px",
                background: "rgba(0,0,0,0.45)", borderRadius: "50%",
                width: "22px", height: "22px", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <Expand size={11} color="white" />
            </div>
          )}
        </div>

        
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 6px", color: "#1a1a1a" }}>{user.name || "—"}</h2>
          <span style={{
            display: "inline-block", padding: "4px 14px", borderRadius: "20px",
            background: roleBg[role], color: roleColors[role],
            fontSize: "12px", fontWeight: "700",
          }}>
            {roleLabels[role] || role}
          </span>
        </div>

        { }
        {statusMsg && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 14px", borderRadius: "8px", marginBottom: "20px",
            background: statusMsg.type === "success" ? "#f0faf0" : "#fff5f5",
            border: `1px solid ${statusMsg.type === "success" ? "#b2e8b2" : "#ffc0c0"}`,
            color: statusMsg.type === "success" ? "#1a6e1a" : "#c0392b",
            fontSize: "13px",
          }}>
            {statusMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {statusMsg.text}
          </div>
        )}

        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          {[
            { label: "Full Name", value: user.name, icon: <IdCard size={15} color="#1a431e" /> },
            { label: "Email Address", value: user.email, icon: <Mail size={15} color="#1a431e" /> },
            { label: "Role", value: roleLabels[role] || role, icon: <Shield size={15} color="#1a431e" /> },
            ...extraFields,
          ].map((field) => (
            <div key={field.label} style={{ padding: "14px 16px", background: "#f8faf8", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                {field.icon || null}
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase" }}>{field.label}</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{field.value || "—"}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#bbb", marginTop: "16px", marginBottom: 0 }}>
          Click the camera icon to update your profile photo. Click the photo to view it full size.
        </p>
      </div>

      { }
      {lightboxOpen && profileImage && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, backdropFilter: "blur(6px)", cursor: "zoom-out",
            padding: "32px",
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: "fixed", top: "20px", right: "20px",
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: "40px", height: "40px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 10000,
            }}
          >
            <X size={20} color="white" />
          </button>
          <img
            src={profileImage}
            alt="Full profile"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "85vh",
              borderRadius: "16px", boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              objectFit: "contain", cursor: "default",
            }}
          />
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { X, User, Lock, Sun, Moon, Globe, Camera, Eye, EyeOff, Check, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "./Toast.jsx";
import API_BASE_URL from "../apiConfig";

export default function SettingsModal({ onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [username, setUsername] = useState(user.name || "");
  const [email] = useState(user.email || "");
  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const fileRef = useRef();

   const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passStatus, setPassStatus] = useState(null);  
  const [passMsg, setPassMsg] = useState("");

   const [tab, setTab] = useState("profile");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Delete profile photo?")) return;
    setProfileImage("");
    const token = localStorage.getItem("token");
    const updated = { ...user, profileImage: "" };
    localStorage.setItem("user", JSON.stringify(updated));
    try {
      await fetch("https://unischedule2-production.up.railway.app/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileImage: "" })
      });
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://unischedule2-production.up.railway.app/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileImage: profileImage })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, profileImage: data.user.profileImage };
        localStorage.setItem("user", JSON.stringify(updated));
        setPassStatus(null);
        toast("Profile saved successfully!", "success");
      } else {
        toast(data.message || "Failed to save profile.", "error");
      }
    } catch (e) {
      toast("Connection error while saving profile.", "error");
    }
  };

  const handleChangePassword = async () => {
    setPassStatus(null);
    if (!oldPass || !newPass || !confirmPass) {
      setPassStatus("error"); setPassMsg("Please fill in all fields."); return;
    }
    if (newPass.length < 6) {
      setPassStatus("error"); setPassMsg("New password must be at least 6 characters."); return;
    }
    if (newPass !== confirmPass) {
      setPassStatus("error"); setPassMsg("New passwords do not match."); return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://unischedule2-production.up.railway.app/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassStatus("success"); setPassMsg("Password changed successfully!");
        setOldPass(""); setNewPass(""); setConfirmPass("");
      } else {
        setPassStatus("error"); setPassMsg(data.message || "Failed to change password.");
      }
    } catch {
      setPassStatus("error"); setPassMsg("Connection error. Check your backend.");
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: <User size={16} /> },
    { key: "security", label: "Security", icon: <Lock size={16} /> }
  ];

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "600",
    color: "#444", marginBottom: "6px",
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(4px)", padding: "16px",
      }}
    >
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "520px",
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        { }
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Settings</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", borderRadius: "6px", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        { }
        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "0 24px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "14px 16px", border: "none", background: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: tab === t.key ? "700" : "400",
              color: tab === t.key ? "#1a2e1a" : "#888",
              borderBottom: tab === t.key ? "2px solid #1a2e1a" : "2px solid transparent",
              marginBottom: "-1px", transition: "all 0.15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        { }
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          { }
          {tab === "profile" && (
            <div>
              { }
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "88px", height: "88px", borderRadius: "50%",
                    background: profileImage ? "transparent" : "#1a2e1a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "32px", fontWeight: "700", color: "white", overflow: "hidden",
                    border: "3px solid #e8f5e8",
                  }}>
                    {profileImage
                      ? <img src={profileImage} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (username.charAt(0).toUpperCase() || "U")
                    }
                  </div>
                  <button
                    onClick={() => fileRef.current.click()}
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "#1a2e1a", border: "2px solid white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}>
                    <Camera size={13} color="white" />
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleDeletePhoto}
                      style={{
                        position: "absolute", bottom: 0, left: -4,
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "#e53e3e", border: "2px solid white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}>
                      <Trash2 size={13} color="white" />
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </div>
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>Click the camera icon to change photo</p>
              </div>

              { }
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Display Name</label>
                <input value={username} disabled style={{ ...inputStyle, background: "#f9f9f9", color: "#999", cursor: "not-allowed" }} />
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Name cannot be changed here as it is linked to university records.</p>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email Address</label>
                <input value={email} disabled style={{ ...inputStyle, background: "#f9f9f9", color: "#999", cursor: "not-allowed" }} />
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Email cannot be changed here.</p>
              </div>

              <button onClick={handleSaveProfile} style={{
                width: "100%", padding: "11px", background: "#1a2e1a", color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer",
              }}>
                Save Profile
              </button>
            </div>
          )}

          { }
          {tab === "security" && (
            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>
                Choose a strong password with at least 6 characters.
              </p>

              { }
              {passStatus && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 14px", borderRadius: "8px", marginBottom: "20px",
                  background: passStatus === "success" ? "#f0faf0" : "#fff5f5",
                  border: `1px solid ${passStatus === "success" ? "#b2e8b2" : "#ffc0c0"}`,
                  color: passStatus === "success" ? "#1a6e1a" : "#c0392b",
                  fontSize: "13px",
                }}>
                  {passStatus === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
                  {passMsg}
                </div>
              )}

              {[
                { label: "Old Password", val: oldPass, set: setOldPass, show: showOld, setShow: setShowOld },
                { label: "New Password", val: newPass, set: setNewPass, show: showNew, setShow: setShowNew },
                { label: "Confirm New Password", val: confirmPass, set: setConfirmPass, show: showConfirm, setShow: setShowConfirm },
              ].map(({ label, val, set, show, setShow }) => (
                <div key={label} style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={show ? "text" : "password"} value={val}
                      onChange={e => set(e.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: "42px" }}
                      onFocus={e => e.target.style.borderColor = "#1a2e1a"}
                      onBlur={e => e.target.style.borderColor = "#ddd"}
                    />
                    <button onClick={() => setShow(!show)} style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#aaa",
                    }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={handleChangePassword} style={{
                width: "100%", padding: "11px", background: "#1a2e1a", color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px",
                cursor: "pointer", marginTop: "8px",
              }}>
                Change Password
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

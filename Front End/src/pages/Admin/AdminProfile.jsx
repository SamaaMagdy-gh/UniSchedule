import ProfilePage from "../../components/ProfilePage";

export default function AdminProfile() {
  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>My Profile</h1>
        <div style={{ color: "#888", fontSize: "13px" }}>View and update your administrator profile</div>
      </div>
      <ProfilePage role="admin" extraFields={[]} />
    </div>
  );
}

export default function DashboardCard({ icon, label, value, subtitle, change, changeColor }) {
  return (
    <div style={{
      backgroundColor: "white", borderRadius: "12px", padding: "24px",
      flex: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee", position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#f0f7f0",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "12px", fontWeight: "600", color: changeColor || (change?.startsWith("+") ? "#2d6a2d" : "#cc4444"),
          backgroundColor: change?.startsWith("+") ? "#f0f7f0" : "#fff0f0",
          padding: "2px 8px", borderRadius: "20px"
        }}>{change}</span>
      </div>
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#999" }}>{subtitle}</div>
    </div>
  );
}
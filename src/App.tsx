import { AppProvider, useApp } from "./context/AppContext";
import AuthFlow from "./auth/AuthFlow";
import CitizenDashboard from "./dashboards/CitizenDashboard";
import OfficialDashboard from "./dashboards/OfficialDashboard";
import UniversityDashboard from "./dashboards/UniversityDashboard";
import StaffDashboard from "./dashboards/StaffDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import IndustryDashboard from "./dashboards/IndustryDashboard";
import NotificationBell from "./components/NotificationBell";

const ROLE_META: Record<string, { label: string; color: string; icon: string }> = {
  citizen: { label: "Citizen Portal", color: "#003580", icon: "👤" },
  official: { label: "Government Official", color: "#1a5276", icon: "🏛️" },
  university: { label: "University / HEI", color: "#1e8449", icon: "🎓" },
  industry: { label: "Industry", color: "#d35400", icon: "🏭" },
  staff: { label: "CSC / Govt. Staff", color: "#7d3c98", icon: "🖥️" },
  admin: { label: "Administrator", color: "#b03a2e", icon: "⚙️" },
};

function Portal() {
  const { user, setUser } = useApp();

  if (!user) return <AuthFlow />;

  const meta = ROLE_META[user.role];

  const renderDashboard = () => {
    switch (user.role) {
      case "citizen": return <CitizenDashboard />;
      case "official": return <OfficialDashboard />;
      case "university": return <UniversityDashboard />;
      case "industry": return <IndustryDashboard />;
      case "staff": return <StaffDashboard />;
      case "admin": return <AdminDashboard />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* National Header */}
      <div style={{ background: "#003580", color: "rgba(255,255,255,0.8)", padding: "3px 16px", fontSize: 11, display: "flex", justifyContent: "space-between" }}>
        <span>भारत सरकार | Government of India — झारखंड सरकार | Government of Jharkhand</span>
        <div style={{ display: "flex", gap: 14 }}><span>English</span><span>हिन्दी</span><span>संताली</span></div>
      </div>

      {/* App Header */}
      <header style={{ background: "white", borderBottom: "3px solid #ff6600", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, background: "#003580", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🇮🇳</div>
          <div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontWeight: 700, fontSize: 19, color: "#003580", lineHeight: 1.1 }}>Jan Abhiyan</div>
            <div style={{ fontSize: 10, color: "#5a6675", fontWeight: 500, letterSpacing: "0.04em" }}>SOCIETAL INNOVATION COLLABORATION PORTAL — JHARKHAND</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: meta.color, color: "white", borderRadius: 3, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
            {meta.icon} {meta.label}
          </div>

          <NotificationBell role={user.role} />

          <div style={{ background: "#f0f2f5", border: "1px solid var(--border)", borderRadius: 3, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0d1b2a" }}>{user.name}</div>
              <div style={{ fontSize: 9, color: "#5a6675", fontFamily: "JetBrains Mono, monospace" }}>{user.virtualId}</div>
            </div>
            <button
              onClick={() => setUser(null)}
              title="Logout"
              style={{ background: "#c0392b", color: "white", border: "none", borderRadius: 2, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {renderDashboard()}
      </main>

      <footer style={{ background: "#003580", color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center", padding: "6px 16px" }}>
        © 2024 Jan Abhiyan — Jharkhand Government | NIC Jharkhand | Help: 1800-XXX-XXXX
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Portal />
    </AppProvider>
  );
}

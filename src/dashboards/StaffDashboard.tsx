import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Problem } from "../context/AppContext";

const CATEGORIES = [
  "Pothole / Road Damage", "Garbage / Sanitation", "Streetlight", "Water Leakage",
  "Drain Blockage", "Water Scarcity", "Electricity Failure", "Tree Fall",
  "Agri-tech Problem", "Health Innovation", "Renewable Energy", "Accessibility Issue",
];

const DISTRICTS = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Deoghar", "Hazaribagh", "Dumka", "Giridih", "Gumla", "Simdega", "Lohardaga", "Khunti", "West Singhbhum", "Koderma", "Chatra", "Palamu"];

const INNOVATION_CATEGORIES = new Set(["Water Scarcity", "Agri-tech Problem", "Health Innovation", "Renewable Energy"]);

export default function StaffDashboard() {
  const { user, problems, addProblem, addNotification, logAudit } = useApp();
  const [tab, setTab] = useState<"register" | "list">("register");
  const [form, setForm] = useState({ name: "", phone: "", district: "", block: "", category: "", issue: "", lang: "hindi" });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const cscProblems = problems.filter(p => p.source === "csc");
  const todayCount = cscProblems.length;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JA-2024-${String(Math.floor(Math.random() * 900) + 150).padStart(5, "0")}`;
    const isInnovation = INNOVATION_CATEGORIES.has(form.category);
    const newProblem: Problem = {
      id: newId,
      title: form.issue,
      description: `[Assisted Registration by ${user?.name}] ${form.issue}`,
      category: form.category,
      domain: form.category,
      district: form.district,
      block: form.block,
      source: "csc",
      citizenVirtualId: `CSC-${form.phone}`,
      citizenName: form.name,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
      priority: "Medium",
      track: isInnovation ? "Innovation Route" : "Simple Civic",
    };
    addProblem(newProblem);
    addNotification({ forRole: "official", type: "info", title: "CSC-Assisted Issue Registered", message: `${user?.name} (CSC) registered issue for citizen ${form.name}, District: ${form.district}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "staff", action: "CSC_ISSUE_REGISTERED", entity: "Problem", entityId: newId, details: `Citizen: ${form.name}, Phone: ${form.phone}, Category: ${form.category}` });
    setSubmitted(newId);
    setForm({ name: "", phone: "", district: "", block: "", category: "", issue: "", lang: "hindi" });
  };

  const filteredProblems = cscProblems.filter(p =>
    !search || p.citizenName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    (p.citizenVirtualId?.includes(search))
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div style={{ background: "#7d3c98", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>CSC / Panchayat Bhawan — Staff Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Operator: {user?.name} | {user?.district} | {user?.organization ?? "CSC"}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["Registered Today", todayCount], ["This Month", 87], ["Total (Session)", todayCount]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fdf0ff", border: "1px solid #c39bd3", borderRadius: 4, padding: "8px 14px", marginBottom: 16, fontSize: 12, color: "#5b2c6f" }}>
        🖥️ <strong>Assisted Reporting:</strong> Register issues on behalf of citizens who cannot use the mobile app. A printed receipt with Reference ID will be generated for the citizen.
      </div>

      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 20 }}>
        {[{ id: "register", label: "📝 Register Citizen Issue", hindi: "नागरिक पंजीकरण" }, { id: "list", label: "📋 Registration History", hindi: "पंजीकृत सूची" }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as "register" | "list"); setSubmitted(null); }} style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: tab === t.id ? "#7d3c98" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none" }}>
            {t.label}
            <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.75 }}>{t.hindi}</div>
          </button>
        ))}
      </div>

      {tab === "register" && (
        submitted ? (
          <div style={{ background: "#f5eef8", border: "1px solid #7d3c98", borderRadius: 4, padding: 24, textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 40 }}>🖨️</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#7d3c98", marginTop: 8 }}>Registration Successful!</div>
            <div style={{ fontSize: 16, marginTop: 8, fontWeight: 700 }}>Reference ID: <span style={{ color: "#003580", fontFamily: "JetBrains Mono, monospace" }}>{submitted}</span></div>
            <div style={{ marginTop: 8, background: "white", border: "1px dashed #7d3c98", borderRadius: 3, padding: 12, fontSize: 12, color: "#5a6675" }}>
              Print this receipt and hand it to the citizen. They can track status at any CSC or by calling 1800-XXX-XXXX.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
              <button onClick={() => setSubmitted(null)} style={{ background: "#7d3c98", color: "white", border: "none", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Register Another →</button>
              <button onClick={() => setTab("list")} style={{ background: "transparent", border: "1.5px solid #7d3c98", color: "#7d3c98", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>View History</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#7d3c98" }}>Citizen Information</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["hindi", "हिन्दी"], ["english", "English"], ["santali", "संताली"]].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setForm({ ...form, lang: id })} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: form.lang === id ? "#7d3c98" : "white", color: form.lang === id ? "white" : "#7d3c98", border: "1.5px solid #7d3c98", borderRadius: 2 }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <SF label="Citizen Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="As per ID / verbal" required />
                <SF label="Mobile Number *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="10-digit number" required type="tel" />
                <div>
                  <label style={SLS}>District *</label>
                  <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required style={SIS}>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <SF label="Block / Village" value={form.block} onChange={v => setForm({ ...form, block: v })} placeholder="Block or village name" />
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18, marginTop: 14 }}>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#7d3c98", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>Issue Details</div>
              <div>
                <label style={SLS}>Issue Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={SIS}>
                  <option value="">Select Category</option>
                  <optgroup label="Simple Civic">{["Pothole / Road Damage", "Garbage / Sanitation", "Streetlight", "Water Leakage", "Drain Blockage", "Electricity Failure", "Tree Fall"].map(c => <option key={c}>{c}</option>)}</optgroup>
                  <optgroup label="Innovation Route">{["Water Scarcity", "Agri-tech Problem", "Health Innovation", "Renewable Energy", "Accessibility Issue"].map(c => <option key={c}>{c}</option>)}</optgroup>
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={SLS}>Issue Description (as told by citizen) *</label>
                <textarea value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} required rows={3} placeholder="Describe the issue as explained by the citizen..." style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12, background: "#fdf0ff", border: "1px solid #c39bd3", borderRadius: 3, padding: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["📷 Attach Photo", "📍 Mark GPS Location"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" />{opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" onClick={() => setForm({ name: "", phone: "", district: "", block: "", category: "", issue: "", lang: "hindi" })} style={{ background: "transparent", border: "1.5px solid #7d3c98", color: "#7d3c98", borderRadius: 3, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Clear</button>
              <button type="submit" style={{ background: "#7d3c98", color: "white", border: "none", borderRadius: 3, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Register & Print Receipt →</button>
            </div>
          </form>
        )
      )}

      {tab === "list" && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or reference ID..." style={{ width: "100%", maxWidth: 360, border: "1px solid var(--border)", borderRadius: 3, padding: "7px 12px", fontSize: 13 }} />
          </div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#7d3c98", color: "white" }}>
                  {["Issue ID", "Name", "Phone", "District", "Category", "Track", "Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", color: "#5a6675" }}>No registrations found. Register issues using the form above.</td></tr>
                )}
                {filteredProblems.map((rec, idx) => (
                  <tr key={rec.id} style={{ background: idx % 2 === 0 ? "white" : "#faf5ff", borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", color: "#7d3c98", fontWeight: 600, fontSize: 10 }}>{rec.id}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{rec.citizenName}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{rec.citizenVirtualId?.replace("CSC-", "") ?? "—"}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{rec.district}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{rec.category}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, background: rec.track === "Simple Civic" ? "#e8f4fd" : "#f3e5f5", color: rec.track === "Simple Civic" ? "#2980b9" : "#7b1fa2", borderRadius: 2, padding: "1px 7px", fontWeight: 700 }}>{rec.track}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#5a6675", whiteSpace: "nowrap" }}>{rec.date}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, background: rec.status === "Resolved" ? "#e8f5e9" : "#fff3e0", color: rec.status === "Resolved" ? "#2e7d32" : "#e67e22", borderRadius: 2, padding: "2px 8px", fontWeight: 700 }}>{rec.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 12, color: "#5a6675", marginTop: 8 }}>{filteredProblems.length} records found</div>
        </div>
      )}
    </div>
  );
}

const SLS: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 };
const SIS: React.CSSProperties = { width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" };

function SF({ label, value, onChange, placeholder, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label style={SLS}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={SIS} />
    </div>
  );
}

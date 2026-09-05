import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Problem } from "../context/AppContext";

const ISSUE_CATEGORIES = [
  "Pothole / Road Damage", "Garbage / Sanitation", "Streetlight", "Water Leakage",
  "Drain Blockage", "Water Scarcity", "Electricity Failure", "Tree Fall",
  "Agri-tech Problem", "Health Innovation", "Renewable Energy", "Accessibility Issue",
];

const INNOVATION_CATEGORIES = new Set(["Water Scarcity", "Agri-tech Problem", "Health Innovation", "Renewable Energy"]);

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Pending": { bg: "#fff3e0", color: "#e67e22" },
  "Assigned": { bg: "#e3f2fd", color: "#1565c0" },
  "In Progress": { bg: "#e8f4fd", color: "#2980b9" },
  "University Routed": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Resolved": { bg: "#e8f5e9", color: "#2e7d32" },
  "Closed": { bg: "#f0f2f5", color: "#5a6675" },
};

const DISTRICTS = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Deoghar", "Hazaribagh", "Dumka", "Giridih", "Gumla", "Simdega", "Lohardaga", "Khunti", "West Singhbhum"];

export default function CitizenDashboard() {
  const { user, problems, addProblem, addNotification, logAudit, teams } = useApp();
  const [tab, setTab] = useState<"home" | "report" | "myissues" | "track">("home");
  const [form, setForm] = useState({ district: "", block: "", category: "", title: "", description: "", location: "" });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<Problem | null | "not_found">(null);

  const myIssues = problems.filter(p => p.citizenVirtualId === user?.virtualId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JA-2024-${String(Math.floor(Math.random() * 900) + 150).padStart(5, "0")}`;
    const isInnovation = INNOVATION_CATEGORIES.has(form.category);
    const newProblem: Problem = {
      id: newId,
      title: form.title,
      description: form.description,
      category: form.category,
      domain: form.category,
      district: form.district || user?.district || "Ranchi",
      block: form.block,
      source: "citizen",
      citizenVirtualId: user!.virtualId,
      citizenName: user!.name,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
      priority: "Medium",
      track: isInnovation ? "Innovation Route" : "Simple Civic",
    };
    addProblem(newProblem);
    addNotification({ forRole: "official", type: "info", title: "New Issue Reported", message: `Citizen ${user?.name} reported: ${form.title} in ${newProblem.district}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "citizen", action: "ISSUE_SUBMITTED", entity: "Problem", entityId: newId, details: `Category: ${form.category}, District: ${newProblem.district}` });
    setSubmitted(newId);
    setForm({ district: "", block: "", category: "", title: "", description: "", location: "" });
  };

  const TABS = [
    { id: "home", label: "🏠 Home" },
    { id: "report", label: "📋 Report Issue" },
    { id: "myissues", label: `📂 My Issues (${myIssues.length})` },
    { id: "track", label: "🔍 Track Status" },
  ] as const;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div style={{ background: "#003580", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>नागरिक पोर्टल — Citizen Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Welcome, {user?.name} | District: {user?.district ?? "—"}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["Total", myIssues.length], ["Resolved", myIssues.filter(i => i.status === "Resolved").length], ["Pending", myIssues.filter(i => i.status === "Pending").length]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 3, padding: "6px 12px", textAlign: "center", minWidth: 58 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#e8f4fd", border: "1px solid #a9d0f5", borderRadius: 4, padding: "8px 14px", marginBottom: 16, fontSize: 12, color: "#1565c0" }}>
        💡 <strong>Dual-Track AI System:</strong> Simple civic issues go to <strong>Government Officers</strong> for quick resolution. Complex problems (water scarcity, health, energy, agri-tech) are automatically routed to <strong>University Research Teams</strong>.
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSubmitted(null); }} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: tab === t.id ? "#003580" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div>
          {/* State-wide counts */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 14 }}>🗺️ Jharkhand — State-wide Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { label: "Total Problems Reported", value: problems.length, color: "#003580", icon: "📋" },
                { label: "Solved / Resolved", value: problems.filter(p => p.status === "Resolved").length, color: "#138808", icon: "✅" },
                { label: "Under Innovation", value: problems.filter(p => p.track === "Innovation Route").length, color: "#7b1fa2", icon: "💡" },
                { label: "Assigned to Depts", value: problems.filter(p => p.status === "Assigned" || p.status === "In Progress").length, color: "#2980b9", icon: "🏛️" },
                { label: "University Teams", value: teams.length, color: "#1e8449", icon: "🎓" },
                { label: "Pending Review", value: problems.filter(p => p.status === "Pending").length, color: "#e67e22", icon: "⏳" },
              ].map(item => (
                <div key={item.label} style={{ background: item.color + "0d", border: `1.5px solid ${item.color}40`, borderRadius: 4, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 24, fontWeight: 700, color: item.color, lineHeight: 1.1, marginTop: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#5a6675", fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#003580", marginBottom: 6 }}>Resolution Progress</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, background: "#e8ecf0", borderRadius: 3, height: 10 }}>
                  <div style={{ width: `${Math.round((problems.filter(p => p.status === "Resolved").length / Math.max(problems.length, 1)) * 100)}%`, background: "#138808", height: "100%", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#138808", minWidth: 40 }}>
                  {Math.round((problems.filter(p => p.status === "Resolved").length / Math.max(problems.length, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "📋", title: "Report a New Issue", desc: "File a complaint or civic issue", action: () => setTab("report"), color: "#003580" },
              { icon: "📂", title: "My Issues", desc: "View all your filed complaints", action: () => setTab("myissues"), color: "#1565c0" },
              { icon: "🔍", title: "Track Status", desc: "Track any issue by reference ID", action: () => setTab("track"), color: "#138808" },
            ].map(card => (
              <button key={card.title} onClick={card.action} style={{ background: "white", border: `1.5px solid ${card.color}`, borderRadius: 4, padding: 18, cursor: "pointer", textAlign: "left", transition: "transform 0.1s" }}>
                <div style={{ fontSize: 28 }}>{card.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: card.color, marginTop: 6 }}>{card.title}</div>
                <div style={{ fontSize: 12, color: "#5a6675", marginTop: 3 }}>{card.desc}</div>
              </button>
            ))}
          </div>
          {myIssues.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 10 }}>Recent Issues</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myIssues.slice(0, 3).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "report" && (
        submitted ? (
          <div style={{ background: "#eafaf1", border: "1px solid #138808", borderRadius: 4, padding: 24, textAlign: "center", maxWidth: 460 }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#138808", marginTop: 8 }}>Issue Registered!</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>Reference ID: <span style={{ color: "#003580", fontFamily: "JetBrains Mono, monospace" }}>{submitted}</span></div>
            <div style={{ fontSize: 12, color: "#5a6675", marginTop: 6 }}>An SMS acknowledgment has been sent to your registered mobile number.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={() => setSubmitted(null)} style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Report Another</button>
              <button onClick={() => setTab("myissues")} style={{ background: "transparent", border: "1.5px solid #003580", color: "#003580", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>View My Issues</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 3, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#2e7d32" }}>
              ✓ Your name, phone number, and Aadhaar are already linked to your account. No need to re-enter them.
            </div>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18, marginBottom: 14 }}>
              <SectionHead title="Location Details" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>District *</label>
                  <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required style={inputStyle}>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <FField label="Block / Village" value={form.block} onChange={v => setForm({ ...form, block: v })} placeholder="Block or village name" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <FField label="Exact Location / Address *" value={form.location} onChange={v => setForm({ ...form, location: v })} placeholder="Landmark or street address" required />
                </div>
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
              <SectionHead title="Issue Details" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Issue Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={inputStyle}>
                    <option value="">Select Category</option>
                    <optgroup label="Simple Civic Issues">
                      {["Pothole / Road Damage", "Garbage / Sanitation", "Streetlight", "Water Leakage", "Drain Blockage", "Electricity Failure", "Tree Fall"].map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Innovation Route (University Team)">
                      {["Water Scarcity", "Agri-tech Problem", "Health Innovation", "Renewable Energy", "Accessibility Issue"].map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                  </select>
                  {form.category && (
                    <div style={{ fontSize: 10, marginTop: 3, color: INNOVATION_CATEGORIES.has(form.category) ? "#7b1fa2" : "#2980b9", fontWeight: 600 }}>
                      {INNOVATION_CATEGORIES.has(form.category) ? "🎓 Will be routed to University Research Team" : "🏛️ Will be assigned to Government Officer"}
                    </div>
                  )}
                </div>
                <FField label="Issue Title *" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Brief title of the issue" required />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Detailed Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={4} placeholder="Describe the issue in detail. How long has it existed? Who is affected? Any previous complaints?" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12, background: "#f0f5ff", border: "1px solid #c5d4f0", borderRadius: 3, padding: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["📷 Attach Photo", "🎤 Voice Note", "📍 GPS Location"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" />{opt}
                  </label>
                ))}
                <span style={{ fontSize: 11, color: "#7a8696" }}>Works offline — syncs when connected</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" onClick={() => setForm({ district: "", block: "", category: "", title: "", description: "", location: "" })} style={{ background: "transparent", border: "1.5px solid #003580", color: "#003580", borderRadius: 3, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Clear</button>
              <button type="submit" style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "8px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Issue →</button>
            </div>
          </form>
        )
      )}

      {tab === "myissues" && (
        <div>
          {myIssues.length === 0 ? (
            <div style={{ textAlign: "center", color: "#5a6675", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4 }}>
              <div style={{ fontSize: 36 }}>📭</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>No issues filed yet. <button onClick={() => setTab("report")} style={{ background: "none", border: "none", color: "#003580", fontWeight: 700, cursor: "pointer" }}>Report your first issue →</button></div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myIssues.map(issue => <IssueCard key={issue.id} issue={issue} expanded />)}
            </div>
          )}
        </div>
      )}

      {tab === "track" && (
        <div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 20, maxWidth: 440 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 10 }}>Track Issue by Reference ID</div>
            <FField label="Reference ID" value={trackId} onChange={setTrackId} placeholder="e.g. JA-2024-00142" />
            <button onClick={() => { const f = problems.find(p => p.id.toLowerCase() === trackId.toLowerCase().trim()); setTrackResult(f ?? "not_found"); }} style={{ marginTop: 10, width: "100%", background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              🔍 Track
            </button>
          </div>
          {trackResult && trackResult !== "not_found" && (
            <div style={{ marginTop: 14, background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
              <IssueCard issue={trackResult} expanded />
            </div>
          )}
          {trackResult === "not_found" && (
            <div style={{ marginTop: 12, background: "#fdf0f0", border: "1px solid #e74c3c", borderRadius: 3, padding: 14, fontSize: 13, color: "#c0392b" }}>❌ No issue found with this Reference ID.</div>
          )}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue, expanded = false }: { issue: Problem; expanded?: boolean }) {
  const sc = STATUS_COLORS[issue.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#003580", fontWeight: 600 }}>{issue.id}</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{issue.title}</div>
          <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{issue.category} • {issue.district} • {issue.date}</div>
          {expanded && issue.description && <div style={{ fontSize: 12, color: "#5a6675", marginTop: 6, lineHeight: 1.5 }}>{issue.description}</div>}
          <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: issue.track === "Simple Civic" ? "#e8f4fd" : "#f3e5f5", color: issue.track === "Simple Civic" ? "#2980b9" : "#7b1fa2", border: `1px solid ${issue.track === "Simple Civic" ? "#a9d0f5" : "#ce93d8"}`, borderRadius: 2, padding: "1px 8px", fontWeight: 600 }}>
              {issue.track}
            </span>
            {issue.assignedTo && <span style={{ fontSize: 10, color: "#5a6675" }}>Assigned: {issue.assignedTo}</span>}
          </div>
        </div>
        <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "4px 12px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{issue.status}</span>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "7px 10px", fontSize: 13, background: "white" };

function SectionHead({ title }: { title: string }) {
  return <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#003580", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>{title}</div>;
}

function FField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}

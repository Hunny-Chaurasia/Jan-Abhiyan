import { useState } from "react";
import { useApp } from "../context/AppContext";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function AdminDashboard() {
  const { user, problems, tasks, teams, collabRequests, opportunities, auditLog, notifications } = useApp();
  const [tab, setTab] = useState<"overview" | "problems" | "users" | "universities" | "industry" | "audit" | "analytics">("overview");
  const [search, setSearch] = useState("");

  const stats = {
    totalProblems: problems.length,
    resolved: problems.filter(p => p.status === "Resolved").length,
    pending: problems.filter(p => p.status === "Pending").length,
    innovative: problems.filter(p => p.track === "Innovation Route").length,
    teams: teams.length,
    tasks: tasks.length,
    collabs: collabRequests.length,
    opportunities: opportunities.length,
    notifications: notifications.filter(n => !n.read).length,
  };

  const DEMO_USERS = [
    { virtualId: "JA-C-00023", name: "Ramesh Kumar Singh", role: "Citizen", district: "Ranchi", status: "Active", verified: true, lastLogin: "23 Aug 2024" },
    { virtualId: "JA-C-00031", name: "Priya Devi", role: "Citizen", district: "Ranchi", status: "Active", verified: true, lastLogin: "22 Aug 2024" },
    { virtualId: "JA-O-00001", name: "Arvind Kumar IAS", role: "Govt. Official", district: "Ranchi", status: "Active", verified: true, lastLogin: "23 Aug 2024" },
    { virtualId: "JA-U-00001", name: "Dr. Anita Sharma", role: "University", district: "Ranchi", status: "Active", verified: true, lastLogin: "23 Aug 2024" },
    { virtualId: "JA-I-00001", name: "Rajesh Verma", role: "Industry", district: "—", status: "Active", verified: true, lastLogin: "22 Aug 2024" },
    { virtualId: "JA-S-00001", name: "Ramani Devi", role: "CSC Staff", district: "Simdega", status: "Active", verified: true, lastLogin: "23 Aug 2024" },
  ];

  const DISTRICTS_DATA = [
    { name: "Ranchi", total: 4, resolved: 2, rate: 50 },
    { name: "Khunti", total: 1, resolved: 0, rate: 0 },
    { name: "Simdega", total: 1, resolved: 0, rate: 0 },
    { name: "West Singhbhum", total: 1, resolved: 0, rate: 0 },
  ];

  const filteredProblems = problems.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "overview", label: "📊 Overview" },
    { id: "problems", label: `📋 All Issues (${problems.length})` },
    { id: "users", label: `👥 Users (${DEMO_USERS.length})` },
    { id: "universities", label: `🎓 Universities (${teams.length} teams)` },
    { id: "industry", label: `🏭 Industry (${collabRequests.length} collabs)` },
    { id: "audit", label: `📜 Audit Log (${auditLog.length})` },
    { id: "analytics", label: "📈 Analytics" },
  ] as const;

  const STATUS_PILL = (status: string) => {
    const m: Record<string, { bg: string; color: string }> = {
      "Pending": { bg: "#fff3e0", color: "#e67e22" }, "Assigned": { bg: "#e3f2fd", color: "#1565c0" },
      "In Progress": { bg: "#e8f4fd", color: "#2980b9" }, "University Routed": { bg: "#f3e5f5", color: "#7b1fa2" },
      "Resolved": { bg: "#e8f5e9", color: "#2e7d32" }, "Closed": { bg: "#f0f2f5", color: "#5a6675" },
      "Active": { bg: "#e8f5e9", color: "#2e7d32" }, "Inactive": { bg: "#fdf0f0", color: "#c0392b" },
      "Proposed": { bg: "#fff8e1", color: "#f39c12" }, "Approved": { bg: "#e3f2fd", color: "#1565c0" },
      "Submitted": { bg: "#f3e5f5", color: "#7b1fa2" }, "Implemented": { bg: "#e0f2f1", color: "#00796b" },
      "Pending Collab": { bg: "#fff8e1", color: "#f39c12" }, "Accepted": { bg: "#e8f5e9", color: "#2e7d32" },
    };
    const s = m[status] ?? { bg: "#f0f2f5", color: "#5a6675" };
    return <span style={{ background: s.bg, color: s.color, borderRadius: 2, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{status}</span>;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div style={{ background: "#b03a2e", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>System Administrator Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Jan Abhiyan — Complete System View | {user?.organization ?? "Govt. of Jharkhand"}</div>
        </div>
        <div style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "6px 14px" }}>
          Last sync: {new Date().toLocaleString("en-IN")} | <strong>{stats.notifications} unread alerts</strong>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total Issues", value: stats.totalProblems, color: "#003580", icon: "📋" },
          { label: "Resolved", value: stats.resolved, color: "#138808", icon: "✅" },
          { label: "Pending", value: stats.pending, color: "#e67e22", icon: "⏳" },
          { label: "Innovation Cases", value: stats.innovative, color: "#8e44ad", icon: "💡" },
          { label: "Research Teams", value: stats.teams, color: "#1e8449", icon: "👥" },
          { label: "Tasks Assigned", value: stats.tasks, color: "#1565c0", icon: "🗂️" },
          { label: "Industry Collabs", value: stats.collabs, color: "#d35400", icon: "🤝" },
          { label: "Opportunities", value: stats.opportunities, color: "#2980b9", icon: "🎯" },
        ].map(m => (
          <div key={m.label} style={{ background: "white", border: `2px solid ${m.color}`, borderRadius: 4, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 24, fontWeight: 700, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: "#5a6675", fontWeight: 600, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: "10px 16px", marginBottom: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#003580" }}>System Health</span>
        {[["API Gateway", true], ["AI Engine", true], ["MongoDB Atlas", true], ["Notification Service", false], ["File Storage", true], ["Auth Service", true]].map(([s, ok]) => (
          <div key={s as string} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "#138808" : "#e67e22" }} />
            <span style={{ fontSize: 11, color: "#5a6675" }}>{s as string}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: ok ? "#138808" : "#e67e22" }}>{ok ? "Online" : "Degraded"}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#5a6675" }}>Uptime: <strong style={{ color: "#138808" }}>99.4%</strong> | Active: <strong>247</strong></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: tab === t.id ? "#b03a2e" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none", whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 12 }}>Dual-Track Distribution</div>
            {[["Simple Civic", problems.filter(p => p.track === "Simple Civic").length, "#2980b9"], ["Innovation Route", problems.filter(p => p.track === "Innovation Route").length, "#8e44ad"]].map(([l, v, c]) => (
              <div key={l as string} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{l as string}</span>
                  <span style={{ color: "#5a6675" }}>{v as number} issues ({Math.round((v as number / Math.max(problems.length, 1)) * 100)}%)</span>
                </div>
                <div style={{ background: "#e8ecf0", borderRadius: 2, height: 10 }}>
                  <div style={{ width: `${Math.round((v as number / Math.max(problems.length, 1)) * 100)}%`, background: c as string, height: "100%", borderRadius: 2 }} />
                </div>
              </div>
            ))}

            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginTop: 18, marginBottom: 12 }}>District Resolution</div>
            {DISTRICTS_DATA.map(d => (
              <div key={d.name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: "#5a6675" }}>{d.resolved}/{d.total} resolved <strong style={{ color: d.rate > 50 ? "#138808" : "#e67e22" }}>({d.rate}%)</strong></span>
                </div>
                <div style={{ background: "#e8ecf0", borderRadius: 2, height: 8 }}>
                  <div style={{ width: `${d.rate}%`, background: d.rate > 50 ? "#138808" : "#e67e22", height: "100%", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 12 }}>AI Classification Engine</div>
              {[["Classification Accuracy", "94.7%", "#138808"], ["Avg. Routing Time", "0.8 sec", "#2980b9"], ["Deduplication Rate", "87%", "#8e44ad"], ["Multilingual Queries", "18%", "#e67e22"], ["Total Processed Today", "42", "#003580"]].map(([l, v, c]) => (
                <div key={l as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "7px 0", borderBottom: "1px solid #f0f2f5" }}>
                  <span style={{ color: "#5a6675" }}>{l as string}</span>
                  <span style={{ fontWeight: 700, color: c as string, fontSize: 15 }}>{v as string}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#003580", marginBottom: 12 }}>Ecosystem Activity</div>
              {[["University Teams Active", teams.filter(t => t.status === "Active").length, "#1e8449"], ["Industry Collab Requests", collabRequests.length, "#d35400"], ["Student Opportunities", opportunities.length, "#2980b9"], ["Pending Notifications", stats.notifications, "#e67e22"]].map(([l, v, c]) => (
                <div key={l as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "7px 0", borderBottom: "1px solid #f0f2f5" }}>
                  <span style={{ color: "#5a6675" }}>{l as string}</span>
                  <span style={{ fontWeight: 700, color: c as string, fontSize: 15 }}>{v as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL ISSUES */}
      {tab === "problems" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or ID..." style={{ border: "1px solid var(--border)", borderRadius: 3, padding: "6px 12px", fontSize: 12, width: 280 }} />
            <div style={{ fontSize: 12, color: "#5a6675" }}>{filteredProblems.length} issues</div>
          </div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#b03a2e", color: "white" }}>
                  {["Issue ID", "Title", "Category", "District", "Citizen", "Track", "Priority", "Status", "Assigned To"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((p, idx) => (
                  <tr key={p.id} style={{ background: idx % 2 === 0 ? "white" : "#fdf5f5", borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#b03a2e", fontWeight: 700 }}>{p.id}</td>
                    <td style={{ padding: "8px 12px", maxWidth: 200 }}>{p.title}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{p.category}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{p.district}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675", fontSize: 10 }}>{p.citizenName}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, background: p.track === "Simple Civic" ? "#e8f4fd" : "#f3e5f5", color: p.track === "Simple Civic" ? "#2980b9" : "#7b1fa2", borderRadius: 2, padding: "1px 7px", fontWeight: 700 }}>{p.track}</span>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, color: p.priority === "High" ? "#c0392b" : p.priority === "Medium" ? "#e67e22" : "#27ae60" }}>{p.priority}</td>
                    <td style={{ padding: "8px 12px" }}>{STATUS_PILL(p.status)}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675", fontSize: 10 }}>{p.assignedTo ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#5a6675" }}>Total registered: <strong>2,847</strong> (showing demo accounts)</div>
            <button style={{ background: "#b03a2e", color: "white", border: "none", borderRadius: 3, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Register User</button>
          </div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#b03a2e", color: "white" }}>
                  {["Virtual ID", "Name", "Role", "District / Org.", "Verified", "Status", "Last Login", "Actions"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map((u, idx) => (
                  <tr key={u.virtualId} style={{ background: idx % 2 === 0 ? "white" : "#fdf5f5", borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#b03a2e", fontWeight: 700 }}>{u.virtualId}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ background: "#f0f2f5", borderRadius: 2, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#5a6675" }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#5a6675" }}>{u.district}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 11, color: u.verified ? "#138808" : "#c0392b", fontWeight: 700 }}>{u.verified ? "✓ Verified" : "✗ Pending"}</span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>{STATUS_PILL(u.status)}</td>
                    <td style={{ padding: "8px 12px", color: "#5a6675", fontSize: 10, whiteSpace: "nowrap" }}>{u.lastLogin}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button style={{ background: "#003580", color: "white", border: "none", borderRadius: 2, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Edit</button>
                        <button style={{ background: "#c0392b", color: "white", border: "none", borderRadius: 2, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Disable</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNIVERSITIES */}
      {tab === "universities" && (
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1e8449", marginBottom: 12 }}>Registered Teams & Projects</div>
          {teams.map(team => (
            <div key={team.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1e8449", fontWeight: 700 }}>{team.id}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{team.teamName} — {team.universityName}</div>
                  <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{team.department} | Leader: {team.teamLeader} | {team.teamSize} members</div>
                  <div style={{ fontSize: 12, color: "#1e8449", marginTop: 2 }}>Problem: {team.problemTitle}</div>
                  <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Mentor: <strong>{team.mentorName}</strong> ({team.mentorType})</div>
                  <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Timeline: {team.startDate} → {team.expectedCompletionDate}</div>
                  {team.technologies && <div style={{ fontSize: 11, color: "#7a8696", marginTop: 2 }}>Tech: {team.technologies}</div>}
                </div>
                <div>
                  {(() => { const sc: Record<string, { bg: string; color: string }> = { "Proposed": { bg: "#fff8e1", color: "#f39c12" }, "Approved": { bg: "#e3f2fd", color: "#1565c0" }, "Active": { bg: "#e8f5e9", color: "#2e7d32" }, "Submitted": { bg: "#f3e5f5", color: "#7b1fa2" }, "Implemented": { bg: "#e0f2f1", color: "#00796b" } }; const s = sc[team.status] ?? { bg: "#f0f2f5", color: "#5a6675" }; return <span style={{ background: s.bg, color: s.color, borderRadius: 3, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{team.status}</span>; })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INDUSTRY */}
      {tab === "industry" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#d35400", marginBottom: 12 }}>Collaboration Requests</div>
            {collabRequests.map(req => {
              const scMap: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff8e1", color: "#f39c12" }, "Accepted": { bg: "#e8f5e9", color: "#2e7d32" }, "Rejected": { bg: "#fdf0f0", color: "#c0392b" }, "More Info Requested": { bg: "#e3f2fd", color: "#1565c0" } };
              const sc = scMap[req.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              return (
                <div key={req.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{req.industryName}</div>
                  <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{req.contactPerson} | {req.collaborationType}</div>
                  <div style={{ fontSize: 12, color: "#1e8449", marginTop: 2 }}>Project: {req.projectTitle}</div>
                  <div style={{ marginTop: 6 }}><span style={{ background: sc.bg, color: sc.color, borderRadius: 2, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{req.status}</span></div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#d35400", marginBottom: 12 }}>Student Opportunities</div>
            {opportunities.map(opp => (
              <div key={opp.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{opp.title}</div>
                <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{opp.industryName} | {opp.type}</div>
                <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Domain: {opp.domain} | Deadline: {opp.deadline}</div>
                <div style={{ fontSize: 11, color: "#2980b9", marginTop: 3 }}>{opp.applications} applications received</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab === "analytics" && (
        <div>
          <div style={{ background: "#f0f5ff", border: "1px solid #c5d4f0", borderRadius: 4, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: "#003580" }}>
            <strong>📈 Platform-wide Analytics</strong> — Full innovation ecosystem metrics. Export to Excel available below.
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button style={{ background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📥 Export Excel Report</button>
            <button style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📄 Download PDF Dashboard</button>
            <button style={{ background: "#d35400", color: "white", border: "none", borderRadius: 3, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📊 District-wise Breakdown Export</button>
          </div>
          <AnalyticsDashboard />
        </div>
      )}

      {/* AUDIT LOG */}
      {tab === "audit" && (
        <div>
          {auditLog.length === 0 && (
            <div style={{ background: "#fff8e1", border: "1px solid #f39c12", borderRadius: 4, padding: 16, fontSize: 13, color: "#7d5a00" }}>
              ℹ️ Audit log is empty. Actions taken in this session (logins, issue submissions, task assignments, team formations) will appear here.
            </div>
          )}
          {auditLog.length > 0 && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#b03a2e", color: "white" }}>
                    {["Audit ID", "Timestamp", "Actor", "Role", "Action", "Entity", "Entity ID", "Details"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry, idx) => (
                    <tr key={entry.id} style={{ background: idx % 2 === 0 ? "white" : "#fdf5f5", borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#b03a2e", fontWeight: 700 }}>{entry.id}</td>
                      <td style={{ padding: "7px 12px", color: "#5a6675", fontSize: 10, whiteSpace: "nowrap" }}>{entry.timestamp}</td>
                      <td style={{ padding: "7px 12px", fontWeight: 600 }}>{entry.actor}</td>
                      <td style={{ padding: "7px 12px" }}>
                        <span style={{ background: "#f0f2f5", borderRadius: 2, padding: "1px 7px", fontSize: 10, fontWeight: 700, color: "#5a6675" }}>{entry.actorRole}</span>
                      </td>
                      <td style={{ padding: "7px 12px" }}>
                        <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", background: "#e8f4fd", color: "#1565c0", borderRadius: 2, padding: "1px 7px", fontWeight: 700 }}>{entry.action}</span>
                      </td>
                      <td style={{ padding: "7px 12px", color: "#5a6675" }}>{entry.entity}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#003580" }}>{entry.entityId}</td>
                      <td style={{ padding: "7px 12px", color: "#5a6675", maxWidth: 200 }}>{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

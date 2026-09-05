import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

const PALETTE = {
  navy: "#003580",
  saffron: "#ff6600",
  green: "#138808",
  teal: "#0097a7",
  purple: "#7b1fa2",
  amber: "#f59e0b",
  red: "#c0392b",
  grey: "#7a8696",
};

const PIE_COLORS = [PALETTE.navy, PALETTE.saffron, PALETTE.green, PALETTE.teal, PALETTE.purple, PALETTE.amber, PALETTE.red, "#2980b9"];

export default function AnalyticsDashboard() {
  const { problems, teams, collabRequests, mentoringEntries, fundingEntries, pilotEntries, milestones, deliverables } = useApp();
  const [activeSection, setActiveSection] = useState<"challenges" | "university" | "industry" | "outcomes">("challenges");

  // ── Challenge Analytics ─────────────────────────────────────────────────
  const totalChallenges = problems.length;
  const resolved = problems.filter(p => p.status === "Resolved" || p.status === "Closed").length;
  const open = problems.filter(p => p.status === "Pending" || p.status === "Assigned" || p.status === "In Progress").length;
  const innovationRoute = problems.filter(p => p.track === "Innovation Route").length;
  const nonInnovation = problems.filter(p => p.track === "Simple Civic").length;

  const districtCounts: Record<string, number> = {};
  problems.forEach(p => { districtCounts[p.district] = (districtCounts[p.district] || 0) + 1; });
  const districtData = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([district, count]) => ({ district: district.length > 10 ? district.slice(0, 10) + "…" : district, count }));

  const domainCounts: Record<string, number> = {};
  problems.forEach(p => { domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1; });
  const domainData = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: "Pending", value: problems.filter(p => p.status === "Pending").length },
    { name: "Assigned", value: problems.filter(p => p.status === "Assigned").length },
    { name: "In Progress", value: problems.filter(p => p.status === "In Progress").length },
    { name: "Univ. Routed", value: problems.filter(p => p.status === "University Routed").length },
    { name: "Resolved", value: problems.filter(p => p.status === "Resolved" || p.status === "Closed").length },
  ].filter(d => d.value > 0);

  // ── University Analytics ────────────────────────────────────────────────
  const univCounts: Record<string, number> = {};
  teams.forEach(t => { univCounts[t.universityName] = (univCounts[t.universityName] || 0) + 1; });
  const univData = Object.entries(univCounts).map(([name, projects]) => ({ name: name.length > 14 ? name.slice(0, 14) + "…" : name, projects }));

  const implStatusCounts: Record<string, number> = {};
  teams.forEach(t => { const s = t.implementationStatus || "Not Started"; implStatusCounts[s] = (implStatusCounts[s] || 0) + 1; });
  const implData = Object.entries(implStatusCounts).map(([name, value]) => ({ name, value }));

  const msCompleted = milestones.filter(m => m.status === "Completed").length;
  const msTotal = milestones.length;
  const dlApproved = deliverables.filter(d => d.status === "Approved").length;
  const dlTotal = deliverables.length;

  // ── Industry Analytics ──────────────────────────────────────────────────
  const industryNames = Array.from(new Set([
    ...mentoringEntries.map(m => m.industryName),
    ...fundingEntries.map(f => f.industryName),
    ...pilotEntries.map(p => p.industryName),
    ...collabRequests.map(c => c.industryName),
  ]));
  const industryData = industryNames.map(name => ({
    name: name.length > 12 ? name.slice(0, 12) + "…" : name,
    mentoring: mentoringEntries.filter(m => m.industryName === name).length,
    funding: fundingEntries.filter(f => f.industryName === name).length,
    pilots: pilotEntries.filter(p => p.industryName === name).length,
    collabs: collabRequests.filter(c => c.industryName === name).length,
  }));

  // ── Innovation Outcomes ─────────────────────────────────────────────────
  const implementedTeams = teams.filter(t => t.status === "Implemented" || t.implementationStatus === "Implemented" || t.implementationStatus === "Completed").length;
  const submittedTeams = teams.filter(t => t.status === "Submitted" || t.implementationStatus === "Under Testing" || t.implementationStatus === "Ready for Implementation").length;
  const activeTeams = teams.filter(t => t.status === "Active" || t.implementationStatus === "In Progress").length;
  const pilotTeams = pilotEntries.length;

  const trendData = [
    { month: "Apr", challenges: 2, teams: 0 },
    { month: "May", challenges: 5, teams: 1 },
    { month: "Jun", challenges: 8, teams: 2 },
    { month: "Jul", challenges: 14, teams: 3 },
    { month: "Aug", challenges: problems.length, teams: teams.length },
  ];

  const SECTIONS = [
    { id: "challenges", label: "📊 Challenge Analytics" },
    { id: "university", label: "🎓 University Analytics" },
    { id: "industry", label: "🏭 Industry Analytics" },
    { id: "outcomes", label: "🚀 Innovation Outcomes" },
  ] as const;

  return (
    <div>
      {/* Section Nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              background: activeSection === s.id ? PALETTE.navy : "white",
              color: activeSection === s.id ? "white" : PALETTE.navy,
              border: `1.5px solid ${PALETTE.navy}`,
              borderRadius: 3,
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* CHALLENGE ANALYTICS */}
      {activeSection === "challenges" && (
        <div>
          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Total Challenges" value={totalChallenges} color={PALETTE.navy} icon="📋" />
            <KpiCard label="Open / Active" value={open} color={PALETTE.amber} icon="⏳" />
            <KpiCard label="Resolved" value={resolved} color={PALETTE.green} icon="✅" />
            <KpiCard label="Innovation Route" value={innovationRoute} color={PALETTE.purple} icon="💡" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* District bar chart */}
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Challenges by District</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={districtData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="district" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={PALETTE.navy} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Status Distribution</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Domain breakdown */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Challenges by Sector / Domain</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {domainData.map((d, i) => (
                <div key={d.name} style={{ background: PIE_COLORS[i % PIE_COLORS.length] + "18", border: `1.5px solid ${PIE_COLORS[i % PIE_COLORS.length]}`, borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>
                  <span style={{ color: PIE_COLORS[i % PIE_COLORS.length], fontWeight: 700 }}>{d.name}</span>
                  <span style={{ color: "#5a6675", marginLeft: 6 }}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Innovation vs Non-Innovation */}
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <div style={{ flex: 1, background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 3, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#7b1fa2", fontWeight: 700 }}>💡 Requires Innovation</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#7b1fa2", marginTop: 4 }}>{innovationRoute}</div>
                <div style={{ fontSize: 10, color: "#9c4dcc", marginTop: 2 }}>Routed to universities & research</div>
              </div>
              <div style={{ flex: 1, background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 3, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#1565c0", fontWeight: 700 }}>🏛️ Does Not Require Innovation</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1565c0", marginTop: 4 }}>{nonInnovation}</div>
                <div style={{ fontSize: 10, color: "#1976d2", marginTop: 2 }}>Resolved through civic departments</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSITY ANALYTICS */}
      {activeSection === "university" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Participating Universities" value={Object.keys(univCounts).length} color={PALETTE.navy} icon="🎓" />
            <KpiCard label="Total Projects" value={teams.length} color={PALETTE.teal} icon="🔬" />
            <KpiCard label="Milestones Completed" value={`${msCompleted}/${msTotal}`} color={PALETTE.green} icon="🏁" />
            <KpiCard label="Deliverables Approved" value={`${dlApproved}/${dlTotal}`} color={PALETTE.amber} icon="📦" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* University bar chart */}
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Projects by University</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={univData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="projects" fill={PALETTE.teal} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Implementation status pie */}
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Implementation Status</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={implData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ percent }: { name?: string; percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {implData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestone progress */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Milestone Completion Progress</div>
            <div style={{ height: 8, background: "#e8ecf0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${msTotal > 0 ? (msCompleted / msTotal) * 100 : 0}%`, background: PALETTE.green, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#5a6675" }}>
              <span>{msCompleted} completed</span>
              <span>{msTotal - msCompleted} pending</span>
              <span style={{ fontWeight: 700, color: PALETTE.green }}>{msTotal > 0 ? Math.round((msCompleted / msTotal) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* INDUSTRY ANALYTICS */}
      {activeSection === "industry" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Industry Partners" value={industryNames.length} color={PALETTE.saffron} icon="🏭" />
            <KpiCard label="Mentoring Programs" value={mentoringEntries.length} color={PALETTE.navy} icon="🤝" />
            <KpiCard label="Funding Commitments" value={fundingEntries.length} color={PALETTE.green} icon="💰" />
            <KpiCard label="Pilot Implementations" value={pilotEntries.length} color={PALETTE.purple} icon="🚀" />
          </div>

          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Industry-wise Participation</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={industryData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="mentoring" name="Mentoring" fill={PALETTE.navy} radius={[2, 2, 0, 0]} />
                <Bar dataKey="funding" name="Funding" fill={PALETTE.green} radius={[2, 2, 0, 0]} />
                <Bar dataKey="pilots" name="Pilots" fill={PALETTE.purple} radius={[2, 2, 0, 0]} />
                <Bar dataKey="collabs" name="Collabs" fill={PALETTE.saffron} radius={[2, 2, 0, 0]} />
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Funding & Pilot details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: PALETTE.navy, marginBottom: 10 }}>💰 Funding Entries</div>
              {fundingEntries.length === 0 ? <div style={{ fontSize: 12, color: "#5a6675" }}>No funding entries yet.</div> : fundingEntries.map(f => (
                <div key={f.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{f.industryName}</div>
                  <div style={{ fontSize: 11, color: "#5a6675" }}>{f.projectTitle}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.green }}>{f.amount}</span>
                    <span style={{ fontSize: 10, background: "#e8f5e9", color: PALETTE.green, padding: "2px 8px", borderRadius: 10 }}>{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: PALETTE.navy, marginBottom: 10 }}>🚀 Pilot Programs</div>
              {pilotEntries.length === 0 ? <div style={{ fontSize: 12, color: "#5a6675" }}>No pilot programs yet.</div> : pilotEntries.map(p => (
                <div key={p.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.industryName}</div>
                  <div style={{ fontSize: 11, color: "#5a6675" }}>{p.projectTitle}</div>
                  <div style={{ fontSize: 10, color: "#5a6675" }}>📍 {p.location}</div>
                  <span style={{ fontSize: 10, background: "#f3e5f5", color: PALETTE.purple, padding: "2px 8px", borderRadius: 10, marginTop: 4, display: "inline-block" }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INNOVATION OUTCOMES */}
      {activeSection === "outcomes" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Active Projects" value={activeTeams} color={PALETTE.navy} icon="🔬" />
            <KpiCard label="Under Testing / Review" value={submittedTeams} color={PALETTE.amber} icon="🧪" />
            <KpiCard label="Implemented" value={implementedTeams} color={PALETTE.green} icon="✅" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Pilot Programs" value={pilotTeams} color={PALETTE.purple} icon="🚀" />
            <KpiCard label="Industry Collaborations" value={collabRequests.filter(c => c.status === "Accepted").length} color={PALETTE.teal} icon="🤝" />
            <KpiCard label="Total Teams Registered" value={teams.length} color={PALETTE.saffron} icon="👥" />
          </div>

          {/* Trend chart */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.navy, marginBottom: 12 }}>Growth Trend — Challenges & Teams Registered</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Line type="monotone" dataKey="challenges" name="Challenges" stroke={PALETTE.saffron} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="teams" name="Teams" stroke={PALETTE.navy} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Community impact placeholders */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Citizens Benefited", value: "14,200+", icon: "👥" },
              { label: "Districts Covered", value: "12 / 24", icon: "🗺️" },
              { label: "Villages Impacted", value: "47", icon: "🏡" },
              { label: "Solutions Scaled", value: "2", icon: "📈" },
            ].map(item => (
              <div key={item.label} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>{item.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: PALETTE.navy, marginTop: 4 }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "#5a6675", marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: "14px 16px" }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#5a6675", marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

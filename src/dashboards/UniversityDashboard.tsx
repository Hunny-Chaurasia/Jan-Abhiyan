import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Problem, Team, TeamMember, ImplementationStatus } from "../context/AppContext";
import { newMilestoneId, newDeliverableId } from "../context/AppContext";
import MessagesPanel from "../components/MessagesPanel";

const MENTOR_TYPES = ["Faculty Mentor", "Industry Mentor", "Government Mentor", "Technical Mentor", "Domain Expert", "External Mentor"];
const TEAM_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Proposed": { bg: "#fff8e1", color: "#f39c12" },
  "Approved": { bg: "#e3f2fd", color: "#1565c0" },
  "Active": { bg: "#e8f5e9", color: "#2e7d32" },
  "Submitted": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Implemented": { bg: "#e0f2f1", color: "#00796b" },
};

const IMPL_STATUS_COLORS: Record<ImplementationStatus, { bg: string; color: string }> = {
  "Not Started": { bg: "#f0f2f5", color: "#5a6675" },
  "In Progress": { bg: "#e8f4fd", color: "#2980b9" },
  "Under Testing": { bg: "#fff8e1", color: "#f39c12" },
  "Ready for Implementation": { bg: "#e3f2fd", color: "#1565c0" },
  "Pilot Implementation": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Implemented": { bg: "#e0f2f1", color: "#00796b" },
  "Completed": { bg: "#e8f5e9", color: "#2e7d32" },
  "Blocked": { bg: "#fdf0f0", color: "#c0392b" },
};

const IMPL_STATUS_LIST: ImplementationStatus[] = ["Not Started", "In Progress", "Under Testing", "Ready for Implementation", "Pilot Implementation", "Implemented", "Completed", "Blocked"];

const emptyMember = (): TeamMember => ({ name: "", memberId: "", department: "", role: "", skills: "" });

const NON_INNOVATION_DEPTS = [
  "PWD — Road Division", "Municipal Corporation", "JBVNL — Electricity", "JUIDCO — Water & Sanitation",
  "Health Department", "Forest Department", "Revenue & Land Reforms", "District Administration",
  "Rural Development Department", "Social Welfare Department",
];

export default function UniversityDashboard() {
  const { user, problems, teams, addTeam, updateTeam, addNotification, logAudit, collabRequests, updateCollabRequest, milestones, addMilestone, updateMilestone, deliverables, addDeliverable, updateDeliverable, addIssueRouting, updateProblemStatus } = useApp();
  const [tab, setTab] = useState<"problems" | "myteams" | "form" | "collabs" | "milestones" | "deliverables" | "messages">("problems");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("All");
  const [showRerouteModal, setShowRerouteModal] = useState<Problem | null>(null);
  const [rerouteForm, setRerouteForm] = useState({ routedTo: "", reason: "" });
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ teamId: "", title: "", description: "", deadline: "" });
  const [deliverableForm, setDeliverableForm] = useState({ teamId: "", title: "", description: "", dueDate: "" });

  const myOrg = user?.organization ?? "BIT Mesra";
  const myVId = user?.virtualId ?? "JA-U-00001";

  const innovationProblems = problems.filter(p => p.track === "Innovation Route");
  const myTeams = teams.filter(t => t.universityName === myOrg);
  const myCollabRequests = collabRequests.filter(r => myTeams.some(t => t.id === r.teamId));
  const myTeamIds = myTeams.map(t => t.id);
  const myMilestones = milestones.filter(m => myTeamIds.includes(m.teamId));
  const myDeliverables = deliverables.filter(d => myTeamIds.includes(d.teamId));

  const filteredProblems = innovationProblems.filter(p => {
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDomain = filterDomain === "All" || p.domain === filterDomain;
    return matchSearch && matchDomain;
  });

  const domains = ["All", ...Array.from(new Set(innovationProblems.map(p => p.domain)))];

  const [form, setForm] = useState({
    teamName: "", teamLeader: "", contactEmail: "", contactPhone: "",
    department: "", problemId: "", problemTitle: "", problemDescription: "",
    whySelected: "", expectedOutcome: "", proposedSolution: "", domain: "",
    members: [emptyMember(), emptyMember()],
    startDate: "", expectedCompletionDate: "", milestones: "", currentProgress: "",
    mentorName: "", mentorDesignation: "", mentorDept: "", mentorType: "Faculty Mentor",
    mentorContact: "", mentorExpertise: "", technologies: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const setMember = (idx: number, field: keyof TeamMember, val: string) => {
    const updated = [...form.members];
    updated[idx] = { ...updated[idx], [field]: val };
    setForm({ ...form, members: updated });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `TEAM-${String(teams.length + 4).padStart(3, "0")}`;
    const newTeam: Team = {
      id: newId, universityName: myOrg, department: form.department, teamName: form.teamName,
      teamLeader: form.teamLeader, contactEmail: form.contactEmail, contactPhone: form.contactPhone,
      problemId: form.problemId, problemTitle: form.problemTitle, problemDescription: form.problemDescription,
      whySelected: form.whySelected, expectedOutcome: form.expectedOutcome, proposedSolution: form.proposedSolution,
      domain: form.domain, teamSize: form.members.filter(m => m.name).length,
      members: form.members.filter(m => m.name),
      startDate: form.startDate, expectedCompletionDate: form.expectedCompletionDate,
      milestones: form.milestones, currentProgress: form.currentProgress,
      mentorName: form.mentorName, mentorDesignation: form.mentorDesignation, mentorDept: form.mentorDept,
      mentorType: form.mentorType, mentorContact: form.mentorContact, mentorExpertise: form.mentorExpertise,
      status: "Proposed", implementationStatus: "Not Started",
      createdAt: new Date().toLocaleDateString("en-IN"), technologies: form.technologies,
    };
    addTeam(newTeam);
    addNotification({ forRole: "admin", type: "info", title: "New Team Registered", message: `Team "${form.teamName}" from ${myOrg} registered for problem ${form.problemId}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    addNotification({ forRole: "official", type: "info", title: "University Team Formed", message: `${myOrg} has formed a team for: ${form.problemTitle}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "university", action: "TEAM_FORMED", entity: "Team", entityId: newId, details: `Team: ${form.teamName}, Problem: ${form.problemId}` });
    setFormSubmitted(true);
  };

  const handleCollab = (requestId: string, action: "Accepted" | "Rejected" | "More Info Requested") => {
    updateCollabRequest(requestId, action);
    logAudit({ actor: user!.name, actorRole: "university", action: `COLLAB_${action.toUpperCase().replace(/ /g, "_")}`, entity: "CollabRequest", entityId: requestId, details: `University response: ${action}` });
  };

  const prefillFromProblem = (p: Problem) => {
    setForm(f => ({ ...f, problemId: p.id, problemTitle: p.title, problemDescription: p.description, domain: p.domain }));
    setTab("form");
    setSelectedProblem(null);
  };

  const handleReroute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRerouteModal || !rerouteForm.routedTo || !rerouteForm.reason) return;
    addIssueRouting({
      id: "",
      problemId: showRerouteModal.id,
      problemTitle: showRerouteModal.title,
      routedBy: myVId,
      routedByName: user!.name,
      routingType: "non-innovation",
      routedTo: rerouteForm.routedTo,
      reason: rerouteForm.reason,
      routedAt: new Date().toLocaleString("en-IN"),
      status: "Routed to department",
    });
    updateProblemStatus(showRerouteModal.id, "Assigned", { assignedTo: rerouteForm.routedTo, assignedDept: rerouteForm.routedTo });
    addNotification({ forRole: "official", type: "info", title: "Issue Flagged — Does Not Require Innovation", message: `University ${myOrg} has flagged problem ${showRerouteModal.id} as not requiring innovation. Rerouted to ${rerouteForm.routedTo}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "university", action: "ISSUE_REROUTED", entity: "Problem", entityId: showRerouteModal.id, details: `Rerouted to: ${rerouteForm.routedTo}. Reason: ${rerouteForm.reason}` });
    setShowRerouteModal(null);
    setRerouteForm({ routedTo: "", reason: "" });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newMilestoneId();
    addMilestone({ id, teamId: milestoneForm.teamId, title: milestoneForm.title, description: milestoneForm.description, deadline: milestoneForm.deadline, status: "Pending", createdAt: new Date().toLocaleDateString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "university", action: "MILESTONE_CREATED", entity: "Milestone", entityId: id, details: `Team: ${milestoneForm.teamId}, Title: ${milestoneForm.title}` });
    setShowMilestoneModal(false);
    setMilestoneForm({ teamId: "", title: "", description: "", deadline: "" });
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newDeliverableId();
    addDeliverable({ id, teamId: deliverableForm.teamId, title: deliverableForm.title, description: deliverableForm.description, dueDate: deliverableForm.dueDate, status: "Pending" });
    logAudit({ actor: user!.name, actorRole: "university", action: "DELIVERABLE_CREATED", entity: "Deliverable", entityId: id, details: `Team: ${deliverableForm.teamId}, Title: ${deliverableForm.title}` });
    setShowDeliverableModal(false);
    setDeliverableForm({ teamId: "", title: "", description: "", dueDate: "" });
  };

  const msCompleted = myMilestones.filter(m => m.status === "Completed").length;
  const dlApproved = myDeliverables.filter(d => d.status === "Approved").length;

  const TABS = [
    { id: "problems", label: "🔍 Problems" },
    { id: "myteams", label: `👥 My Teams (${myTeams.length})` },
    { id: "milestones", label: `🏁 Milestones (${msCompleted}/${myMilestones.length})` },
    { id: "deliverables", label: `📦 Deliverables (${dlApproved}/${myDeliverables.length})` },
    { id: "form", label: "➕ Form Team" },
    { id: "collabs", label: `🤝 Collabs (${myCollabRequests.length})` },
    { id: "messages", label: "💬 Messages" },
  ] as const;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div style={{ background: "#1e8449", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>University / HEI Collaboration Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{myOrg} | {user?.name} | {user?.designation}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["Problems", innovationProblems.length], ["Teams", myTeams.length], ["Milestones ✓", msCompleted], ["Deliverables ✓", dlApproved]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap", background: tab === t.id ? "#1e8449" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none" }}>{t.label}</button>
        ))}
      </div>

      {/* AVAILABLE PROBLEMS */}
      {tab === "problems" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedProblem ? "1fr 360px" : "1fr", gap: 14 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search problems..." style={{ border: "1px solid var(--border)", borderRadius: 3, padding: "6px 12px", fontSize: 12, width: 220 }} />
              {domains.map(d => (
                <button key={d} onClick={() => setFilterDomain(d)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: filterDomain === d ? "#1e8449" : "white", color: filterDomain === d ? "white" : "#1e8449", border: "1.5px solid #1e8449", borderRadius: 2 }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredProblems.map(p => {
                const alreadyTeamed = teams.some(t => t.problemId === p.id && t.universityName === myOrg);
                return (
                  <div key={p.id} onClick={() => setSelectedProblem(p)} style={{ background: "white", border: `1px solid ${selectedProblem?.id === p.id ? "#1e8449" : "var(--border)"}`, borderRadius: 4, padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1e8449", fontWeight: 700 }}>{p.id}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{p.category} • {p.district} • {p.date}</div>
                        <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4 }}>{p.description}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, background: "#f3e5f5", color: "#7b1fa2", borderRadius: 2, padding: "1px 8px", fontWeight: 700 }}>{p.domain}</span>
                          <span style={{ fontSize: 10, color: "#c0392b", fontWeight: 700 }}>Priority: {p.priority}</span>
                          {alreadyTeamed && <span style={{ fontSize: 10, background: "#e8f5e9", color: "#2e7d32", borderRadius: 2, padding: "1px 8px", fontWeight: 700 }}>✓ Your team registered</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {!alreadyTeamed && (
                          <button onClick={e => { e.stopPropagation(); prefillFromProblem(p); }} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>➕ Form Team</button>
                        )}
                        <button onClick={e => { e.stopPropagation(); setShowRerouteModal(p); }} style={{ background: "#e67e22", color: "white", border: "none", borderRadius: 3, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>🔀 Reroute</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedProblem && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#1e8449" }}>Problem Details</div>
                <button onClick={() => setSelectedProblem(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a6675" }}>×</button>
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1e8449", fontWeight: 700 }}>{selectedProblem.id}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{selectedProblem.title}</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 6, lineHeight: 1.6 }}>{selectedProblem.description}</div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                {[["Category", selectedProblem.category], ["Domain", selectedProblem.domain], ["District", selectedProblem.district], ["Priority", selectedProblem.priority], ["Status", selectedProblem.status]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 5, borderBottom: "1px solid #f0f2f5" }}>
                    <span style={{ color: "#5a6675", fontWeight: 600 }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => prefillFromProblem(selectedProblem)} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>➕ Form a Team for this Problem</button>
                <button onClick={() => setShowRerouteModal(selectedProblem)} style={{ background: "#e67e22", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔀 Flag: Does Not Require Innovation</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY TEAMS */}
      {tab === "myteams" && (
        <div>
          {myTeams.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>
              No teams formed yet. <button onClick={() => setTab("form")} style={{ background: "none", border: "none", color: "#1e8449", fontWeight: 700, cursor: "pointer" }}>Form your first team →</button>
            </div>
          )}
          {selectedTeam ? (
            <TeamDetailPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} onUpdateStatus={(id, s) => updateTeam(id, { status: s })} onUpdateImplStatus={(id, s) => updateTeam(id, { implementationStatus: s })} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myTeams.map(team => {
                const sc = TEAM_STATUS_COLORS[team.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
                const is = team.implementationStatus ? IMPL_STATUS_COLORS[team.implementationStatus] : { bg: "#f0f2f5", color: "#5a6675" };
                return (
                  <div key={team.id} onClick={() => setSelectedTeam(team)} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1e8449", fontWeight: 700 }}>{team.id}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{team.teamName}</div>
                        <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{team.department} • {team.teamSize} members</div>
                        <div style={{ fontSize: 12, color: "#1e8449", marginTop: 2 }}>Problem: {team.problemTitle}</div>
                        {team.expectedCompletionDate && <div style={{ fontSize: 11, color: "#e67e22", marginTop: 2 }}>⏰ Deadline: {team.expectedCompletionDate}</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{team.status}</span>
                        {team.implementationStatus && <span style={{ background: is.bg, color: is.color, borderRadius: 3, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{team.implementationStatus}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MILESTONES */}
      {tab === "milestones" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e8449" }}>🏁 Project Milestones</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Track progress milestones for all your teams. <strong>{msCompleted}/{myMilestones.length}</strong> completed.</div>
            </div>
            <button onClick={() => setShowMilestoneModal(true)} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Milestone</button>
          </div>
          {myMilestones.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No milestones yet. Add milestones to track your project progress.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myMilestones.map(m => {
              const team = teams.find(t => t.id === m.teamId);
              const msCol: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff3e0", color: "#e67e22" }, "In Progress": { bg: "#e8f4fd", color: "#2980b9" }, "Completed": { bg: "#e8f5e9", color: "#2e7d32" }, "Blocked": { bg: "#fdf0f0", color: "#c0392b" } };
              const sc = msCol[m.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              return (
                <div key={m.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1e8449", fontWeight: 700 }}>{m.id} | {team?.teamName}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: "#5a6675" }}>{m.description}</div>
                      <div style={{ fontSize: 11, color: "#e67e22", marginTop: 4 }}>⏰ Deadline: {m.deadline}</div>
                      {m.completedAt && <div style={{ fontSize: 11, color: "#138808" }}>✅ Completed: {m.completedAt}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{m.status}</span>
                      <select value={m.status} onChange={e => {
                        const newStatus = e.target.value as any;
                        updateMilestone(m.id, { status: newStatus, completedAt: newStatus === "Completed" ? new Date().toLocaleDateString("en-IN") : undefined });
                      }} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 6px", cursor: "pointer" }}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DELIVERABLES */}
      {tab === "deliverables" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e8449" }}>📦 Project Deliverables</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Define, upload, and track project deliverables. <strong>{dlApproved}/{myDeliverables.length}</strong> approved.</div>
            </div>
            <button onClick={() => setShowDeliverableModal(true)} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Deliverable</button>
          </div>
          {myDeliverables.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No deliverables defined yet.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myDeliverables.map(d => {
              const team = teams.find(t => t.id === d.teamId);
              const dlCol: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff3e0", color: "#e67e22" }, "Uploaded": { bg: "#e3f2fd", color: "#1565c0" }, "Reviewed": { bg: "#f3e5f5", color: "#7b1fa2" }, "Approved": { bg: "#e8f5e9", color: "#2e7d32" } };
              const sc = dlCol[d.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              return (
                <div key={d.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1e8449", fontWeight: 700 }}>{d.id} | {team?.teamName}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: "#5a6675" }}>{d.description}</div>
                      <div style={{ fontSize: 11, color: "#e67e22", marginTop: 4 }}>Due: {d.dueDate}</div>
                      {d.fileNote && <div style={{ fontSize: 11, color: "#2980b9", marginTop: 2 }}>📎 {d.fileNote}</div>}
                      {d.uploadedAt && <div style={{ fontSize: 10, color: "#5a6675" }}>Uploaded: {d.uploadedAt}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{d.status}</span>
                      <select value={d.status} onChange={e => updateDeliverable(d.id, { status: e.target.value as any, uploadedAt: e.target.value === "Uploaded" ? new Date().toLocaleDateString("en-IN") : d.uploadedAt })} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 6px", cursor: "pointer" }}>
                        <option value="Pending">Pending</option>
                        <option value="Uploaded">Uploaded</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORM A TEAM */}
      {tab === "form" && (
        formSubmitted ? (
          <div style={{ background: "#eafaf1", border: "1px solid #138808", borderRadius: 4, padding: 24, textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#138808", marginTop: 8 }}>Team Successfully Registered!</div>
            <div style={{ fontSize: 13, color: "#5a6675", marginTop: 6 }}>Team <strong>{form.teamName}</strong> has been registered for <strong>{form.problemTitle}</strong>.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={() => { setFormSubmitted(false); setTab("myteams"); }} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>View My Teams</button>
              <button onClick={() => { setFormSubmitted(false); setForm({ teamName: "", teamLeader: "", contactEmail: "", contactPhone: "", department: "", problemId: "", problemTitle: "", problemDescription: "", whySelected: "", expectedOutcome: "", proposedSolution: "", domain: "", members: [emptyMember(), emptyMember()], startDate: "", expectedCompletionDate: "", milestones: "", currentProgress: "", mentorName: "", mentorDesignation: "", mentorDept: "", mentorType: "Faculty Mentor", mentorContact: "", mentorExpertise: "", technologies: "" }); }} style={{ background: "transparent", border: "1.5px solid #1e8449", color: "#1e8449", borderRadius: 3, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Form Another Team</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <FormSection color="#1e8449" title="Basic Information">
              <Grid>
                <GField label="University / College" value={myOrg} disabled />
                <GField label="Department *" value={form.department} onChange={v => setForm({ ...form, department: v })} placeholder="e.g. Environmental Engineering" required />
                <GField label="Team Name *" value={form.teamName} onChange={v => setForm({ ...form, teamName: v })} required />
                <GField label="Team Leader *" value={form.teamLeader} onChange={v => setForm({ ...form, teamLeader: v })} required />
                <GField label="Contact Email *" value={form.contactEmail} onChange={v => setForm({ ...form, contactEmail: v })} type="email" required />
                <GField label="Contact Phone *" value={form.contactPhone} onChange={v => setForm({ ...form, contactPhone: v })} type="tel" required />
              </Grid>
            </FormSection>

            <FormSection color="#1e8449" title="Problem Selection">
              <div>
                <label style={LS2}>Select Problem *</label>
                <select value={form.problemId} onChange={e => { const p = innovationProblems.find(x => x.id === e.target.value); if (p) setForm(f => ({ ...f, problemId: p.id, problemTitle: p.title, problemDescription: p.description, domain: p.domain })); }} required style={IS2}>
                  <option value="">Select from available innovation problems</option>
                  {innovationProblems.map(p => <option key={p.id} value={p.id}>{p.id} — {p.title}</option>)}
                </select>
              </div>
              {form.problemTitle && <div style={{ background: "#f0f9f2", borderRadius: 3, padding: "10px 12px", fontSize: 12 }}><strong>Selected:</strong> {form.problemTitle}</div>}
              <GField label="Why selected? *" value={form.whySelected} onChange={v => setForm({ ...form, whySelected: v })} required textarea />
              <GField label="Expected Outcome *" value={form.expectedOutcome} onChange={v => setForm({ ...form, expectedOutcome: v })} required textarea />
              <GField label="Proposed Solution *" value={form.proposedSolution} onChange={v => setForm({ ...form, proposedSolution: v })} required textarea />
              <GField label="Domain *" value={form.domain} onChange={v => setForm({ ...form, domain: v })} required />
              <GField label="Technologies / Tools" value={form.technologies} onChange={v => setForm({ ...form, technologies: v })} placeholder="e.g. GIS, IoT, Mobile App" />
            </FormSection>

            <FormSection color="#1e8449" title="Team Members">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#5a6675" }}>{form.members.length} member slots</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, members: [...f.members, emptyMember()] }))} style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 2, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>+ Add</button>
                  {form.members.length > 1 && <button type="button" onClick={() => setForm(f => ({ ...f, members: f.members.slice(0, -1) }))} style={{ background: "#c0392b", color: "white", border: "none", borderRadius: 2, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>− Remove</button>}
                </div>
              </div>
              {form.members.map((m, idx) => (
                <div key={idx} style={{ background: "#f8faf9", border: "1px solid #d4edda", borderRadius: 3, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e8449", marginBottom: 8 }}>Member {idx + 1}{idx === 0 ? " (Leader)" : ""}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <GField label="Full Name *" value={m.name} onChange={v => setMember(idx, "name", v)} required={idx === 0} />
                    <GField label="Member ID" value={m.memberId} onChange={v => setMember(idx, "memberId", v)} />
                    <GField label="Department" value={m.department} onChange={v => setMember(idx, "department", v)} />
                    <GField label="Role in Team" value={m.role} onChange={v => setMember(idx, "role", v)} />
                    <div style={{ gridColumn: "1 / -1" }}><GField label="Skills" value={m.skills} onChange={v => setMember(idx, "skills", v)} /></div>
                  </div>
                </div>
              ))}
            </FormSection>

            <FormSection color="#1e8449" title="Timeline">
              <Grid>
                <GField label="Start Date *" value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} type="date" required />
                <GField label="Expected Completion *" value={form.expectedCompletionDate} onChange={v => setForm({ ...form, expectedCompletionDate: v })} type="date" required />
              </Grid>
              <GField label="Milestone Plan" value={form.milestones} onChange={v => setForm({ ...form, milestones: v })} placeholder="M1: Survey (Date) | M2: Prototype (Date) | M3: Testing (Date)" textarea />
            </FormSection>

            <FormSection color="#1e8449" title="Mentorship">
              <Grid>
                <GField label="Mentor Name *" value={form.mentorName} onChange={v => setForm({ ...form, mentorName: v })} required />
                <GField label="Designation" value={form.mentorDesignation} onChange={v => setForm({ ...form, mentorDesignation: v })} />
                <GField label="Department" value={form.mentorDept} onChange={v => setForm({ ...form, mentorDept: v })} />
                <div>
                  <label style={LS2}>Mentor Type *</label>
                  <select value={form.mentorType} onChange={e => setForm({ ...form, mentorType: e.target.value })} style={IS2}>
                    {MENTOR_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <GField label="Contact" value={form.mentorContact} onChange={v => setForm({ ...form, mentorContact: v })} />
                <GField label="Expertise" value={form.mentorExpertise} onChange={v => setForm({ ...form, mentorExpertise: v })} />
              </Grid>
            </FormSection>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" onClick={() => setTab("problems")} style={{ background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, padding: "9px 18px", fontSize: 13, color: "#5a6675", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ background: "#1e8449", color: "white", border: "none", borderRadius: 3, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Team Registration →</button>
            </div>
          </form>
        )
      )}

      {/* COLLABORATIONS */}
      {tab === "collabs" && (
        <div>
          {myCollabRequests.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No collaboration requests received yet.</div>}
          {myCollabRequests.map(req => {
            const scMap: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff8e1", color: "#f39c12" }, "Accepted": { bg: "#e8f5e9", color: "#2e7d32" }, "Rejected": { bg: "#fdf0f0", color: "#c0392b" }, "More Info Requested": { bg: "#e3f2fd", color: "#1565c0" } };
            const sc = scMap[req.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
            return (
              <div key={req.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{req.industryName}</div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Contact: {req.contactPerson} | {req.email}</div>
                    <div style={{ fontSize: 12, color: "#1e8449", marginTop: 2 }}>Project: <strong>{req.projectTitle}</strong></div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4 }}>Type: {req.collaborationType} | {req.areaOfInterest}</div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4 }}>{req.message}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{req.status}</span>
                    <span style={{ fontSize: 10, color: "#7a8696" }}>{req.sentAt}</span>
                  </div>
                </div>
                {req.status === "Pending" && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button onClick={() => handleCollab(req.id, "Accepted")} style={{ background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✅ Accept</button>
                    <button onClick={() => handleCollab(req.id, "More Info Requested")} style={{ background: "#2980b9", color: "white", border: "none", borderRadius: 3, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔍 More Info</button>
                    <button onClick={() => handleCollab(req.id, "Rejected")} style={{ background: "#c0392b", color: "white", border: "none", borderRadius: 3, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>❌ Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MESSAGES */}
      {tab === "messages" && (
        <MessagesPanel myVirtualId={myVId} myName={user?.name ?? "University User"} myRole="university" />
      )}

      {/* ── Issue Reroute Modal ── */}
      {showRerouteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 4, padding: 24, width: 480, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#e67e22", marginBottom: 4 }}>🔀 Flag: Does Not Require Innovation</div>
            <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 16 }}>Problem: <strong>{showRerouteModal.title}</strong></div>
            <div style={{ background: "#fff8e1", border: "1px solid #f39c12", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#7d4e00", marginBottom: 16 }}>
              ⚠️ This will reroute the problem to a government department and remove it from the innovation workflow. An audit trail will be maintained.
            </div>
            <form onSubmit={handleReroute}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Route To (Department) *</label>
                  <select value={rerouteForm.routedTo} onChange={e => setRerouteForm(f => ({ ...f, routedTo: e.target.value }))} required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }}>
                    <option value="">Select appropriate department</option>
                    {NON_INNOVATION_DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Reason for Rerouting *</label>
                  <textarea value={rerouteForm.reason} onChange={e => setRerouteForm(f => ({ ...f, reason: e.target.value }))} required rows={3} placeholder="Explain why this problem does not require innovation and which standard government process should handle it." style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, resize: "vertical" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowRerouteModal(null)} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#e67e22", color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Reroute to Department →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Milestone Modal ── */}
      {showMilestoneModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 4, padding: 24, width: 480, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#1e8449", marginBottom: 16 }}>🏁 Add Milestone</div>
            <form onSubmit={handleAddMilestone}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={LS2}>Team *</label>
                  <select value={milestoneForm.teamId} onChange={e => setMilestoneForm(f => ({ ...f, teamId: e.target.value }))} required style={IS2}>
                    <option value="">Select team</option>
                    {myTeams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
                <GField label="Milestone Title *" value={milestoneForm.title} onChange={v => setMilestoneForm(f => ({ ...f, title: v }))} required />
                <GField label="Description" value={milestoneForm.description} onChange={v => setMilestoneForm(f => ({ ...f, description: v }))} textarea />
                <GField label="Deadline *" value={milestoneForm.deadline} onChange={v => setMilestoneForm(f => ({ ...f, deadline: v }))} type="date" required />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowMilestoneModal(false)} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#1e8449", color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add Milestone →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Deliverable Modal ── */}
      {showDeliverableModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 4, padding: 24, width: 480, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#1e8449", marginBottom: 16 }}>📦 Add Deliverable</div>
            <form onSubmit={handleAddDeliverable}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={LS2}>Team *</label>
                  <select value={deliverableForm.teamId} onChange={e => setDeliverableForm(f => ({ ...f, teamId: e.target.value }))} required style={IS2}>
                    <option value="">Select team</option>
                    {myTeams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
                <GField label="Deliverable Title *" value={deliverableForm.title} onChange={v => setDeliverableForm(f => ({ ...f, title: v }))} required />
                <GField label="Description *" value={deliverableForm.description} onChange={v => setDeliverableForm(f => ({ ...f, description: v }))} textarea required />
                <GField label="Due Date *" value={deliverableForm.dueDate} onChange={v => setDeliverableForm(f => ({ ...f, dueDate: v }))} type="date" required />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowDeliverableModal(false)} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#1e8449", color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add Deliverable →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamDetailPanel({ team, onClose, onUpdateStatus, onUpdateImplStatus }: { team: Team; onClose: () => void; onUpdateStatus: (id: string, s: Team["status"]) => void; onUpdateImplStatus: (id: string, s: ImplementationStatus) => void }) {
  const sc = TEAM_STATUS_COLORS[team.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
  const is = team.implementationStatus ? IMPL_STATUS_COLORS[team.implementationStatus] : { bg: "#f0f2f5", color: "#5a6675" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#1e8449", fontWeight: 700 }}>{team.id}</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, marginTop: 2 }}>{team.teamName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a6675" }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <Detail title="Problem" value={team.problemTitle} />
          <Detail title="Department" value={team.department} />
          <Detail title="Leader" value={team.teamLeader} />
          <Detail title="Team Size" value={`${team.teamSize} members`} />
          <Detail title="Start Date" value={team.startDate} />
          <Detail title="Expected Completion" value={team.expectedCompletionDate} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e8449", marginBottom: 6 }}>Proposed Solution</div>
          <div style={{ fontSize: 12, color: "#5a6675", lineHeight: 1.6 }}>{team.proposedSolution}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e8449", marginBottom: 6 }}>Team Members</div>
          {team.members.map((m, i) => (
            <div key={i} style={{ background: "#f8faf9", borderRadius: 3, padding: "8px 12px", marginBottom: 6, fontSize: 12 }}>
              <strong>{m.name}</strong>{m.memberId ? ` (${m.memberId})` : ""} — {m.role}<br />
              <span style={{ color: "#5a6675" }}>{m.department} | {m.skills}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#1e8449", marginBottom: 10 }}>Mentor Details</div>
          {[["Name", team.mentorName], ["Designation", team.mentorDesignation], ["Department", team.mentorDept], ["Type", team.mentorType], ["Contact", team.mentorContact], ["Expertise", team.mentorExpertise]].map(([k, v]) => v ? (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 5, borderBottom: "1px solid #f0f2f5" }}>
              <span style={{ color: "#5a6675", fontWeight: 600 }}>{k}</span><span style={{ fontWeight: 500, textAlign: "right", maxWidth: 180 }}>{v}</span>
            </div>
          ) : null)}
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e8449", marginBottom: 8 }}>Team Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(["Proposed", "Approved", "Active", "Submitted", "Implemented"] as Team["status"][]).map(s => {
              const sc2 = TEAM_STATUS_COLORS[s] ?? { bg: "#f0f2f5", color: "#5a6675" };
              return (
                <button key={s} onClick={() => onUpdateStatus(team.id, s)} style={{ background: team.status === s ? sc2.bg : "white", color: team.status === s ? sc2.color : "#5a6675", border: `1.5px solid ${team.status === s ? sc2.color : "var(--border)"}`, borderRadius: 3, padding: "5px 10px", fontSize: 12, fontWeight: team.status === s ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                  {team.status === s ? "● " : "○ "}{s}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e8449", marginBottom: 8 }}>Implementation Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {IMPL_STATUS_LIST.map(s => {
              const is2 = IMPL_STATUS_COLORS[s];
              const active = team.implementationStatus === s;
              return (
                <button key={s} onClick={() => onUpdateImplStatus(team.id, s)} style={{ background: active ? is2.bg : "white", color: active ? is2.color : "#5a6675", border: `1.5px solid ${active ? is2.color : "var(--border)"}`, borderRadius: 3, padding: "5px 10px", fontSize: 11, fontWeight: active ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                  {active ? "● " : "○ "}{s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18, marginBottom: 14 }}>
      <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function GField({ label, value, onChange, placeholder, required, type = "text", disabled, textarea }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; required?: boolean; type?: string; disabled?: boolean; textarea?: boolean;
}) {
  return (
    <div>
      <label style={LS2}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} required={required} rows={3} style={{ ...IS2, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={{ ...IS2, background: disabled ? "#f8f9fb" : "white" }} />
      )}
    </div>
  );
}

function Detail({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#5a6675", fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

const LS2: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 };
const IS2: React.CSSProperties = { width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" };

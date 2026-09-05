import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Team, CollaborationRequest, Opportunity } from "../context/AppContext";
import { newMentoringId, newFundingId, newPilotId } from "../context/AppContext";
import MessagesPanel from "../components/MessagesPanel";

const EVAL_OPTIONS = [
  { id: "high_potential", icon: "⭐", label: "High Potential", color: "#f39c12" },
  { id: "implementable", icon: "✅", label: "Implementable", color: "#138808" },
  { id: "needs_development", icon: "🧪", label: "Requires Further Development", color: "#2980b9" },
  { id: "interesting", icon: "💡", label: "Interesting Concept", color: "#8e44ad" },
  { id: "collaborate", icon: "🤝", label: "Interested in Collaboration", color: "#1565c0" },
  { id: "not_suitable", icon: "❌", label: "Not Currently Suitable", color: "#c0392b" },
];

const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  "Active": { bg: "#e8f5e9", color: "#2e7d32" },
  "Completed": { bg: "#e0f2f1", color: "#00796b" },
  "Paused": { bg: "#fff8e1", color: "#f39c12" },
  "Committed": { bg: "#e3f2fd", color: "#1565c0" },
  "Disbursed": { bg: "#e8f5e9", color: "#2e7d32" },
  "Pending": { bg: "#fff3e0", color: "#e67e22" },
  "Selected": { bg: "#f3e5f5", color: "#7b1fa2" },
  "In Progress": { bg: "#e8f4fd", color: "#2980b9" },
  "Testing": { bg: "#fff8e1", color: "#f39c12" },
  "Feedback": { bg: "#e8f5e9", color: "#1e8449" },
};

export default function IndustryDashboard() {
  const { user, teams, opportunities, addOpportunity, collabRequests, addCollabRequest, addNotification, logAudit, mentoringEntries, addMentoringEntry, updateMentoringEntry, fundingEntries, addFundingEntry, updateFundingEntry, pilotEntries, addPilotEntry, updatePilotEntry } = useApp();
  const [tab, setTab] = useState<"discover" | "evaluate" | "connect" | "mentoring" | "funding" | "pilot" | "opportunities" | "messages">("discover");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamEvals, setTeamEvals] = useState<Record<string, string>>({});
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [showMentoringModal, setShowMentoringModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("All");

  const myOrg = user?.organization ?? "Tata Steel Ltd.";
  const myVId = user?.virtualId ?? "JA-I-00001";

  const [collabForm, setCollabForm] = useState({ contactPerson: user?.name ?? "", designation: user?.designation ?? "", email: "", phone: "", areaOfInterest: "", reasonForInterest: "", collaborationType: "", requirements: "", message: "" });
  const [oppForm, setOppForm] = useState({ type: "Internship", title: "", description: "", eligibility: "", skills: "", domain: "", deadline: "" });
  const [mentoringForm, setMentoringForm] = useState({ mentorName: "", teamId: "", expertise: "", progress: "" });
  const [fundingForm, setFundingForm] = useState({ teamId: "", amount: "", purpose: "", status: "Committed" });
  const [pilotForm, setPilotForm] = useState({ teamId: "", location: "", startDate: "", feedback: "" });

  const myCollabRequests = collabRequests.filter(r => r.industryName === myOrg);
  const myMentoring = mentoringEntries.filter(m => m.industryVirtualId === myVId);
  const myFunding = fundingEntries.filter(f => f.industryVirtualId === myVId);
  const myPilots = pilotEntries.filter(p => p.industryVirtualId === myVId);

  const domains = ["All", ...Array.from(new Set(teams.map(t => t.domain).filter(Boolean)))];
  const filteredTeams = teams.filter(t => {
    const matchSearch = !search || t.teamName.toLowerCase().includes(search.toLowerCase()) || t.problemTitle.toLowerCase().includes(search.toLowerCase()) || t.universityName.toLowerCase().includes(search.toLowerCase());
    const matchDomain = filterDomain === "All" || t.domain === filterDomain;
    return matchSearch && matchDomain;
  });

  const handleCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const newId = `CR-${String(collabRequests.length + 2).padStart(3, "0")}`;
    const newReq: CollaborationRequest = { id: newId, industryName: myOrg, contactPerson: collabForm.contactPerson, designation: collabForm.designation, email: collabForm.email, phone: collabForm.phone, areaOfInterest: collabForm.areaOfInterest || selectedTeam.domain, teamId: selectedTeam.id, projectTitle: selectedTeam.teamName, reasonForInterest: collabForm.reasonForInterest, collaborationType: collabForm.collaborationType, requirements: collabForm.requirements, message: collabForm.message, sentAt: new Date().toLocaleString("en-IN"), status: "Pending" };
    addCollabRequest(newReq);
    addNotification({ forRole: "university", type: "alert", title: "Industry Collaboration Request", message: `${myOrg} has sent a collaboration request for your project ${selectedTeam.teamName}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    addNotification({ forRole: "admin", type: "info", title: "New Collaboration Request", message: `${myOrg} → ${selectedTeam.universityName} for "${selectedTeam.teamName}"`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "industry", action: "COLLAB_REQUEST_SENT", entity: "CollaborationRequest", entityId: newId, details: `To: ${selectedTeam.universityName}, Project: ${selectedTeam.teamName}` });
    setShowCollabModal(false);
    setSelectedTeam(null);
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `OPP-${String(opportunities.length + 4).padStart(3, "0")}`;
    const newOpp: Opportunity = { id: newId, industryName: myOrg, type: oppForm.type, title: oppForm.title, description: oppForm.description, eligibility: oppForm.eligibility, skills: oppForm.skills, domain: oppForm.domain, deadline: oppForm.deadline, postedAt: new Date().toLocaleDateString("en-IN"), applications: 0 };
    addOpportunity(newOpp);
    addNotification({ forRole: "university", type: "info", title: "New Opportunity Posted", message: `${myOrg} posted a new ${oppForm.type}: ${oppForm.title}`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "industry", action: "OPPORTUNITY_POSTED", entity: "Opportunity", entityId: newId, details: `Type: ${oppForm.type}, Title: ${oppForm.title}` });
    setShowOppModal(false);
    setOppForm({ type: "Internship", title: "", description: "", eligibility: "", skills: "", domain: "", deadline: "" });
  };

  const handleAddMentoring = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === mentoringForm.teamId);
    if (!team) return;
    const id = newMentoringId();
    addMentoringEntry({ id, industryVirtualId: myVId, industryName: myOrg, mentorName: mentoringForm.mentorName, teamId: team.id, projectTitle: team.teamName, status: "Active", startDate: new Date().toLocaleDateString("en-IN"), progress: mentoringForm.progress || "Mentoring initiated.", expertise: mentoringForm.expertise });
    addNotification({ forRole: "university", type: "info", title: "New Mentoring Partnership", message: `${myOrg} has initiated a mentoring partnership with your team ${team.teamName}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "industry", action: "MENTORING_STARTED", entity: "MentoringEntry", entityId: id, details: `Team: ${team.teamName}, Mentor: ${mentoringForm.mentorName}` });
    setShowMentoringModal(false);
    setMentoringForm({ mentorName: "", teamId: "", expertise: "", progress: "" });
  };

  const handleAddFunding = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === fundingForm.teamId);
    if (!team) return;
    const id = newFundingId();
    addFundingEntry({ id, industryVirtualId: myVId, industryName: myOrg, teamId: team.id, projectTitle: team.teamName, amount: fundingForm.amount, status: fundingForm.status as any, purpose: fundingForm.purpose, committedAt: new Date().toLocaleDateString("en-IN") });
    addNotification({ forRole: "university", type: "success", title: "Funding Committed", message: `${myOrg} has committed funding of ${fundingForm.amount} for your project ${team.teamName}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "industry", action: "FUNDING_COMMITTED", entity: "FundingEntry", entityId: id, details: `Team: ${team.teamName}, Amount: ${fundingForm.amount}` });
    setShowFundingModal(false);
    setFundingForm({ teamId: "", amount: "", purpose: "", status: "Committed" });
  };

  const handleAddPilot = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === pilotForm.teamId);
    if (!team) return;
    const id = newPilotId();
    addPilotEntry({ id, industryVirtualId: myVId, industryName: myOrg, teamId: team.id, projectTitle: team.teamName, status: "Selected", startDate: pilotForm.startDate, location: pilotForm.location, feedback: pilotForm.feedback });
    addNotification({ forRole: "university", type: "success", title: "Selected for Pilot Implementation", message: `${myOrg} has selected your project ${team.teamName} for pilot implementation in ${pilotForm.location}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "industry", action: "PILOT_INITIATED", entity: "PilotEntry", entityId: id, details: `Team: ${team.teamName}, Location: ${pilotForm.location}` });
    setShowPilotModal(false);
    setPilotForm({ teamId: "", location: "", startDate: "", feedback: "" });
  };

  const TABS = [
    { id: "discover", label: "🔍 Discover" },
    { id: "evaluate", label: "⭐ Evaluate" },
    { id: "connect", label: `🤝 Connections (${myCollabRequests.length})` },
    { id: "mentoring", label: `🧑‍🏫 Mentoring (${myMentoring.length})` },
    { id: "funding", label: `💰 Funding (${myFunding.length})` },
    { id: "pilot", label: `🚀 Pilots (${myPilots.length})` },
    { id: "opportunities", label: `🎯 Opportunities` },
    { id: "messages", label: "💬 Messages" },
  ] as const;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div style={{ background: "#d35400", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>Industry Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{myOrg} | {user?.name} | {user?.designation}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["Projects", teams.length], ["Collabs", myCollabRequests.length], ["Mentoring", myMentoring.length], ["Pilots", myPilots.length]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap", background: tab === t.id ? "#d35400" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none" }}>{t.label}</button>
        ))}
      </div>

      {/* DISCOVER */}
      {tab === "discover" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedTeam ? "1fr 380px" : "1fr", gap: 14 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams, projects, universities..." style={{ border: "1px solid var(--border)", borderRadius: 3, padding: "6px 12px", fontSize: 12, width: 260 }} />
              {domains.map(d => (
                <button key={d} onClick={() => setFilterDomain(d)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: filterDomain === d ? "#d35400" : "white", color: filterDomain === d ? "white" : "#d35400", border: "1.5px solid #d35400", borderRadius: 2 }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredTeams.map(team => {
                const eval_ = teamEvals[team.id];
                const evalOpt = EVAL_OPTIONS.find(e => e.id === eval_);
                return (
                  <div key={team.id} onClick={() => setSelectedTeam(team)} style={{ background: "white", border: `1px solid ${selectedTeam?.id === team.id ? "#d35400" : "var(--border)"}`, borderRadius: 4, padding: 16, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#d35400", fontWeight: 700 }}>{team.id} | {team.universityName}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{team.teamName}</div>
                        <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{team.department} | {team.teamSize} members</div>
                        <div style={{ fontSize: 12, color: "#1e8449", marginTop: 2 }}>Solving: <strong>{team.problemTitle}</strong></div>
                        <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4 }}>{team.proposedSolution?.slice(0, 120)}{(team.proposedSolution?.length ?? 0) > 120 ? "..." : ""}</div>
                        {team.technologies && (
                          <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {team.technologies.split(",").map(t => (
                              <span key={t} style={{ fontSize: 10, background: "#f0f5ff", color: "#003580", border: "1px solid #c5d4f0", borderRadius: 2, padding: "1px 7px" }}>{t.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        {(() => { const scMap: Record<string, { bg: string; color: string }> = { "Proposed": { bg: "#fff8e1", color: "#f39c12" }, "Approved": { bg: "#e3f2fd", color: "#1565c0" }, "Active": { bg: "#e8f5e9", color: "#2e7d32" }, "Submitted": { bg: "#f3e5f5", color: "#7b1fa2" }, "Implemented": { bg: "#e0f2f1", color: "#00796b" } }; const s = scMap[team.status] ?? { bg: "#f0f2f5", color: "#5a6675" }; return <span style={{ background: s.bg, color: s.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{team.status}</span>; })()}
                        {evalOpt && <span style={{ background: `${evalOpt.color}20`, color: evalOpt.color, borderRadius: 3, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{evalOpt.icon} {evalOpt.label}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTeam && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#d35400" }}>Project Details</div>
                <button onClick={() => setSelectedTeam(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a6675" }}>×</button>
              </div>
              <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#d35400", fontWeight: 700 }}>{selectedTeam.id}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{selectedTeam.teamName}</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>{selectedTeam.universityName} — {selectedTeam.department}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {[["Problem", selectedTeam.problemTitle], ["Domain", selectedTeam.domain], ["Team Leader", selectedTeam.teamLeader], ["Team Size", `${selectedTeam.teamSize} members`], ["Mentor", `${selectedTeam.mentorName}`], ["Completion", selectedTeam.expectedCompletionDate], ["Technologies", selectedTeam.technologies ?? "—"], ["Progress", selectedTeam.currentProgress]].map(([k, v]) => v ? (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 5, borderBottom: "1px solid #f0f2f5", gap: 8 }}>
                    <span style={{ color: "#5a6675", fontWeight: 600, flexShrink: 0 }}>{k}</span><span style={{ fontWeight: 500, textAlign: "right" }}>{v}</span>
                  </div>
                ) : null)}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#d35400", marginBottom: 6 }}>Evaluate</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {EVAL_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setTeamEvals(e => ({ ...e, [selectedTeam.id]: opt.id }))} style={{ background: teamEvals[selectedTeam.id] === opt.id ? `${opt.color}15` : "white", color: teamEvals[selectedTeam.id] === opt.id ? opt.color : "#5a6675", border: `1.5px solid ${teamEvals[selectedTeam.id] === opt.id ? opt.color : "var(--border)"}`, borderRadius: 3, padding: "6px 10px", fontSize: 11, fontWeight: teamEvals[selectedTeam.id] === opt.id ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                <button onClick={() => setShowCollabModal(true)} style={{ width: "100%", background: "#d35400", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🤝 Collaboration Request</button>
                <button onClick={() => { setMentoringForm(f => ({ ...f, teamId: selectedTeam.id })); setShowMentoringModal(true); }} style={{ width: "100%", background: "#1a5276", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🧑‍🏫 Offer Mentoring</button>
                <button onClick={() => { setFundingForm(f => ({ ...f, teamId: selectedTeam.id })); setShowFundingModal(true); }} style={{ width: "100%", background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>💰 Commit Funding</button>
                <button onClick={() => { setPilotForm(f => ({ ...f, teamId: selectedTeam.id })); setShowPilotModal(true); }} style={{ width: "100%", background: "#7b1fa2", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚀 Select for Pilot</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVALUATE */}
      {tab === "evaluate" && (
        <div>
          <div style={{ fontSize: 13, color: "#5a6675", marginBottom: 14 }}>Projects you have evaluated — click any project in Discover to add your evaluation.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {Object.entries(teamEvals).map(([teamId, evalId]) => {
              const team = teams.find(t => t.id === teamId);
              const evalOpt = EVAL_OPTIONS.find(e => e.id === evalId);
              if (!team || !evalOpt) return null;
              return (
                <div key={teamId} style={{ background: "white", border: `1.5px solid ${evalOpt.color}`, borderRadius: 4, padding: 14 }}>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#d35400", fontWeight: 700 }}>{teamId}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{team.teamName}</div>
                  <div style={{ fontSize: 12, color: "#5a6675" }}>{team.universityName}</div>
                  <div style={{ marginTop: 10, background: `${evalOpt.color}15`, borderRadius: 3, padding: "6px 10px", display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 18 }}>{evalOpt.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: evalOpt.color }}>{evalOpt.label}</span>
                  </div>
                </div>
              );
            })}
            {Object.keys(teamEvals).length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#5a6675", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4 }}>
                No evaluations yet. Go to <strong>Discover</strong> to evaluate university teams.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONNECTIONS */}
      {tab === "connect" && (
        <div>
          {myCollabRequests.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No collaboration requests sent yet.</div>}
          {myCollabRequests.map(req => {
            const scMap: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff8e1", color: "#f39c12" }, "Accepted": { bg: "#e8f5e9", color: "#2e7d32" }, "Rejected": { bg: "#fdf0f0", color: "#c0392b" }, "More Info Requested": { bg: "#e3f2fd", color: "#1565c0" } };
            const sc = scMap[req.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
            return (
              <div key={req.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#d35400", fontWeight: 700 }}>{req.id}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Project: {req.projectTitle}</div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Type: {req.collaborationType} | {req.areaOfInterest}</div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4 }}>{req.message}</div>
                    <div style={{ fontSize: 10, color: "#7a8696", marginTop: 4 }}>Sent: {req.sentAt}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "4px 12px", fontSize: 11, fontWeight: 700, alignSelf: "flex-start" }}>{req.status}</span>
                </div>
                {req.status === "Accepted" && (
                  <div style={{ marginTop: 10, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 3, padding: "8px 12px", fontSize: 12, color: "#2e7d32" }}>
                    🎉 University accepted your collaboration request! Use Messages to communicate directly.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MENTORING */}
      {tab === "mentoring" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a5276" }}>🧑‍🏫 Mentoring Programs</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Connect your industry experts with university teams to guide innovation projects.</div>
            </div>
            <button onClick={() => setShowMentoringModal(true)} style={{ background: "#1a5276", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Start Mentoring</button>
          </div>
          {myMentoring.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No mentoring programs yet. Start by selecting a university project.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myMentoring.map(m => {
              const sc = STATUS_PILL[m.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              const team = teams.find(t => t.id === m.teamId);
              return (
                <div key={m.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1a5276", fontWeight: 700 }}>{m.id} | {m.teamId}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{m.projectTitle}</div>
                      <div style={{ fontSize: 12, color: "#5a6675" }}>Mentor: <strong>{m.mentorName}</strong> | Expertise: {m.expertise}</div>
                      {team && <div style={{ fontSize: 12, color: "#1e8449" }}>University: {team.universityName}</div>}
                      <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4, background: "#f0f5ff", padding: "6px 10px", borderRadius: 3 }}>Progress: {m.progress}</div>
                      <div style={{ fontSize: 10, color: "#7a8696", marginTop: 4 }}>Started: {m.startDate}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{m.status}</span>
                      <select value={m.status} onChange={e => updateMentoringEntry(m.id, { status: e.target.value as any })} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 6px", cursor: "pointer" }}>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FUNDING */}
      {tab === "funding" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#138808" }}>💰 Funding & Financial Support</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Commit funding to promising university innovation projects and track utilization.</div>
            </div>
            <button onClick={() => setShowFundingModal(true)} style={{ background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Commit Funding</button>
          </div>
          {myFunding.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No funding commitments yet.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myFunding.map(f => {
              const sc = STATUS_PILL[f.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              const team = teams.find(t => t.id === f.teamId);
              return (
                <div key={f.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#138808", fontWeight: 700 }}>{f.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{f.projectTitle}</div>
                      {team && <div style={{ fontSize: 12, color: "#1e8449" }}>University: {team.universityName}</div>}
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#138808", marginTop: 4 }}>{f.amount}</div>
                      <div style={{ fontSize: 12, color: "#5a6675" }}>Purpose: {f.purpose}</div>
                      <div style={{ fontSize: 10, color: "#7a8696" }}>Committed: {f.committedAt}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{f.status}</span>
                      <select value={f.status} onChange={e => updateFundingEntry(f.id, { status: e.target.value as any })} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 6px", cursor: "pointer" }}>
                        <option value="Committed">Committed</option>
                        <option value="Disbursed">Disbursed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PILOT */}
      {tab === "pilot" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#7b1fa2" }}>🚀 Pilot Implementation</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Select innovations for real-world pilot implementation. Track milestones, results, and feedback.</div>
            </div>
            <button onClick={() => setShowPilotModal(true)} style={{ background: "#7b1fa2", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Pilot</button>
          </div>
          {myPilots.length === 0 && <div style={{ textAlign: "center", padding: 32, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No pilot programs yet. Select a university innovation for pilot implementation.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myPilots.map(p => {
              const sc = STATUS_PILL[p.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              const team = teams.find(t => t.id === p.teamId);
              return (
                <div key={p.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7b1fa2", fontWeight: 700 }}>{p.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{p.projectTitle}</div>
                      {team && <div style={{ fontSize: 12, color: "#1e8449" }}>University: {team.universityName}</div>}
                      <div style={{ fontSize: 12, color: "#5a6675" }}>📍 Location: {p.location}</div>
                      <div style={{ fontSize: 10, color: "#7a8696" }}>Start: {p.startDate}</div>
                      {p.feedback && <div style={{ fontSize: 12, color: "#5a6675", marginTop: 6, background: "#f3e5f5", padding: "6px 10px", borderRadius: 3 }}>Feedback: {p.feedback}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{p.status}</span>
                      <select value={p.status} onChange={e => updatePilotEntry(p.id, { status: e.target.value as any })} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 6px", cursor: "pointer" }}>
                        {["Selected", "In Progress", "Testing", "Completed", "Feedback"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OPPORTUNITIES */}
      {tab === "opportunities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => setShowOppModal(true)} style={{ background: "#d35400", color: "white", border: "none", borderRadius: 3, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Post New Opportunity</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {opportunities.map(opp => (
              <div key={opp.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
                <span style={{ fontSize: 10, background: "#f0f5ff", color: "#003580", border: "1px solid #c5d4f0", borderRadius: 2, padding: "1px 8px", fontWeight: 700 }}>{opp.type}</span>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{opp.title}</div>
                <div style={{ fontSize: 12, color: "#d35400", fontWeight: 600, marginTop: 2 }}>{opp.industryName}</div>
                <div style={{ fontSize: 12, color: "#5a6675", marginTop: 8, lineHeight: 1.5 }}>{opp.description}</div>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                  {[["Eligibility", opp.eligibility], ["Skills", opp.skills], ["Domain", opp.domain], ["Deadline", opp.deadline]].map(([k, v]) => v ? (
                    <div key={k} style={{ display: "flex", gap: 6, fontSize: 12 }}><span style={{ color: "#5a6675", fontWeight: 600, minWidth: 70 }}>{k}:</span><span>{v}</span></div>
                  ) : null)}
                </div>
                <div style={{ marginTop: 10, background: "#f0f5ff", borderRadius: 3, padding: "5px 10px", fontSize: 11, color: "#2980b9", fontWeight: 600 }}>{opp.applications} applications</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {tab === "messages" && (
        <MessagesPanel myVirtualId={myVId} myName={user?.name ?? "Industry User"} myRole="industry" />
      )}

      {/* ── Modals ── */}
      {showCollabModal && selectedTeam && (
        <Modal title="Send Collaboration Request" subtitle={`To: ${selectedTeam.teamName} — ${selectedTeam.universityName}`} onClose={() => setShowCollabModal(false)}>
          <form onSubmit={handleCollab}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <MField label="Contact Person *" value={collabForm.contactPerson} onChange={v => setCollabForm({ ...collabForm, contactPerson: v })} required />
                <MField label="Designation" value={collabForm.designation} onChange={v => setCollabForm({ ...collabForm, designation: v })} />
                <MField label="Email *" value={collabForm.email} onChange={v => setCollabForm({ ...collabForm, email: v })} type="email" required />
                <MField label="Phone" value={collabForm.phone} onChange={v => setCollabForm({ ...collabForm, phone: v })} type="tel" />
              </div>
              <div>
                <label style={LS}>Collaboration Type *</label>
                <select value={collabForm.collaborationType} onChange={e => setCollabForm({ ...collabForm, collaborationType: e.target.value })} required style={IS}>
                  <option value="">Select type</option>
                  {["CSR Partnership", "R&D Collaboration", "Technology Licensing", "Pilot Implementation", "Industry Mentorship", "Joint Venture", "Funding / Sponsorship", "Student Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <MField label="Reason for Interest *" value={collabForm.reasonForInterest} onChange={v => setCollabForm({ ...collabForm, reasonForInterest: v })} required textarea />
              <MField label="What you bring" value={collabForm.requirements} onChange={v => setCollabForm({ ...collabForm, requirements: v })} textarea />
              <MField label="Message to Team" value={collabForm.message} onChange={v => setCollabForm({ ...collabForm, message: v })} textarea />
            </div>
            <ModalFooter onCancel={() => setShowCollabModal(false)} submitLabel="Send Request →" color="#d35400" />
          </form>
        </Modal>
      )}

      {showMentoringModal && (
        <Modal title="🧑‍🏫 Start Mentoring Program" onClose={() => setShowMentoringModal(false)}>
          <form onSubmit={handleAddMentoring}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>Select Project *</label>
                <select value={mentoringForm.teamId} onChange={e => setMentoringForm(f => ({ ...f, teamId: e.target.value }))} required style={IS}>
                  <option value="">Select team/project</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.teamName} — {t.universityName}</option>)}
                </select>
              </div>
              <MField label="Mentor Name *" value={mentoringForm.mentorName} onChange={v => setMentoringForm(f => ({ ...f, mentorName: v }))} placeholder="Industry expert name" required />
              <MField label="Mentor Expertise" value={mentoringForm.expertise} onChange={v => setMentoringForm(f => ({ ...f, expertise: v }))} placeholder="e.g. Environmental engineering, product design" />
              <MField label="Initial Progress Note" value={mentoringForm.progress} onChange={v => setMentoringForm(f => ({ ...f, progress: v }))} placeholder="Describe initial goals and engagement plan" textarea />
            </div>
            <ModalFooter onCancel={() => setShowMentoringModal(false)} submitLabel="Start Mentoring →" color="#1a5276" />
          </form>
        </Modal>
      )}

      {showFundingModal && (
        <Modal title="💰 Commit Funding" onClose={() => setShowFundingModal(false)}>
          <form onSubmit={handleAddFunding}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>Select Project *</label>
                <select value={fundingForm.teamId} onChange={e => setFundingForm(f => ({ ...f, teamId: e.target.value }))} required style={IS}>
                  <option value="">Select team/project</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.teamName} — {t.universityName}</option>)}
                </select>
              </div>
              <MField label="Funding Amount *" value={fundingForm.amount} onChange={v => setFundingForm(f => ({ ...f, amount: v }))} placeholder="e.g. ₹5,00,000" required />
              <MField label="Purpose / Utilization *" value={fundingForm.purpose} onChange={v => setFundingForm(f => ({ ...f, purpose: v }))} placeholder="How will the funds be used?" required textarea />
              <div>
                <label style={LS}>Initial Status</label>
                <select value={fundingForm.status} onChange={e => setFundingForm(f => ({ ...f, status: e.target.value }))} style={IS}>
                  <option value="Committed">Committed</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>
            </div>
            <ModalFooter onCancel={() => setShowFundingModal(false)} submitLabel="Commit Funding →" color="#138808" />
          </form>
        </Modal>
      )}

      {showPilotModal && (
        <Modal title="🚀 Select for Pilot Implementation" onClose={() => setShowPilotModal(false)}>
          <form onSubmit={handleAddPilot}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>Select Project *</label>
                <select value={pilotForm.teamId} onChange={e => setPilotForm(f => ({ ...f, teamId: e.target.value }))} required style={IS}>
                  <option value="">Select team/project</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.teamName} — {t.universityName}</option>)}
                </select>
              </div>
              <MField label="Pilot Location *" value={pilotForm.location} onChange={v => setPilotForm(f => ({ ...f, location: v }))} placeholder="e.g. Noamundi block, West Singhbhum" required />
              <MField label="Proposed Start Date" value={pilotForm.startDate} onChange={v => setPilotForm(f => ({ ...f, startDate: v }))} type="date" />
              <MField label="Initial Notes / Feedback" value={pilotForm.feedback} onChange={v => setPilotForm(f => ({ ...f, feedback: v }))} placeholder="Expected outcomes, initial assessment..." textarea />
            </div>
            <ModalFooter onCancel={() => setShowPilotModal(false)} submitLabel="Start Pilot →" color="#7b1fa2" />
          </form>
        </Modal>
      )}

      {showOppModal && (
        <Modal title="Post Opportunity" onClose={() => setShowOppModal(false)}>
          <form onSubmit={handleAddOpportunity}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>Opportunity Type *</label>
                <select value={oppForm.type} onChange={e => setOppForm({ ...oppForm, type: e.target.value })} style={IS}>
                  {["Internship", "Live Project", "Hackathon", "Research Opportunity", "Industry Mentorship", "Training", "Pre-Placement Offer", "Industry Visit"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <MField label="Title *" value={oppForm.title} onChange={v => setOppForm({ ...oppForm, title: v })} required />
              <MField label="Description *" value={oppForm.description} onChange={v => setOppForm({ ...oppForm, description: v })} textarea required />
              <MField label="Eligibility" value={oppForm.eligibility} onChange={v => setOppForm({ ...oppForm, eligibility: v })} placeholder="e.g. 3rd/4th year students" />
              <MField label="Skills Required" value={oppForm.skills} onChange={v => setOppForm({ ...oppForm, skills: v })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <MField label="Domain" value={oppForm.domain} onChange={v => setOppForm({ ...oppForm, domain: v })} />
                <MField label="Deadline" value={oppForm.deadline} onChange={v => setOppForm({ ...oppForm, deadline: v })} type="date" />
              </div>
            </div>
            <ModalFooter onCancel={() => setShowOppModal(false)} submitLabel="Post Opportunity →" color="#d35400" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "white", borderRadius: 4, padding: 24, width: 500, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#d35400", marginBottom: subtitle ? 4 : 16 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 16 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, submitLabel, color }: { onCancel: () => void; submitLabel: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
      <button type="button" onClick={onCancel} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
      <button type="submit" style={{ padding: "8px 20px", background: color, color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{submitLabel}</button>
    </div>
  );
}

function MField({ label, value, onChange, placeholder, required, type = "text", textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label style={LS}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} rows={3} style={{ ...IS, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={IS} />
      )}
    </div>
  );
}

const LS: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 };
const IS: React.CSSProperties = { width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" };

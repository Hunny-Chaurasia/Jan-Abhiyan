import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Problem, Task } from "../context/AppContext";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Pending": { bg: "#fff3e0", color: "#e67e22" },
  "Assigned": { bg: "#e3f2fd", color: "#1565c0" },
  "In Progress": { bg: "#e8f4fd", color: "#2980b9" },
  "University Routed": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Resolved": { bg: "#e8f5e9", color: "#2e7d32" },
};

const PRIORITY_COLORS: Record<string, string> = { "High": "#c0392b", "Medium": "#e67e22", "Low": "#27ae60" };

const ASSIGN_TO_OPTIONS = [
  "PWD — Ranchi Division", "Municipal Corporation (RMC)", "JBVNL — Electrical Division",
  "JUIDCO — Water & Sanitation", "Forest Department", "Health Department Ranchi",
  "Block Development Office — Kanke", "Block Development Office — Ratu", "NHAI — NH Corridor",
  "District Collector Office", "Jharkhand Police", "Fire & Emergency Services",
];

const ASSIGN_TO_TYPES: Record<string, "department" | "university" | "officer" | "agency"> = {
  "PWD — Ranchi Division": "department",
  "Municipal Corporation (RMC)": "department",
  "JBVNL — Electrical Division": "department",
  "JUIDCO — Water & Sanitation": "department",
  "BIT Mesra": "university",
  "NIT Jamshedpur": "university",
  "AIIMS Jharkhand": "university",
};

const UNIVERSITIES = ["BIT Mesra", "NIT Jamshedpur", "AIIMS Jharkhand", "Ranchi University", "RIMS Ranchi", "Jharkhand Rai University"];

export default function OfficialDashboard() {
  const { user, problems, tasks, teams, addTask, updateProblemStatus, updateTask, addNotification, logAudit, issueRoutings, addIssueRouting, auditLog } = useApp();
  const [tab, setTab] = useState<"problems" | "tasks" | "routing" | "analytics">("problems");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTrack, setFilterTrack] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoutingModal, setShowRoutingModal] = useState<Problem | null>(null);
  const [routingDecision, setRoutingDecision] = useState<"innovation" | "non-innovation" | "">("");
  const [routingForm, setRoutingForm] = useState({ routedTo: "", university: "", reason: "", involvesIndustry: false, industryNote: "" });
  const [assignForm, setAssignForm] = useState({ assignedTo: "", deadline: "", priority: "Medium" as Problem["priority"], instructions: "" });
  const [progressNote, setProgressNote] = useState("");

  const stats = {
    total: problems.length,
    pending: problems.filter(p => p.status === "Pending").length,
    inProgress: problems.filter(p => p.status === "In Progress" || p.status === "Assigned").length,
    resolved: problems.filter(p => p.status === "Resolved").length,
    overdue: tasks.filter(t => t.status === "Overdue").length,
    innovationRoute: problems.filter(p => p.track === "Innovation Route").length,
  };

  const districts = ["All", ...Array.from(new Set(problems.map(p => p.district)))];

  const filteredProblems = problems.filter(p => {
    if (filterStatus !== "All" && p.status !== filterStatus) return false;
    if (filterTrack !== "All" && p.track !== filterTrack) return false;
    if (filterDistrict !== "All" && p.district !== filterDistrict) return false;
    return true;
  });

  const handleAssign = () => {
    if (!selectedProblem || !assignForm.assignedTo || !assignForm.deadline) return;
    const taskId = `TASK-${String(tasks.length + 13).padStart(5, "0")}`;
    const newTask: Task = {
      id: taskId, problemId: selectedProblem.id, problemTitle: selectedProblem.title,
      assignedTo: assignForm.assignedTo, assignedToType: ASSIGN_TO_TYPES[assignForm.assignedTo] ?? "department",
      assignedBy: user!.name, assignedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      deadline: assignForm.deadline, priority: assignForm.priority, instructions: assignForm.instructions,
      status: "Pending", progressUpdates: [],
    };
    addTask(newTask);
    updateProblemStatus(selectedProblem.id, "Assigned", { assignedTo: assignForm.assignedTo, taskId });
    addNotification({ forRole: "admin", type: "info", title: "Task Assigned", message: `${user?.name} assigned problem ${selectedProblem.id} to ${assignForm.assignedTo}.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "official", action: "TASK_ASSIGNED", entity: "Task", entityId: taskId, details: `Assigned to: ${assignForm.assignedTo}. Deadline: ${assignForm.deadline}` });
    setShowAssignModal(false);
    setAssignForm({ assignedTo: "", deadline: "", priority: "Medium", instructions: "" });
    setSelectedProblem(null);
  };

  const handleMarkResolved = (problemId: string) => {
    updateProblemStatus(problemId, "Resolved");
    addNotification({ forRole: "citizen", type: "success", title: "Issue Resolved", message: `Your issue ${problemId} has been resolved.`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    logAudit({ actor: user!.name, actorRole: "official", action: "ISSUE_RESOLVED", entity: "Problem", entityId: problemId, details: "Marked as resolved" });
    setSelectedProblem(null);
  };

  const handleAddProgress = (taskId: string) => {
    if (!progressNote.trim()) return;
    updateTask(taskId, { progressUpdates: [...(selectedTask?.progressUpdates ?? []), { date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), note: progressNote }], status: "In Progress" });
    setProgressNote("");
  };

  const handleRouting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRoutingModal || !routingDecision) return;
    const routedTo = routingDecision === "innovation" ? routingForm.university : routingForm.routedTo;
    addIssueRouting({
      id: "",
      problemId: showRoutingModal.id,
      problemTitle: showRoutingModal.title,
      routedBy: user!.virtualId,
      routedByName: user!.name,
      routingType: routingDecision,
      routedTo,
      reason: routingForm.reason,
      routedAt: new Date().toLocaleString("en-IN"),
      status: routingDecision === "innovation" ? "Routed to University" : "Routed to Department",
    });
    if (routingDecision === "innovation") {
      updateProblemStatus(showRoutingModal.id, "University Routed", { assignedTo: routedTo });
      addNotification({ forRole: "university", type: "info", title: "New Problem Assigned", message: `Official ${user?.name} has routed problem ${showRoutingModal.id} to you for innovation. ${routingForm.involvesIndustry ? "Industry collaboration is recommended." : ""}`, read: false, createdAt: new Date().toLocaleString("en-IN") });
    } else {
      updateProblemStatus(showRoutingModal.id, "Assigned", { assignedTo: routedTo, assignedDept: routedTo });
    }
    logAudit({ actor: user!.name, actorRole: "official", action: "ISSUE_ROUTED", entity: "Problem", entityId: showRoutingModal.id, details: `Type: ${routingDecision}, Routed to: ${routedTo}, Reason: ${routingForm.reason}` });
    setShowRoutingModal(null);
    setRoutingDecision("");
    setRoutingForm({ routedTo: "", university: "", reason: "", involvesIndustry: false, industryNote: "" });
    setSelectedProblem(null);
  };

  const TABS = [
    { id: "problems", label: "📋 Problems / Issues" },
    { id: "tasks", label: `🗂️ Tasks (${tasks.length})` },
    { id: "routing", label: `🔀 Issue Routing (${issueRoutings.length})` },
    { id: "analytics", label: "📊 Analytics" },
  ] as const;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div style={{ background: "#1a5276", color: "white", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 17, fontWeight: 700 }}>Government Official Dashboard</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{user?.name} | {user?.designation ?? "District Officer"} | {user?.district}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["Total", stats.total], ["Pending", stats.pending], ["Resolved", stats.resolved], ["Innovation", stats.innovationRoute]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 3, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Total Issues", value: stats.total, color: "#1a5276", icon: "📋" },
          { label: "Pending", value: stats.pending, color: "#e67e22", icon: "⏳" },
          { label: "Active", value: stats.inProgress, color: "#2980b9", icon: "🔧" },
          { label: "Resolved", value: stats.resolved, color: "#138808", icon: "✅" },
          { label: "Overdue", value: stats.overdue, color: "#c0392b", icon: "⚠️" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", border: `2px solid ${s.color}`, borderRadius: 4, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#5a6675", fontWeight: 600, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Resolution bar */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: "10px 16px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a5276" }}>Resolution Rate</span>
        <div style={{ flex: 1, minWidth: 160, background: "#e8ecf0", borderRadius: 2, height: 8 }}>
          <div style={{ width: `${Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%`, background: "#138808", height: "100%", borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#138808" }}>{Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%</span>
        <span style={{ fontSize: 11, color: "#5a6675" }}>SLA: <strong style={{ color: "#138808" }}>87%</strong></span>
        <span style={{ fontSize: 11, color: "#5a6675" }}>Avg. Resolution: <strong>3.2 days</strong></span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap", background: tab === t.id ? "#1a5276" : "transparent", color: tab === t.id ? "white" : "#5a6675", borderBottom: tab === t.id ? "2px solid #ff6600" : "none" }}>{t.label}</button>
        ))}
      </div>

      {/* PROBLEMS TAB */}
      {tab === "problems" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedProblem ? "1fr 360px" : "1fr", gap: 14 }}>
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a6675" }}>Status:</span>
              {["All", "Pending", "Assigned", "In Progress", "University Routed", "Resolved"].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: filterStatus === f ? "#1a5276" : "white", color: filterStatus === f ? "white" : "#1a5276", border: "1.5px solid #1a5276", borderRadius: 2 }}>{f}</button>
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a6675", marginLeft: 6 }}>Track:</span>
              {["All", "Simple Civic", "Innovation Route"].map(f => (
                <button key={f} onClick={() => setFilterTrack(f)} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: filterTrack === f ? "#003580" : "white", color: filterTrack === f ? "white" : "#003580", border: "1.5px solid #003580", borderRadius: 2 }}>{f}</button>
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a6675", marginLeft: 6 }}>District:</span>
              <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 3, padding: "3px 8px" }}>
                {districts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#1a5276", color: "white" }}>
                    {["Issue ID", "Title", "Category", "District", "Track", "Priority", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((p, idx) => {
                    const sc = STATUS_COLORS[p.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
                    return (
                      <tr key={p.id} onClick={() => setSelectedProblem(p)} style={{ background: selectedProblem?.id === p.id ? "#f0f5ff" : idx % 2 === 0 ? "white" : "#f8f9fb", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1a5276", fontWeight: 700 }}>{p.id}</td>
                        <td style={{ padding: "8px 12px", maxWidth: 180 }}><div style={{ fontWeight: 600 }}>{p.title}</div><div style={{ fontSize: 10, color: "#7a8696" }}>{p.citizenName}</div></td>
                        <td style={{ padding: "8px 12px", color: "#5a6675" }}>{p.category}</td>
                        <td style={{ padding: "8px 12px", color: "#5a6675" }}>{p.district}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontSize: 10, background: p.track === "Simple Civic" ? "#e8f4fd" : "#f3e5f5", color: p.track === "Simple Civic" ? "#2980b9" : "#7b1fa2", borderRadius: 2, padding: "1px 7px", fontWeight: 700 }}>{p.track}</span>
                        </td>
                        <td style={{ padding: "8px 12px" }}><span style={{ fontSize: 10, color: PRIORITY_COLORS[p.priority], fontWeight: 700 }}>{p.priority}</span></td>
                        <td style={{ padding: "8px 12px" }}><span style={{ background: sc.bg, color: sc.color, borderRadius: 2, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{p.status}</span></td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={e => { e.stopPropagation(); setSelectedProblem(p); }} style={{ background: "#1a5276", color: "white", border: "none", borderRadius: 2, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>View</button>
                            {p.status === "Pending" && (
                              <button onClick={e => { e.stopPropagation(); setShowRoutingModal(p); }} style={{ background: "#7b1fa2", color: "white", border: "none", borderRadius: 2, padding: "3px 8px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>🔀 Route</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedProblem && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#1a5276" }}>Problem Details</div>
                <button onClick={() => setSelectedProblem(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a6675" }}>×</button>
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1a5276", fontWeight: 700 }}>{selectedProblem.id}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{selectedProblem.title}</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginTop: 4, lineHeight: 1.5 }}>{selectedProblem.description}</div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Category", selectedProblem.category], ["District", selectedProblem.district], ["Reported By", selectedProblem.citizenName], ["Date", selectedProblem.date], ["Track", selectedProblem.track], ["Assigned To", selectedProblem.assignedTo ?? "Not assigned"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 5, borderBottom: "1px solid #f0f2f5" }}>
                    <span style={{ color: "#5a6675", fontWeight: 600 }}>{k}</span>
                    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: 200 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* District-level context: which university and industry are involved */}
              {selectedProblem.teamId && (() => {
                const team = teams.find(t => t.id === selectedProblem.teamId);
                return team ? (
                  <div style={{ marginTop: 10, background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 3, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7b1fa2", marginBottom: 4 }}>🎓 Assigned to University Team</div>
                    <div style={{ fontSize: 12 }}><strong>{team.teamName}</strong> — {team.universityName}</div>
                    <div style={{ fontSize: 11, color: "#5a6675" }}>Status: {team.implementationStatus || team.status}</div>
                  </div>
                ) : null;
              })()}

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedProblem.status === "Pending" && (
                  <button onClick={() => setShowRoutingModal(selectedProblem)} style={{ background: "#7b1fa2", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    🔀 Classify & Route Issue
                  </button>
                )}
                {selectedProblem.status !== "Resolved" && selectedProblem.status !== "Closed" && selectedProblem.status !== "University Routed" && (
                  <button onClick={() => setShowAssignModal(true)} style={{ background: "#1a5276", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    📋 Assign Task to Department
                  </button>
                )}
                {selectedProblem.status === "In Progress" && (
                  <button onClick={() => handleMarkResolved(selectedProblem.id)} style={{ background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    ✅ Mark as Resolved
                  </button>
                )}
              </div>
              {selectedProblem.taskId && (
                <div style={{ marginTop: 10, background: "#f0f5ff", borderRadius: 3, padding: "8px 12px", fontSize: 11 }}>
                  <div style={{ fontWeight: 700, color: "#003580" }}>Task: <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{selectedProblem.taskId}</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TASKS TAB */}
      {tab === "tasks" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedTask ? "1fr 380px" : "1fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.length === 0 && <div style={{ textAlign: "center", color: "#5a6675", padding: 24, background: "white", border: "1px solid var(--border)", borderRadius: 4 }}>No tasks assigned yet.</div>}
            {tasks.map(task => {
              const tcol: Record<string, { bg: string; color: string }> = { "Pending": { bg: "#fff3e0", color: "#e67e22" }, "In Progress": { bg: "#e8f4fd", color: "#2980b9" }, "Completed": { bg: "#e8f5e9", color: "#2e7d32" }, "Overdue": { bg: "#fdf0f0", color: "#c0392b" } };
              const sc = tcol[task.status] ?? { bg: "#f0f2f5", color: "#5a6675" };
              return (
                <div key={task.id} onClick={() => setSelectedTask(task)} style={{ background: "white", border: `1px solid ${selectedTask?.id === task.id ? "#1a5276" : "var(--border)"}`, borderRadius: 4, padding: 14, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#1a5276", fontWeight: 700 }}>{task.id}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{task.problemTitle}</div>
                      <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Assigned to: <strong>{task.assignedTo}</strong></div>
                      <div style={{ fontSize: 11, color: "#5a6675", marginTop: 2 }}>By: {task.assignedBy} | Deadline: <strong style={{ color: "#e67e22" }}>{task.deadline}</strong></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{task.status}</span>
                      <span style={{ fontSize: 10, color: PRIORITY_COLORS[task.priority], fontWeight: 700 }}>{task.priority} Priority</span>
                    </div>
                  </div>
                  {task.progressUpdates.length > 0 && (
                    <div style={{ marginTop: 8, background: "#f8f9fb", borderRadius: 2, padding: "6px 10px", fontSize: 11, color: "#5a6675" }}>
                      Latest: <strong>{task.progressUpdates[task.progressUpdates.length - 1].note}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedTask && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 16, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, color: "#1a5276" }}>Task Details</div>
                <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a6675" }}>×</button>
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1a5276", fontWeight: 700 }}>{selectedTask.id}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{selectedTask.problemTitle}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Assigned To", selectedTask.assignedTo], ["Assigned By", selectedTask.assignedBy], ["Date", selectedTask.assignedDate], ["Deadline", selectedTask.deadline], ["Priority", selectedTask.priority]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 5, borderBottom: "1px solid #f0f2f5" }}>
                    <span style={{ color: "#5a6675", fontWeight: 600 }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              {selectedTask.instructions && (
                <div style={{ marginTop: 10, background: "#f0f5ff", borderRadius: 3, padding: "8px 12px", fontSize: 12 }}>
                  <strong>Instructions:</strong> {selectedTask.instructions}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a5276", marginBottom: 6 }}>Progress Updates</div>
                {selectedTask.progressUpdates.length === 0 && <div style={{ fontSize: 12, color: "#5a6675" }}>No updates yet.</div>}
                {selectedTask.progressUpdates.map((u, i) => (
                  <div key={i} style={{ background: "#f8f9fb", borderRadius: 2, padding: "6px 10px", fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: "#5a6675", fontFamily: "JetBrains Mono, monospace" }}>{u.date}</span>: {u.note}
                  </div>
                ))}
                <textarea rows={2} value={progressNote} onChange={e => setProgressNote(e.target.value)} placeholder="Add progress update..." style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "6px 10px", fontSize: 12, resize: "none", marginTop: 8 }} />
                <button onClick={() => handleAddProgress(selectedTask.id)} style={{ marginTop: 6, width: "100%", background: "#1a5276", color: "white", border: "none", borderRadius: 3, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add Update</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUTING TAB */}
      {tab === "routing" && (
        <div>
          <div style={{ background: "#f0f5ff", border: "1px solid #c5d4f0", borderRadius: 4, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#003580" }}>
            <strong>🔀 Smart Issue Routing:</strong> As a government official, you can classify each problem as requiring innovation (route to university) or not (route to appropriate department). Every routing decision is logged in the audit trail.
          </div>

          {/* Routing history */}
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1a5276", marginBottom: 12 }}>Routing History ({issueRoutings.length})</div>
          {issueRoutings.length === 0 && <div style={{ textAlign: "center", padding: 24, background: "white", border: "1px solid var(--border)", borderRadius: 4, color: "#5a6675" }}>No issues routed yet. Use the "Route" button on pending problems.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {issueRoutings.map(r => (
              <div key={r.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, background: r.routingType === "innovation" ? "#f3e5f5" : "#e3f2fd", color: r.routingType === "innovation" ? "#7b1fa2" : "#1565c0", borderRadius: 2, padding: "1px 8px", fontWeight: 700 }}>
                        {r.routingType === "innovation" ? "💡 Innovation Route" : "🏛️ Standard Civic"}
                      </span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#5a6675" }}>{r.problemId}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.problemTitle}</div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Routed to: <strong>{r.routedTo}</strong></div>
                    <div style={{ fontSize: 12, color: "#5a6675", marginTop: 2 }}>Reason: {r.reason}</div>
                    <div style={{ fontSize: 10, color: "#7a8696", marginTop: 4 }}>By {r.routedByName} | {r.routedAt}</div>
                  </div>
                  <span style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 700, alignSelf: "flex-start" }}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Audit trail */}
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1a5276", marginBottom: 12 }}>Audit Log ({auditLog.length} entries)</div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, overflow: "auto", maxHeight: 320 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "#f0f2f5" }}>
                  {["ID", "Timestamp", "Actor", "Action", "Entity", "Details"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#5a6675", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#5a6675" }}>No audit entries yet.</td></tr>
                )}
                {auditLog.map((entry, i) => (
                  <tr key={entry.id} style={{ background: i % 2 === 0 ? "white" : "#f8f9fb", borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", color: "#1a5276" }}>{entry.id}</td>
                    <td style={{ padding: "7px 12px", color: "#5a6675", whiteSpace: "nowrap" }}>{entry.timestamp}</td>
                    <td style={{ padding: "7px 12px", fontWeight: 600 }}>{entry.actor}</td>
                    <td style={{ padding: "7px 12px" }}><span style={{ background: "#f0f5ff", color: "#003580", borderRadius: 2, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{entry.action}</span></td>
                    <td style={{ padding: "7px 12px", color: "#5a6675" }}>{entry.entity} <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{entry.entityId}</span></td>
                    <td style={{ padding: "7px 12px", color: "#5a6675", maxWidth: 240 }}>{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1a5276", marginBottom: 14 }}>Issues by Category</div>
            {Array.from(new Set(problems.map(p => p.category))).map(cat => {
              const count = problems.filter(p => p.category === cat).length;
              const pct = Math.round((count / problems.length) * 100);
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{cat}</span><span style={{ color: "#5a6675" }}>{count}</span>
                  </div>
                  <div style={{ background: "#e8ecf0", borderRadius: 2, height: 6 }}>
                    <div style={{ width: `${pct}%`, background: "#1a5276", height: "100%", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1a5276", marginBottom: 14 }}>District-wise Breakdown</div>
            {Array.from(new Set(problems.map(p => p.district))).map(dist => {
              const distProblems = problems.filter(p => p.district === dist);
              const resolved = distProblems.filter(p => p.status === "Resolved").length;
              const pct = Math.round((resolved / Math.max(distProblems.length, 1)) * 100);
              return (
                <div key={dist} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{dist}</span>
                    <span style={{ color: "#5a6675" }}>{distProblems.length} issues | {resolved} resolved ({pct}%)</span>
                  </div>
                  <div style={{ background: "#e8ecf0", borderRadius: 2, height: 6 }}>
                    <div style={{ width: `${pct}%`, background: "#138808", height: "100%", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ gridColumn: "1 / -1", background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 18 }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 14, fontWeight: 700, color: "#1a5276", marginBottom: 14 }}>Innovation vs. Non-Innovation Routing</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Innovation Route", value: stats.innovationRoute, color: "#7b1fa2", icon: "💡" },
                { label: "Simple Civic", value: problems.filter(p => p.track === "Simple Civic").length, color: "#2980b9", icon: "🏛️" },
                { label: "University Routed", value: problems.filter(p => p.status === "University Routed").length, color: "#1e8449", icon: "🎓" },
                { label: "Routing Records", value: issueRoutings.length, color: "#d35400", icon: "🔀" },
              ].map(item => (
                <div key={item.label} style={{ background: item.color + "10", border: `1px solid ${item.color}40`, borderRadius: 4, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 22, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#5a6675", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Task Modal ── */}
      {showAssignModal && selectedProblem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 4, padding: 24, width: 500, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#1a5276", marginBottom: 6 }}>Assign Task</div>
            <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 16 }}>Problem: <strong>{selectedProblem.title}</strong></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>Assign To *</label>
                <select value={assignForm.assignedTo} onChange={e => setAssignForm({ ...assignForm, assignedTo: e.target.value })} style={IS}>
                  <option value="">Select Department / Team / Person</option>
                  <optgroup label="Government Departments">
                    {ASSIGN_TO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </optgroup>
                  <optgroup label="Universities">
                    {UNIVERSITIES.map(o => <option key={o}>{o}</option>)}
                  </optgroup>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LS}>Deadline *</label>
                  <input type="date" value={assignForm.deadline} onChange={e => setAssignForm({ ...assignForm, deadline: e.target.value })} style={IS} required />
                </div>
                <div>
                  <label style={LS}>Priority</label>
                  <select value={assignForm.priority} onChange={e => setAssignForm({ ...assignForm, priority: e.target.value as any })} style={IS}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={LS}>Instructions</label>
                <textarea value={assignForm.instructions} onChange={e => setAssignForm({ ...assignForm, instructions: e.target.value })} rows={3} style={{ ...IS, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAssignModal(false)} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAssign} disabled={!assignForm.assignedTo || !assignForm.deadline} style={{ padding: "8px 20px", background: assignForm.assignedTo && assignForm.deadline ? "#1a5276" : "#a0aab4", color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: assignForm.assignedTo && assignForm.deadline ? "pointer" : "not-allowed" }}>
                Assign Task →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart Routing Modal ── */}
      {showRoutingModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 4, padding: 24, width: 540, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 700, color: "#1a5276", marginBottom: 4 }}>🔀 Classify & Route Issue</div>
            <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 16 }}>Problem: <strong>{showRoutingModal.title}</strong> ({showRoutingModal.id})</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a5276", marginBottom: 10 }}>Step 1: Classify the Issue *</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button type="button" onClick={() => setRoutingDecision("innovation")} style={{ border: `2px solid ${routingDecision === "innovation" ? "#7b1fa2" : "var(--border)"}`, borderRadius: 4, padding: "16px 14px", cursor: "pointer", background: routingDecision === "innovation" ? "#f3e5f5" : "white", textAlign: "left" }}>
                  <div style={{ fontSize: 22 }}>💡</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7b1fa2", marginTop: 6 }}>Requires Innovation</div>
                  <div style={{ fontSize: 11, color: "#5a6675", marginTop: 3, lineHeight: 1.4 }}>Complex challenge needing research, technology, or novel solution. Route to university.</div>
                  {routingDecision === "innovation" && <div style={{ marginTop: 6, fontSize: 11, color: "#7b1fa2", fontWeight: 700 }}>✓ Selected</div>}
                </button>
                <button type="button" onClick={() => setRoutingDecision("non-innovation")} style={{ border: `2px solid ${routingDecision === "non-innovation" ? "#1565c0" : "var(--border)"}`, borderRadius: 4, padding: "16px 14px", cursor: "pointer", background: routingDecision === "non-innovation" ? "#e3f2fd" : "white", textAlign: "left" }}>
                  <div style={{ fontSize: 22 }}>🏛️</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1565c0", marginTop: 6 }}>Does Not Require Innovation</div>
                  <div style={{ fontSize: 11, color: "#5a6675", marginTop: 3, lineHeight: 1.4 }}>Standard civic issue that can be resolved through normal government processes.</div>
                  {routingDecision === "non-innovation" && <div style={{ marginTop: 6, fontSize: 11, color: "#1565c0", fontWeight: 700 }}>✓ Selected</div>}
                </button>
              </div>
            </div>

            {routingDecision && (
              <form onSubmit={handleRouting}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {routingDecision === "innovation" ? (
                    <>
                      <div>
                        <label style={LS}>Route to University *</label>
                        <select value={routingForm.university} onChange={e => setRoutingForm(f => ({ ...f, university: e.target.value }))} required style={IS}>
                          <option value="">Select university / innovation team</option>
                          {UNIVERSITIES.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                        <input type="checkbox" checked={routingForm.involvesIndustry} onChange={e => setRoutingForm(f => ({ ...f, involvesIndustry: e.target.checked }))} />
                        <span>Recommend Industry Partner Involvement</span>
                      </label>
                      {routingForm.involvesIndustry && (
                        <div>
                          <label style={LS}>Industry Involvement Note</label>
                          <input value={routingForm.industryNote} onChange={e => setRoutingForm(f => ({ ...f, industryNote: e.target.value }))} placeholder="e.g. Suggest partnering with SAIL or Tata Steel for implementation" style={IS} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <label style={LS}>Route to Department *</label>
                      <select value={routingForm.routedTo} onChange={e => setRoutingForm(f => ({ ...f, routedTo: e.target.value }))} required style={IS}>
                        <option value="">Select appropriate department</option>
                        {ASSIGN_TO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={LS}>Reason / Justification *</label>
                    <textarea value={routingForm.reason} onChange={e => setRoutingForm(f => ({ ...f, reason: e.target.value }))} required rows={3} placeholder={routingDecision === "innovation" ? "Explain why this requires innovation and why you selected this university..." : "Explain why this is a standard issue and which department is best equipped to handle it..."} style={{ ...IS, resize: "vertical" }} />
                  </div>
                </div>
                <div style={{ background: "#f0f5ff", border: "1px solid #c5d4f0", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#003580", marginTop: 12 }}>
                  🔒 This routing decision will be recorded in the audit log with your name, timestamp, and reason.
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => { setShowRoutingModal(null); setRoutingDecision(""); }} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ padding: "8px 20px", background: routingDecision === "innovation" ? "#7b1fa2" : "#1565c0", color: "white", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {routingDecision === "innovation" ? "Route to University →" : "Route to Department →"}
                  </button>
                </div>
              </form>
            )}

            {!routingDecision && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => { setShowRoutingModal(null); }} style={{ padding: "8px 18px", background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, color: "#5a6675", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const LS: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 };
const IS: React.CSSProperties = { width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" };

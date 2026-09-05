import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Role } from "../context/AppContext";

interface MessagesPanelProps {
  myVirtualId: string;
  myName: string;
  myRole: Role;
  filterProjectId?: string;
}

export default function MessagesPanel({ myVirtualId, myName, myRole, filterProjectId }: MessagesPanelProps) {
  const { messages, sendMessage, markMessageRead, teams } = useApp();
  const [compose, setCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({ toVirtualId: "", toName: "", toRole: "university" as Role, projectId: "", content: "" });
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const myMessages = messages.filter(m =>
    (m.fromVirtualId === myVirtualId || m.toVirtualId === myVirtualId) &&
    (!filterProjectId || m.projectId === filterProjectId)
  );

  // Group by project
  const threadMap: Record<string, typeof myMessages> = {};
  myMessages.forEach(m => {
    if (!threadMap[m.projectId]) threadMap[m.projectId] = [];
    threadMap[m.projectId].push(m);
  });
  const threads = Object.entries(threadMap).map(([projectId, msgs]) => ({
    projectId,
    projectTitle: msgs[0].projectTitle,
    lastMsg: msgs[msgs.length - 1],
    unread: msgs.filter(m => m.toVirtualId === myVirtualId && !m.read).length,
    msgs: msgs.sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
  }));

  const COUNTER_ROLE_CONTACTS: { virtualId: string; name: string; role: Role }[] = [
    { virtualId: "JA-I-00001", name: "Rajesh Verma (Tata Steel Ltd.)", role: "industry" },
    { virtualId: "JA-U-00001", name: "Dr. Anita Sharma (BIT Mesra)", role: "university" },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.content.trim() || !composeForm.projectId || !composeForm.toVirtualId) return;
    const team = teams.find(t => t.id === composeForm.projectId);
    sendMessage({
      fromVirtualId: myVirtualId,
      fromName: myName,
      fromRole: myRole,
      toVirtualId: composeForm.toVirtualId,
      toName: composeForm.toName,
      toRole: composeForm.toRole,
      projectId: composeForm.projectId,
      projectTitle: team?.teamName || composeForm.projectId,
      content: composeForm.content.trim(),
    });
    setCompose(false);
    setComposeForm({ toVirtualId: "", toName: "", toRole: "university", projectId: "", content: "" });
  };

  const handleReply = (e: React.FormEvent, thread: typeof threads[0]) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    const lastMsg = thread.lastMsg;
    const toVId = lastMsg.fromVirtualId === myVirtualId ? lastMsg.toVirtualId : lastMsg.fromVirtualId;
    const toName = lastMsg.fromVirtualId === myVirtualId ? lastMsg.toName : lastMsg.fromName;
    const toRole = lastMsg.fromVirtualId === myVirtualId ? lastMsg.toRole : lastMsg.fromRole;
    sendMessage({
      fromVirtualId: myVirtualId,
      fromName: myName,
      fromRole: myRole,
      toVirtualId: toVId,
      toName,
      toRole,
      projectId: thread.projectId,
      projectTitle: thread.projectTitle,
      content: replyContent.trim(),
    });
    setReplyContent("");
  };

  const openThread = (projectId: string) => {
    setActiveThread(projectId);
    threadMap[projectId]?.filter(m => m.toVirtualId === myVirtualId && !m.read).forEach(m => markMessageRead(m.id));
  };

  const S = {
    panel: { background: "white", border: "1px solid var(--border)", borderRadius: 4 },
    header: { padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    threadItem: (active: boolean): React.CSSProperties => ({ padding: "10px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: active ? "#f0f5ff" : "white", transition: "background 0.1s" }),
    bubble: (mine: boolean): React.CSSProperties => ({ maxWidth: "75%", alignSelf: mine ? "flex-end" : "flex-start", background: mine ? "#003580" : "#f0f2f5", color: mine ? "white" : "#0d1b2a", borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 12px", fontSize: 13 }),
  };

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#003580" }}>
          💬 Messages
          {myMessages.filter(m => m.toVirtualId === myVirtualId && !m.read).length > 0 && (
            <span style={{ marginLeft: 8, background: "#c0392b", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>
              {myMessages.filter(m => m.toVirtualId === myVirtualId && !m.read).length} new
            </span>
          )}
        </div>
        <button onClick={() => { setCompose(true); setActiveThread(null); }} style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          + New Message
        </button>
      </div>

      {compose && (
        <form onSubmit={handleSend} style={{ padding: 14, borderBottom: "1px solid var(--border)", background: "#f8fafd" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#003580", marginBottom: 10 }}>New Message</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 3 }}>To *</label>
              <select value={composeForm.toVirtualId} onChange={e => {
                const contact = COUNTER_ROLE_CONTACTS.find(c => c.virtualId === e.target.value);
                if (contact) setComposeForm(f => ({ ...f, toVirtualId: contact.virtualId, toName: contact.name, toRole: contact.role }));
              }} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "7px 8px", fontSize: 12, background: "white" }} required>
                <option value="">Select recipient</option>
                {COUNTER_ROLE_CONTACTS.filter(c => c.virtualId !== myVirtualId).map(c => (
                  <option key={c.virtualId} value={c.virtualId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 3 }}>Project *</label>
              <select value={composeForm.projectId} onChange={e => setComposeForm(f => ({ ...f, projectId: e.target.value }))} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "7px 8px", fontSize: 12, background: "white" }} required>
                <option value="">Select project</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
          </div>
          <textarea value={composeForm.content} onChange={e => setComposeForm(f => ({ ...f, content: e.target.value }))} placeholder="Type your message…" rows={3} required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setCompose(false)} style={{ background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, padding: "6px 14px", fontSize: 12, color: "#5a6675", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Send →</button>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: 320 }}>
        {/* Thread list */}
        <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto", maxHeight: 480 }}>
          {threads.length === 0 && (
            <div style={{ padding: 20, fontSize: 12, color: "#5a6675", textAlign: "center" }}>No conversations yet.</div>
          )}
          {threads.map(t => (
            <div key={t.projectId} style={S.threadItem(activeThread === t.projectId)} onClick={() => openThread(t.projectId)}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#003580", marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{t.projectTitle}</span>
                {t.unread > 0 && <span style={{ background: "#c0392b", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, flexShrink: 0 }}>{t.unread}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#5a6675", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.lastMsg.content}</div>
              <div style={{ fontSize: 10, color: "#a0aab4", marginTop: 2 }}>{t.lastMsg.sentAt}</div>
            </div>
          ))}
        </div>

        {/* Thread view */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!activeThread ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#a0aab4", fontSize: 13 }}>
              Select a conversation to view messages
            </div>
          ) : (() => {
            const thread = threads.find(t => t.projectId === activeThread)!;
            return (
              <>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "#f8fafd" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#003580" }}>📁 {thread.projectTitle}</div>
                  <div style={{ fontSize: 10, color: "#5a6675" }}>{thread.msgs.length} messages in this thread</div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10, maxHeight: 340 }}>
                  {thread.msgs.map(m => {
                    const mine = m.fromVirtualId === myVirtualId;
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                        <div style={{ fontSize: 10, color: "#a0aab4", marginBottom: 3 }}>{mine ? "You" : m.fromName} · {m.sentAt}</div>
                        <div style={S.bubble(mine)}>{m.content}</div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={e => { handleReply(e, thread); }} style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                  <input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Type a reply…" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 3, padding: "7px 10px", fontSize: 13, fontFamily: "inherit" }} />
                  <button type="submit" style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Send</button>
                </form>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

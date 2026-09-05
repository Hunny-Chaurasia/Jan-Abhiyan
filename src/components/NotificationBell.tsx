import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Role } from "../context/AppContext";

export default function NotificationBell({ role }: { role: Role }) {
  const { notifications, markNotifRead } = useApp();
  const [open, setOpen] = useState(false);

  const mine = notifications.filter(n => n.forRole === role || n.forRole === "all");
  const unread = mine.filter(n => !n.read).length;

  const TYPE_COLORS: Record<string, string> = {
    info: "#2980b9",
    warning: "#e67e22",
    success: "#138808",
    alert: "#c0392b",
  };

  const TYPE_ICONS: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    alert: "🚨",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 3, padding: "5px 10px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}
      >
        🔔
        {unread > 0 && (
          <span style={{ background: "#ff6600", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, background: "white", border: "1px solid var(--border)", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 420, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#003580", color: "white", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications ({unread} unread)</span>
              <button onClick={() => mine.forEach(n => markNotifRead(n.id))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 11, cursor: "pointer" }}>Mark all read</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {mine.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#5a6675", fontSize: 13 }}>No notifications</div>
              )}
              {mine.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotifRead(n.id)}
                  style={{ padding: "10px 14px", borderBottom: "1px solid #f0f2f5", cursor: "pointer", background: n.read ? "white" : "#f0f5ff", display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICONS[n.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: TYPE_COLORS[n.type] }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#5a6675", marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: "#9aa5b1", marginTop: 4 }}>{n.createdAt}</div>
                  </div>
                  {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#003580", flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

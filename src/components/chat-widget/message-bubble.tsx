import { type ChatMessage, type ChatState, fmtTime, mediaKind } from "./types";
import { chatCopy } from "@/lib/chat-widget-copy";

export function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.direction === "system") {
    return <div className="pl-msg-system">{m.body}</div>;
  }
  const outbound = m.direction === "outbound";
  return (
    <div className={`pl-msg ${outbound ? "pl-out" : "in"}`}>
      <div
        className={`pl-bubble ${m.status === "pending" ? "pl-pending" : ""} ${m.status === "failed" ? "pl-failed" : ""}`}
      >
        {m.body && <p className="pl-bubble-body">{m.body}</p>}
        {(m.attachments ?? []).map((u, i) => {
          const k = mediaKind(u);
          if (k === "image") return <img key={i} src={u} alt="" className="pl-media" />;
          if (k === "video") return <video key={i} src={u} controls className="pl-media" />;
          if (k === "audio") return <audio key={i} src={u} controls className="pl-media" />;
          return (
            <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="pl-file-link">
              {u.split("/").pop() || "file"}
            </a>
          );
        })}
        {m.status === "failed" && <span className="pl-retry-note">Failed to send</span>}
      </div>
      {m.dateAdded && <time className="pl-time">{fmtTime(m.dateAdded)}</time>}
    </div>
  );
}

export function StatusLine({ state }: { state: ChatState }) {
  if (state.error?.message) {
    return <div className="pl-status pl-status-err">{state.error.message}</div>;
  }
  if (state.connection === "reconnecting")
    return <div className="pl-status">{chatCopy.reconnectingText}</div>;
  if (state.connection === "offline")
    return <div className="pl-status">{chatCopy.offlineText}</div>;
  return null;
}

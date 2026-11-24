export type Direction = "inbound" | "outbound" | "system";
export type Status = "pending" | "sent" | "failed";

export interface ChatMessage {
  body?: string;
  direction: Direction;
  status?: Status;
  dateAdded?: string;
  attachments?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  status: "uploading" | "uploaded" | "failed";
  progress?: number;
  url?: string;
  failureText?: string;
}

export interface ContactField {
  value: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  dataType?: "TEXTAREA" | "PHONE" | "EMAIL" | string;
}

export interface ChatState {
  config?: any;
  isOpen?: boolean;
  messages?: ChatMessage[];
  hasMoreHistory?: boolean;
  historyLoading?: boolean;
  agentTyping?: boolean;
  unreadCount?: number;
  canSend?: boolean;
  sendBlockedUntil?: string | null;
  captchaRequired?: boolean;
  captchaStatusMessage?: string;
  rateLimited?: boolean;
  connection?: "idle" | "connecting" | "connected" | "reconnecting" | "offline";
  showContactForm?: boolean;
  feedbackRequested?: boolean;
  feedbackSubmitted?: boolean;
  ended?: boolean;
  endedReason?: string;
  contactFormSubmitted?: boolean;
  requestState?: string;
  error?: { message?: string; field?: string; code?: string } | null;
  attachments?: Attachment[];
  awaitingChatTypeSelection?: boolean;
  activeChatType?: "liveChat" | "emailChat" | null;
  detectedCountry?: string | null;
}

export const mediaKind = (u: string) =>
  /\.(mp4|mov|webm)(\?|$)/i.test(u)
    ? "video"
    : /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(u)
      ? "audio"
      : /\.(png|jpe?g|gif|webp|heic)(\?|$)/i.test(u)
        ? "image"
        : "file";

export function fmtTime(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

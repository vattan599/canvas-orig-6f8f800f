import { useEffect, useMemo, useRef, useState } from "react";
import { chatWidgetConfig, loadChatCore } from "@/lib/chat-widget-config";
import { chatCopy } from "@/lib/chat-widget-copy";
import type { ChatState, ContactField } from "./types";
import { MessageBubble, StatusLine } from "./message-bubble";
import { ContactForm } from "./contact-form";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ChatWidget() {
  const [state, setState] = useState<ChatState>({});
  const [text, setText] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openIntent, setOpenIntent] = useState(false);

  const chatRef = useRef<any>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const s = state;
  const config = s.config;
  const activeType = s.activeChatType;
  const liveChat = activeType === "liveChat";
  const emailChat = activeType === "emailChat";

  // ---- setup client ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const core = await loadChatCore(chatWidgetConfig.coreUrl);
        if (cancelled) return;
        const { createChatClient } = core;
        const chat = createChatClient({
          locationId: chatWidgetConfig.locationId,
          widgetId: chatWidgetConfig.chatWidgetId,
          marketplaceUrl: chatWidgetConfig.marketplaceUrl,
          source: chatWidgetConfig.source,
        });
        chatRef.current = chat;
        const unsub = chat.subscribe((st: ChatState) => {
          if (!cancelled) setState(st);
        });
        unsubRef.current = unsub;
        const def = chat.getState?.()?.config?.compliance?.defaultConsentCheck;
        if (typeof def === "boolean") setConsentGiven(def);
        if (openIntent) {
          chat.setPanelOpen(true);
          await chat.open();
        }
      } catch (e) {
        setState((p) => ({
          ...p,
          error: { message: (e as Error)?.message || "Failed to load chat" },
        }));
      }
    })();
    return () => {
      cancelled = true;
      try {
        unsubRef.current?.();
      } catch {}
      try {
        chatRef.current?.close();
      } catch {}
      chatRef.current = null;
      unsubRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set captcha anchor once panel mounts
  useEffect(() => {
    if (panelRef.current && chatRef.current) {
      try {
        chatRef.current.setCaptchaAnchor(panelRef.current);
      } catch {}
    }
  }, [s.isOpen]);

  // open intent -> open once client ready
  useEffect(() => {
    if (openIntent && chatRef.current && s.isOpen !== undefined) {
      (async () => {
        try {
          chatRef.current.setPanelOpen(true);
          await chatRef.current.open();
        } catch {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIntent, chatRef.current]);

  // prefetch on idle
  useEffect(() => {
    const idle = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined;
    const run = () => loadChatCore(chatWidgetConfig.coreUrl).catch(() => {});
    if (idle) idle(run);
    else window.setTimeout(run, 2000);
  }, []);

  const open = () => {
    if (chatRef.current) {
      chatRef.current.setPanelOpen(true);
      chatRef.current.open();
    } else {
      setOpenIntent(true);
    }
  };
  const close = () => {
    try {
      chatRef.current?.setPanelOpen(false);
    } catch {}
  };

  // ---- transcript scroll ----
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [s.messages?.length, s.agentTyping]);

  // ---- send ----
  const uploading = (s.attachments ?? []).some((a) => a.status === "uploading");
  const ready = (s.attachments ?? [])
    .filter((a) => a.status === "uploaded")
    .map((a) => a.url) as string[];

  const send = async () => {
    const chat = chatRef.current;
    if (!chat) return;
    if (!(s.canSend && !uploading && (text.trim() || ready.length))) return;
    const payload = { text: text.trim(), attachments: ready };
    setText("");
    try {
      await chat.sendMessage(payload);
    } catch {}
  };

  const onPickFile = (files: FileList | null) => {
    const chat = chatRef.current;
    if (!files || !files.length || !chat) return;
    const max = s.config?.liveChat?.attachments?.maxFiles ?? Infinity;
    const current = (s.attachments ?? []).length;
    const room = Math.max(0, max - current);
    Array.from(files)
      .slice(0, room)
      .forEach((f) => {
        chat.uploadAttachment(f).catch(() => {});
      });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- contact form ----
  const fields: ContactField[] = useMemo(
    () => (s.config?.contactForm?.fields ?? []) as ContactField[],
    [s.config],
  );
  const compliance = s.config?.compliance ?? {};
  const showConsent = !!compliance.showConsentCheckbox;
  const consentRequired = !!compliance.consentRequired;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const chat = chatRef.current;
    if (!chat) return;
    if (s.captchaRequired) return;
    const missing: string[] = [];
    for (const f of fields) {
      if (f.required && !(formValues[f.value] ?? "").trim()) missing.push(f.label);
    }
    if (missing.length) {
      setFormError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (consentRequired && !consentGiven) {
      setFormError("Please accept the consent to continue.");
      return;
    }
    setFormError(null);
    const payload = Object.fromEntries(fields.map((f) => [f.value, formValues[f.value] ?? ""]));
    try {
      await chat.submitContactForm({ ...payload, consentGiven });
    } catch {}
  };

  // ---- quick replies ----
  const showQuickReplies =
    liveChat &&
    !s.contactFormSubmitted &&
    (s.messages ?? []).filter((m) => m.direction !== "system").length === 0 &&
    !s.showContactForm &&
    !s.feedbackRequested &&
    !s.feedbackSubmitted &&
    !s.ended;

  const sendQuickReply = (q: string) => {
    const chat = chatRef.current;
    if (chat && s.canSend) {
      chat.sendMessage({ text: q, attachments: [] }).catch(() => {});
    }
  };

  const panelPending = s.showContactForm || s.feedbackRequested || s.feedbackSubmitted || s.ended;

  return (
    <>
      {/* Teaser bubble */}
      {!s.isOpen && (
        <button type="button" onClick={open} className="pl-teaser" aria-label={chatCopy.teaser}>
          {chatCopy.teaser}
        </button>
      )}

      {/* Launcher */}
      {!s.isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label={chatCopy.launcherLabel}
          className="pl-launcher"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="pl-launcher-ic">
            <path
              d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          {s.unreadCount ? <span className="pl-badge">{s.unreadCount}</span> : null}
        </button>
      )}

      {/* Panel */}
      {s.isOpen && (
        <div className="pl-panel" ref={panelRef} role="dialog" aria-label={chatCopy.heading}>
          <div className="pl-head">
            <div className="pl-head-info">
              <span className="pl-head-title">{chatCopy.heading}</span>
              <span className="pl-head-sub">{chatCopy.subHeading}</span>
            </div>
            <button type="button" onClick={close} aria-label="Close chat" className="pl-x">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="pl-body">
            {/* No config yet */}
            {!config && (
              <div className="pl-center">
                {s.error ? (
                  <div className="pl-err-block">
                    <p>{s.error.message || "Chat failed to load."}</p>
                    <button type="button" className="pl-btn pl-btn-line" onClick={open}>
                      {chatCopy.retryText}
                    </button>
                  </div>
                ) : (
                  <p className="pl-loading">{chatCopy.loadingText}</p>
                )}
              </div>
            )}

            {/* Chat type selection */}
            {config && s.awaitingChatTypeSelection && !activeType && (
              <div className="pl-center">
                <p className="pl-choose">How would you like to chat?</p>
                <div className="pl-choose-row">
                  <button
                    type="button"
                    className="pl-btn pl-btn-gold"
                    onClick={() => chatRef.current?.setActiveChatType("liveChat")}
                  >
                    Live Chat
                  </button>
                  <button
                    type="button"
                    className="pl-btn pl-btn-line"
                    onClick={() => chatRef.current?.setActiveChatType("emailChat")}
                  >
                    SMS / Email
                  </button>
                </div>
              </div>
            )}

            {/* Email chat: form then thank-you */}
            {config &&
              emailChat &&
              (s.contactFormSubmitted ? (
                <div className="pl-center">
                  <p className="pl-thanks">Thanks! We've got your details and will be in touch.</p>
                </div>
              ) : (
                <ContactForm
                  fields={fields}
                  values={formValues}
                  onChange={(k, v) => setFormValues((p) => ({ ...p, [k]: v }))}
                  onSubmit={submitForm}
                  compliance={compliance}
                  showConsent={showConsent}
                  consentGiven={consentGiven}
                  setConsentGiven={setConsentGiven}
                  consentRequired={consentRequired}
                  captchaRequired={!!s.captchaRequired}
                  requestState={s.requestState}
                  error={s.error}
                  formError={formError}
                  detectedCountry={s.detectedCountry}
                />
              ))}

            {/* Live chat: transcript + cards */}
            {config && liveChat && (
              <>
                <div className="pl-thread" ref={threadRef}>
                  {s.hasMoreHistory && (
                    <button
                      type="button"
                      className="pl-history"
                      onClick={() => chatRef.current?.loadOlderMessages()}
                    >
                      {s.historyLoading ? "Loading…" : "Load earlier messages"}
                    </button>
                  )}
                  {(s.messages ?? []).map((m, i) => (
                    <MessageBubble key={i} m={m} />
                  ))}
                  {s.agentTyping && (
                    <div className="pl-typing" aria-label="Agent is typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>

                {showQuickReplies && (
                  <div className="pl-qr">
                    <p className="pl-qr-intro">{chatCopy.quickRepliesIntro}</p>
                    <div className="pl-qr-row">
                      {chatCopy.quickReplies.map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="pl-chip"
                          onClick={() => sendQuickReply(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <StatusLine state={s} />

                {/* pending cards */}
                {s.showContactForm && (
                  <ContactForm
                    fields={fields}
                    values={formValues}
                    onChange={(k, v) => setFormValues((p) => ({ ...p, [k]: v }))}
                    onSubmit={submitForm}
                    compliance={compliance}
                    showConsent={showConsent}
                    consentGiven={consentGiven}
                    setConsentGiven={setConsentGiven}
                    consentRequired={consentRequired}
                    captchaRequired={!!s.captchaRequired}
                    requestState={s.requestState}
                    error={s.error}
                    formError={formError}
                    detectedCountry={s.detectedCountry}
                  />
                )}

                {!s.showContactForm && s.feedbackRequested && !s.feedbackSubmitted && (
                  <div className="pl-card">
                    <p>{s.config?.liveChat?.feedbackMessage || "How did we do?"}</p>
                    <div className="pl-thumbs">
                      <button
                        type="button"
                        aria-label="Thumbs up"
                        onClick={() => chatRef.current?.sendFeedback("positive")}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7 11v8H4v-8h3Zm0 0 4-7a2 2 0 0 1 3 1.7V8h5a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 17 18H7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Thumbs down"
                        onClick={() => chatRef.current?.sendFeedback("negative")}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M17 13V5h3v8h-3Zm0 0-4 7a2 2 0 0 1-3-1.7V16H5a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 6 6h11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {!s.showContactForm && s.feedbackSubmitted && (
                  <div className="pl-card">
                    <p>{s.config?.liveChat?.feedbackNote || "Thanks for your feedback!"}</p>
                    <button
                      type="button"
                      className="pl-btn pl-btn-line"
                      onClick={() => chatRef.current?.restartConversation()}
                    >
                      Start a new chat
                    </button>
                  </div>
                )}

                {!s.showContactForm && !s.feedbackRequested && !s.feedbackSubmitted && s.ended && (
                  <div className="pl-card">
                    <button
                      type="button"
                      className="pl-btn pl-btn-gold"
                      onClick={() => chatRef.current?.restartConversation()}
                    >
                      Start a new chat
                    </button>
                  </div>
                )}

                {/* Composer (hidden while a card is pending) */}
                {!panelPending && (
                  <div className="pl-composer">
                    {(s.attachments ?? []).length > 0 && (
                      <div className="pl-att-chips">
                        {(s.attachments ?? []).map((a) => (
                          <span
                            key={a.id}
                            className={`pl-att ${a.status === "failed" ? "pl-att-fail" : ""}`}
                          >
                            {a.name}
                            {a.status === "uploading" && a.progress != null && (
                              <em>{Math.round((a.progress ?? 0) * 100)}%</em>
                            )}
                            {a.status === "failed" && <em>{a.failureText || "failed"}</em>}
                            <button
                              type="button"
                              aria-label="Remove"
                              onClick={() => chatRef.current?.removeAttachment(a.id)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="pl-composer-row">
                      {s.config?.liveChat?.attachments?.enabled && (
                        <>
                          <button
                            type="button"
                            aria-label="Attach a file"
                            className="pl-clip"
                            disabled={
                              (s.attachments ?? []).length >=
                              (s.config?.liveChat?.attachments?.maxFiles ?? Infinity)
                            }
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <svg viewBox="0 0 24 24" fill="none">
                              <path
                                d="M16 8 8.5 15.5a3 3 0 0 0 4.2 4.2L20 12.4a5 5 0 0 0-7-7L5.5 13a7 7 0 0 0 9.9 9.9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={
                              s.config?.liveChat?.attachments?.acceptedTypes?.join(",") || undefined
                            }
                            className="pl-file-hidden"
                            onChange={(e) => onPickFile(e.target.files)}
                          />
                        </>
                      )}
                      <textarea
                        rows={1}
                        className="pl-input"
                        placeholder="Type a message…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="pl-send"
                        disabled={
                          !(s.canSend && !uploading && (text.trim() || ready.length)) ||
                          s.captchaRequired
                        }
                        onClick={send}
                        aria-label="Send"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 12h13m-5-5 5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    {s.captchaRequired && (
                      <p className="pl-captcha-msg">
                        {s.captchaStatusMessage || "Please complete the captcha."}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

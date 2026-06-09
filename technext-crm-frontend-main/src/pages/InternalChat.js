import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

const BASE_URL = "http://localhost:8080/api";
const WS_URL = "http://localhost:8080/ws";

const CHANNELS = [
  {
    id: "general",
    name: "General",
    icon: "💬",
    desc: "Team-wide announcements",
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: "🪪",
    desc: "Candidate discussions",
  },
  { id: "sales", name: "Sales", icon: "💼", desc: "Leads and deals" },
  { id: "hr", name: "HR", icon: "👥", desc: "HR updates" },
  { id: "operations", name: "Operations", icon: "⚙️", desc: "Ops team" },
];

const EMOJI = [
  "👍",
  "❤️",
  "😊",
  "🎉",
  "🔥",
  "✅",
  "👏",
  "💡",
  "⚡",
  "🚀",
  "😄",
  "🙏",
];

export default function InternalChat() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [connected, setConnected] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typing, setTyping] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => setUsers(r.data))
      .catch(() => {});
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  useEffect(() => {
    loadMessages();
    subscribeToChannel();
  }, [activeChannel, activeDM, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        console.log("WebSocket connected!");
      },
      onDisconnect: () => {
        setConnected(false);
        console.log("WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setConnected(false);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    if (stompClientRef.current) stompClientRef.current.deactivate();
  };

  const subscribeToChannel = () => {
    if (!stompClientRef.current || !connected) return;
    // Unsubscribe from previous channel
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

    const topic = activeDM
      ? `/user/${currentUser.id}/queue/messages`
      : `/topic/channel.${activeChannel}`;

    subscriptionRef.current = stompClientRef.current.subscribe(
      topic,
      (message) => {
        const newMsg = JSON.parse(message.body);
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      },
    );

    // Subscribe to typing indicator
    if (!activeDM) {
      stompClientRef.current.subscribe(
        `/topic/channel.${activeChannel}.typing`,
        (msg) => {
          setTyping(msg.body);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTyping(""), 2000);
        },
      );
    }
  };

  const loadMessages = async () => {
    try {
      let res;
      if (activeDM) {
        res = await axios.get(
          `${BASE_URL}/messages/direct/${currentUser.id}/${activeDM.id}`,
        );
      } else {
        res = await axios.get(`${BASE_URL}/messages/channel/${activeChannel}`);
      }
      setMessages(res.data);
    } catch (e) {}
  };

  const scrollToBottom = () => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const sendMessage = () => {
    if (!inputMsg.trim()) return;

    const payload = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: inputMsg.trim(),
      messageType: "text",
      isRead: false,
    };

    if (activeDM) {
      payload.receiverId = activeDM.id;
      payload.receiverName = activeDM.name;
      payload.channel = `dm_${Math.min(currentUser.id, activeDM.id)}_${Math.max(currentUser.id, activeDM.id)}`;
    } else {
      payload.channel = activeChannel;
    }

    // Send via WebSocket if connected, otherwise fallback to REST
    if (stompClientRef.current && connected) {
      const destination = activeDM ? "/app/chat.direct" : "/app/chat.send";
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(payload),
      });
      // Optimistically add message to UI
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      // Fallback to REST API
      axios
        .post(`${BASE_URL}/messages`, payload)
        .then(() => loadMessages())
        .catch(() => {});
    }

    setInputMsg("");
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setInputMsg(e.target.value);
    // Send typing indicator
    if (stompClientRef.current && connected && !activeDM && e.target.value) {
      stompClientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          senderName: currentUser.name,
          channel: activeChannel,
        }),
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDelete = async (id, senderId) => {
    if (senderId !== currentUser.id) return;
    await axios.delete(`${BASE_URL}/messages/${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const switchChannel = (channelId) => {
    setActiveChannel(channelId);
    setActiveDM(null);
    setMessages([]);
    setTyping("");
  };

  const switchDM = (user) => {
    setActiveDM(user);
    setActiveChannel(null);
    setMessages([]);
    setTyping("");
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#0ea5e9",
      "#ec4899",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const filteredMessages = messages.filter(
    (m) =>
      !searchQuery ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group messages by date
  const groupedMessages = filteredMessages.reduce((groups, msg) => {
    const date = msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Today";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const otherUsers = users.filter((u) => u.id !== currentUser.id);
  const currentChannelInfo = CHANNELS.find((c) => c.id === activeChannel);

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.wsHeader}>
          <div style={s.wsName}>TechNext Chat</div>
          <div style={s.wsStatus}>
            <span
              style={{
                ...s.wsDot,
                background: connected ? "#10b981" : "#ef4444",
              }}
            />
            <span style={s.wsOnline}>
              {connected ? `${users.length} members online` : "Reconnecting..."}
            </span>
          </div>
        </div>

        <div style={s.sideSearch}>
          <input
            style={s.sideSearchInput}
            placeholder="🔍 Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Channels */}
        <div style={s.sideSection}>
          <div style={s.sideSectionTitle}>CHANNELS</div>
          {CHANNELS.map((ch) => (
            <div
              key={ch.id}
              style={{
                ...s.sideItem,
                ...(activeChannel === ch.id && !activeDM
                  ? s.sideItemActive
                  : {}),
              }}
              onClick={() => switchChannel(ch.id)}
            >
              <span style={s.sideItemIcon}>{ch.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    ...s.sideItemName,
                    ...(activeChannel === ch.id && !activeDM
                      ? { color: "#fff" }
                      : {}),
                  }}
                >
                  # {ch.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Messages */}
        <div style={s.sideSection}>
          <div style={s.sideSectionTitle}>DIRECT MESSAGES</div>
          {otherUsers.map((u) => (
            <div
              key={u.id}
              style={{
                ...s.sideItem,
                ...(activeDM?.id === u.id ? s.sideItemActive : {}),
              }}
              onClick={() => switchDM(u)}
            >
              <div
                style={{ ...s.dmAvatar, background: getAvatarColor(u.name) }}
              >
                {getInitials(u.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    ...s.sideItemName,
                    ...(activeDM?.id === u.id ? { color: "#fff" } : {}),
                  }}
                >
                  {u.name}
                </div>
                <div style={s.dmRole}>{u.role}</div>
              </div>
              <div style={s.onlineDot} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div style={s.chatArea}>
        {/* Header */}
        <div style={s.chatHeader}>
          <div style={s.chatHeaderLeft}>
            {activeDM ? (
              <>
                <div
                  style={{
                    ...s.chatHeaderAvatar,
                    background: getAvatarColor(activeDM.name),
                  }}
                >
                  {getInitials(activeDM.name)}
                </div>
                <div>
                  <div style={s.chatHeaderName}>{activeDM.name}</div>
                  <div style={s.chatHeaderSub}>{activeDM.role} · 🟢 Online</div>
                </div>
              </>
            ) : (
              <>
                <div style={s.chatHeaderIcon}>
                  {currentChannelInfo?.icon || "💬"}
                </div>
                <div>
                  <div style={s.chatHeaderName}>
                    # {currentChannelInfo?.name || activeChannel}
                  </div>
                  <div style={s.chatHeaderSub}>
                    {currentChannelInfo?.desc || ""} · {messages.length}{" "}
                    messages
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={s.chatHeaderRight}>
            {/* Connection status */}
            <div
              style={{
                ...s.connStatus,
                background: connected ? "#f0fdf4" : "#fef2f2",
                color: connected ? "#10b981" : "#ef4444",
              }}
            >
              {connected ? "🟢 Live" : "🔴 Offline"}
            </div>
            <button style={s.headerBtn} onClick={loadMessages} title="Refresh">
              🔄
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messageArea}>
          {messages.length === 0 ? (
            <div style={s.emptyChat}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                {activeDM ? "💬" : "🚀"}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f1117",
                  marginBottom: "6px",
                }}
              >
                {activeDM
                  ? `Start a conversation with ${activeDM.name}`
                  : `Welcome to #${activeChannel}!`}
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                Send the first message below 👇
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div style={s.dateDivider}>
                  <div style={s.dateLine} />
                  <span style={s.dateLabel}>{date}</span>
                  <div style={s.dateLine} />
                </div>
                {msgs.map((msg, idx) => {
                  const isOwn = msg.senderId === currentUser.id;
                  const prevMsg = msgs[idx - 1];
                  const showAvatar =
                    !prevMsg || prevMsg.senderId !== msg.senderId;
                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        ...s.msgRow,
                        ...(isOwn ? s.msgRowOwn : {}),
                        ...(!showAvatar
                          ? { marginTop: "2px" }
                          : { marginTop: "12px" }),
                      }}
                    >
                      {!isOwn && (
                        <div style={s.msgAvatarWrap}>
                          {showAvatar ? (
                            <div
                              style={{
                                ...s.msgAvatar,
                                background: getAvatarColor(msg.senderName),
                              }}
                            >
                              {getInitials(msg.senderName)}
                            </div>
                          ) : (
                            <div style={{ width: "34px" }} />
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          ...s.msgBubbleWrap,
                          ...(isOwn
                            ? { alignItems: "flex-end" }
                            : { alignItems: "flex-start" }),
                        }}
                      >
                        {showAvatar && !isOwn && (
                          <div style={s.msgSenderName}>{msg.senderName}</div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "6px",
                            ...(isOwn ? { flexDirection: "row-reverse" } : {}),
                          }}
                        >
                          <div
                            style={{
                              ...s.msgBubble,
                              ...(isOwn ? s.msgBubbleOwn : s.msgBubbleOther),
                            }}
                          >
                            {msg.message}
                          </div>
                          <div style={s.msgTime}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {isOwn && (
                          <button
                            style={s.deleteBtn}
                            onClick={() => handleDelete(msg.id, msg.senderId)}
                          >
                            ✕ delete
                          </button>
                        )}
                      </div>
                      {isOwn && (
                        <div style={s.msgAvatarWrap}>
                          {showAvatar ? (
                            <div
                              style={{
                                ...s.msgAvatar,
                                background: getAvatarColor(currentUser.name),
                              }}
                            >
                              {getInitials(currentUser.name)}
                            </div>
                          ) : (
                            <div style={{ width: "34px" }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
          {/* Typing indicator */}
          {typing && (
            <div style={s.typingIndicator}>
              <div style={s.typingDots}>
                <span />
                <span />
                <span />
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {typing}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          <div style={s.inputBox}>
            <div style={{ position: "relative" }}>
              {showEmoji && (
                <div style={s.emojiPicker}>
                  {EMOJI.map((e) => (
                    <button
                      key={e}
                      style={s.emojiBtn}
                      onClick={() => {
                        setInputMsg((prev) => prev + e);
                        setShowEmoji(false);
                        inputRef.current?.focus();
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <button
                style={s.inputBtn}
                onClick={() => setShowEmoji(!showEmoji)}
              >
                😊
              </button>
            </div>
            <textarea
              ref={inputRef}
              style={s.messageInput}
              placeholder={
                activeDM
                  ? `Message ${activeDM.name}...`
                  : `Message #${activeChannel}...`
              }
              value={inputMsg}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              style={{
                ...s.sendBtn,
                ...(!inputMsg.trim() ? s.sendBtnDisabled : {}),
              }}
              onClick={sendMessage}
              disabled={!inputMsg.trim()}
            >
              ➤
            </button>
          </div>
          <div style={s.inputHint}>
            {connected
              ? "⚡ Real-time · Enter to send · Shift+Enter for new line"
              : "⚠️ Reconnecting... messages will still be sent"}
          </div>
        </div>
      </div>

      {/* Members Panel */}
      <div style={s.membersPanel}>
        <div style={s.membersPanelTitle}>Members ({users.length})</div>
        {users.map((u) => (
          <div key={u.id} style={s.memberItem} onClick={() => switchDM(u)}>
            <div
              style={{ ...s.memberAvatar, background: getAvatarColor(u.name) }}
            >
              {getInitials(u.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.memberName}>
                {u.name}
                {u.id === currentUser.id ? " (you)" : ""}
              </div>
              <div style={s.memberRole}>{u.role}</div>
            </div>
            <div style={s.memberOnline}>🟢</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .typing-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    height: "100%",
    background: "#f8f9fc",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "240px",
    minWidth: "240px",
    background: "#1a1d27",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  wsHeader: {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  wsName: { fontSize: "15px", fontWeight: "800", color: "#fff" },
  wsStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  wsDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  wsOnline: { fontSize: "11px", color: "rgba(255,255,255,0.4)" },
  sideSearch: { padding: "10px 12px" },
  sideSearchInput: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  sideSection: { padding: "6px 8px", marginBottom: "4px" },
  sideSectionTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "1.2px",
    padding: "6px 8px",
    marginBottom: "2px",
  },
  sideItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "1px",
  },
  sideItemActive: { background: "rgba(99,102,241,0.25)" },
  sideItemIcon: { fontSize: "14px", width: "20px", textAlign: "center" },
  sideItemName: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  dmAvatar: {
    width: "26px",
    height: "26px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  dmRole: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.3)",
    marginTop: "1px",
  },
  onlineDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#fff",
  },
  chatHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
  },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  chatHeaderAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
  },
  chatHeaderIcon: { fontSize: "24px" },
  chatHeaderName: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  chatHeaderSub: { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  chatHeaderRight: { display: "flex", gap: "8px", alignItems: "center" },
  connStatus: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  headerBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontSize: "14px",
  },
  messageArea: { flex: 1, overflowY: "auto", padding: "16px 20px" },
  emptyChat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60%",
    gap: "4px",
  },
  dateDivider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "16px 0",
  },
  dateLine: { flex: 1, height: "1px", background: "#f1f3f9" },
  dateLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "600",
    background: "#fff",
    padding: "0 8px",
    whiteSpace: "nowrap",
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  msgRowOwn: { flexDirection: "row-reverse" },
  msgAvatarWrap: { flexShrink: 0 },
  msgAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
  },
  msgBubbleWrap: { display: "flex", flexDirection: "column", maxWidth: "60%" },
  msgSenderName: {
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: "4px",
    paddingLeft: "2px",
  },
  msgBubble: {
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "13.5px",
    lineHeight: "1.5",
    wordBreak: "break-word",
    maxWidth: "100%",
  },
  msgBubbleOwn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  msgBubbleOther: {
    background: "#f1f3f9",
    color: "#0f1117",
    borderBottomLeftRadius: "4px",
  },
  msgTime: {
    fontSize: "10px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
    marginBottom: "2px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "10px",
    color: "#9ca3af",
    padding: "0",
    marginTop: "2px",
    alignSelf: "flex-end",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    marginLeft: "42px",
  },
  typingDots: { display: "flex", gap: "3px" },
  inputArea: {
    padding: "12px 20px 16px",
    borderTop: "1px solid #e5e7f0",
    background: "#fff",
  },
  inputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1.5px solid #e5e7f0",
    padding: "8px 12px",
  },
  inputBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    flexShrink: 0,
  },
  messageInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13.5px",
    color: "#0f1117",
    fontFamily: "inherit",
    resize: "none",
    maxHeight: "120px",
    lineHeight: "1.5",
  },
  sendBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "16px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  sendBtnDisabled: {
    background: "#e5e7f0",
    color: "#9ca3af",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "40px",
    left: 0,
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "12px",
    padding: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    zIndex: 100,
    width: "220px",
  },
  emojiBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    borderRadius: "6px",
    padding: "4px",
  },
  inputHint: {
    fontSize: "10.5px",
    color: "#9ca3af",
    marginTop: "6px",
    textAlign: "center",
  },
  membersPanel: {
    width: "220px",
    minWidth: "220px",
    background: "#fff",
    borderLeft: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "14px",
  },
  membersPanelTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
  },
  memberAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  memberName: { fontSize: "12.5px", fontWeight: "600", color: "#0f1117" },
  memberRole: { fontSize: "10.5px", color: "#9ca3af", marginTop: "1px" },
  memberOnline: { fontSize: "10px" },
};

import { useState, useRef, useEffect } from "react";
import { askCopilot } from "../api/copilot";

export function QAView({ docs, drift }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  const company = drift?.company || docs[0]?.company || "this company";

  const suggestions = [
    `Which commitments carry the highest CSRD/SEC liability right now?`,
    `Summarise all material changes between the earliest and latest report`,
    `Draft a response to: "Why have your climate targets become more conditional?"`,
    `What would a regulator flag as gaps in ${company}'s climate disclosures?`,
    `Prepare talking points for an ESG investor roadshow`,
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question) {
    const q = question.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const response = await askCopilot(q, docs, drift, messages);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="qa-w">

      {/* ── Suggested questions ─────────────────────────────────────────────── */}
      {messages.length === 0 && (
        <div className="sug-row">
          {suggestions.map((s, i) => (
            <button key={i} className="sug" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Message thread ──────────────────────────────────────────────────── */}
      {messages.length > 0 && (
        <div className="msgs">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <div className="msg-lbl">{msg.role === "user" ? "You" : "AuditAI"}</div>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="msg assistant">
              <div className="msg-lbl">AuditAI</div>
              <span className="spin" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      <div className="qa-input-wr">
        <textarea
          className="qa-ta"
          rows={3}
          placeholder={`Ask anything about ${company}'s commitment history… (Enter to send, Shift+Enter for new line)`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="qa-send"
          disabled={!input.trim() || loading}
          onClick={() => send(input)}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>

    </div>
  );
}
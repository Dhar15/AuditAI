import { useState, useEffect } from "react";
import { SAMPLES } from "../data/samples";
import { scoreColor } from "../config/driftRules";

// ─── EmailJS config ───────────────────────────────────────────────────────────
// Fill these in from your EmailJS dashboard (emailjs.com)
// Account → General → Public Key
// Email Services → your service ID
// Email Templates → your template ID

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

async function sendAccessRequest({ name, company, email, role }) {
  // Load EmailJS SDK lazily from CDN if not already loaded
  if (!window.emailjs) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:    name,
    from_email:   email,
    from_company: company,
    role:         role || "Not specified",
    to_email:     "dharkshitij@gmail.com",
  });
}

// ─── Feature list ─────────────────────────────────────────────────────────────

const ACCESS_FEATURES = [
  {
    icon: "⚙",
    title: "Secure document ingestion",
    body: "Annual reports, sustainability disclosures, CDP responses, and investor presentations — processed against your internal commitment taxonomy via our onboarding pipeline.",
  },
  {
    icon: "⚖",
    title: "CSRD & SEC audit-ready output",
    body: "Every extracted commitment is source-cited and exportable. Designed to feed directly into regulatory disclosure workflows and legal review.",
  },
  {
    icon: "🔒",
    title: "Enterprise data isolation",
    body: "Your documents never leave your environment. AuditAI deploys within your cloud tenancy — no shared infrastructure, no third-party data exposure.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeView({ onLoadSample }) {
  const [form,      setForm]      = useState({ name: "", company: "", email: "", role: "" });
  const [status,    setStatus]    = useState("idle"); // idle | sending | success | error
  const [errorMsg,  setErrorMsg]  = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) return;
    setStatus("sending");
    setErrorMsg("");

    try {
      await sendAccessRequest(form);
      setStatus("success");
    } catch (err) {
      console.error("EmailJS error:", err);
      setErrorMsg("Something went wrong — please email dharkshitij@gmail.com directly.");
      setStatus("error");
    }
  }

  const formComplete = form.name.trim() && form.email.trim() && form.company.trim();

  return (
    <div className="home">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="home-eyebrow">ESG Commitment Intelligence</div>

      <h1 className="home-h">
        Commitments made.<br />
        <i>Commitments kept?</i>
      </h1>

      <p className="home-p">
        Energy companies have made hundreds of public climate commitments over the past
        decade — across annual reports, investor days, and regulatory filings. AuditAI
        extracts every commitment, tracks what changed year-over-year, scores credibility
        exposure, and answers your hardest investor and regulatory questions from the
        actual source documents.
      </p>

      {/* ── Sample cards ─────────────────────────────────────────────────────── */}
      <div className="section-lbl">Live examples — click any company to explore</div>

      <div className="samples-grid">
        {Object.values(SAMPLES).map((sample) => {
          const scoreCol      = scoreColor(sample.credibility_score);
          const negativeDrift = sample.drift.commitment_threads.filter(
            (t) => t.drift === "dropped" || t.drift === "revised_down"
          ).length;
          const totalThreads  = sample.drift.commitment_threads.length;

          return (
            <div className="sample-card" key={sample.company} onClick={() => onLoadSample(sample)}>
              <div className="sc-company">{sample.company}</div>
              <div className="sc-years">{sample.years}</div>
              <div className="sc-tag">{sample.tagline}</div>

              <div className="sc-score-row">
                <div>
                  <div className="sc-score" style={{ color: scoreCol }}>{sample.credibility_score}</div>
                  <div className="sc-score-lbl">Credibility / 100</div>
                </div>
                <div className="sc-threads">
                  <div style={{ fontSize: "1.1rem", fontFamily: "var(--serif)", color: "#ef4444" }}>
                    {negativeDrift}
                    <span style={{ fontSize: ".7rem", color: "var(--tx3)" }}> / {totalThreads}</span>
                  </div>
                  <div>commitments deteriorated</div>
                </div>
              </div>

              <button className="sc-load-btn">Explore analysis →</button>
            </div>
          );
        })}
      </div>

      {/* ── Request Access ───────────────────────────────────────────────────── */}
      <div className="divider">for your company</div>

      <div className="access-section">

        {/* Left: feature list */}
        <div className="access-features">
          <div className="section-lbl" style={{ marginBottom: "1.5rem" }}>
            What's included in full access
          </div>

          {ACCESS_FEATURES.map((f) => (
            <div className="access-feature" key={f.title}>
              <div className="af-icon">{f.icon}</div>
              <div>
                <div className="af-title">{f.title}</div>
                <div className="af-body">{f.body}</div>
              </div>
            </div>
          ))}

          <div className="access-note">
            Currently in private beta with ESG and Investor Relations teams at
            European energy majors. Enterprise pricing available on request.
          </div>
        </div>

        {/* Right: form */}
        <div className="access-form-wrap">
          {status === "success" ? (
            <div className="access-success">
              <div className="as-icon">✓</div>
              <div className="as-h">Request received</div>
              <div className="as-p">
                We'll be in touch within 2 business days to schedule an onboarding
                call and discuss your document corpus.
              </div>
            </div>
          ) : (
            <>
              <div className="access-form-h">Request access</div>
              <div className="access-form-sub">
                Tell us about your organisation and we'll set up a private instance
                against your own document library.
              </div>

              <div className="form-fields">
                <div className="form-row">
                  <label className="form-lbl">Full name</label>
                  <input
                    className="form-inp"
                    name="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label className="form-lbl">Company</label>
                  <input
                    className="form-inp"
                    name="company"
                    placeholder="Equinor, Chevron, ExxonMobil, etc."
                    value={form.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label className="form-lbl">Work email</label>
                  <input
                    className="form-inp"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label className="form-lbl">
                    Role <span style={{ color: "var(--tx3)" }}>(optional)</span>
                  </label>
                  <select
                    className="form-inp form-sel"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="">Select your function…</option>
                    <option value="ESG / Sustainability">ESG / Sustainability</option>
                    <option value="Investor Relations">Investor Relations</option>
                    <option value="Legal / Compliance">Legal / Compliance</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {status === "error" && (
                <div className="form-error">{errorMsg}</div>
              )}

              <button
                className="btn-request"
                disabled={!formComplete || status === "sending"}
                onClick={handleSubmit}
              >
                {status === "sending" ? "Sending…" : "Request access →"}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
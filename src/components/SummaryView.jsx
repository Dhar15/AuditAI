import { useState } from "react";
import { createPortal } from "react-dom";
import { scoreColor, NEGATIVE_DRIFT } from "../config/driftRules";
import { useReveal, useCountUp } from "../utils/animate";

// ─── Methodology data ─────────────────────────────────────────────────────────

const DIMENSIONS = [
  { key: "consistency", label: "Consistency", weight: "35%", description: "Measures whether commitments made in earlier reports are still present — and unchanged — in later reports. A company that quietly drops or rewrites targets between annual reports scores low here. Maintained and on_track threads score positively; dropped and revised_down threads penalise heavily." },
  { key: "specificity",  label: "Specificity",  weight: "25%", description: "Measures how quantified and time-bound the commitments are. Vague language ('we aim to reduce emissions over time') scores low. Concrete, numeric, year-bound commitments ('reduce absolute Scope 3 by 30% by 2035 vs 2016') score high. Replacing a numeric target with aspirational language is penalised in the year the change occurs." },
  { key: "ambition",     label: "Ambition",     weight: "25%", description: "Measures whether the targets are genuinely challenging relative to science and peer benchmarks. Covers the level of emission reduction pledged, clean energy investment as a share of total capex, and whether the company sets absolute targets (harder) or intensity targets (easier). Weakening from absolute to intensity-based metrics is penalised." },
  { key: "disclosure",   label: "Disclosure",   weight: "15%", description: "Measures the quality and transparency of reporting — interim milestones, methodology explanations, explicit conditionality. High disclosure scores do not mean good performance; they mean honesty. A company can score high on disclosure while scoring low on consistency." },
];

// ─── Methodology Modal ────────────────────────────────────────────────────────

function MethodologyModal({ score, breakdown, onClose }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-hd">
          <div>
            <div className="modal-title">How the Credibility Score is calculated</div>
            <div className="modal-sub">A weighted composite of four independently scored dimensions</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-formula">
          {DIMENSIONS.map((d) => (
            <div className="mf-row" key={d.key}>
              <span className="mf-dim">{d.label}</span>
              <span className="mf-op">×</span>
              <span className="mf-wt">{d.weight}</span>
              {breakdown?.[d.key] != null && (
                <span className="mf-actual" style={{ color: scoreColor(breakdown[d.key]) }}>
                  = {Math.round(breakdown[d.key] * parseFloat(d.weight) / 100)}pts
                </span>
              )}
            </div>
          ))}
          <div className="mf-divider" />
          <div className="mf-row mf-total">
            <span className="mf-dim">Credibility Score</span>
            <span className="mf-op">=</span>
            <span className="mf-wt" style={{ color: scoreColor(score) }}>{score} / 100</span>
          </div>
        </div>

        <div className="modal-dims">
          {DIMENSIONS.map((d) => (
            <div className="modal-dim" key={d.key}>
              <div className="md-head">
                <span className="md-label">{d.label}</span>
                <span className="md-weight">weight {d.weight}</span>
                {breakdown?.[d.key] != null && (
                  <span className="md-score" style={{ color: scoreColor(breakdown[d.key]) }}>
                    {breakdown[d.key]}/100
                  </span>
                )}
              </div>
              <p className="md-body">{d.description}</p>
            </div>
          ))}
        </div>

        <div className="modal-bands">
          <div className="mb-title">Score bands</div>
          {[
            { range: "65 – 100", color: "#22c55e", desc: "Lower exposure. Commitments are broadly consistent and specific." },
            { range: "42 – 64",  color: "#f59e0b", desc: "Moderate exposure. Some drift or weakening detected." },
            { range: "0 – 41",   color: "#ef4444", desc: "High exposure. Material commitments dropped, revised down, or made conditional." },
          ].map((b) => (
            <div className="mb-row" key={b.range}>
              <span className="mb-range" style={{ color: b.color }}>{b.range}</span>
              <span className="mb-desc">{b.desc}</span>
            </div>
          ))}
        </div>

        <div className="modal-note">
          Consistency carries the highest weight because commitment drift — not just ambition — is the primary driver of regulatory and legal exposure under CSRD and SEC climate disclosure rules.
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Animated score bar ───────────────────────────────────────────────────────

function ScoreBar({ label, value, visible }) {
  const color = scoreColor(value ?? 0);
  return (
    <div className="br">
      <div className="br-lbl">
        <span>{label}</span>
        <span style={{ color }}>{value ?? "—"}/100</span>
      </div>
      <div className="bt">
        <div
          className="bf"
          style={{
            width: visible ? `${value ?? 0}%` : "0%",
            background: color,
            transition: visible ? "width 1s cubic-bezier(.22,.68,0,1.2)" : "none",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function SummaryView({ drift }) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [scoreRef,  scoreVisible]     = useReveal(0.2);
  const [breakRef,  breakVisible]     = useReveal(0.15);
  const [risksRef,  risksVisible]     = useReveal(0.1);
  const animatedScore                 = useCountUp(drift?.credibility_score ?? 0, 1400, scoreVisible);

  if (!drift) {
    return <div className="empty">Select a company above to generate drift analysis &amp; credibility score.</div>;
  }

  const scoreCol           = scoreColor(drift.credibility_score);
  const negativeDriftCount = (drift.commitment_threads || []).filter(
    (t) => NEGATIVE_DRIFT.includes(t.drift)
  ).length;

  return (
    <div>
      <div className="sum-grid">

        {/* Animated credibility score */}
        <div
          ref={scoreRef}
          className={`score-box anim-block ${scoreVisible ? "anim-in" : ""}`}
        >
          <div className="score-n" style={{ color: scoreCol }}>{animatedScore}</div>
          <div className="score-tag">Credibility Score / 100</div>
          <div className="score-rat">{drift.credibility_rationale}</div>
          <button className="score-method-btn" onClick={() => setModalOpen(true)}>
            How is this calculated? →
          </button>
        </div>

        {/* Score breakdown bars — fill in on scroll */}
        <div
          ref={breakRef}
          className={`breakdown anim-block ${breakVisible ? "anim-in" : ""}`}
        >
          <div className="bd-title">Score Breakdown</div>
          {DIMENSIONS.map((d) => (
            <ScoreBar
              key={d.key}
              label={d.label}
              value={drift.score_breakdown?.[d.key]}
              visible={breakVisible}
            />
          ))}
        </div>
      </div>

      {/* Risks + Strengths */}
      <div ref={risksRef} className="rk-grid">
        <div className={`rk anim-block ${risksVisible ? "anim-in" : ""}`} style={{ "--delay": "0ms" }}>
          <div className="rk-h" style={{ color: "var(--red)" }}>⚠ Key Risks</div>
          {(drift.key_risks || []).map((risk, i) => (
            <div className="rk-item" key={i}>
              <span style={{ color: "var(--red)", flexShrink: 0 }}>•</span>
              {risk}
            </div>
          ))}
        </div>
        <div className={`rk anim-block ${risksVisible ? "anim-in" : ""}`} style={{ "--delay": "100ms" }}>
          <div className="rk-h" style={{ color: "var(--green)" }}>✓ Strengths</div>
          {(drift.key_strengths || []).map((strength, i) => (
            <div className="rk-item" key={i}>
              <span style={{ color: "var(--green)", flexShrink: 0 }}>•</span>
              {strength}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--tx3)", textAlign: "center" }}>
        {drift.commitment_threads?.length || 0} commitment threads · {negativeDriftCount} negative drift flags
      </div>

      {modalOpen && (
        <MethodologyModal
          score={drift.credibility_score}
          breakdown={drift.score_breakdown}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
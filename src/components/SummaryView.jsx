import { useState } from "react";
import { createPortal } from "react-dom";
import { scoreColor, NEGATIVE_DRIFT } from "../config/driftRules";
import { useReveal, useCountUp } from "../utils/animate";

// ─── Dimension definitions ────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    key: "consistency", label: "Consistency", weight: "35%",
    howCalculated: "% of threads not dropped or revised down. −10pts per thread where language became conditional.",
  },
  {
    key: "specificity", label: "Specificity", weight: "25%",
    howCalculated: "Each commitment scored: 2 = numeric target + year, 1 = one of the two, 0 = vague. Average × 50.",
  },
  {
    key: "ambition", label: "Ambition", weight: "25%",
    howCalculated: "Base 50. +20 absolute reduction ≥40%, +10 net zero, +10 clean capex ≥25%. −15 Scope 3 switched to intensity, −10 target year pushed back or reversed.",
  },
  {
    key: "disclosure", label: "Disclosure", weight: "15%",
    howCalculated: "Base 40. +15 actual progress figures, +15 conditional assumptions, +15 methodology changes, +10 interim milestones. −10 per silent removal (max −20).",
  },
];

// ─── Hover Tooltip ────────────────────────────────────────────────────────────

function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function handleMouseEnter(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      top:  rect.bottom + window.scrollY + 6,
      left: Math.max(8, Math.min(rect.left + window.scrollX - 8, window.innerWidth - 272)),
    });
    setVisible(true);
  }

  return (
    <>
      <span
        className="tt-icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
      >?</span>
      {visible && createPortal(
        <div
          className="tt-box"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Methodology Modal ────────────────────────────────────────────────────────

function MethodologyModal({ score, breakdown, notes, onClose }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">How the Credibility Score is calculated</div>
            <div className="modal-sub">A weighted composite of four rule-based dimensions</div>
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
              <p className="md-how"><strong>Calculated as:</strong> {d.howCalculated}</p>
              {notes?.[d.key] && <p className="md-note">↳ {notes[d.key]}</p>}
            </div>
          ))}
        </div>

        <div className="modal-bands">
          <div className="mb-title">Score bands</div>
          {[
            { range: "65 – 100", color: "#22c55e", desc: "Lower exposure. Commitments broadly consistent and specific." },
            { range: "42 – 64",  color: "#f59e0b", desc: "Moderate exposure. Some drift or weakening detected." },
            { range: "0 – 41",   color: "#ef4444", desc: "High exposure. Material commitments dropped or made conditional." },
          ].map((b) => (
            <div className="mb-row" key={b.range}>
              <span className="mb-range" style={{ color: b.color }}>{b.range}</span>
              <span className="mb-desc">{b.desc}</span>
            </div>
          ))}
        </div>

        <div className="modal-note">
          Consistency carries the highest weight because commitment drift is the primary driver of regulatory exposure under CSRD and SEC climate disclosure rules.
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ dim, value, note, visible }) {
  const color = scoreColor(value ?? 0);
  return (
    <div className="br">
      <div className="br-lbl">
        <span className="br-label-wrap">
          {dim.label}
          <Tooltip text={note || dim.howCalculated} />
        </span>
        <span style={{ color, fontFamily: "var(--mono)", fontSize: ".65rem" }}>
          {value ?? "—"}/100
        </span>
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

// ─── Main component ───────────────────────────────────────────────────────────

export function SummaryView({ drift }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [scoreRef,  scoreVisible] = useReveal(0.2);
  const [rightRef,  rightVisible] = useReveal(0.15);
  const animatedScore             = useCountUp(drift?.credibility_score ?? 0, 1400, scoreVisible);

  if (!drift) {
    return <div className="empty">Select a company above to generate drift analysis &amp; credibility score.</div>;
  }

  const scoreCol           = scoreColor(drift.credibility_score);
  const negativeDriftCount = (drift.commitment_threads || []).filter(
    (t) => NEGATIVE_DRIFT.includes(t.drift)
  ).length;

  return (
    <div>

      {/* Two columns: score left | right column has breakdown on top, risks below */}
      <div className="sum-grid">

        {/* Left: credibility score */}
        <div ref={scoreRef} className={`score-box anim-block ${scoreVisible ? "anim-in" : ""}`}>
          <div className="score-n" style={{ color: scoreCol }}>{animatedScore}</div>
          <div className="score-tag">Credibility Score / 100</div>
          <div className="score-rat">{drift.credibility_rationale}</div>
          <button className="score-method-btn" onClick={() => setModalOpen(true)}>
            How is this calculated? →
          </button>
        </div>

        {/* Right: breakdown + risks/strengths stacked vertically */}
        <div ref={rightRef} className={`sum-right anim-block ${rightVisible ? "anim-in" : ""}`}>

          {/* Top: score breakdown */}
          <div className="breakdown">
            <div className="bd-title">Score Breakdown</div>
            <div className="br-grid">
              {DIMENSIONS.map((d) => (
                <ScoreBar
                  key={d.key}
                  dim={d}
                  value={drift.score_breakdown?.[d.key]}
                  note={drift.score_notes?.[d.key]}
                  visible={rightVisible}
                />
              ))}
            </div>
          </div>

          {/* Bottom: risks and strengths side by side */}
          <div className="rk-row">
            <div className="rk">
              <div className="rk-h" style={{ color: "var(--red)" }}>⚠ Key Risks</div>
              {(drift.key_risks || []).map((risk, i) => (
                <div className="rk-item" key={i}>
                  <span style={{ color: "var(--red)", flexShrink: 0 }}>•</span>{risk}
                </div>
              ))}
            </div>
            <div className="rk">
              <div className="rk-h" style={{ color: "var(--green)" }}>✓ Strengths</div>
              {(drift.key_strengths || []).map((s, i) => (
                <div className="rk-item" key={i}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>•</span>{s}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--tx3)", textAlign: "center", marginTop: ".75rem" }}>
        {drift.commitment_threads?.length || 0} commitment threads · {negativeDriftCount} negative drift flags
      </div>

      {modalOpen && (
        <MethodologyModal
          score={drift.credibility_score}
          breakdown={drift.score_breakdown}
          notes={drift.score_notes}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
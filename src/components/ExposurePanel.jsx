import { useState } from "react";
import { useReveal } from "../utils/animate";

// ─── Regulatory framework data ────────────────────────────────────────────────
// Sources: CSRD Art. 51 (penalties up to 5% of net turnover or €10M, whichever higher)
//          SEC Rule 10b-5 and climate disclosure rules ($500K–$10M+ per violation)
//          ClientEarth v Shell precedent; TotalEnergies €10K/day French court ruling

function calcExposure(sample) {
  const rev   = sample.revenue_usd_bn * 1e9;   // convert to full USD
  const drift = sample.negative_drift_count;
  const score = sample.credibility_score;

  // ── CSRD ────────────────────────────────────────────────────────────────────
  // Penalty per material violation: max(€10M, 5% net turnover)
  // Material violations ≈ number of dropped/revised_down threads
  const csrdPerViolation = Math.max(10e6, rev * 0.05);
  // Low score amplifies — regulator more likely to act on systemic drift
  const csrdMultiplier   = score < 42 ? 1.0 : score < 65 ? 0.6 : 0.25;
  const csrdLow  = csrdPerViolation * Math.max(1, drift) * csrdMultiplier * 0.5;
  const csrdHigh = csrdPerViolation * Math.max(1, drift) * csrdMultiplier * 1.8;

  // ── SEC (for NYSE-listed companies) ─────────────────────────────────────────
  // Climate disclosure violations: $500K–$5M per filing, plus restatement costs
  const secBase  = sample.sec_applicable ? rev * 0.002 * csrdMultiplier : 0;
  const secHigh  = sample.sec_applicable ? rev * 0.008 * csrdMultiplier : 0;

  // ── Litigation ──────────────────────────────────────────────────────────────
  // Based on ClientEarth/TotalEnergies precedents — class actions, NGO suits
  const litBase  = score < 42 ? rev * 0.001 : score < 65 ? rev * 0.0004 : rev * 0.0001;
  const litHigh  = litBase * 4;

  // ── Reputational / cost of capital ──────────────────────────────────────────
  // ESG downgrades → ~15–50bps spread widening on debt
  // Using 5% assumed debt/total capital, 50bps worst case
  const debtProxy = sample.market_cap_usd_bn * 1e9 * 0.4;  // approx debt
  const cocLow    = score < 65 ? debtProxy * 0.0015 : 0;
  const cocHigh   = score < 65 ? debtProxy * 0.005  : 0;

  const totalLow  = csrdLow + secBase + litBase + cocLow;
  const totalHigh = csrdHigh + secHigh + litHigh + cocHigh;

  return {
    total: { low: totalLow, high: totalHigh },
    breakdown: [
      {
        label: "CSRD / Regulatory Fines",
        framework: sample.hq_country === "France" ? "CSRD (direct)" : "CSRD-equivalent",
        low:  csrdLow,
        high: csrdHigh,
        note: `max(€10M, 5% turnover) × ${Math.max(1, drift)} material violations`,
        active: true,
      },
      {
        label: "SEC Enforcement",
        framework: "SEC Rule 10b-5 + Climate Disclosure",
        low:  secBase,
        high: secHigh,
        note: "$500K–$5M per filing violation + restatement",
        active: sample.sec_applicable,
      },
      {
        label: "Climate Litigation",
        framework: "NGO / Shareholder suits",
        low:  litBase,
        high: litHigh,
        note: "Based on ClientEarth, TotalEnergies precedents",
        active: true,
      },
      {
        label: "Cost of Capital Impact",
        framework: "ESG downgrade → spread widening",
        low:  cocLow,
        high: cocHigh,
        note: "15–50bps on estimated debt base",
        active: score < 65,
      },
    ],
  };
}

function fmt(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExposurePanel({ sample }) {
  const [expanded, setExpanded] = useState(false);
  const [ref, visible]          = useReveal(0.1);

  if (!sample) return null;

  const exp     = calcExposure(sample);
  const score   = sample.credibility_score;
  const riskTier = score < 42 ? { label: "HIGH EXPOSURE", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" }
                 : score < 65 ? { label: "MODERATE EXPOSURE", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" }
                 :               { label: "LOWER EXPOSURE",   color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.25)"  };

  return (
    <div
      ref={ref}
      className={`exposure-panel anim-block ${visible ? "anim-in" : ""}`}
      style={{ borderColor: riskTier.border, background: riskTier.bg }}
    >
      {/* Header row */}
      <div className="exp-header">
        <div>
          <div className="exp-eyebrow" style={{ color: riskTier.color }}>
            <span className="exp-dot" style={{ background: riskTier.color }} />
            {riskTier.label}
          </div>
          <div className="exp-range">
            {fmt(exp.total.low)} – {fmt(exp.total.high)}
          </div>
          <div className="exp-sub">estimated regulatory &amp; legal exposure window</div>
        </div>

        <div className="exp-meta">
          <div className="exp-meta-item">
            <span className="exp-meta-lbl">Revenue base</span>
            <span className="exp-meta-val">${sample.revenue_usd_bn}B</span>
          </div>
          <div className="exp-meta-item">
            <span className="exp-meta-lbl">Jurisdictions</span>
            <span className="exp-meta-val">{sample.listings.join(" · ")}</span>
          </div>
          <div className="exp-meta-item">
            <span className="exp-meta-lbl">Drift events</span>
            <span className="exp-meta-val" style={{ color: sample.negative_drift_count > 0 ? "#ef4444" : "#22c55e" }}>
              {sample.negative_drift_count} negative
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown toggle */}
      <button className="exp-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide breakdown ↑" : "Show breakdown by framework →"}
      </button>

      {expanded && (
        <div className="exp-breakdown">
          {exp.breakdown.filter(b => b.active).map((b) => (
            <div className="exp-row" key={b.label}>
              <div className="exp-row-left">
                <div className="exp-row-label">{b.label}</div>
                <div className="exp-row-framework">{b.framework}</div>
                <div className="exp-row-note">{b.note}</div>
              </div>
              <div className="exp-row-right">
                <div className="exp-row-range">{fmt(b.low)} – {fmt(b.high)}</div>
              </div>
            </div>
          ))}
          <div className="exp-disclaimer">
            Estimates based on published penalty schedules. Not legal advice.
            CSRD penalties operative from FY2024 reporting cycle.
          </div>
        </div>
      )}
    </div>
  );
}
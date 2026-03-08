import { useState } from "react";
import { SAMPLES } from "../data/samples";
import { scoreColor } from "../config/driftRules";
import { useReveal } from "../utils/animate";

// ─── Radar chart (pure SVG — no library) ─────────────────────────────────────

const AXES = [
  { key: "consistency", label: "Consistency" },
  { key: "specificity", label: "Specificity" },
  { key: "ambition",    label: "Ambition"    },
  { key: "disclosure",  label: "Disclosure"  },
];

const COMPANY_COLORS = {
  BP:            { stroke: "#ef4444", fill: "rgba(239,68,68,0.12)"  },
  Shell:         { stroke: "#f59e0b", fill: "rgba(245,158,11,0.12)" },
  TotalEnergies: { stroke: "#3b82f6", fill: "rgba(59,130,246,0.12)" },
};

function polarToXY(angle, radius, cx, cy) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function RadarChart({ samples, highlighted }) {
  const cx = 200, cy = 200, maxR = 150;
  const n  = AXES.length;
  const angles = AXES.map((_, i) => (360 / n) * i);

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  function polygonPoints(scores, r) {
    return angles.map((angle, i) => {
      const val = (scores[AXES[i].key] ?? 0) / 100;
      const pt  = polarToXY(angle, val * r, cx, cy);
      return `${pt.x},${pt.y}`;
    }).join(" ");
  }

  return (
    <svg viewBox="0 0 400 400" className="radar-svg">
      {/* Grid rings */}
      {rings.map(pct => (
        <polygon
          key={pct}
          points={angles.map(angle => {
            const pt = polarToXY(angle, (pct / 100) * maxR, cx, cy);
            return `${pt.x},${pt.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Ring labels */}
      {[20, 60, 100].map(pct => {
        const pt = polarToXY(0, (pct / 100) * maxR, cx, cy);
        return (
          <text key={pct} x={pt.x + 4} y={pt.y} fill="rgba(255,255,255,0.2)"
            fontSize="8" fontFamily="'IBM Plex Mono', monospace">
            {pct}
          </text>
        );
      })}

      {/* Axis spokes */}
      {angles.map((angle, i) => {
        const pt = polarToXY(angle, maxR, cx, cy);
        return (
          <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        );
      })}

      {/* Axis labels */}
      {angles.map((angle, i) => {
        const pt   = polarToXY(angle, maxR + 22, cx, cy);
        const dim  = AXES[i];
        const isTop = angle === 0;
        return (
          <text key={i} x={pt.x} y={pt.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.45)" fontSize="10"
            fontFamily="'IBM Plex Mono', monospace">
            {dim.label}
          </text>
        );
      })}

      {/* Company polygons — dimmed ones first, highlighted on top */}
      {Object.values(samples)
        .sort((a, b) => a.company === highlighted ? 1 : b.company === highlighted ? -1 : 0)
        .map(sample => {
          const col     = COMPANY_COLORS[sample.company];
          const scores  = sample.drift.score_breakdown;
          const isHigh  = sample.company === highlighted;
          return (
            <g key={sample.company}>
              <polygon
                points={polygonPoints(scores, maxR)}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth={isHigh ? 2.5 : 1.2}
                opacity={highlighted && !isHigh ? 0.35 : 1}
              />
              {/* Score dots at each vertex */}
              {angles.map((angle, i) => {
                const val = (scores[AXES[i].key] ?? 0) / 100;
                const pt  = polarToXY(angle, val * maxR, cx, cy);
                return (
                  <circle key={i} cx={pt.x} cy={pt.y} r={isHigh ? 3.5 : 2}
                    fill={col.stroke} opacity={highlighted && !isHigh ? 0.35 : 1} />
                );
              })}
            </g>
          );
        })
      }
    </svg>
  );
}

// ─── Score table ──────────────────────────────────────────────────────────────

function ScoreTable({ samples, highlighted, onHover }) {
  const companies = Object.values(samples);

  return (
    <div className="bench-table">
      <div className="bench-table-head">
        <div className="bt-cell bt-label" />
        {AXES.map(a => (
          <div key={a.key} className="bt-cell bt-dim">{a.label}</div>
        ))}
        <div className="bt-cell bt-dim">Overall</div>
      </div>

      {companies.map(sample => {
        const col   = COMPANY_COLORS[sample.company];
        const sc    = sample.drift.score_breakdown;
        const isH   = sample.company === highlighted;
        return (
          <div
            key={sample.company}
            className={`bench-row ${isH ? "bench-row-active" : ""}`}
            onMouseEnter={() => onHover(sample.company)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="bt-cell bt-label">
              <span className="bench-dot" style={{ background: col.stroke }} />
              {sample.company}
            </div>
            {AXES.map(a => {
              const val = sc[a.key];
              const leader = companies.every(s =>
                s.company === sample.company || (s.drift.score_breakdown[a.key] ?? 0) <= val
              );
              return (
                <div key={a.key} className="bt-cell bt-score"
                  style={{ color: scoreColor(val) }}>
                  {val}
                  {leader && <span className="bench-best" title="Best in class">↑</span>}
                </div>
              );
            })}
            <div className="bt-cell bt-score bt-overall"
              style={{ color: scoreColor(sample.credibility_score) }}>
              {sample.credibility_score}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Insight cards ────────────────────────────────────────────────────────────

function insightCards(samples) {
  const arr = Object.values(samples);
  return AXES.map(axis => {
    const sorted = [...arr].sort((a, b) =>
      (b.drift.score_breakdown[axis.key] ?? 0) - (a.drift.score_breakdown[axis.key] ?? 0)
    );
    const best   = sorted[0];
    const worst  = sorted[sorted.length - 1];
    const gap    = (best.drift.score_breakdown[axis.key] ?? 0) - (worst.drift.score_breakdown[axis.key] ?? 0);
    return { axis, best, worst, gap };
  });
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function BenchmarkView({ activeSample }) {
  const [highlighted, setHighlighted] = useState(activeSample?.company ?? null);
  const [ref, visible] = useReveal(0.05);

  const samples  = SAMPLES;
  const insights = insightCards(samples);

  return (
    <div ref={ref} className={`bench-wrap anim-block ${visible ? "anim-in" : ""}`}>

      {/* Header */}
      <div className="bench-header">
        <div>
          <div className="section-lbl">Peer Benchmarking</div>
          <h2 className="bench-h">BP · Shell · TotalEnergies</h2>
          <p className="bench-p">
            Side-by-side comparison across all four credibility dimensions.
            Hover a company to isolate its profile.
          </p>
        </div>
      </div>

      {/* Chart + table */}
      <div className="bench-grid">

        <div className="bench-chart-wrap">
          <RadarChart samples={samples} highlighted={highlighted} />

          {/* Legend */}
          <div className="bench-legend">
            {Object.entries(COMPANY_COLORS).map(([name, col]) => (
              <div
                key={name}
                className={`bench-leg-item ${highlighted === name ? "bench-leg-active" : ""}`}
                onMouseEnter={() => setHighlighted(name)}
                onMouseLeave={() => setHighlighted(null)}
              >
                <span className="bench-dot" style={{ background: col.stroke }} />
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="bench-right">
          <ScoreTable
            samples={samples}
            highlighted={highlighted}
            onHover={setHighlighted}
          />

          {/* Insight cards */}
          <div className="bench-insights">
            {insights.map(({ axis, best, worst, gap }) => {
              const bestCol  = COMPANY_COLORS[best.company];
              const worstCol = COMPANY_COLORS[worst.company];
              return (
                <div className="bench-insight" key={axis.key}>
                  <div className="bi-axis">{axis.label}</div>
                  <div className="bi-row">
                    <div>
                      <div className="bi-lbl">Best</div>
                      <div className="bi-val" style={{ color: bestCol.stroke }}>
                        {best.company}
                        <span style={{ color: scoreColor(best.drift.score_breakdown[axis.key]) }}>
                          {" "}{best.drift.score_breakdown[axis.key]}
                        </span>
                      </div>
                    </div>
                    <div className="bi-gap">
                      <div className="bi-lbl">Gap</div>
                      <div className="bi-val" style={{ color: "var(--tx2)" }}>{gap}pts</div>
                    </div>
                    <div>
                      <div className="bi-lbl">Weakest</div>
                      <div className="bi-val" style={{ color: worstCol.stroke }}>
                        {worst.company}
                        <span style={{ color: scoreColor(worst.drift.score_breakdown[axis.key]) }}>
                          {" "}{worst.drift.score_breakdown[axis.key]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
import { DRIFT_CFG, scoreColor } from "../config/driftRules";

/**
 * Colored pill showing a drift status label (Maintained, Dropped, Walked Back, etc.)
 */
export function Badge({ drift }) {
  const cfg = DRIFT_CFG[drift] || DRIFT_CFG.softened;
  return (
    <span
      className="d-badge"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}28`,
      }}
    >
      {cfg.label}
    </span>
  );
}

/**
 * Horizontal progress bar for a single credibility score dimension.
 */
export function ScoreBar({ label, value }) {
  const color = scoreColor(value);
  return (
    <div className="br">
      <div className="br-lbl">
        <span style={{ textTransform: "capitalize" }}>{label}</span>
        <span style={{ color }}>{value}/100</span>
      </div>
      <div className="bt">
        <div className="bf" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
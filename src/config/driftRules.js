/** Visual config for each drift status — color, background, label. */
export const DRIFT_CFG = {
  maintained:   { label: "Maintained",   color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  on_track:     { label: "On Track",     color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  revised_up:   { label: "Strengthened", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  new:          { label: "New",          color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  softened:     { label: "Softened",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  revised_down: { label: "Walked Back",  color: "#f97316", bg: "rgba(249,115,22,0.08)" },
  dropped:      { label: "Dropped",      color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
};

/** Human-readable labels for commitment categories. */
export const CAT_LABELS = {
  emissions_target:     "Emissions",
  capex_pledge:         "Capex",
  production_change:    "Production",
  portfolio_transition: "Portfolio",
  renewable_target:     "Renewables",
};

/** Processing pipeline step config — label, color, progress bar percentage. */
export const ST_MAP = {
  pending:    { label: "Queued",                  color: "var(--tx3)",  pct: 0   },
  extracting: { label: "Reading PDF…",            color: "var(--gold)", pct: 22  },
  analysing:  { label: "Extracting commitments…", color: "var(--gold)", pct: 62  },
  drift:      { label: "Detecting drift…",        color: "var(--gold)", pct: 88  },
  done:       { label: "Complete",                color: "var(--green)", pct: 100 },
  error:      { label: "Error",                   color: "var(--red)",  pct: 100 },
};

/** Drift statuses that count as negative movement. */
export const NEGATIVE_DRIFT = ["dropped", "revised_down"];

/** Returns a color for a credibility score: green / amber / red. */
export const scoreColor = (s) =>
  s >= 65 ? "#22c55e" : s >= 42 ? "#f59e0b" : "#ef4444";
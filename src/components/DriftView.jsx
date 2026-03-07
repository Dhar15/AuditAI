import { Badge } from "./shared";
import { CAT_LABELS, DRIFT_CFG } from "../config/driftRules";

/**
 * Drift tab — shows commitment threads with side-by-side year comparison.
 * Each thread shows what the company said in each year and how it changed.
 */
export function DriftView({ drift, docs }) {
  // Guard: need at least 2 reports for drift
  if (!drift?.commitment_threads) {
    return (
      <div className="empty">
        {docs.length < 2
          ? "Upload at least 2 reports from different years to enable drift detection."
          : "Drift analysis unavailable — try re-uploading the reports."}
      </div>
    );
  }

  const years = [...new Set(docs.map((d) => d.year))].sort();

  return (
    <div>
      {drift.commitment_threads.map((thread, i) => {
        const cfg = DRIFT_CFG[thread.drift];

        return (
          <div className="thread" key={i}>
            {/* ── Thread header ─────────────────────────────────────────────── */}
            <div className="th-hd">
              <div>
                <div className="th-topic">{thread.topic}</div>
                <div className="th-cat">{CAT_LABELS[thread.category] || thread.category}</div>
              </div>
              <Badge drift={thread.drift} />
            </div>

            {/* ── Drift explanation ─────────────────────────────────────────── */}
            {thread.drift_explanation && (
              <div className="th-expl">{thread.drift_explanation}</div>
            )}

            {/* ── Year columns ──────────────────────────────────────────────── */}
            <div
              className="yr-row"
              style={{ gridTemplateColumns: `repeat(${years.length}, 1fr)` }}
            >
              {years.map((year) => {
                // AI may return year as string or number — check both
                const entry = thread.years?.[year] || thread.years?.[String(year)];
                const isLatestYear = year === years[years.length - 1];

                return (
                  <div
                    className="yr-col"
                    key={year}
                    style={isLatestYear && cfg ? { background: cfg.bg } : {}}
                  >
                    <div
                      className="yr-lbl"
                      style={isLatestYear && cfg ? { color: cfg.color } : {}}
                    >
                      {year}
                    </div>

                    {entry ? (
                      <>
                        <div className="yr-tx">{entry.commitment_text}</div>
                        {entry.metric && <div className="yr-mt">{entry.metric}</div>}
                        {entry.is_conditional && (
                          <div className="yr-cond">⚠ Conditional language</div>
                        )}
                      </>
                    ) : (
                      <div className="yr-abs">Not present in {year} report</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
import { useState } from "react";
import { CAT_LABELS } from "../config/driftRules";

const SIGNIFICANCE_STYLES = {
  high:   { cls: "sh", bg: "rgba(239,68,68,.08)"   },
  medium: { cls: "sm", bg: "rgba(245,158,11,.08)"  },
  low:    { cls: "sl", bg: "rgba(255,255,255,.04)" },
};

/**
 * Registry tab — full filterable table of every commitment extracted
 * from all successfully processed reports.
 */
export function RegistryView({ docs }) {
  const [filterYear, setFilterYear] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSignificance, setFilterSignificance] = useState("all");

  // Flatten all commitments from all docs into a single list
  const allRows = docs.flatMap((doc) =>
    (doc.commitments || []).map((c) => ({ year: doc.year, ...c }))
  );

  const availableYears = [...new Set(allRows.map((r) => r.year))].sort();

  const filteredRows = allRows.filter(
    (r) =>
      (filterYear === "all"         || r.year === filterYear) &&
      (filterCategory === "all"     || r.category === filterCategory) &&
      (filterSignificance === "all" || r.significance === filterSignificance)
  );

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="fltbar">
        <select className="flt" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="all">All Years</option>
          {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className="flt" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(CAT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select className="flt" value={filterSignificance} onChange={(e) => setFilterSignificance(e.target.value)}>
          <option value="all">All Significance</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <span className="cnt">{filteredRows.length} records</span>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Year</th>
              <th>Category</th>
              <th>Topic</th>
              <th>Commitment</th>
              <th>Metric</th>
              <th>Sig</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => {
              const sig = SIGNIFICANCE_STYLES[row.significance] || SIGNIFICANCE_STYLES.low;
              return (
                <tr key={i}>
                  <td className="td-yr">{row.year}</td>
                  <td>
                    <span className="td-cat">{CAT_LABELS[row.category] || row.category}</span>
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--tx)", minWidth: 100, whiteSpace: "nowrap" }}>
                    {row.topic}
                  </td>
                  <td className="td-tx">{row.commitment_text}</td>
                  <td className="td-mt">{row.metric || "—"}</td>
                  <td>
                    <span
                      className={`sig ${sig.cls}`}
                      style={{ background: sig.bg, border: "1px solid currentColor", borderRadius: 2, padding: ".12rem .32rem" }}
                    >
                      {row.significance || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">No records match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
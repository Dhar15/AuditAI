import { useState } from "react";
import { groq } from "../api/groqClient";
import { safeParseJSON } from "../utils/json";

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildExtractionPrompt(text) {
  return `You are an expert ESG analyst. Extract every climate or sustainability commitment from the text below.

For each commitment return a JSON object with:
- topic: short name (e.g. "Scope 1&2 Emissions", "Renewable Capacity")
- category: one of: emissions_target | renewable_energy | capital_allocation | supply_chain | biodiversity | reporting | other
- commitment_text: the exact or closely paraphrased commitment
- metric: the specific measurable target if present (null if none)
- target_year: integer year if stated (null if none)
- is_conditional: true if the commitment includes qualifying language like "subject to", "if", "assuming", "depending on"
- significance: high | medium | low
- conditionality_detail: what the condition is, if any (null otherwise)

Return ONLY a JSON array. No fences, no explanation, no commentary.
If no commitments are found return [].

Text:
${text.slice(0, 6000)}`;
}

// ─── Category colours ─────────────────────────────────────────────────────────

const CAT_COLOR = {
  emissions_target:    { bg: "rgba(239,68,68,.12)",   color: "#ef4444"  },
  renewable_energy:    { bg: "rgba(34,197,94,.12)",   color: "#22c55e"  },
  capital_allocation:  { bg: "rgba(59,130,246,.12)",  color: "#3b82f6"  },
  supply_chain:        { bg: "rgba(168,85,247,.12)",  color: "#a855f7"  },
  biodiversity:        { bg: "rgba(20,184,166,.12)",  color: "#14b8a6"  },
  reporting:           { bg: "rgba(201,153,58,.12)",  color: "#c9993a"  },
  other:               { bg: "rgba(126,134,158,.12)", color: "#7e869e"  },
};

function CatBadge({ cat }) {
  const style = CAT_COLOR[cat] || CAT_COLOR.other;
  return (
    <span className="ext-badge" style={style}>
      {cat.replace(/_/g, " ")}
    </span>
  );
}

// ─── Example texts ────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    label: "BP 2022 excerpt",
    text: `We aim to reduce our oil and gas production by around 40% by 2030, compared with 2019 levels, subject to the pace of the energy transition. We have a target to achieve net zero operations on an equity basis by 2050 or sooner, and to install 50GW of renewable generating capacity by 2030. We will increase low-carbon investment to $5bn per year by 2030, with low-carbon capex representing around 40% of total capex. These targets are subject to board review and market conditions.`,
  },
  {
    label: "Shell 2023 excerpt",
    text: `Shell targets a Net Carbon Intensity reduction of 30% by 2035 and 65% by 2050, compared to 2016 levels, in line with customer energy needs. We will grow our renewable power business to 50TWh by 2030. Shell maintains its absolute target to reduce Scope 1 and Scope 2 emissions to near-zero by 2050. Our LNG portfolio will remain a cornerstone of our energy transition strategy through 2030. Capital allocated to low-carbon solutions will rise to 25% of total spending by 2025.`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ExtractView() {
  const [text,        setText]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [results,     setResults]     = useState(null);
  const [error,       setError]       = useState("");

  async function handleExtract() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const raw = await groq([{ role: "user", content: buildExtractionPrompt(text) }], 1200);
      const parsed = safeParseJSON(raw);
      if (!Array.isArray(parsed)) throw new Error("Unexpected response format");
      setResults(parsed);
    } catch (e) {
      setError("Extraction failed — " + (e.message || "unknown error"));
    } finally {
      setLoading(false);
    }
  }

  function handleExample(ex) {
    setText(ex.text);
    setResults(null);
    setError("");
  }

  function downloadExcel() {
    if (!results?.length) return;

    // Dynamically load SheetJS from CDN if not already present
    const doDownload = (XLSX) => {
      const rows = results.map((r, i) => ({
        "#":                   i + 1,
        "Topic":               r.topic ?? "",
        "Category":            (r.category ?? "").replace(/_/g, " "),
        "Commitment":          r.commitment_text ?? "",
        "Metric / Target":     r.metric ?? "",
        "Target Year":         r.target_year ?? "",
        "Conditional":         r.is_conditional ? "Yes" : "No",
        "Conditionality":      r.conditionality_detail ?? "",
        "Significance":        r.significance ?? "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 4  },  // #
        { wch: 28 },  // Topic
        { wch: 20 },  // Category
        { wch: 70 },  // Commitment
        { wch: 30 },  // Metric
        { wch: 12 },  // Target Year
        { wch: 12 },  // Conditional
        { wch: 40 },  // Conditionality
        { wch: 12 },  // Significance
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Commitments");
      XLSX.writeFile(wb, "auditai_commitments.xlsx");
    };

    if (window.XLSX) {
      doDownload(window.XLSX);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => doDownload(window.XLSX);
      document.head.appendChild(script);
    }
  }

  const highCount = results?.filter(r => r.significance === "high").length ?? 0;
  const condCount = results?.filter(r => r.is_conditional).length ?? 0;
  const noMetric  = results?.filter(r => !r.metric).length ?? 0;

  return (
    <div className="extract-wrap">

      {/* Header */}
      <div className="section-lbl">Live Commitment Extractor</div>
      <h2 className="bench-h">Paste any annual report text</h2>
      <p className="bench-p">
        Drop in a paragraph or page from any energy company's annual report,
        sustainability disclosure, or investor presentation. AuditAI extracts
        every commitment, classifies it, flags conditionality, and structures
        it for registry ingestion — in under 5 seconds.
      </p>

      {/* Example presets */}
      <div className="ext-examples">
        <span className="ext-examples-lbl">Try an example:</span>
        {EXAMPLES.map(ex => (
          <button key={ex.label} className="ext-ex-btn" onClick={() => handleExample(ex)}>
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="ext-input-wrap">
        <textarea
          className="ext-ta"
          placeholder="Paste annual report text here — any length, any format. Try a page from BP's 2024 Annual Report or Shell's Net Zero Strategy document…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={7}
        />
        <div className="ext-input-footer">
          <span className="ext-char-count">{text.length.toLocaleString()} chars</span>
          <button
            className="btn-extract"
            disabled={!text.trim() || loading}
            onClick={handleExtract}
          >
            {loading
              ? <><span className="spin" style={{ marginRight: ".5rem" }} />Extracting…</>
              : "Extract commitments →"
            }
          </button>
        </div>
      </div>

      {error && <div className="form-error" style={{ marginTop: "1rem" }}>{error}</div>}

      {/* Results */}
      {results && (
        <div className="ext-results">

          {/* Summary stats */}
          <div className="ext-stats">
            <div className="ext-stat">
              <div className="ext-stat-n">{results.length}</div>
              <div className="ext-stat-l">commitments found</div>
            </div>
            <div className="ext-stat">
              <div className="ext-stat-n" style={{ color: "#ef4444" }}>{condCount}</div>
              <div className="ext-stat-l">conditional</div>
            </div>
            <div className="ext-stat">
              <div className="ext-stat-n" style={{ color: "#f59e0b" }}>{noMetric}</div>
              <div className="ext-stat-l">no metric</div>
            </div>
            <div className="ext-stat">
              <div className="ext-stat-n" style={{ color: "#22c55e" }}>{highCount}</div>
              <div className="ext-stat-l">high significance</div>
            </div>
            <button className="ext-copy-btn" onClick={downloadExcel}>
              ↓ Download Excel
            </button>
          </div>

          {results.length === 0 ? (
            <div className="empty">No commitments detected in this text.</div>
          ) : (
            <div className="ext-cards">
              {results.map((r, i) => (
                <div key={i} className={`ext-card ${r.is_conditional ? "ext-card-cond" : ""}`}>
                  <div className="ext-card-head">
                    <div className="ext-card-topic">{r.topic}</div>
                    <div className="ext-card-badges">
                      <CatBadge cat={r.category} />
                      {r.is_conditional && (
                        <span className="ext-badge" style={{ background: "rgba(249,115,22,.12)", color: "#f97316" }}>
                          conditional
                        </span>
                      )}
                      <span className={`ext-sig ext-sig-${r.significance}`}>{r.significance}</span>
                    </div>
                  </div>

                  <div className="ext-card-text">{r.commitment_text}</div>

                  <div className="ext-card-meta">
                    {r.metric && (
                      <div className="ext-meta-item">
                        <span className="ext-meta-lbl">Metric</span>
                        <span className="ext-meta-val">{r.metric}</span>
                      </div>
                    )}
                    {r.target_year && (
                      <div className="ext-meta-item">
                        <span className="ext-meta-lbl">Target year</span>
                        <span className="ext-meta-val">{r.target_year}</span>
                      </div>
                    )}
                    {r.conditionality_detail && (
                      <div className="ext-meta-item">
                        <span className="ext-meta-lbl" style={{ color: "#f97316" }}>Condition</span>
                        <span className="ext-meta-val" style={{ color: "#f97316" }}>{r.conditionality_detail}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
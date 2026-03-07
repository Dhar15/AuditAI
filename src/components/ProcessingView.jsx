import { ST_MAP } from "../config/driftRules";

/**
 * Processing screen shown while PDFs are being read and analysed.
 * Displays a progress bar and status label for each uploaded file.
 */
export function ProcessingView({ docs }) {
  return (
    <div className="proc">
      <div className="proc-h">Analysing…</div>
      <div className="proc-p">
        Extracting commitments from each document, then running cross-year drift
        detection. Takes ~30–90 seconds depending on report size.
      </div>

      <div>
        {docs.map((doc, i) => {
          const step = ST_MAP[doc.status] || ST_MAP.pending;
          const isActive = ["extracting", "analysing", "drift"].includes(doc.status);

          return (
            <div className="proc-item" key={i}>
              <div className="proc-item-top">
                <span className="proc-name">
                  {doc.file.name}{" "}
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--tx3)" }}>
                    ({doc.year})
                  </span>
                </span>
                <span className="proc-st" style={{ color: step.color }}>
                  {isActive && <span className="spin" />}
                  {doc.status === "error"
                    ? (doc.error || "Error").slice(0, 55)
                    : step.label}
                </span>
              </div>
              <div className="trk">
                <div className="fill" style={{ width: `${step.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
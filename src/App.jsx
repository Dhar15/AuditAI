import { useState } from "react";

import { BackgroundCanvas } from "./components/BackgroundCanvas";
import { HomeView }         from "./components/HomeView";
import { SummaryView }      from "./components/SummaryView";
import { RegistryView }     from "./components/RegistryView";
import { DriftView }        from "./components/DriftView";
import { QAView }           from "./components/QAView";
import { BenchmarkView }    from "./components/BenchmarkView";
import { ExtractView }      from "./components/ExtractView";

import "./styles/global.css";

const COMPANY_TABS = [
  { id: "summary",   label: "Summary"   },
  { id: "registry",  label: "Registry"  },
  { id: "drift",     label: "Drift"     },
  { id: "benchmark", label: "Benchmark" },
  { id: "qa",        label: "Q&A"       },
];

export default function App() {
  const [phase,   setPhase]   = useState("home");
  const [tab,     setTab]     = useState("summary");
  const [company, setCompany] = useState("");
  const [sample,  setSample]  = useState(null);
  const [docs,    setDocs]    = useState([]);
  const [drift,   setDrift]   = useState(null);

  function loadSample(s) {
    setSample(s);
    setCompany(s.company);
    setDocs(s.docs);
    setDrift(s.drift);
    setTab("summary");
    setTimeout(() => setPhase("results"), 10);
  }

  function goHome() {
    setPhase("home");
    setCompany("");
    setSample(null);
    setDocs([]);
    setDrift(null);
  }

  return (
    <>
      <BackgroundCanvas />

      <div className="app-layer">

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <nav className="nav">
          <div className="logo" onClick={goHome}>Audit<i>AI</i></div>

          <div className="nav-tabs">
            <button
              className={`tab ${phase === "home" ? "on" : ""}`}
              onClick={goHome}
            >
              Home
            </button>

            {COMPANY_TABS.map((t) => (
              <button
                key={t.id}
                className={`tab ${tab === t.id && phase === "results" ? "on" : ""}`}
                disabled={phase !== "results"}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}

            <div className="nav-divider" />

            <button
              className={`tab ${tab === "extract" && phase === "extract" ? "on" : ""}`}
              onClick={() => { setTab("extract"); setPhase("extract"); }}
            >
              Extract
            </button>
          </div>

          <div style={{
            fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".06em",
            color: company ? "var(--gold)" : "var(--tx3)",
            transition: "color .3s",
          }}>
            {company ? company.toUpperCase() : "SELECT A COMPANY"}
          </div>
        </nav>

        {/* ── Pages ─────────────────────────────────────────────────────── */}
        {phase === "home" && (
          <div key="home" className="page-enter">
            <HomeView onLoadSample={loadSample} />
          </div>
        )}

        {phase === "extract" && (
          <div key="extract" className="page-enter">
            <div className="results">
              <div key="extract" className="tab-enter">
                <ExtractView />
              </div>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div key="results" className="page-enter">
            <div className="results">
              <div className="res-h">{company}</div>
              <div className="res-s">
                {docs.length} report{docs.length !== 1 ? "s" : ""}{" "}
                · {docs.map((d) => d.year).sort().join(", ")}
                {drift ? ` · Credibility ${drift.credibility_score}/100` : ""}
              </div>

              <div key={tab} className="tab-enter">
                {tab === "summary"   && <SummaryView   drift={drift} sample={sample} />}
                {tab === "registry"  && <RegistryView  docs={docs} />}
                {tab === "drift"     && <DriftView      drift={drift} docs={docs} />}
                {tab === "benchmark" && <BenchmarkView  activeSample={sample} />}
{tab === "qa"        && <QAView         docs={docs} drift={drift} />}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
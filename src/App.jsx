import { useState } from "react";

import { BackgroundCanvas } from "./components/BackgroundCanvas";
import { HomeView }    from "./components/HomeView";
import { SummaryView } from "./components/SummaryView";
import { RegistryView} from "./components/RegistryView";
import { DriftView }   from "./components/DriftView";
import { QAView }      from "./components/QAView";

import "./styles/global.css";

const TABS = [
  { id: "summary",  label: "Summary"  },
  { id: "registry", label: "Registry" },
  { id: "drift",    label: "Drift"    },
  { id: "qa",       label: "Q&A"      },
];

export default function App() {
  const [phase,   setPhase]   = useState("home");
  const [tab,     setTab]     = useState("summary");
  const [company, setCompany] = useState("");
  const [docs,    setDocs]    = useState([]);
  const [drift,   setDrift]   = useState(null);

  function loadSample(sample) {
    setCompany(sample.company);
    setDocs(sample.docs);
    setDrift(sample.drift);
    setTab("summary");
    // Small delay so the tab animation triggers fresh each time
    setTimeout(() => setPhase("results"), 10);
  }

  function goHome() {
    setPhase("home");
    setCompany("");
    setDocs([]);
    setDrift(null);
  }

  return (
    <>

      <BackgroundCanvas />

      <nav className="nav">
        <div className="logo" onClick={goHome}>Audit<i>AI</i></div>

        <div className="nav-tabs">
          <button className={`tab ${phase === "home" ? "on" : ""}`} onClick={goHome}>
            Home
          </button>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id && phase === "results" ? "on" : ""}`}
              disabled={phase !== "results"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{
          fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".06em",
          color: company ? "var(--gold)" : "var(--tx3)",
          transition: "color .3s",
        }}>
          {company ? company.toUpperCase() : "SELECT A COMPANY"}
        </div>
      </nav>

      {phase === "home" && (
        <div key="home" className="page-enter">
          <HomeView onLoadSample={loadSample} />
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

            {/* key prop forces remount on tab change → triggers entry animation */}
            <div key={tab} className="tab-enter">
              {tab === "summary"  && <SummaryView  drift={drift} />}
              {tab === "registry" && <RegistryView docs={docs} />}
              {tab === "drift"    && <DriftView    drift={drift} docs={docs} />}
              {tab === "qa"       && <QAView       docs={docs} drift={drift} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
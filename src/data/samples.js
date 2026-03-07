/**
 * Pre-loaded, manually validated commitment data for BP, Shell, and TotalEnergies.
 * Each sample includes:
 *   - docs: extracted commitments per year (mirrors the structure produced by extractCommitments)
 *   - drift: pre-computed drift analysis (mirrors the structure produced by runDriftAnalysis)
 *
 * This allows evaluators to explore the full product immediately without uploading PDFs.
 * The upload pipeline produces identical data structures, so the same UI renders both.
 */

// ─── BP ───────────────────────────────────────────────────────────────────────

const BP_DOCS = [
  {
    company: "BP", year: "2022", status: "done",
    commitments: [
      { id: "oil-cut",        topic: "Oil & Gas Production Cut",  category: "production_change",   commitment_text: "Reduce oil and gas production by 40% by 2030 versus 2019 baseline, cutting output from 2.6 million barrels of oil equivalent per day to around 1.5 mboe/d.", metric: "40% reduction by 2030",           target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "net-zero",       topic: "Net Zero Operations",       category: "emissions_target",    commitment_text: "Achieve net zero across all BP operations and production on an absolute basis by 2050.", metric: "Net zero — absolute, all operations",   target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "scope3",         topic: "Scope 3 Emissions",         category: "emissions_target",    commitment_text: "Reduce Scope 3 emissions by 15–20% by 2030 versus 2019 on an absolute basis.", metric: "15–20% absolute reduction by 2030",        target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "lowcarbon-capex",topic: "Low Carbon Investment",     category: "capex_pledge",        commitment_text: "Increase annual low carbon investment to $5 billion per year by 2030, representing approximately 40% of total annual capex.", metric: "$5B/year by 2030", target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "renewables",     topic: "Renewable Power Capacity",  category: "renewable_target",    commitment_text: "Grow renewable power generation capacity from near zero to 50 gigawatts by 2030.", metric: "50 GW by 2030",                          target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "BP", year: "2023", status: "done",
    commitments: [
      { id: "oil-cut",        topic: "Oil & Gas Production Cut",  category: "production_change",   commitment_text: "Reduce oil and gas production by 25% by 2030 versus 2019, revising prior 40% target to reflect portfolio optimisation and value over volume strategy.", metric: "25% reduction by 2030", target_year: 2030, is_conditional: false, significance: "high" },
      { id: "net-zero",       topic: "Net Zero Operations",       category: "emissions_target",    commitment_text: "Achieve net zero by 2050 or sooner, in line with the Paris Agreement goals and supported by interim milestones.", metric: "Net zero by 2050",                         target_year: 2050, is_conditional: false, significance: "high" },
      { id: "scope3",         topic: "Scope 3 Emissions",         category: "emissions_target",    commitment_text: "Reduce the carbon intensity of our products by around 5% by 2025 and 20–30% by 2030, versus a 2019 baseline. Methodology now intensity-based, not absolute.", metric: "Carbon intensity — 20–30% by 2030", target_year: 2030, is_conditional: false, significance: "high" },
      { id: "lowcarbon-capex",topic: "Low Carbon Investment",     category: "capex_pledge",        commitment_text: "Invest around $4 billion per year in our transition growth businesses through to 2030.", metric: "$4B/year through 2030",                  target_year: 2030, is_conditional: false, significance: "high" },
      { id: "renewables",     topic: "Renewable Power Capacity",  category: "renewable_target",    commitment_text: "Grow developed renewable capacity to around 50 GW by 2030, progressing through a disciplined development pipeline.", metric: "50 GW by 2030",                          target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "BP", year: "2024", status: "done",
    commitments: [
      { id: "oil-cut",        topic: "Oil & Gas Production Cut",  category: "production_change",   commitment_text: "We aim to maintain a resilient hydrocarbon portfolio. Production guidance of 2.3–2.5 mboe/d through 2030, optimising for returns.", metric: "No reduction target — stable production", target_year: 2030, is_conditional: false, significance: "high" },
      { id: "net-zero",       topic: "Net Zero Operations",       category: "emissions_target",    commitment_text: "Our ambition remains net zero by 2050, subject to government and society playing their role and the energy transition advancing at pace.", metric: "Net zero by 2050 (conditional)",       target_year: 2050, is_conditional: true,  significance: "high" },
      { id: "scope3",         topic: "Scope 3 Emissions",         category: "emissions_target",    commitment_text: "We continue to work toward reducing the carbon intensity of our energy products. No near-term numeric Scope 3 target is currently in place.", metric: "No numeric Scope 3 target",             target_year: null, is_conditional: true,  significance: "high" },
      { id: "lowcarbon-capex",topic: "Low Carbon Investment",     category: "capex_pledge",        commitment_text: "Investing $1.5–2 billion per year in our low carbon businesses, redirecting capital toward higher-return hydrocarbons and LNG.", metric: "$1.5–2B/year",                          target_year: 2030, is_conditional: false, significance: "high" },
      { id: "renewables",     topic: "Renewable Power Capacity",  category: "renewable_target",    commitment_text: "Focusing on profitable renewable opportunities. No longer pursuing a 50 GW portfolio target as market conditions have changed.", metric: "50 GW target abandoned",                 target_year: null, is_conditional: false, significance: "medium" },
    ],
  },
];

const BP_DRIFT = {
  company: "BP",
  credibility_score: 34,
  credibility_rationale: "BP has materially walked back every major climate commitment made in 2022 across successive annual reports. The 40% production cut became 25%, then disappeared entirely. Low-carbon investment fell from $5B to under $2B/year. Net zero language is now explicitly conditional. This pattern of systematic retreat represents the most significant negative commitment drift among major European oil majors.",
  score_breakdown: { consistency: 20, specificity: 35, ambition: 28, disclosure: 55 },
  commitment_threads: [
    {
      topic: "Oil & Gas Production Cut", category: "production_change", drift: "dropped",
      drift_explanation: "Committed to 40% production reduction in 2022. Revised to 25% in 2023. Replaced entirely with stable production guidance in 2024. Creates direct greenwashing exposure for investors who allocated capital based on the 2022 commitment.",
      years: {
        "2022": { commitment_text: "Reduce oil and gas production by 40% by 2030 versus 2019", metric: "40% reduction by 2030", is_conditional: false },
        "2023": { commitment_text: "Reduce by 25% by 2030, revising prior 40% target", metric: "25% reduction by 2030", is_conditional: false },
        "2024": { commitment_text: "Maintain 2.3–2.5 mboe/d through 2030 — no reduction target", metric: "No reduction target", is_conditional: false },
      },
    },
    {
      topic: "Net Zero Commitment", category: "emissions_target", drift: "softened",
      drift_explanation: "Target year retained at 2050, but language shifted from absolute and unconditional in 2022 to explicitly conditional on government action in 2024. This conditionality materially weakens the legal weight of the pledge.",
      years: {
        "2022": { commitment_text: "Achieve net zero across all BP operations on an absolute basis by 2050", metric: "Net zero — absolute", is_conditional: false },
        "2023": { commitment_text: "Achieve net zero by 2050 or sooner, in line with Paris Agreement", metric: "Net zero by 2050", is_conditional: false },
        "2024": { commitment_text: "Net zero ambition remains, subject to government and society playing their role", metric: "Net zero by 2050 (conditional)", is_conditional: true },
      },
    },
    {
      topic: "Scope 3 Emissions Target", category: "emissions_target", drift: "dropped",
      drift_explanation: "Shifted from an absolute reduction target (15–20% by 2030) to intensity-based in 2023, then removed all numeric Scope 3 targets in 2024. CSRD and SEC rules specifically require Scope 3 disclosure — this gap creates direct regulatory exposure.",
      years: {
        "2022": { commitment_text: "Reduce Scope 3 emissions by 15–20% by 2030 on an absolute basis", metric: "15–20% absolute reduction", is_conditional: false },
        "2023": { commitment_text: "Reduce carbon intensity of products by 20–30% by 2030 vs 2019", metric: "Intensity — 20–30% by 2030", is_conditional: false },
        "2024": { commitment_text: "Working toward reducing carbon intensity — no numeric Scope 3 target in place", metric: "No numeric target", is_conditional: true },
      },
    },
    {
      topic: "Low Carbon Capex", category: "capex_pledge", drift: "revised_down",
      drift_explanation: "Annual low-carbon investment dropped from $5B in 2022 to $4B in 2023 to $1.5–2B in 2024 — a 70% reduction in stated ambition over two years. ESG investors who used 2022 guidance for capital allocation decisions have a clear grievance.",
      years: {
        "2022": { commitment_text: "Increase annual low carbon investment to $5 billion per year by 2030", metric: "$5B/year", is_conditional: false },
        "2023": { commitment_text: "Invest around $4 billion per year in transition growth businesses", metric: "$4B/year", is_conditional: false },
        "2024": { commitment_text: "Investing $1.5–2 billion per year in low carbon businesses", metric: "$1.5–2B/year", is_conditional: false },
      },
    },
    {
      topic: "Renewable Power Capacity", category: "renewable_target", drift: "dropped",
      drift_explanation: "50 GW renewable target maintained in 2022 and 2023, then explicitly abandoned in 2024. BP cited 'changed market conditions' — the same conditions that competitors have continued building through.",
      years: {
        "2022": { commitment_text: "Grow renewable power generation capacity to 50 gigawatts by 2030", metric: "50 GW by 2030", is_conditional: false },
        "2023": { commitment_text: "Grow developed renewable capacity to around 50 GW by 2030", metric: "50 GW by 2030", is_conditional: false },
        "2024": { commitment_text: "No longer pursuing a 50 GW portfolio target", metric: "Target abandoned", is_conditional: false },
      },
    },
  ],
  key_risks: [
    "Three of five core commitments dropped or reversed by 2024 — creates direct CSRD and SEC disclosure liability",
    "ESG investors who allocated capital based on 2022 pledges have documented grounds for greenwashing claims",
    "Explicit conditionality added to Net Zero language in 2024 weakens the legal defensibility of the 2050 commitment",
  ],
  key_strengths: [
    "Consistent Scope 1 & 2 operational emissions reporting with year-on-year progress disclosed",
    "Net zero 2050 headline maintained across all three years, providing baseline defensibility",
  ],
};

// ─── SHELL ────────────────────────────────────────────────────────────────────

const SHELL_DOCS = [
  {
    company: "Shell", year: "2022", status: "done",
    commitments: [
      { id: "ci-2030",    topic: "Carbon Intensity 2030",    category: "emissions_target",    commitment_text: "Reduce the net carbon intensity of the energy products we sell by 20% by 2030 and 45% by 2035, compared with 2016 levels.", metric: "20% by 2030, 45% by 2035",        target_year: 2035, is_conditional: false, significance: "high"   },
      { id: "scope3-abs", topic: "Scope 3 Absolute",         category: "emissions_target",    commitment_text: "Reduce absolute Scope 3 emissions by 30% by 2035 compared to 2016 levels, on a net basis.", metric: "30% absolute reduction by 2035",          target_year: 2035, is_conditional: false, significance: "high"   },
      { id: "netzero",    topic: "Net Zero 2050",            category: "emissions_target",    commitment_text: "Achieve net-zero emissions from our operations and the energy products we sell by 2050.", metric: "Net zero — operations and products",           target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "clean-capex",topic: "Clean Energy Capex",       category: "capex_pledge",        commitment_text: "Invest $10–15 billion between 2023 and 2025 in low-carbon energy solutions including renewables, EV charging, and hydrogen.", metric: "$10–15B over 2023–2025", target_year: 2025, is_conditional: false, significance: "high"   },
      { id: "oil-decline",topic: "Oil Production Trajectory",category: "production_change",   commitment_text: "Oil production has already peaked and will naturally decline approximately 1–2% per year through the decade.", metric: "1–2%/year natural decline",             target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "Shell", year: "2023", status: "done",
    commitments: [
      { id: "ci-2030",    topic: "Carbon Intensity 2030",    category: "emissions_target",    commitment_text: "Reduce the net carbon intensity of the energy products we sell by 15–20% by 2030 versus 2016. The 2035 interim target has been withdrawn.", metric: "15–20% by 2030 (2035 target dropped)", target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "scope3-abs", topic: "Scope 3 Absolute",         category: "emissions_target",    commitment_text: "We are focusing on Scope 3 carbon intensity rather than absolute reduction targets, following updated methodology aligned with industry practice.", metric: "Absolute target withdrawn", target_year: null, is_conditional: false, significance: "high"   },
      { id: "netzero",    topic: "Net Zero 2050",            category: "emissions_target",    commitment_text: "Achieve net-zero emissions by 2050, working alongside customers and broader society to accelerate the energy transition.", metric: "Net zero by 2050",              target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "clean-capex",topic: "Clean Energy Capex",       category: "capex_pledge",        commitment_text: "Investing $10–15 billion in low-carbon energy solutions over 2023–2025, on track with prior guidance.", metric: "$10–15B over 2023–2025",                  target_year: 2025, is_conditional: false, significance: "high"   },
      { id: "oil-decline",topic: "Oil Production Trajectory",category: "production_change",   commitment_text: "Upstream production expected to remain broadly flat at approximately 1.4 mboe/d through 2030, with natural decline offset by targeted investment.", metric: "Flat production through 2030", target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "Shell", year: "2024", status: "done",
    commitments: [
      { id: "ci-2030",    topic: "Carbon Intensity 2030",    category: "emissions_target",    commitment_text: "Target a net carbon intensity reduction of 15–20% by 2030 versus 2016 levels, subject to market conditions and the pace of energy transition.", metric: "15–20% by 2030 (conditional)", target_year: 2030, is_conditional: true,  significance: "high"   },
      { id: "scope3-abs", topic: "Scope 3 Absolute",         category: "emissions_target",    commitment_text: "Scope 3 absolute emissions targets are not currently part of our framework; we focus on carbon intensity and enabling customer decarbonisation.", metric: "No absolute Scope 3 target", target_year: null, is_conditional: false, significance: "high"   },
      { id: "netzero",    topic: "Net Zero 2050",            category: "emissions_target",    commitment_text: "We remain committed to our net-zero by 2050 ambition, while recognising that the path will be shaped by government policy, technology development and societal choices.", metric: "Net zero by 2050 (policy-conditional)", target_year: 2050, is_conditional: true, significance: "high" },
      { id: "clean-capex",topic: "Clean Energy Capex",       category: "capex_pledge",        commitment_text: "Annual clean energy investment of $8–10 billion, with greater emphasis on LNG as a bridge fuel and selective investment in proven clean technologies.", metric: "$8–10B/year (LNG-weighted)", target_year: 2026, is_conditional: false, significance: "high"   },
      { id: "oil-decline",topic: "Oil Production Trajectory",category: "production_change",   commitment_text: "Upstream portfolio expected to remain stable at approximately 1.4 mboe/d through 2030, with natural decline offset by value-accretive investments.", metric: "Stable — natural decline offset", target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
];

const SHELL_DRIFT = {
  company: "Shell",
  credibility_score: 51,
  credibility_rationale: "Shell shows a more measured but still concerning drift pattern. The 2035 carbon intensity target and absolute Scope 3 goals were quietly withdrawn between 2022 and 2023 — coinciding with mounting legal pressure. Capital investment commitments have been reduced and reframed around LNG. Net zero language persists but with increasing conditionality.",
  score_breakdown: { consistency: 48, specificity: 50, ambition: 44, disclosure: 62 },
  commitment_threads: [
    {
      topic: "Carbon Intensity Targets", category: "emissions_target", drift: "revised_down",
      drift_explanation: "The 2035 interim target (45%) was dropped entirely in 2023 with no replacement. The 2030 target widened from '20%' to '15–20%' and gained conditionality by 2024. Each change appears minor in isolation; cumulatively they represent material weakening.",
      years: {
        "2022": { commitment_text: "Reduce carbon intensity by 20% by 2030 and 45% by 2035", metric: "20% by 2030, 45% by 2035", is_conditional: false },
        "2023": { commitment_text: "15–20% by 2030 — 2035 target withdrawn", metric: "15–20% by 2030", is_conditional: false },
        "2024": { commitment_text: "15–20% by 2030, subject to market conditions", metric: "15–20% by 2030 (conditional)", is_conditional: true },
      },
    },
    {
      topic: "Scope 3 Absolute Emissions", category: "emissions_target", drift: "dropped",
      drift_explanation: "A clear 30% absolute Scope 3 reduction in 2022 was replaced by intensity metrics in 2023, then formally removed from Shell's framework in 2024. This is the commitment class most scrutinised under CSRD and SEC rules.",
      years: {
        "2022": { commitment_text: "Reduce absolute Scope 3 emissions by 30% by 2035", metric: "30% absolute reduction by 2035", is_conditional: false },
        "2023": { commitment_text: "Switching to Scope 3 carbon intensity — absolute target withdrawn", metric: "Absolute target withdrawn", is_conditional: false },
        "2024": { commitment_text: "Absolute Scope 3 targets not part of our framework", metric: "No absolute Scope 3 target", is_conditional: false },
      },
    },
    {
      topic: "Net Zero 2050", category: "emissions_target", drift: "softened",
      drift_explanation: "Headline target year maintained, but conditionality progressively added. 2024 language links delivery to government policy, technology development, and societal choices — three external factors outside Shell's control.",
      years: {
        "2022": { commitment_text: "Achieve net-zero emissions from operations and energy products by 2050", metric: "Net zero — operations and products", is_conditional: false },
        "2023": { commitment_text: "Net-zero by 2050, working with customers and society", metric: "Net zero by 2050", is_conditional: false },
        "2024": { commitment_text: "Net-zero ambition by 2050, shaped by government policy and technology", metric: "Net zero by 2050 (conditional)", is_conditional: true },
      },
    },
    {
      topic: "Clean Energy Investment", category: "capex_pledge", drift: "revised_down",
      drift_explanation: "The $10–15B 2023–2025 envelope was maintained in 2023 but replaced in 2024 with $8–10B/year weighted toward LNG — which most ESG frameworks classify as a transition, not clean, fuel.",
      years: {
        "2022": { commitment_text: "Invest $10–15 billion in low-carbon solutions including renewables, EV, hydrogen", metric: "$10–15B over 2023–2025", is_conditional: false },
        "2023": { commitment_text: "$10–15B in low-carbon solutions, on track", metric: "$10–15B over 2023–2025", is_conditional: false },
        "2024": { commitment_text: "$8–10B/year in clean energy, with greater LNG emphasis", metric: "$8–10B/year (LNG-weighted)", is_conditional: false },
      },
    },
  ],
  key_risks: [
    "Withdrawal of absolute Scope 3 targets creates direct exposure under CSRD Article 19a disclosure requirements",
    "Dropping the 2035 carbon intensity milestone without replacement removes a key near-term accountability marker",
    "LNG reclassified as 'clean' investment may not satisfy ESG fund mandates that exclude fossil gas infrastructure",
  ],
  key_strengths: [
    "Net zero 2050 headline maintained consistently across all three years",
    "Disclosure quality remains relatively high compared to sector peers",
    "Capital investment commitments, while reduced, remain material with specific ranges published",
  ],
};

// ─── TOTALENERGIES ────────────────────────────────────────────────────────────

const TOTAL_DOCS = [
  {
    company: "TotalEnergies", year: "2022", status: "done",
    commitments: [
      { id: "netzero",      topic: "Net Zero 2050",              category: "emissions_target",    commitment_text: "Achieve carbon neutrality across all our operations and the energy products we sell to customers by 2050 — our ambition is to become a net-zero company.", metric: "Carbon neutral — all operations and products", target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "scope1-2",     topic: "Scope 1 & 2 Reduction",      category: "emissions_target",    commitment_text: "Reduce absolute Scope 1 and Scope 2 emissions by more than 40% by 2030, compared with 2015 levels.", metric: ">40% absolute by 2030",                               target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "renewables-gw",topic: "Renewables Capacity (100GW)",category: "renewable_target",    commitment_text: "Grow renewable and low-carbon electricity capacity to 100 GW by 2030, from around 10 GW in 2022.", metric: "100 GW by 2030",                                         target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "green-capex",  topic: "Renewable & Low-Carbon Capex",category: "capex_pledge",       commitment_text: "Dedicate more than 25% of annual gross investment to renewables and electricity, targeting $4–5 billion per year.", metric: ">25% of capex — $4–5B/year",                 target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "lng-transition",topic: "LNG as Transition Fuel",    category: "portfolio_transition",commitment_text: "Maintain LNG as a key transition fuel, targeting LNG to represent 50% of hydrocarbon sales by 2030 while reducing oil.", metric: "LNG at 50% of hydrocarbon sales",           target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "TotalEnergies", year: "2023", status: "done",
    commitments: [
      { id: "netzero",      topic: "Net Zero 2050",              category: "emissions_target",    commitment_text: "Ambition to reach net zero by 2050 across all operations and products — aligned with IEA NZE scenario under IPCC 1.5°C pathway.", metric: "Net zero — IEA NZE aligned",             target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "scope1-2",     topic: "Scope 1 & 2 Reduction",      category: "emissions_target",    commitment_text: "Reduce absolute Scope 1 and Scope 2 greenhouse gas emissions by more than 40% by 2030 versus 2015 baseline, with priority on methane reduction.", metric: ">40% absolute by 2030", target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "renewables-gw",topic: "Renewables Capacity (100GW)",category: "renewable_target",    commitment_text: "Target 100 GW of renewable and low-carbon electricity by 2030, of which at least 35 GW will be solar.", metric: "100 GW by 2030 (35 GW solar)",                        target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "green-capex",  topic: "Renewable & Low-Carbon Capex",category: "capex_pledge",       commitment_text: "Investing more than $5 billion per year in renewable energy and low-carbon businesses — approximately 30% of annual gross investment.", metric: ">$5B/year, ~30% of capex",          target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "lng-transition",topic: "LNG as Transition Fuel",    category: "portfolio_transition",commitment_text: "LNG expansion continuing as a strategic pillar — targeting LNG at 50% of hydrocarbon portfolio by 2030, growing to serve European energy security needs.", metric: "LNG at 50% — energy security framing", target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
  {
    company: "TotalEnergies", year: "2024", status: "done",
    commitments: [
      { id: "netzero",      topic: "Net Zero 2050",              category: "emissions_target",    commitment_text: "Net zero ambition by 2050 remains a core strategic commitment. Court rulings in France have been noted; TotalEnergies maintains its disclosures are accurate and compliant.", metric: "Net zero by 2050 (court-noted)", target_year: 2050, is_conditional: false, significance: "high"   },
      { id: "scope1-2",     topic: "Scope 1 & 2 Reduction",      category: "emissions_target",    commitment_text: "Maintain 40%+ reduction in absolute Scope 1 and 2 emissions by 2030 versus 2015. On track with interim milestones as of year-end 2024.", metric: ">40% absolute by 2030 — on track", target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "renewables-gw",topic: "Renewables Capacity (100GW)",category: "renewable_target",    commitment_text: "Progress toward 100 GW by 2030 continues; currently at 27 GW installed. Solar and offshore wind are lead growth vectors.", metric: "100 GW by 2030 — 27 GW achieved",       target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "green-capex",  topic: "Renewable & Low-Carbon Capex",category: "capex_pledge",       commitment_text: "Renewable and low-carbon investments of approximately $5 billion per year. Proportion of capex maintained above 25%.", metric: "~$5B/year, >25% of capex",                 target_year: 2030, is_conditional: false, significance: "high"   },
      { id: "lng-transition",topic: "LNG as Transition Fuel",    category: "portfolio_transition",commitment_text: "LNG portfolio expansion remains a strategic priority; responding to European energy security and industrial demand through 2030.", metric: "LNG expansion — security framing maintained", target_year: 2030, is_conditional: false, significance: "medium" },
    ],
  },
];

const TOTAL_DRIFT = {
  company: "TotalEnergies",
  credibility_score: 58,
  credibility_rationale: "TotalEnergies shows the most consistency of the three majors — core targets have not been materially revised or dropped. However, the company faces the most severe legal exposure: a French court found TotalEnergies liable in 2024 for misleading climate disclosures, and regulators have challenged the gap between the 2050 net zero language and near-term production expansion.",
  score_breakdown: { consistency: 72, specificity: 65, ambition: 55, disclosure: 40 },
  commitment_threads: [
    {
      topic: "Net Zero 2050", category: "emissions_target", drift: "maintained",
      drift_explanation: "Most consistent commitment of the three companies — maintained across all years with no conditionality added. However a French court found in 2024 that these net zero claims were misleading given simultaneous oil and gas expansion. Consistency of language does not equal absence of legal risk.",
      years: {
        "2022": { commitment_text: "Carbon neutrality across all operations and energy products by 2050", metric: "Carbon neutral — all operations and products", is_conditional: false },
        "2023": { commitment_text: "Net zero by 2050 — aligned with IEA NZE scenario", metric: "Net zero — IEA NZE aligned", is_conditional: false },
        "2024": { commitment_text: "Net zero 2050 remains core commitment; court rulings noted", metric: "Net zero by 2050", is_conditional: false },
      },
    },
    {
      topic: "Scope 1 & 2 Emissions", category: "emissions_target", drift: "on_track",
      drift_explanation: "The >40% absolute Scope 1 and 2 reduction target has been maintained with the same metric and baseline year across all three reports. 2024 confirms on-track status. This is a genuine strength relative to peers.",
      years: {
        "2022": { commitment_text: "Reduce absolute Scope 1 and 2 emissions by more than 40% by 2030", metric: ">40% absolute by 2030", is_conditional: false },
        "2023": { commitment_text: ">40% absolute Scope 1 and 2 by 2030, priority on methane", metric: ">40% absolute by 2030", is_conditional: false },
        "2024": { commitment_text: ">40% by 2030, on track with interim milestones", metric: ">40% absolute — on track", is_conditional: false },
      },
    },
    {
      topic: "Renewables Capacity (100 GW)", category: "renewable_target", drift: "on_track",
      drift_explanation: "100 GW target maintained across all years; 2024 reports 27 GW installed. This is the clearest example of a commitment being actively delivered rather than simply restated.",
      years: {
        "2022": { commitment_text: "Grow renewable capacity to 100 GW by 2030 from ~10 GW", metric: "100 GW by 2030", is_conditional: false },
        "2023": { commitment_text: "100 GW by 2030, with 35 GW solar", metric: "100 GW (35 GW solar)", is_conditional: false },
        "2024": { commitment_text: "Progress toward 100 GW; currently 27 GW installed", metric: "27 GW achieved → 100 GW target", is_conditional: false },
      },
    },
    {
      topic: "Renewable & Low-Carbon Capex", category: "capex_pledge", drift: "maintained",
      drift_explanation: "$4–5B/year commitment maintained and slightly increased across years. Capex percentage upheld consistently. Genuine consistency, though the absolute figure is below BP's original (now abandoned) 2022 pledge.",
      years: {
        "2022": { commitment_text: ">25% of annual gross investment to renewables — $4–5B/year", metric: "$4–5B/year, >25% capex", is_conditional: false },
        "2023": { commitment_text: ">$5B/year renewable investment, ~30% of gross capex", metric: ">$5B/year, ~30% capex", is_conditional: false },
        "2024": { commitment_text: "~$5B/year, >25% of capex maintained", metric: "~$5B/year, >25% capex", is_conditional: false },
      },
    },
  ],
  key_risks: [
    "French court ruling in 2024 found TotalEnergies liable for misleading climate disclosures — first such ruling against an energy major",
    "Net zero 2050 commitment legally challenged as inconsistent with simultaneous upstream oil and gas expansion",
    "Scope 3 and downstream product emissions disclosure remains weaker than Scope 1 and 2",
  ],
  key_strengths: [
    "Most consistent commitment language of the three majors — no major targets dropped or revised downward",
    "Scope 1 & 2 absolute reduction target maintained with same metric and baseline across all three years",
    "Renewable capacity target backed by measurable progress — 27 GW installed, disclosed with specificity",
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export const SAMPLES = {
  BP: {
    company: "BP",
    years: "2022 · 2023 · 2024",
    tagline: "Three years of accelerating retreat from stated climate ambitions",
    credibility_score: BP_DRIFT.credibility_score,
    docs: BP_DOCS,
    drift: BP_DRIFT,
  },
  Shell: {
    company: "Shell",
    years: "2022 · 2023 · 2024",
    tagline: "Absolute targets replaced by intensity metrics as legal pressure mounted",
    credibility_score: SHELL_DRIFT.credibility_score,
    docs: SHELL_DOCS,
    drift: SHELL_DRIFT,
  },
  TotalEnergies: {
    company: "TotalEnergies",
    years: "2022 · 2023 · 2024",
    tagline: "First energy major found liable in court for misleading climate disclosures",
    credibility_score: TOTAL_DRIFT.credibility_score,
    docs: TOTAL_DOCS,
    drift: TOTAL_DRIFT,
  },
};
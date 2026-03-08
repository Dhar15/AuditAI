/**
 * Prompt for extracting structured commitments from a single annual report.
 */
export function buildExtractionPrompt(text, year, company) {
  return `You are a senior ESG analyst. Extract every MATERIAL public commitment and quantified target from this ${company} ${year} Annual Report.

Focus on: net zero pledges, Scope 1/2/3 emission targets, carbon intensity goals, capex pledges for clean/low-carbon, oil & gas production targets, renewable capacity goals, divestment timelines, methane reduction targets.

Ignore vague aspirational language with no commitment, no metric, and no year.

Return ONLY valid JSON — no markdown fences, no commentary, nothing else:
{
  "company": "${company}",
  "year": ${year},
  "commitments": [
    {
      "id": "unique short slug e.g. net-zero-2050",
      "topic": "short label e.g. Net Zero, Scope 3 Reduction, Renewable Capacity",
      "category": "emissions_target | capex_pledge | production_change | portfolio_transition | renewable_target",
      "commitment_text": "exact or near-exact language from the document",
      "metric": "quantified target string, or null if none",
      "target_year": integer or null,
      "is_conditional": true or false,
      "significance": "high | medium | low"
    }
  ]
}

Report excerpt:
${text}`;
}

/**
 * Prompt for cross-year drift analysis across multiple extracted commitment sets.
 */
export function buildDriftPrompt(docs) {
  const company = docs[0].company;

  const payload = docs.map((d) => ({
    year: d.year,
    commitments: d.commitments.map((c) => ({
      id: c.id,
      topic: c.topic,
      category: c.category,
      metric: c.metric,
      commitment_text: c.commitment_text,
      is_conditional: c.is_conditional,
    })),
  }));

  return `You are a senior ESG compliance analyst reviewing ${company}'s climate commitments across multiple annual reports.

Your task:
1. Group commitments referring to the SAME underlying goal into "commitment threads" — match by topic similarity, not exact wording.
2. For each thread, determine drift from earliest to latest year.
3. Score each dimension using the EXACT rubric below. Do not deviate.

Drift values: maintained | softened | revised_down | revised_up | dropped | new | on_track

SCORING RUBRIC:

CONSISTENCY (0-100): Pct of threads NOT dropped or revised_down.
  Formula: (maintained+on_track+revised_up+new threads) / total_threads * 100
  Then subtract 10 for each thread where language became conditional. Floor 0.

SPECIFICITY (0-100): Score each commitment in the LATEST year: 2=has numeric target AND year, 1=has one of the two, 0=vague only.
  Average score * 50 = specificity. E.g. 4 commitments scoring 2,2,1,0 = avg 1.25 * 50 = 63.

AMBITION (0-100): Base 50.
  +20 if absolute emission reduction >= 40% by 2030/2035 in latest year
  +10 if net zero / carbon neutral target in latest year
  +10 if clean capex >= 25% of total in latest year
  -15 if absolute Scope 3 replaced by intensity metric at any point
  -10 if any target year pushed back vs earliest year
  -10 if production reduction target removed or reversed
  Floor 0, cap 100.

DISCLOSURE (0-100): Base 40.
  +15 if progress reported with actual figures (not just restated targets)
  +15 if conditional assumptions explicitly disclosed
  +15 if methodology changes between years are explained
  +10 if interim milestones set for long-term targets
  -10 per year a commitment was silently removed with no explanation (max -20)
  Floor 0, cap 100.

CREDIBILITY: Round(consistency*0.35 + specificity*0.25 + ambition*0.25 + disclosure*0.15)

Include score_notes: one sentence per dimension explaining what specifically drove the score for this company.

Return ONLY valid JSON, no fences, no commentary:
{
  "company": "${company}",
  "credibility_score": integer,
  "credibility_rationale": "2-3 sentence honest assessment of consistency pattern",
  "score_breakdown": { "consistency": int, "specificity": int, "ambition": int, "disclosure": int },
  "score_notes": { "consistency": "one sentence", "specificity": "one sentence", "ambition": "one sentence", "disclosure": "one sentence" },
  "commitment_threads": [
    {
      "topic": "string",
      "category": "string",
      "drift": "drift_value",
      "drift_explanation": "what changed and why it matters for legal/regulatory exposure",
      "years": {
        "YEAR": { "commitment_text": "string", "metric": "string or null", "is_conditional": bool }
      }
    }
  ],
  "key_risks": ["risk 1", "risk 2", "risk 3"],
  "key_strengths": ["strength 1", "strength 2"]
}

Annual report data:
${JSON.stringify(payload, null, 2)}`;
}

/**
 * System prompt for the Q&A co-pilot, grounded in the company's actual documents.
 */
export function buildCopilotSystemPrompt(docs, drift) {
  const company = drift?.company || docs[0]?.company || "this company";

  const registry = docs
    .map(
      (d) =>
        `=== ${d.year} ===\n${d.commitments
          .map(
            (c) =>
              `[${c.topic}] ${c.commitment_text} | Metric: ${c.metric || "none"} | Conditional: ${c.is_conditional}`
          )
          .join("\n")}`
    )
    .join("\n\n");

  const threads = (drift?.commitment_threads || [])
    .map((t) => `${t.topic} → ${t.drift}: ${t.drift_explanation}`)
    .join("\n");

  return `You are AuditAI, an internal ESG compliance co-pilot for ${company}'s ESG, Investor Relations, and Legal teams.
You have full visibility into their commitment history extracted from official annual reports.

Be specific. Always cite years. Be honest about risk — this is internal use, not PR.
Format clearly. Keep answers focused and actionable.

COMMITMENT REGISTRY (${docs.length} reports):
${registry}

DRIFT ANALYSIS:
Score: ${drift?.credibility_score ?? "N/A"}/100
${drift?.credibility_rationale ?? "Single report — no drift analysis available"}
${threads}

KEY RISKS: ${(drift?.key_risks || []).join(" | ")}`;
}
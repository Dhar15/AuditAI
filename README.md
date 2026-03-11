# AuditAI - ESG Commitment Intelligence Platform

> **Note:** This project was built as part of a work assignment for an AI Product Manager role application. It demonstrates product thinking, AI feature design, and end-to-end implementation of a domain-specific AI product.

---

## What is AuditAI?

Energy companies have made hundreds of public climate commitments over the past decade - across annual reports, investor presentations, and regulatory filings. There is no unified internal source of truth. Nobody in legal, ESG, or IR can answer the question: *what did we commit to in 2021, and does our 2024 report still say the same thing?*

With CSRD live from the 2024 reporting cycle and SEC climate disclosure rules in effect, that gap is now a legal liability - not just a reputational one.

**AuditAI** is an internal commitment intelligence platform that gives ESG, IR, and legal teams a single source of truth for every public climate commitment a company has ever made. It extracts commitments from annual reports, tracks drift year-over-year, scores credibility exposure across four dimensions, and quantifies regulatory risk in dollar terms.

---

## The Problem

| Company | What Happened | Exposure |
|---|---|---|
| **BP** | Reversed 40% production cut; Scope 3 targets dropped | Score: 34/100 |
| **Shell** | Replaced absolute Scope 3 targets with intensity metrics | Score: 51/100 |
| **TotalEnergies** | Found liable in French court for misleading climate disclosures | Score: 58/100 |

3,000+ active climate litigation cases globally as of 2024. CSRD penalties: max(€10M, 5% of net turnover) per material violation.

---

## Features

### 📊 Credibility Score
A 0–100 score calculated from four rule-based dimensions - not AI estimation, but an explicit rubric applied to extracted commitment data.

| Dimension | Weight | How It's Calculated |
|---|---|---|
| **Consistency** | 35% | % of commitment threads not dropped or revised down. −10pts per thread where language became conditional. |
| **Specificity** | 25% | Each commitment scored 0–2 (2 = numeric target + year). Average × 50. |
| **Ambition** | 25% | Base 50. Adjustments for absolute vs intensity targets, capex allocation, net zero presence, target year changes. |
| **Disclosure** | 15% | Base 40. Rewards actual progress figures, methodology transparency, interim milestones. Penalises silent removals. |

### ⚠️ Regulatory Exposure Quantifier
Translates the credibility score into a dollar exposure window - broken down by CSRD fines, SEC enforcement, climate litigation, and cost of capital impact. Derived from actual revenue, listing jurisdictions, and drift event count.

### 📈 Peer Benchmarking Radar
Interactive 3D radar chart comparing BP, Shell, and TotalEnergies across all four dimensions. Drag to rotate. Hover the legend or score table to isolate a company.

### 🔍 Drift Analysis
Commitment threads tracked year-over-year. Each thread shows exactly how language changed between filings - with drift labels (Maintained / Softened / Revised Down / Dropped / Walked Back) and an explanation of why it matters for regulatory exposure.

### 🤖 Live Commitment Extractor
Paste any paragraph from any annual report. AuditAI extracts every commitment in under 5 seconds - structured with topic, category, metric, target year, conditionality, and significance. Download as Excel.

### 💬 Q&A Co-pilot
Ask any question about a loaded company's commitments. Grounded in the extracted commitment corpus - not general knowledge.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Pure CSS (no UI library) |
| AI / LLM | Groq API - Llama 3.3 70B |
| Email | EmailJS (request access form) |
| Excel export | SheetJS (client-side) |
| Charts | Pure SVG (no charting library) |
| Animation | CSS keyframes + IntersectionObserver + requestAnimationFrame |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── api/
│   ├── copilot.js          - Q&A co-pilot function
│   ├── groqClient.js       - Groq API fetch wrapper
│   └── prompts.js          - All prompt templates with scoring rubrics
├── components/
│   ├── BackgroundCanvas.jsx  - Animated particle network background
│   ├── BenchmarkView.jsx     - Interactive 3D radar chart + score table
│   ├── DriftView.jsx         - Commitment thread drift analysis
│   ├── ExposurePanel.jsx     - Regulatory exposure quantifier
│   ├── ExtractView.jsx       - Live commitment extractor
│   ├── HomeView.jsx          - Landing page + request access form
│   ├── QAView.jsx            - AI co-pilot chat
│   ├── RegistryView.jsx      - Filterable commitment registry
│   ├── shared.jsx            - Shared UI components
│   └── SummaryView.jsx       - Credibility score + breakdown
├── config/
│   └── driftRules.js       - Scoring config, drift labels, colour maps
├── data/
│   └── samples.js          - Pre-loaded BP, Shell, TotalEnergies data
├── styles/
│   └── global.css
├── utils/
│   ├── animate.js          - useReveal, useCountUp hooks
│   └── json.js             - safeParseJSON utility
└── App.jsx
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com) - no credit card needed
- A free [EmailJS account](https://emailjs.com) - for the request access form

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/auditai.git
cd auditai
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Groq - powers Q&A and commitment extraction
VITE_GROQ_API_KEY=gsk_your_key_here

# EmailJS - request access form submissions
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxx
```

### EmailJS Template Setup

In your EmailJS template, use these variables:

```
Subject: AuditAI Access Request - {{from_company}}

Name: {{from_name}}
Email: {{from_email}}
Company: {{from_company}}
Role: {{role}}
```

### Run Locally

```bash
npm run dev
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then add all four environment variables in your Vercel project dashboard under **Settings → Environment Variables**, and redeploy.

---

## Product Decisions & Tradeoffs

**Why pre-loaded samples instead of live document upload?**
Annual reports are 200–300 pages, often scanned PDFs with inconsistent formatting. Reliable extraction requires a backend pipeline with a large-context model and OCR. For this demo, pre-loaded data keeps the focus on the AI product layer - the extraction feature demonstrates the capability on user-supplied text.

**Why Groq / Llama over OpenAI?**
Speed. The Q&A co-pilot and commitment extractor need to feel instant. Groq's inference speed on Llama 3.3 70B is materially faster than GPT-4o for this use case, with no meaningful quality difference on structured extraction tasks.

**Why a rule-based rubric instead of an end-to-end AI score?**
A compliance product needs to be auditable. If a regulator or board asks why a company scored 34, the answer needs to be a traceable formula, not "the model said so." The rubric makes every score explainable and contestable - which is a feature, not a limitation.

**Why pure SVG for the radar chart?**
No charting library adds the interactive 3D rotation behaviour needed. A 100-line SVG component is more controllable and lighter than pulling in D3 or Recharts for a single chart.

---

## Key Concepts

**Commitment Thread**
A single climate goal tracked across multiple annual reports. AuditAI groups statements referring to the same underlying goal into a thread - even when the company rewords them between years - and labels the trajectory (Maintained, Softened, Revised Down, Dropped, etc.).

**Drift**
The change in a commitment from one year to the next. Drift is the core signal for regulatory exposure - not because companies fail to keep commitments, but because they quietly revise them in ways that create legal inconsistency between filings.

**Intensity vs Absolute Targets**
An absolute target caps total emissions. An intensity target measures emissions per unit of output - so absolute emissions can rise if production grows. Replacing an absolute target with an intensity target is treated as a material weakening and penalised in the Ambition score.

---

## Disclaimer

This is a demo product. Regulatory exposure figures are estimates based on published penalty schedules and are not legal advice. Credibility scores are AI-assisted and should be validated against primary source documents before use in any legal or regulatory context.

---

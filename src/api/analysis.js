import { groq } from "./groqClient";
import { buildExtractionPrompt, buildDriftPrompt, buildCopilotSystemPrompt } from "./prompts";
import { safeParseJSON } from "../utils/json";

// ─── Chunking config ──────────────────────────────────────────────────────────
// Groq's llama-3.3-70b-versatile has a ~6000 token request limit in practice.
// At ~4 chars/token, 24000 chars of text is the safe ceiling per request.
// We chunk the PDF text and run extraction on each chunk separately.

const CHUNK_SIZE = 24000;   // characters per chunk sent to the model
const CHUNK_OVERLAP = 1500; // overlap so commitments that span a boundary aren't missed

/**
 * Split text into overlapping chunks of CHUNK_SIZE characters.
 */
function chunkText(text) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    const next = start + CHUNK_SIZE - CHUNK_OVERLAP;
    if (next >= text.length) break;
    start = next;
  }

  // Catch any trailing text not captured above
  if (start < text.length && (chunks.length === 0 || start > 0)) {
    const last = text.slice(start);
    if (last.length > 200) chunks.push(last); // skip tiny trailing fragments
  }

  return chunks;
}

/**
 * Deduplicate commitments across chunks.
 * Two commitments are duplicates if their normalised topic keys match.
 * Keeps whichever has the longer, more descriptive commitment_text.
 */
function deduplicateCommitments(commitments) {
  const seen = new Map();

  for (const c of commitments) {
    const key = (c.id || c.topic || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, c);
    } else if ((c.commitment_text || "").length > (existing.commitment_text || "").length) {
      seen.set(key, c); // keep the more detailed version
    }
  }

  return Array.from(seen.values());
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract structured commitments from raw PDF text for a single report.
 * Automatically chunks large documents to stay within Groq's request limits.
 *
 * @param {string} text    - raw text extracted from PDF (up to 50k chars from pdf.js)
 * @param {string} year    - report year
 * @param {string} company - company name
 * @returns {Promise<{company, year, commitments: Array}>}
 */
export async function extractCommitments(text, year, company) {
  const chunks = chunkText(text);
  const allCommitments = [];

  for (let i = 0; i < chunks.length; i++) {
    const prompt = buildExtractionPrompt(chunks[i], year, company);

    try {
      const raw = await groq([{ role: "user", content: prompt }], 2000);
      const parsed = safeParseJSON(raw);
      if (parsed?.commitments?.length) {
        allCommitments.push(...parsed.commitments);
      }
    } catch (err) {
      // If one chunk fails (e.g. transient rate limit), log and continue with others
      console.warn(`Chunk ${i + 1}/${chunks.length} failed: ${err.message}`);
    }
  }

  const commitments = deduplicateCommitments(allCommitments);

  if (!commitments.length) {
    throw new Error(
      "No commitments found. The PDF may be image-based (scanned) or contain no quantified climate targets."
    );
  }

  return { company, year, commitments };
}

/**
 * Run cross-year drift analysis across successfully extracted docs.
 * Requires at least 2 docs with commitments.
 *
 * @param {Array} docs - array of successfully extracted doc objects
 * @returns {Promise<Object>} drift analysis result
 */
export async function runDriftAnalysis(docs) {
  if (docs.length < 2) throw new Error("Drift analysis requires at least 2 reports.");

  const prompt = buildDriftPrompt(docs);
  const raw = await groq([{ role: "user", content: prompt }], 3000);
  const parsed = safeParseJSON(raw);

  if (!parsed?.commitment_threads) {
    throw new Error("Drift analysis response could not be parsed. Try re-uploading.");
  }

  return parsed;
}

/**
 * Answer a user question grounded in the company's extracted commitment corpus.
 *
 * @param {string}      question - user's question
 * @param {Array}       docs     - extracted docs
 * @param {Object|null} drift    - drift analysis result (null for single-report)
 * @param {Array}       history  - prior conversation messages for multi-turn context
 * @returns {Promise<string>} AI response
 */
export async function askCopilot(question, docs, drift, history = []) {
  const systemPrompt = buildCopilotSystemPrompt(docs, drift);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6), // last 3 turns to stay within context limits
    { role: "user", content: question },
  ];

  return await groq(messages, 1200);
}
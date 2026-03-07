/**
 * Attempt to parse JSON from an LLM response that may include:
 * - Valid JSON directly
 * - JSON wrapped in ```json ... ``` fences
 * - JSON embedded inside a longer text string
 *
 * Returns null if all strategies fail.
 *
 * @param {string} raw - raw text from LLM
 * @returns {Object|null} parsed object, or null on failure
 */
export function safeParseJSON(raw) {
  if (!raw) return null;

  // Strategy 1: direct parse
  try { return JSON.parse(raw); } catch (_) {}

  // Strategy 2: strip markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
  }

  // Strategy 3: extract first {...} block
  const objectMatch = raw.match(/(\{[\s\S]*\})/s);
  if (objectMatch) {
    try { return JSON.parse(objectMatch[1]); } catch (_) {}
  }

  return null;
}
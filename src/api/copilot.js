import { groq } from "./groqClient";
import { buildCopilotSystemPrompt } from "./prompts";

/**
 * Answer a user question grounded in the company's extracted commitment corpus.
 *
 * @param {string}      question - user's question
 * @param {Array}       docs     - extracted/pre-loaded docs
 * @param {Object|null} drift    - drift analysis result
 * @param {Array}       history  - prior conversation messages for multi-turn context
 * @returns {Promise<string>} AI response text
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
import OpenAI from 'openai';
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.AI_API_KEY,
});
// OpenRouter regularly retires free model variants (e.g. `z-ai/glm-5.2:free`),
// which makes every request fail. Models are tried in order until one returns
// content. Override with a comma-separated AI_MODELS env var.
const DEFAULT_MODELS = [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3.5-super-vl:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'inclusionai/ling-3.2-flash:free',
];
export const AI_MODELS = (process.env.AI_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
if (AI_MODELS.length === 0)
    AI_MODELS.push(...DEFAULT_MODELS);
/**
 * Runs a chat completion, falling back through AI_MODELS when a model errors
 * (removed, rate-limited, provider down) or returns empty content.
 * Throws only if every model fails.
 */
export async function createCompletion(messages) {
    let lastError;
    for (const model of AI_MODELS) {
        try {
            const response = await openai.chat.completions.create({ model, messages });
            const content = response.choices?.[0]?.message?.content?.trim();
            if (content)
                return content;
            lastError = new Error(`Model ${model} returned empty content`);
            console.warn(`[AI] ${model} returned empty content, trying next model`);
        }
        catch (error) {
            lastError = error;
            console.warn(`[AI] ${model} failed (${error?.status ?? ''} ${error?.message ?? error}), trying next model`);
        }
    }
    throw lastError ?? new Error('No AI models configured');
}
/** Strips markdown code fences the model may wrap around the HTML. */
export function cleanCode(code) {
    return code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim();
}
export default openai;

import { getOpenRouterApiKey } from "@/openrouterAi/apiKeyStorage";
import { Vocabulary } from "@/types/vocabulary";

const BASE_URL = "https://openrouter.ai/api/v1";
const SITE_URL = "https://vocabulary-app.com"; // Replace with actual site URL if available
const SITE_NAME = "AI Vocabulary App";

const getHeaders = (apiKey: string) => ({
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": SITE_URL,
    "X-Title": SITE_NAME,
});

export const generateVocabularyFromWord = async (word: string, apiKey?: string, modelId?: string) => {
    const keyToUse = apiKey || getOpenRouterApiKey();
    if (!keyToUse) {
        throw new Error("OpenRouter API key is required");
    }

    const prompt = `
Generate detailed vocabulary information for the English word: "${word}".
Target audience: IELTS Band 7+ learners (Bangla speakers).

You must provide:
1. Bangla Meaning (most common/appropriate meaning)
2. Part of Speech (e.g., Noun, Verb, Adjective)
3. Pronunciation (Bangla phonetic)
4. Explanation (Brief definition in English)
5. Synonyms (5 words)
6. Antonyms (5 words)
7. Examples (2 sentences with Bangla translation)
8. Verb Forms (if word is a verb, provide base, v2, v3, ing, s_es forms)
9. Related Words (2-3 words with different parts of speech from the same root)

Format the output EXACTLY as this JSON:
{
  "bangla": "string",
  "english": "${word}",
  "partOfSpeech": "string",
  "pronunciation": "string",
  "explanation": "string",
  "synonyms": ["string"],
  "antonyms": ["string"],
  "examples": [
    {"en": "string", "bn": "string"}
  ],
  "verbForms": {
    "base": "string",
    "v2": "string",
    "v3": "string",
    "ing": "string",
    "s_es": "string"
  },
  "relatedWords": [
    {
      "word": "string",
      "partOfSpeech": "string",
      "meaning": "string",
      "example": "string"
    }
  ]
}
`;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: getHeaders(keyToUse),
        body: JSON.stringify({
            "model": modelId || "google/gemma-3-12b:free",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": { "type": "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;

    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response");
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
};

export const generateVerbForms = async (word: string, apiKey?: string, modelId?: string) => {
    const keyToUse = apiKey || getOpenRouterApiKey();
    if (!keyToUse) {
        throw new Error("OpenRouter API key is required");
    }

    const prompt = `
Generate verb forms for the English verb: "${word}".

Format the output EXACTLY as this JSON:
{
  "base": "${word}",
  "v2": "string (past simple)",
  "v3": "string (past participle)",
  "ing": "string (present participle)",
  "s_es": "string (third person singular)"
}
`;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: getHeaders(keyToUse),
        body: JSON.stringify({
            "model": modelId || "google/gemma-3-12b:free",
            "messages": [
                { "role": "user", "content": prompt }
            ],
            "response_format": { "type": "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;

    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response");
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
};

export const generateRelatedWords = async (word: string, apiKey?: string, modelId?: string) => {
    const keyToUse = apiKey || getOpenRouterApiKey();
    if (!keyToUse) {
        throw new Error("OpenRouter API key is required");
    }

    const prompt = `
Generate exactly 3 related words for the English word: "${word}".

⚠️ RULES:
- Related words MUST come from the same root family (e.g., "act" → action, active, activity) and IELTS 7+ level vocabulary.
- Related words must come from the SAME ROOT (morphologically connected).
- Meaning should be concise, academic, and reflect native Bangladeshi thought.
- They MUST fit valid English word families.
- Each related word MUST use one of THESE part-of-speech types ONLY:
  ["Noun","Verb","Adjective","Adverb","Preposition","Conjunction","Pronoun","Interjection","Phrase","Idiom","Phrasal Verb","Linking Phrase"]

- Always return Bangla translation for "meaning".
- Examples MUST be simple, clear, and meaningful.
- DO NOT repeat the input word itself.
- DO NOT generate duplicates.
- DO NOT add explanations outside JSON.

Return ONLY this JSON format:

{
  "relatedWords": [
    {
      "word": "string",
      "partOfSpeech": "Noun | Verb | Adjective | Adverb | ...",
      "meaning": "string (Bangla meaning)",
      "example": "string (English sentence)"
    }
  ]
}
`;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: getHeaders(keyToUse),
        body: JSON.stringify({
            model: modelId || "google/gemma-3-12b:free",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();

    const parsed = JSON.parse(result.choices[0].message.content || "{}");

    if (!parsed.relatedWords || !Array.isArray(parsed.relatedWords)) {
        return [];
    }

    return parsed.relatedWords;
};

export const chatWithVocabulary = async (
    vocabulary: Vocabulary,
    messages: any[],
    apiKey?: string,
    modelId?: string
) => {
    const keyToUse = apiKey || getOpenRouterApiKey();
    if (!keyToUse) {
        throw new Error("OpenRouter API key is required");
    }

    const systemPrompt = `
You are a helpful English vocabulary tutor for a Bangla speaker.
The user is learning the word: "${vocabulary.english}".
Meaning: ${vocabulary.bangla}
Part of Speech: ${vocabulary.partOfSpeech}
Context: IELTS Band 7+ preparation.

Your goal is to help the user understand and use this word correctly.
Answer questions about synonyms, antonyms, usage, grammar, and collocations related to this word.
Keep answers concise and helpful.
If the user asks for examples, provide them with Bangla translations.
`;

    // Map messages to include reasoning_details if present
    const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => {
            const msg: any = { role: m.role, content: m.content };
            if (m.reasoning_details) {
                msg.reasoning_details = m.reasoning_details;
            }
            return msg;
        })
    ];

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: getHeaders(keyToUse),
        body: JSON.stringify({
            model: modelId || "google/gemma-3-12b:free",
            messages: apiMessages,
            reasoning: { enabled: true }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const choice = result.choices[0];

    return {
        content: choice.message.content,
        reasoning_details: choice.message.reasoning_details, // Return reasoning details
    };
};

export const generateVocabularyFromWord = async (word: string, bangla?: string, apiKey?: string, modelId?: string) => {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const keyToUse = apiKey || OPENAI_API_KEY;

    if (!keyToUse) {
        throw new Error("OpenAI API key is required (VITE_OPENAI_API_KEY)");
    }

    // Use proxy in development to avoid CORS, direct URL in production
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? "/api/openai" : "https://api.openai.com/v1";

    // Safety: Ensure baseUrl is not pointing to a 3rd party proxy (n8n)
    if (/n8n|automationlearners/i.test(baseUrl)) {
        throw new Error("Invalid dev proxy configuration: n8n/third-party proxy is not allowed. Please remove any n8n proxy and use the standard OpenAI endpoint.");
    }

    const hasBangla = !!bangla && bangla.trim() !== "";
    const prompt = `
You are a vocabulary generator. You MUST return ONLY valid JSON with no wrapper, no markdown, no explanations.

Input:

English word: ${word}${hasBangla ? `

Bangla meaning: ${bangla}` : ""}

CRITICAL: Your response must be ONLY the JSON object described below.
Do NOT wrap it in any other structure.
Do NOT use markdown code blocks.
Do NOT add any text before or after the JSON.
Do NOT modify the input English word — use it EXACTLY as provided.${hasBangla ? " Do NOT modify the provided Bangla meaning." : " Generate the most common/appropriate Bangla meaning."}

✅ REQUIRED JSON STRUCTURE
If the vocabulary word IS a Verb (partOfSpeech: "Verb"):
{
  "english": "${word}",
  "bangla": "${hasBangla ? bangla : ""}",
  "partOfSpeech": "",
  "pronunciation": "",
  "explanation": "",
  "synonyms": ["", "", "", "", ""],
  "antonyms": ["", "", "", "", ""],
  "examples": [
    { "en": "", "bn": "" },
    { "en": "", "bn": "" }
  ],
  "verbForms": {
    "base": "",
    "v2": "",
    "v3": "",
    "ing": "",
    "s_es": ""
  },
  "relatedWords": [
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" },
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" },
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" }
  ]
}

If the vocabulary word is NOT a Verb (partOfSpeech is anything else) → REMOVE verbForms COMPLETELY (do not include the key at all):
{
  "english": "${word}",
  "bangla": "${hasBangla ? bangla : ""}",
  "partOfSpeech": "",
  "pronunciation": "",
  "explanation": "",
  "synonyms": ["", "", "", "", ""],
  "antonyms": ["", "", "", "", ""],
  "examples": [
    { "en": "", "bn": "" },
    { "en": "", "bn": "" }
  ],
  "relatedWords": [
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" },
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" },
    { "word": "", "partOfSpeech": "", "meaning": "", "example": "" }
  ]
}

✅ RULES
1. partOfSpeech

Allowed values ONLY (detect accurately based on standard English grammar for the word and Bangla meaning if provided; MUST select exactly one):

Noun

Verb

Adjective

Adverb

Preposition

Conjunction

Pronoun

Interjection

Phrase

Idiom

Phrasal Verb

Linking Phrase

CRITICAL: Choose "Verb" ONLY if the word functions primarily as a verb. Otherwise, do NOT choose "Verb". For example, if the word can be multiple POS, choose the most common one, but NEVER default to Verb unless it is primarily a verb.

2. verbForms

CRITICAL: Include ONLY if partOfSpeech is EXACTLY "Verb". If not, OMIT the entire "verbForms" key from JSON. Do NOT include empty or partial verbForms for non-verbs.
If included: Fill all forms correctly. Use the input English word as base if it matches.

3. relatedWords (EXACTLY 3)

Must come from the same morphological/word-family root
Must be IELTS 8+ level
meaning must be in Bangla
example must be a simple, academic-quality English sentence

4. pronunciation

Format EXACTLY as: "US: /IPA/ | Bangla: বাংলা ফোনেটিক"
- US: Standard IPA for US English pronunciation
- Bangla: Bangla phonetic spelling in Bangladeshi style (use Bengali script for phonetic transcription, e.g., "শেরেনডিপিটি" for serendipity)
Follow Bangladeshi accent style: Adapt US IPA slightly for common Bangladeshi pronunciations (e.g., softer 'r', vowel shifts).

5. explanation

Very clear, concise, academic English (not Bangla)
IELTS 8+ standard
Suitable for Bangladeshi learners

6. synonyms & antonyms

EXACTLY 5 each
MUST be IELTS 8+ academic vocabulary
High-level but relevant

7. examples

EXACTLY 2 examples
English sentences MUST be:
Academic
Clear
IELTS 8+ writing style
Bangla sentences MUST be:
Natural Bangladeshi style
Smooth and simple
Translate the English examples accurately to Bangla.

8. Input protection

You CANNOT alter or replace the input English word.${hasBangla ? " Use the provided Bangla exactly." : ""}

9. JSON purity

Output MUST be:
ONLY JSON
No markdown
No backticks
No explanations
No comments
Starts with { and ends with }
`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${keyToUse}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": modelId || "gpt-4o",
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
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;

    let jsonText = text.trim();
    // Remove any leading/trailing markdown if present, but emphasize no markdown
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response as valid JSON");
    }

    jsonText = jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Ensure partOfSpeech is selected from allowed list; if not, throw error or default
    const allowedPOS = [
        "Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction",
        "Pronoun", "Interjection", "Phrase", "Idiom", "Phrasal Verb", "Linking Phrase"
    ];
    if (!allowedPOS.includes(parsed.partOfSpeech)) {
        throw new Error(`Invalid partOfSpeech generated: ${parsed.partOfSpeech}. Must be one of: ${allowedPOS.join(", ")}`);
    }

    // Validate verbForms: Only present if POS is exactly "Verb"
    const isVerbPOS = parsed.partOfSpeech === "Verb";
    if (isVerbPOS && (!parsed.verbForms || typeof parsed.verbForms !== "object")) {
        throw new Error("verbForms missing or invalid for Verb");
    }
    if (!isVerbPOS && parsed.hasOwnProperty("verbForms")) {
        // Remove verbForms if present incorrectly
        delete parsed.verbForms;
        console.warn("Removed invalid verbForms for non-verb POS");
    }

    // Validate pronunciation format
    if (parsed.pronunciation && !parsed.pronunciation.includes("|")) {
        throw new Error("Pronunciation must include both US and Bangla formats separated by '|'");
    }

    // If bangla not provided and not generated, generate a simple one or error
    if (!hasBangla && !parsed.bangla) {
        throw new Error("Bangla meaning was not generated");
    }

    return parsed;
};
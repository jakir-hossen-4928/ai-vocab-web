export const enhanceVocabulary = async (vocab: any, apiKey?: string, specificFields?: string[]) => {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const keyToUse = apiKey || localStorage.getItem("openai_api_key") || OPENAI_API_KEY;

    if (!keyToUse) {
        throw new Error("OpenAI API key is required");
    }

    // Determine what fields need enhancement
    let needsEnhancement: string[] = [];

    // Check verb forms (only for verbs)
    if (vocab.partOfSpeech === "Verb" && !vocab.verbForms) {
        needsEnhancement.push("verbForms");
    }

    // Check synonyms
    if (!vocab.synonyms || vocab.synonyms.length < 3) {
        needsEnhancement.push("synonyms");
    }

    // Check antonyms
    if (!vocab.antonyms || vocab.antonyms.length < 3) {
        needsEnhancement.push("antonyms");
    }

    // Check examples
    if (!vocab.examples || vocab.examples.length === 0) {
        needsEnhancement.push("examples");
    }

    // Check related words
    if (!vocab.relatedWords || vocab.relatedWords.length === 0) {
        needsEnhancement.push("relatedWords");
    }

    // Check pronunciation
    if (!vocab.pronunciation || vocab.pronunciation.trim() === "") {
        needsEnhancement.push("pronunciation");
    }

    // Check explanation
    if (!vocab.explanation || vocab.explanation.length < 50) {
        needsEnhancement.push("explanation");
    }

    // If specific fields are requested, filter to only those that are missing
    if (specificFields && specificFields.length > 0 && !specificFields.includes("all")) {
        needsEnhancement = needsEnhancement.filter(field => specificFields.includes(field));
    }

    // If nothing needs enhancement, return empty object
    if (needsEnhancement.length === 0) {
        return {};
    }

    // Build comprehensive IELTS-focused prompt
    const prompt = `You are enhancing vocabulary for IELTS Writing Task 2 Band 7+ level. Generate ONLY missing fields as valid JSON for formal academic contexts (social issues, environment, education, technology).

Existing: English="${vocab.english}", Bangla="${vocab.bangla}", POS="${vocab.partOfSpeech}"
Enhance: ${needsEnhancement.join(", ")}

RULES:
${needsEnhancement.includes("pronunciation") ? '- pronunciation: "US: /IPA/ | BD: বাংলা" (US IPA + Bangla phonetic in Bengali script)\n' : ''}${needsEnhancement.includes("explanation") ? '- explanation: 100-150 words, IELTS 8+, include: in where/why/how used, real-life guide, memorable logic\n' : ''}${needsEnhancement.includes("synonyms") ? '- synonyms: EXACTLY 5, IELTS 8+ academic level\n' : ''}${needsEnhancement.includes("antonyms") ? '- antonyms: EXACTLY 5, IELTS 8+ academic level\n' : ''}${needsEnhancement.includes("examples") ? '- examples: EXACTLY 2 [{en:"",bn:""}], English=IELTS 8+ style, Bangla=natural Bangladeshi\n' : ''}${needsEnhancement.includes("verbForms") ? '- verbForms: {base,v2,v3,ing,s_es} all forms correct\n' : ''}${needsEnhancement.includes("relatedWords") ? '- relatedWords: EXACTLY 3 [{word,partOfSpeech,meaning,example}], same word family, IELTS 8+, meaning in Bangla\n' : ''}
Return ONLY JSON object with requested fields. No markdown, no wrapper. Start with { end with }.`;

    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? "/api/openai" : "https://api.openai.com/v1";

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${keyToUse}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "gpt-4o",
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
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response as valid JSON");
    }

    jsonText = jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Only return the fields that were requested
    const filteredEnhancements: any = {};
    needsEnhancement.forEach(field => {
        if (parsed[field] !== undefined) {
            filteredEnhancements[field] = parsed[field];
        }
    });

    return filteredEnhancements;
};

/**
 * Utility for flexible answer matching in IELTS Listening tests.
 * Handles variations in numbers, words, and formatting.
 */

// Mapping of number words to digits
const NUMBER_WORDS: Record<string, string> = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20',
    'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60',
    'seventy': '70', 'eighty': '80', 'ninety': '90',
    'hundred': '100', 'thousand': '1000'
};

/**
 * Normalizes text by removing common prefixes, punctuation, and converting words to numbers where appropriate.
 */
export const normalizeAnswer = (text: string): string => {
    if (!text) return "";

    let normalized = text.toLowerCase().trim();

    // Remove accents (café -> cafe)
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Remove prefixes like "a.", "b)", "1."
    // Strictly require a dot or closing paren.
    // Protect decimals: "1.5" should NOT be stripped. "1." followed by digit is a decimal.
    normalized = normalized.replace(/^([a-z0-9]{1,2})[\.\)](?!\d)\s*/, '');


    // 2. Handle "point" for decimals (e.g., "one point five" -> "1.5")
    normalized = normalized.replace(/\bpoint\b/g, '.');

    // 3. Convert number words to digits (simple cases)
    // We split by space and try to convert individual words or pairs
    let words = normalized.split(/\s+/);

    // Simple pass: convert known number words to digits
    const digits = words.map(w => NUMBER_WORDS[w] || w);

    // Rejoin to handle connected logic if needed, but for now simple replacement
    normalized = digits.join(' ');

    // 4. Remove all punctuation and extra spaces for final comparison
    // Except dots if they look like decimals
    normalized = normalized.replace(/[^\w\s\.]/g, '').replace(/\s+/g, ' ').trim();

    return normalized;
};

/**
 * Recursively generates all valid string variations from a pattern.
 * Handles:
 * - Parentheses: "rain(-)wear" -> "rainwear", "rain-wear"
 * - Slashes: "this/that afternoon" -> "this afternoon", "that afternoon"
 * - Independent Slashes: "trains / bus" -> "trains", "bus"
 */
const expandVariants = (pattern: string): string[] => {
    const results = new Set<string>();
    const queue = [pattern];

    while (queue.length > 0) {
        const current = queue.pop()!;

        // 1. Handle Parentheses (Optional content)
        // Match first (...) block
        const parenMatch = current.match(/\(([^)]*)\)/);
        if (parenMatch) {
            const fullMatch = parenMatch[0];
            const content = parenMatch[1];
            const index = parenMatch.index!;

            const prefix = current.substring(0, index);
            const suffix = current.substring(index + fullMatch.length);

            // Option A: Include content (without parens)
            queue.push(prefix + content + suffix);

            // Option B: Exclude content
            // Need to be careful about spacing. "rain(-)wear" -> "rain-wear" vs "rainwear"
            // If prefix/suffix share words, spacing matters.
            // Simple string concatenation usually works, normalizeAnswer handles spaces later.
            queue.push(prefix + suffix);
            continue;
        }

        // 2. Handle Slashes (Alternatives)

        // A. "Word/Word" pattern (e.g. this/that) -> bind to immediate words
        // matches "word/word" but NOT " / " (space slash)
        // We use a regex strictly for non-space bordered slash
        const wordSlashMatch = current.match(/(\S+)\/(\S+)/);
        if (wordSlashMatch) {
            const fullMatch = wordSlashMatch[0];
            const left = wordSlashMatch[1];
            const right = wordSlashMatch[2];
            const index = wordSlashMatch.index!;

            const prefix = current.substring(0, index);
            const suffix = current.substring(index + fullMatch.length);

            queue.push(prefix + left + suffix);
            queue.push(prefix + right + suffix);
            continue;
        }

        // B. " / " Pattern (Independent options) or remaining slashes
        if (current.includes('/')) {
            const parts = current.split('/');
            parts.forEach(p => queue.push(p));
            continue;
        }

        // No more syntax, add to results
        if (current.trim()) {
            results.add(current);
        }
    }

    return Array.from(results);
};


/**
 * Generates variants of an answer for flexible matching.
 */
const generateVariants = (text: string): string[] => {
    const variants = new Set<string>();
    const norm = normalizeAnswer(text);

    variants.add(norm);

    // Variant 1: Remove all spaces (e.g. "one five" -> "onefive" -> "15")
    variants.add(norm.replace(/\s+/g, ''));

    // Variant 2: Handle "one five" as "1.5" if the correct answer involves decimals?
    // Actually, usually "one five" means 15 or 1.5 depending on context.
    // We can't know for sure, but we can match against the target.

    return Array.from(variants);
};

/**
 * Checks if the user's answer matches any of the allowed answers.
 * @param userAnswer The input from the user.
 * @param possibleAnswers The correct answer string (can be slash-separated variants).
 */
export const checkAnswer = (userAnswer: string, possibleAnswers: string): boolean => {
    if (!userAnswer || !possibleAnswers) return false;

    // 1. Basic Normalization of user input
    const userNorm = normalizeAnswer(userAnswer);
    const userVariants = generateVariants(userAnswer); // e.g. "1 5" and "15"

    // 2. Expand Correct Answer Template
    // e.g. "(the) train" -> ["the train", "train"]
    const allowedTemplates = expandVariants(possibleAnswers);

    for (const template of allowedTemplates) {
        // Normalize each expanded template (removes cases, punctuation, converts numbers)
        const correctNorm = normalizeAnswer(template);
        const correctStripped = correctNorm.replace(/\s+/g, '');

        // Direct match
        if (userNorm === correctNorm) return true;

        // Variant match (spaces stripped from user)
        if (userVariants.includes(correctNorm)) return true;

        // Variant match (spaces stripped from Correct Template)
        // e.g. User "mosf" -> "mosf". Correct "m o s f" -> "m o s f". Stripped "mosf". Match.
        if (userNorm === correctStripped) return true;

        // Numeric sequence match
        if (/^[\d.\s]+$/.test(correctNorm)) {
            const correctDigits = correctNorm.replace(/[^\d]/g, '');
            const userDigits = userNorm.replace(/[^\d]/g, '');
            if (correctDigits.length > 0 && correctDigits === userDigits) {
                return true;
            }
        }
    }

    return false;
};

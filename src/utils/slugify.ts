const banglaToEnglishMap: Record<string, string> = {
    // Core subjects/topics
    'ইংরেজি': 'english',
    'উচ্চারণ': 'pronunciation',
    'উচ্চারণের': 'pronunciation',
    'জড়তা': 'hesitation',
    'কাটাতে': 'overcome',
    'কাটানোর': 'overcome',
    'কার্যকর': 'effective',
    'সহজ': 'easy',
    'কৌশল': 'techniques',
    'শিখুন': 'learn',
    'শেখা': 'learn',
    'জানা': 'know',
    'প্রয়োজনীয়': 'essential',
    'গুরুত্বপূর্ণ': 'important',
    'সেরা': 'best',
    'টিপস': 'tips',
    'টিউটোরিয়াল': 'tutorial',
    'কোর্স': 'course',

    // Grammar/Vocab terms
    'শব্দার্থ': 'vocabulary',
    'ব্যাকরণ': 'grammar',
    'নিয়ম': 'rules',
    'অর্থ': 'meaning',
    'বাক্য': 'sentence',
    'কথোপকথন': 'conversation',
    'ব্যবহার': 'usage',
    'ব্যাবহার': 'usage',
    'চলতি': 'common',
    'দৈনন্দিন': 'daily',
    'উদাহরণ': 'example',
    'তালিকা': 'list',
    'অনুশীলন': 'practice',
    'দক্ষতা': 'skill',
    'উন্নতি': 'improve',

    // Common words
    'কি': 'what',
    'কেন': 'why',
    'কিভাবে': 'how',
    'এবং': 'and',
    'বা': 'or',
    'জন্য': 'for',
    'থেকে': 'from',
    'সাথে': 'with',
    'নতুন': 'new',
    'সবচেয়ে': 'most',
    'মজার': 'fun',
    'উপায়': 'way',
    'মাধ্যমে': 'through',

    // Numbers (0-9) are handled by convertDigits
};

/**
 * Converts Bengali digits in a string to English digits.
 */
const convertDigits = (text: string): string => {
    const digitMap: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return text.replace(/[০-৯]/g, s => digitMap[s]);
};

/**
 * Programmatically translates common Bengali educational terms to English
 * for cleaner, more readable URL slugs without using AI.
 */
const translatePragmatically = (text: string): string => {
    // Normalize and split into words/tokens
    const words = text.normalize('NFC')
        .replace(/[।?!,.:;।]/g, ' ') // Remove Bengali and English punctuation
        .split(/\s+/)
        .filter(w => w.length > 0);

    return words.map(word => {
        // 1. Direct match
        if (banglaToEnglishMap[word]) return banglaToEnglishMap[word];

        // 2. Handle numbers (e.g., ১৫, ২০ ইত্যাদি)
        if (/^[০-৯]+$/.test(word)) return convertDigits(word);

        // 3. Handle common suffixes (ti, er, r, gulo)
        let root = word;
        if (word.endsWith('টি') || word.endsWith('টা')) root = word.slice(0, -2);
        else if (word.endsWith('গুলোর') || word.endsWith('গুলো')) root = word.replace(/গুলোর$|গুলো$/, '');
        else if (word.endsWith('উন্নত')) root = word.replace('উন্নত', '');
        else if (word.endsWith('র')) root = word.slice(0, -1);
        else if (word.endsWith('এর')) root = word.slice(0, -2);

        // Check if root is a number after suffix removal (e.g., ১৫টি -> ১৫)
        if (/^[০-৯]+$/.test(root)) return convertDigits(root);

        if (banglaToEnglishMap[root]) return banglaToEnglishMap[root];

        // 4. Keep Latin characters as is
        if (/^[a-zA-Z0-9-]+$/.test(word)) return word;

        // 5. Default: empty (ignore unknown Bengali words to keep slug clean/English-focused)
        return '';
    })
        .filter(w => w !== '')
        .join('-');
};

export const slugify = (text: string): string => {
    if (!text) return '';

    return translatePragmatically(text.toString())
        .toLowerCase()
        .replace(/--+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')        // Trim - from start of text
        .replace(/-+$/, '');       // Trim - from end of text
};

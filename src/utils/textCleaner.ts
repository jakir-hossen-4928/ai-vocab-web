/**
 * Cleans text content pasted from AI chatbots or other sources
 * Removes hidden characters, normalizes whitespace, and preserves markdown formatting
 */
export function cleanTextContent(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove zero-width characters and other invisible Unicode characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Remove BOM (Byte Order Mark)
    cleaned = cleaned.replace(/^\uFEFF/, '');

    // Remove other control characters except newlines and tabs
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize different types of spaces to regular space
    cleaned = cleaned.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

    // Normalize line breaks (convert \r\n and \r to \n)
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Remove excessive blank lines (more than 2 consecutive newlines)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace from each line while preserving indentation for code blocks
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');

    // Trim leading and trailing whitespace from the entire content
    cleaned = cleaned.trim();

    return cleaned;
}

/**
 * Sanitizes text for display, ensuring safe rendering
 */
export function sanitizeForDisplay(text: string): string {
    if (!text) return '';

    // First clean the text
    let sanitized = cleanTextContent(text);

    // Additional display-specific cleaning can be added here

    return sanitized;
}

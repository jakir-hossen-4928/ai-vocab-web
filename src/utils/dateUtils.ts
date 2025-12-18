import { isValid, parseISO } from "date-fns";

export const safeDate = (date: any): Date | null => {
    if (!date) return null;
    try {
        // Handle Firebase Timestamp
        if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
            return date.toDate();
        }
        // Handle timestamps (numbers)
        if (typeof date === 'number') {
            return new Date(date);
        }
        // Handle string dates
        if (typeof date === 'string') {
            // Try ISO parse first
            const parsed = parseISO(date);
            if (isValid(parsed)) return parsed;

            const d = new Date(date);
            return isValid(d) ? d : null;
        }

        const d = new Date(date);
        return isValid(d) ? d : null;
    } catch (e) {
        return null;
    }
};

export const safeTimestamp = (date: any): number => {
    const d = safeDate(date);
    return d ? d.getTime() : 0;
};

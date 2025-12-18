import { useState, useEffect } from "react";

const VIEW_PREFERENCE_KEY = "vocabulary_view_preference";

export type ViewPreference = "modal" | "page" | null;

export function useViewPreference() {
    const [preference, setPreference] = useState<ViewPreference>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load preference from localStorage
        const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
        if (stored === "modal" || stored === "page") {
            setPreference(stored);
        }
        setIsLoading(false);
    }, []);

    const savePreference = (pref: "modal" | "page") => {
        localStorage.setItem(VIEW_PREFERENCE_KEY, pref);
        setPreference(pref);
    };

    const clearPreference = () => {
        localStorage.removeItem(VIEW_PREFERENCE_KEY);
        setPreference(null);
    };

    return {
        preference,
        isLoading,
        savePreference,
        clearPreference,
    };
}

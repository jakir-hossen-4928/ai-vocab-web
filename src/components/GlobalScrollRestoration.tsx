import { useScrollRestoration } from "@/hooks/useScrollRestoration";

/**
 * Global component to handle window scroll restoration on navigation.
 * Place this inside BrowserRouter.
 */
export const GlobalScrollRestoration = () => {
    // Pass null for ref to target window
    // "window" is the default componentId
    // Always enabled
    useScrollRestoration(null, "window", true);

    return null;
};

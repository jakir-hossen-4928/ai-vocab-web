import { useState, useEffect } from 'react';

/**
 * Hook that detects if the virtual keyboard is likely open on mobile devices.
 * Works by detecting viewport height changes and active element focus.
 */
export function useKeyboard() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        // Only run on clients
        if (typeof window === 'undefined') return;

        // Baseline height to compare against
        let initialHeight = window.innerHeight;

        const handleResize = () => {
            const currentHeight = window.innerHeight;

            // Determine if an input is focused
            const activeElement = document.activeElement;
            const isInputFocused =
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement;

            // If viewport shrank significantly (>15%) and an input is focused,
            // it's highly likely the keyboard is open.
            const shrankSignificantly = currentHeight < initialHeight * 0.85;

            setIsKeyboardOpen(shrankSignificantly && isInputFocused);
        };

        // Also check on orientation change
        const handleOrientationChange = () => {
            // Reset initial height on rotation
            setTimeout(() => {
                initialHeight = window.innerHeight;
                handleResize();
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Add focus/blur listeners to immediately respond to intent
        const handleFocusChange = () => setTimeout(handleResize, 100);
        window.addEventListener('focusin', handleFocusChange);
        window.addEventListener('focusout', handleFocusChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('focusin', handleFocusChange);
            window.removeEventListener('focusout', handleFocusChange);
        };
    }, []);

    return isKeyboardOpen;
}

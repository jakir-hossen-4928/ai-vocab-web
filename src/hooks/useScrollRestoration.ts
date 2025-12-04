import { useEffect, RefObject } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * A hook to save and restore scroll position of a container element or the window.
 *
 * @param ref - The ref of the scrollable container element. Pass null for window scroll.
 * @param componentId - A unique identifier for this scroll container within the page (default: "window")
 * @param enabled - Whether scroll restoration is enabled (e.g., wait for data to load)
 */
export const useScrollRestoration = (
    ref: RefObject<HTMLElement> | null,
    componentId: string = "window",
    enabled: boolean = true
) => {
    const { key } = useLocation();
    const navType = useNavigationType();

    // Disable browser's default scroll restoration to avoid conflicts
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const isWindow = !ref;
        const element = isWindow ? window : ref?.current;

        if (!element) return;

        const scrollKey = `scroll_pos_${key}_${componentId}`;

        const getScrollY = () => {
            if (isWindow) return window.scrollY;
            return (element as HTMLElement).scrollTop;
        };

        const setScrollY = (y: number) => {
            if (isWindow) {
                window.scrollTo(0, y);
            } else {
                (element as HTMLElement).scrollTop = y;
            }
        };

        if (navType === 'POP') {
            const savedPosition = sessionStorage.getItem(scrollKey);
            if (savedPosition) {
                const y = parseInt(savedPosition, 10);

                // Attempt to restore immediately
                setScrollY(y);

                // Retry logic using requestAnimationFrame for smoother handling
                // and timeouts for delayed rendering (virtualization, images, etc.)
                const attemptRestore = () => {
                    const current = getScrollY();
                    // Allow for small variance (1px)
                    if (Math.abs(current - y) > 1) {
                        setScrollY(y);
                    }
                };

                // Try on next few frames
                requestAnimationFrame(() => {
                    attemptRestore();
                    requestAnimationFrame(() => {
                        attemptRestore();
                        // Additional checks for slower rendering components
                        setTimeout(attemptRestore, 50);
                        setTimeout(attemptRestore, 150);
                        setTimeout(attemptRestore, 300);
                    });
                });
            }
        } else {
            // For PUSH/REPLACE, reset to top
            setScrollY(0);
        }

        const handleScroll = () => {
            sessionStorage.setItem(scrollKey, getScrollY().toString());
        };

        // Use passive listener for better performance
        element.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            element.removeEventListener('scroll', handleScroll);
        };
    }, [key, enabled, ref, navType, componentId]);
};

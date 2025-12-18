
import despia from 'despia-native';
import { useCallback, useEffect, useState } from 'react';

export const useNative = () => {
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        // Check if running in Despia native environment
        const checkNative = () => {
            // Check for actual Despia environment
            const isDespiaUserAgent = navigator.userAgent.includes('despia');

            // Check for debug override (e.g. ?native_debug=true)
            const urlParams = new URLSearchParams(window.location.search);
            const isDebug = urlParams.get('native_debug') === 'true';

            setIsNative(isDespiaUserAgent || isDebug);

            if (isDebug) {
                console.log("🔌 Native Bridge Simulation Enabled");
                // Mock the window.despia if strictly needed, or just log in our wrapper
            }
        };
        checkNative();
    }, []);

    // Wrapper to safely execute or log native commands
    const nativeCommand = (command: string) => {
        if (navigator.userAgent.includes('despia')) {
            try {
                despia(command);
            } catch (e) {
                console.error("Native command failed:", e);
            }
        } else {
            console.log(`📱 [Native Mock] Executing: ${command}`);
        }
    };

    const haptic = useCallback((type: 'light' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
        if (!isNative) return;

        switch (type) {
            case 'light':
                nativeCommand('lighthaptic://');
                break;
            case 'heavy':
                nativeCommand('heavyhaptic://');
                break;
            case 'success':
                nativeCommand('successhaptic://');
                break;
            case 'warning':
                nativeCommand('warninghaptic://');
                break;
            case 'error':
                nativeCommand('errorhaptic://');
                break;
        }
    }, [isNative]);

    const setStatusBarColor = useCallback((colorHex: string) => {
        if (!isNative) return;

        // Convert hex to rgb format: {r, g, b}
        const hex = colorHex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        nativeCommand(`statusbarcolor://{${r}, ${g}, ${b}}`);
    }, [isNative]);

    const share = useCallback((options: { title?: string; message?: string; url?: string }) => {
        if (!isNative) {
            // Fallback to Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: options.title,
                    text: options.message,
                    url: options.url
                }).catch(console.error);
            } else {
                console.log(`💻 [Web Fallback] Share: ${options.message}`);
            }
            // Even if simulating, we might want to log the native command version too if isNative is forced true
            if (new URLSearchParams(window.location.search).get('native_debug') === 'true') {
                // proceed to log the native command below
            } else {
                return;
            }
        }

        let shareString = 'shareapp://';
        if (options.message || options.url) {
            shareString += '?';
            const params = [];
            if (options.message) params.push(`message=${encodeURIComponent(options.message)}`);
            if (options.url) params.push(`url=${encodeURIComponent(options.url)}`);
            shareString += params.join('&');
        }

        nativeCommand(shareString);
    }, [isNative]);

    const showSpinner = useCallback(() => {
        if (isNative) nativeCommand('spinneron://');
    }, [isNative]);

    const hideSpinner = useCallback(() => {
        if (isNative) nativeCommand('spinneroff://');
    }, [isNative]);

    return {
        isNative,
        haptic,
        setStatusBarColor,
        share,
        showSpinner,
        hideSpinner
    };
};

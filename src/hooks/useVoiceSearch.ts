import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useNative } from './useNative';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

type SupportedLanguage = 'en-US' | 'bn-BD';

export function useVoiceSearch(onResult: (transcript: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState<SupportedLanguage>('en-US');
    const [interimTranscript, setInterimTranscript] = useState<string>('');
    const { haptic } = useNative();

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const toastIdRef = useRef<string | number | null>(null);
    const hasFinalRef = useRef(false);

    const toggleLanguage = useCallback(() => {
        haptic('light');
        setLanguage(prev => prev === 'en-US' ? 'bn-BD' : 'en-US');
    }, [haptic]);

    const startListening = useCallback(() => {
        if (!navigator.onLine) {
            toast.error("You are offline", {
                description: "Voice search requires an internet connection."
            });
            haptic('error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("🎤 Voice search not supported", {
                description: "Please use Chrome, Edge, or Brave browser"
            });
            return;
        }

        haptic('success');

        // Reset state
        hasFinalRef.current = false;
        setInterimTranscript('');
        setIsListening(true);

        const langLabel = language === 'en-US' ? 'English' : 'Bangla';

        // Create recognizer for selected language ONLY
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = true;
        recognition.continuous = false; // Stop after first result

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[0];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            if (!isFinal) {
                setInterimTranscript(transcript);
            } else {
                hasFinalRef.current = true;
                setInterimTranscript('');
                setIsListening(false);
                haptic('success');

                console.log(`✅ Recognized (${langLabel}): "${transcript}"`);

                onResult(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'aborted') return;

            // Ignore no-speech error if we already have a final result
            if (event.error === 'no-speech' && hasFinalRef.current) return;

            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setInterimTranscript('');

            if (event.error === 'no-speech') {
                haptic('warning');
            } else if (event.error === 'not-allowed') {
                haptic('error');
                toast.error("Microphone denied", {
                    description: "Please allow access"
                });
            } else if (event.error !== 'network') {
                haptic('error');
                // Ignore network errors which can happen frequently on mobile
                toast.error("Recognition failed");
            }
        };

        recognition.onend = () => {
            if (!hasFinalRef.current) {
                setIsListening(false);
                setInterimTranscript('');
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start", e);
            setIsListening(false);
        }

    }, [language, onResult, haptic]);

    const stopListening = useCallback(() => {
        haptic('light');
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }
        setIsListening(false);
        setInterimTranscript('');
    }, [haptic]);

    return {
        isListening,
        startListening,
        stopListening,
        detectedLanguage: language === 'en-US' ? 'English' : 'Bangla', // backwards compatibility
        interimTranscript,
        language,
        toggleLanguage
    };
}

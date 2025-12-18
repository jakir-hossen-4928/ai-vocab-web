import { useState, useEffect } from 'react';
import {
    loadVoices,
    getStoredVoiceName,
    setStoredVoiceName as setServiceVoice,
    getStoredRate,
    setStoredRate as setServiceRate,
    getStoredPitch,
    setStoredPitch as setServicePitch,
    speakText
} from '../services/ttsService';

export const useTTS = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
    const [rate, setRateState] = useState(1);
    const [pitch, setPitchState] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initVoices = async () => {
            try {
                const loadedVoices = await loadVoices();
                if (mounted) {
                    setVoices(loadedVoices);

                    // Load Voice
                    const storedVoice = getStoredVoiceName();
                    if (storedVoice) {
                        const exists = loadedVoices.some(v => v.name === storedVoice);
                        if (exists) {
                            setSelectedVoiceName(storedVoice);
                        }
                    }

                    // Load Rate & Pitch
                    setRateState(getStoredRate());
                    setPitchState(getStoredPitch());

                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to load voices", e);
                if (mounted) setLoading(false);
            }
        };

        initVoices();

        return () => {
            mounted = false;
        };
    }, []);

    const setVoice = (name: string) => {
        setServiceVoice(name);
        setSelectedVoiceName(name);
    };

    const setRate = (value: number) => {
        setServiceRate(value);
        setRateState(value);
    };

    const setPitch = (value: number) => {
        setServicePitch(value);
        setPitchState(value);
    };

    const testVoice = (text: string = "Hello, this is a test.") => {
        speakText(text);
    };

    return {
        voices,
        selectedVoiceName,
        setVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        testVoice,
        loading
    };
};

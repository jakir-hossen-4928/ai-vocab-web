import React, { useState } from 'react';
import './TranslateButton.css';
import { Loader2, Languages } from "lucide-react";

interface TranslateButtonProps {
    text: string;
    className?: string;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({ text, className = "" }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [showTranslation, setShowTranslation] = useState(false);

    const translateToBangla = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent clicks
        if (showTranslation) {
            setShowTranslation(false);
            return;
        }

        if (translatedText) {
            setShowTranslation(true);
            return;
        }

        setIsTranslating(true);

        const GOOGLE_API = import.meta.env.VITE_GOOGLE_TRANSLATION_API;

        try {
            const response = await fetch(
                GOOGLE_API + encodeURIComponent(text)
            );

            const data = await response.json();

            const translation = data[0]
                .map((item: any) => item[0])
                .join('');

            setTranslatedText(translation);
            setShowTranslation(true);

        } catch (error) {
            console.error('Translation error:', error);
            setTranslatedText('Translation failed. Please try again.');
            setShowTranslation(true);

        } finally {
            setIsTranslating(false);
        }

    };

    return (
        <div className={`translate-wrapper ${className}`} onClick={(e) => e.stopPropagation()}>
            <button
                className={`translate-trigger-btn ${showTranslation ? 'active' : ''}`}
                onClick={translateToBangla}
                disabled={isTranslating}
                title="Translate to Bangla"
            >
                {isTranslating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <div className="flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold tracking-tight">BN</span>
                    </div>
                )}
            </button>

            {showTranslation && (
                <div className="translation-card">
                    <div className="translation-header">
                        <span className="lang-label">🇧🇩 বাংলা অনুবাদ</span>
                        <button
                            className="close-icon-btn"
                            onClick={() => setShowTranslation(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="translation-body">
                        {translatedText}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranslateButton;

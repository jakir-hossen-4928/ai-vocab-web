import { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Vocabulary } from '@/types/vocabulary';
import { toast } from 'sonner';

export const useVocabularyShare = () => {
    const shareRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [itemToShare, setItemToShare] = useState<Vocabulary | null>(null);

    const shareAsImage = useCallback(async (item: Vocabulary) => {
        if (isSharing) return;

        setItemToShare(item);
        setIsSharing(true);

        // Wait for state update and render
        setTimeout(async () => {
            try {
                if (!shareRef.current) {
                    throw new Error('Capture element not found');
                }

                // Ensure the element is "visible" but off-screen
                // html-to-image sometimes fails if the element is not in the DOM or display: none

                // Small delay to ensure render is settled and fonts are loaded
                // We increase this to 500ms for better reliability
                await new Promise(resolve => setTimeout(resolve, 500));

                console.log('Starting image capture...');
                const dataUrl = await toPng(shareRef.current, {
                    cacheBust: true,
                    pixelRatio: 2,
                    skipAutoScale: true,
                    // Specific options to help with font loading
                    fontEmbedCSS: '',
                });
                console.log('Capture successful');

                // Convert dataUrl to File object for sharing
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], `vocabulary-${item.english.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    console.log('Using Web Share API');
                    await navigator.share({
                        files: [file],
                        title: `Vocabulary: ${item.english}`,
                        text: `Check out this word: ${item.english} (${item.bangla})`,
                    });
                } else {
                    console.log('Sharing not supported or failed, falling back to download');
                    const link = document.createElement('a');
                    link.download = `vocabulary-${item.english.toLowerCase().replace(/\s+/g, '-')}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Sharing not supported. Image downloaded instead.');
                }
            } catch (error) {
                console.error('Error sharing image:', error);
                toast.error('Failed to generate sharing image. Please try again.');
            } finally {
                setIsSharing(false);
                setItemToShare(null);
            }
        }, 150);
    }, [isSharing]);

    return { shareAsImage, shareRef, itemToShare, isSharing };
};

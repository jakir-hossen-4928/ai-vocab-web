import React from 'react';
import { Vocabulary } from '@/types/vocabulary';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageSquare, Activity, Copy, ArrowRightLeft, Languages, Globe, Heart } from 'lucide-react';

interface ShareableVocabularyCardProps {
    item: Vocabulary;
    colors?: {
        background?: string;
        text?: string;
        primary?: string;
    };
}

export const ShareableVocabularyCard = React.forwardRef<HTMLDivElement, ShareableVocabularyCardProps>(
    ({ item, colors = {} }, ref) => {
        // Use default colors or values from props
        const bgColor = colors.background || 'white';
        const primaryColor = colors.primary || '#3b82f6'; // blue-500

        return (
            <div
                ref={ref}
                style={{
                    backgroundColor: bgColor,
                    width: '450px',
                    padding: '24px',
                    borderRadius: '24px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                    color: colors.text || '#1f2937', // gray-800
                }}
                className="shadow-2xl border border-blue-100 bg-white"
            >
                {/* App Branding Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500 p-2 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-blue-500 tracking-tight">Ai Vocab</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8">
                    <Badge variant="secondary" className="px-4 py-1 text-sm bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest rounded-full">
                        {item.partOfSpeech}
                    </Badge>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        {item.bangla}
                    </h1>
                    <h2 className="text-2xl font-semibold text-blue-600">
                        {item.english}
                    </h2>
                    {item.pronunciation && (
                        <p className="text-sm text-gray-400 font-mono">
                            /{item.pronunciation}/
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Examples Section */}
                    {item.examples && item.examples.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" /> Example:
                            </h3>
                            <div className="space-y-3">
                                {item.examples.slice(0, 1).map((ex, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
                                            "{ex.en}"
                                        </p>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {ex.bn}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Synonyms & Antonyms */}
                    <div className="grid grid-cols-2 gap-4">
                        {item.synonyms && item.synonyms.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Synonyms:
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.synonyms.map((syn, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] font-medium bg-white text-gray-600 border-gray-200 rounded-lg py-0.5">
                                            {syn}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {item.antonyms && item.antonyms.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <ArrowRightLeft className="w-3 h-3" /> Antonyms:
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.antonyms.slice(0, 5).map((ant, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] font-medium bg-white text-gray-600 border-gray-200 rounded-lg py-0.5">
                                            {ant}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 rounded-full border border-blue-100/50">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] items-center text-gray-400 font-medium tracking-wide">
                            Learn more at <span className="text-blue-500 font-bold ml-1">ai-vocabulary-coach.netlify.app</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-60">
                        <span className="text-[9px] text-gray-400 font-medium tracking-widest uppercase flex items-center gap-1">
                            Developed with <Heart className="w-2.5 h-2.5 text-red-500 fill-current" /> by Jakir Hossen
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

ShareableVocabularyCard.displayName = 'ShareableVocabularyCard';

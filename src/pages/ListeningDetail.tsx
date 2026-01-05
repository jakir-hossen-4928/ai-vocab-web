import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback, memo } from "react";
import { listeningTests } from "@/data/listeningData";
import { listeningService } from "@/services/listeningService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Play, CheckCircle2, XCircle, RefreshCcw, Headphones, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// --- Sub-components for Optimization ---

interface QuestionInputProps {
    id: number;
    value: string;
    showResults: boolean;
    isCorrect?: boolean;
    answer: string;
    number: number;
    onChange: (id: number, val: string) => void;
}

const QuestionInput = memo(({ id, value, showResults, isCorrect, answer, number, onChange }: QuestionInputProps) => {
    return (
        <div className="inline-flex flex-col items-center mx-1 align-middle relative group/input">
            <div className="relative">
                <span className="absolute -top-3 -right-3 h-[18px] w-[18px] bg-background border border-border rounded-full text-[9px] font-black flex items-center justify-center text-muted-foreground shadow-sm z-10 group-focus-within/input:border-primary group-focus-within/input:text-primary transition-colors">
                    {number}
                </span>
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextIndex = number + 1;
                            const nextInput = document.querySelector(`input[data-question-index="${nextIndex}"]`) as HTMLInputElement;
                            if (nextInput) {
                                nextInput.focus();
                            }
                        }
                    }}
                    data-question-index={number}
                    className={`h-9 w-[180px] min-w-[140px] text-lg font-bold px-2 text-center transition-all duration-300
                        border-0 border-b-[3px] rounded-t-lg rounded-b-none
                        focus:ring-0 focus:ring-offset-0 
                        ${showResults
                            ? isCorrect
                                ? "border-green-500/50 text-green-700 bg-green-50/50 dark:bg-green-900/10 dark:text-green-400"
                                : "border-destructive/40 text-destructive bg-destructive/5 dark:text-red-400"
                            : "bg-muted/30 border-muted-foreground/20 focus:border-primary focus:bg-background focus:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
                        }`}
                    placeholder="_____"
                    disabled={showResults}
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>
            {showResults && !isCorrect && (
                <div className="mt-2 animate-in zoom-in-50 fade-in duration-300">
                    <div className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive text-xs font-bold px-3 py-1.5 rounded-md border border-destructive/20 relative z-20">
                        <span className="opacity-70 text-[10px] uppercase tracking-wider">Ans:</span>
                        <span>{answer}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

const AudioPlayer = memo(({ url }: { url: string }) => (
    <div className="space-y-4 p-5 rounded-2xl bg-background/80 border border-border/50 shadow-sm backdrop-blur-md">
        <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2"><Play className="h-3 w-3 fill-current" /> Audio Source</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Standard</span>
        </div>

        <div className="rounded-xl overflow-hidden bg-black/5 border border-black/5 shadow-inner relative group isolate aspect-[5/1]">
            <iframe
                src={url}
                className="absolute inset-0 w-full h-full border-0 mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100 transition-opacity"
                allow="autoplay"
                title="IELTS Audio"
                loading="lazy"
            ></iframe>
        </div>

        <div className="flex justify-end">
            <a
                href={url.replace('/preview', '/view')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/80 hover:text-primary transition-colors hover:underline"
            >
                Open in split window <BookOpen className="h-3 w-3" />
            </a>
        </div>
    </div>
));

// --- Main Component ---

const ListeningDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    // Fetch Data with React Query
    const { data: test, isLoading, isError } = useQuery({
        queryKey: ['ielts-test', id],
        queryFn: async () => {
            if (!id) throw new Error("No ID");
            const dbTest = await listeningService.getTestById(id);
            if (dbTest) return dbTest;
            const staticTest = listeningTests.find(t => t.id === id);
            if (staticTest) return staticTest;
            throw new Error("Not found");
        },
        staleTime: Infinity, // Tests are static mostly
    });

    const handleAnswerChange = useCallback((questionId: number, value: string) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const isCorrect = useCallback((questionId: number, userAnswer: string | undefined): boolean => {
        if (!test || !userAnswer) return false;
        // Optimization: Create a map of answers once? Or simpler: find question.
        // For render validation, finding is fine.
        const question = test.sections.flatMap(s => s.questions).find(q => q.id === questionId);
        if (!question) return false;

        const allowed = question.answer.split('/').map(a => a.trim().toLowerCase());
        return allowed.includes(userAnswer.trim().toLowerCase());
    }, [test]);

    const checkAnswers = () => {
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success("Test completed!");
    };

    const resetTest = () => {
        setUserAnswers({});
        setShowResults(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center p-8 bg-background">
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
                    <div className="w-full md:w-1/3 space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                    <div className="flex-1 space-y-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-40 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !test) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Test Not Found</h2>
                <Button onClick={() => navigate("/ielts-listing")}>Return to Listings</Button>
            </div>
        );
    }

    // Memoize score calculation
    const score = showResults ? Object.keys(userAnswers).filter(qid => isCorrect(Number(qid), userAnswers[Number(qid)])).length : 0;
    const totalQuestions = test.sections.reduce((acc, s) => acc + s.questions.length, 0);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-background animate-in fade-in duration-500">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card md:hidden sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/ielts-listing")} className="-ml-2">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="line-clamp-1">{test.title}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-hidden relative">
                {/* LEFT PANEL */}
                <div className="w-full md:w-[400px] lg:w-[450px] xl:w-[500px] flex-shrink-0 md:border-r border-border/50 flex flex-col h-auto md:h-full z-20 bg-card/50 backdrop-blur-xl overflow-y-auto custom-scrollbar">
                    <div className="p-6 md:p-8 space-y-8">
                        <div className="hidden md:flex items-center gap-4 mb-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate("/ielts-listing")} className="-ml-3 px-3 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full transition-all group">
                                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Listing
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <h1 className="font-black text-2xl md:text-3xl tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{test.title}</h1>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-primary" /> Listen carefully and answer the questions.
                            </p>
                        </div>

                        <AudioPlayer url={test.audioUrl} />

                        {showResults && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 p-5 rounded-2xl bg-muted/40 border border-border/50">
                                <h3 className="font-black text-xl flex items-center gap-2 mb-6"><CheckCircle2 className="h-5 w-5 text-green-500" /> Scoreboard</h3>
                                <div className="flex items-center justify-between mb-6 bg-background rounded-xl p-4 border border-border/50 shadow-sm">
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Score</div>
                                    <div className="text-3xl font-black text-foreground">
                                        <span className="text-primary">{score}</span>
                                        <span className="text-muted-foreground/40 text-lg">/{totalQuestions}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL - Questions */}
                <div className="flex-1 h-full overflow-y-auto bg-muted/20 relative scroll-smooth p-4 md:p-10 pb-40">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {test.sections.map((section, idx) => (
                            <div key={idx} className="space-y-6">
                                <div className="flex items-end justify-between border-b border-border/60 pb-4">
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">{section.title}</h2>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border px-2 py-1 rounded-md">Part {idx + 1}</span>
                                </div>
                                <div className="bg-card rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-border/40 p-8 md:p-12 relative overflow-hidden">
                                    <div className="font-medium text-muted-foreground mb-8 leading-relaxed bg-muted/30 p-4 rounded-lg border-l-4 border-primary/40">
                                        {section.instruction}
                                    </div>
                                    <div className="space-y-8">
                                        {section.questions.map((q) => (
                                            <div key={q.id} className="relative pl-2">
                                                <div className="flex flex-wrap items-baseline gap-x-3 text-lg leading-loose text-foreground/90">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mr-2 self-center shrink-0" />
                                                    {q.beforeInput && <span>{q.beforeInput}</span>}
                                                    <QuestionInput
                                                        id={q.id}
                                                        number={q.number}
                                                        value={userAnswers[q.id]}
                                                        onChange={handleAnswerChange}
                                                        showResults={showResults}
                                                        isCorrect={showResults ? isCorrect(q.id, userAnswers[q.id]) : undefined}
                                                        answer={q.answer}
                                                    />
                                                    {q.afterInput && <span>{q.afterInput}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Button */}
                <div className="fixed bottom-8 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    {!showResults ? (
                        <Button size="lg" onClick={checkAnswers} className="font-bold px-10 h-14 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-lg">Check Answers</Button>
                    ) : (
                        <Button size="lg" variant="default" onClick={resetTest} className="font-bold px-10 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2 shadow-2xl"><RefreshCcw className="h-5 w-5" /> Take Another Attempt</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListeningDetail;


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, Trash2, Heart, Loader2, Edit } from "lucide-react";
import { speakText } from "@/services/ttsService";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { confirmAction, showSuccessToast, showErrorToast } from "@/utils/sweetAlert";
import { motion } from "framer-motion";

import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/useSwipe";
import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SwipeHint = ({ onDismiss }: { onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onAnimationComplete={() => setTimeout(onDismiss, 2500)}
    className="fixed bottom-8 left-0 right-0 pointer-events-none z-50 flex justify-center pb-4"
  >
    <div className="bg-black/60 text-white px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-md shadow-lg">
      <ArrowLeft className="w-4 h-4 animate-pulse" />
      <span className="text-xs font-medium">Swipe to navigate</span>
      <ArrowRight className="w-4 h-4 animate-pulse" />
    </div>
  </motion.div>
);

export default function VocabularyDetail() {
  const { id } = useParams();
  const { data } = useVocabularies();
  const { deleteVocabulary } = useVocabularyMutations();

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite: toggleFav, isFavorite: checkIsFavorite } = useFavorites();

  const [vocab, setVocab] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Data is now a flat array from useVocabularies
  const vocabularies = data || [];

  // Check if current vocabulary is favorite
  const isFavorite = id ? checkIsFavorite(id) : false;

  const isMobile = useIsMobile();
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Hide hint after delay
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => setShowSwipeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleSwipeLeft = () => {
    const currentIndex = vocabularies.findIndex(v => v.id === id);
    if (currentIndex !== -1 && currentIndex < vocabularies.length - 1) {
      setSlideDirection('right');
      navigate(`/vocabularies/${vocabularies[currentIndex + 1].id}`);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = vocabularies.findIndex(v => v.id === id);
    if (currentIndex > 0) {
      setSlideDirection('left');
      navigate(`/vocabularies/${vocabularies[currentIndex - 1].id}`);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const containerProps = isMobile ? swipeHandlers : {};

  useEffect(() => {
    const loadVocabulary = async () => {
      if (!id) return;

      setLoading(true);

      // Try to find in cache first
      const cachedVocab = vocabularies.find(v => v.id === id);
      if (cachedVocab) {
        setVocab(cachedVocab);
        setLoading(false);
        return;
      }

      // Fallback to fetch if not in cache
      try {
        const docRef = doc(db, "vocabularies", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVocab({ id: docSnap.id, ...docSnap.data() } as Vocabulary);
        } else {
          showErrorToast("Vocabulary not found");
          navigate("/vocabularies");
        }
      } catch (error) {
        console.error("Error fetching vocabulary:", error);
        showErrorToast("Failed to load vocabulary");
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, [id, vocabularies, navigate]);

  const toggleFavorite = () => {
    if (!id) return;
    toggleFav(id);
    showSuccessToast(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleDelete = async () => {
    if (!id || !isAdmin) return;

    const isConfirmed = await confirmAction(
      'Are you sure?',
      "You won't be able to revert this!",
      'Yes, delete it!'
    );

    if (isConfirmed) {
      try {
        await deleteVocabulary.mutateAsync(id);
        showSuccessToast('Your vocabulary has been deleted.');
        navigate("/vocabularies");
      } catch (error) {
        // Error handling is done in mutation
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vocab) return null;

  return (
    <div className="min-h-screen bg-background pb-8 overflow-hidden" {...containerProps}>
      <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
        <motion.div
          key={id}
          custom={slideDirection}
          initial={{ x: slideDirection === 'right' ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideDirection === 'right' ? -300 : 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full"
        >
          <header
            className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
          >
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/vocabularies/edit/${id}`)}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold mb-2 break-words"
                  >
                    {vocab.bangla}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl mb-2 break-words"
                  >
                    {vocab.english}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                      {vocab.partOfSpeech}
                    </Badge>
                    <span className="text-sm text-primary-foreground/80">
                      {vocab.pronunciation}
                    </span>
                  </motion.div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => speakText(vocab.english)}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </header>

          <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4 relative z-10">
            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 shadow-hover">
                <h2 className="font-semibold text-foreground mb-2">Explanation</h2>
                <p className="text-muted-foreground">{vocab.explanation}</p>
              </Card>
            </motion.div>

            {/* Verb Forms */}
            {vocab.verbForms && vocab.partOfSpeech?.toLowerCase().includes("verb") && vocab.verbForms.base && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Card className="p-6 shadow-hover">
                  <h2 className="font-semibold text-foreground mb-3">Verb Forms</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Base", value: vocab.verbForms.base },
                      { label: "Past (V2)", value: vocab.verbForms.v2 },
                      { label: "Past Participle (V3)", value: vocab.verbForms.v3 },
                      { label: "Present Participle (-ing)", value: vocab.verbForms.ing },
                      { label: "Third Person (s/es)", value: vocab.verbForms.s_es },
                    ].map((form, idx) => (
                      <div key={idx} className="p-2 bg-muted/30 rounded-md border text-center relative group hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground block mb-1">{form.label}</span>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium text-sm break-all">{form.value}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-primary flex-shrink-0"
                            onClick={() => speakText(form.value)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Related Words */}
            {vocab.relatedWords && Array.isArray(vocab.relatedWords) && vocab.relatedWords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
              >
                <Card className="p-6 shadow-hover">
                  <h2 className="font-semibold text-foreground mb-3">Related Words</h2>
                  <div className="grid gap-3">
                    {vocab.relatedWords.map((word, index) => (
                      <Card key={index} className="p-3 bg-muted/30 border-l-4 border-l-primary/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2 sm:gap-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold break-all">{word.word}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-primary flex-shrink-0"
                              onClick={() => speakText(word.word)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 flex-shrink-0">
                              {word.partOfSpeech}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{word.meaning}</span>
                        </div>
                        {word.example && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            "{word.example}"
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Examples */}
            {vocab.examples && vocab.examples.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6 shadow-card">
                  <h2 className="font-semibold text-foreground mb-3">Examples</h2>
                  <div className="space-y-4">
                    {vocab.examples.map((example, idx) => (
                      <div key={idx} className="border-l-2 border-accent pl-4">
                        <p className="text-foreground mb-1">{example.bn}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-sm flex-1">
                            {example.en}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => speakText(example.en)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-4">
              {vocab.synonyms && vocab.synonyms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-4 shadow-card h-full">
                    <h3 className="font-semibold text-sm text-foreground mb-2">
                      Synonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {vocab.synonyms.map((syn, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1 pr-1.5 py-1"
                          onClick={() => speakText(syn)}
                        >
                          {syn}
                          <Volume2 className="h-3 w-3 opacity-50" />
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {vocab.antonyms && vocab.antonyms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-4 shadow-card h-full">
                    <h3 className="font-semibold text-sm text-foreground mb-2">
                      Antonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {vocab.antonyms.map((ant, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1 pr-1.5 py-1"
                          onClick={() => speakText(ant)}
                        >
                          {ant}
                          <Volume2 className="h-3 w-3 opacity-50" />
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {
        isMobile && showSwipeHint && (
          <AnimatePresence>
            <SwipeHint onDismiss={() => setShowSwipeHint(false)} />
          </AnimatePresence>
        )
      }
    </div >
  );
}

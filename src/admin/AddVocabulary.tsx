import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary, VocabularyExample } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, Trash2, Wand2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { generateVocabularyFromWord } from "@/services/openaiService";
import { useVocabularyMutations, useVocabularies } from "@/hooks/useVocabularies";
import { motion } from "framer-motion";
import PARTS_OF_SPEECH from "@/data/partOfSpeech.json";
import { checkVocabularyDuplicate } from "@/utils/vocabularyDuplicateChecker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AddVocabulary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addVocabulary, updateVocabulary } = useVocabularyMutations();
  const { data: existingVocabularies = [] } = useVocabularies();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    isDuplicate: boolean;
    duplicates: Vocabulary[];
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState<Partial<Vocabulary>>({
    bangla: "",
    english: "",
    partOfSpeech: "",
    pronunciation: "",
    explanation: "",
    synonyms: [],
    antonyms: [],
    examples: [],
    verbForms: { base: "", v2: "", v3: "", ing: "", s_es: "" },
    relatedWords: [],
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }

    if (id) {
      fetchVocabulary();
    }
  }, [user, isAdmin, id, navigate]);

  const fetchVocabulary = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const docRef = doc(db, "vocabularies", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const loadedData = docSnap.data() as Vocabulary;
        // Clear verbForms if not exactly "Verb" when loading existing data
        if (loadedData.partOfSpeech !== "Verb") {
          loadedData.verbForms = undefined;
        }
        setFormData(loadedData);
      } else {
        toast.error("Vocabulary not found");
        navigate("/vocabularies");
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast.error("Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.english) {
      toast.error("Please enter a word first");
      return;
    }

    try {
      setGenerating(true);
      // Pass bangla if available (e.g., during edits) to respect existing translation
      const details = await generateVocabularyFromWord(formData.english, formData.bangla);
      setFormData((prev) => {
        const newData = {
          ...prev,
          ...details,
          english: formData.english, // Keep original word input
        };
        // Only include verbForms if partOfSpeech is exactly "Verb"
        if (details.partOfSpeech !== "Verb") {
          delete newData.verbForms;
        }
        return newData;
      });
      toast.success("Details generated successfully");
    } catch (error) {
      console.error("Error generating details:", error);
      toast.error("Failed to generate details");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.english || !formData.bangla) {
      toast.error("Please fill in the required fields");
      return;
    }

    // Skip duplicate check if we're editing an existing vocabulary
    if (!id) {
      // Check for duplicates before adding
      const duplicateCheck = checkVocabularyDuplicate(
        {
          english: formData.english,
          partOfSpeech: formData.partOfSpeech
        },
        existingVocabularies
      );

      if (duplicateCheck.isDuplicate) {
        // Show duplicate warning dialog
        setDuplicateCheckResult(duplicateCheck);
        setShowDuplicateDialog(true);
        return;
      } else if (duplicateCheck.duplicates.length > 0) {
        // Same word but different part of speech - show info and proceed
        toast.info(duplicateCheck.message, { duration: 5000 });
      }
    }

    // Proceed with save
    await saveVocabulary();
  };

  const saveVocabulary = async () => {
    try {
      setLoading(true);

      // Only include verbForms if the word is exactly "Verb"
      const isVerb = formData.partOfSpeech === "Verb";
      const { verbForms, ...restFormData } = formData;

      const data: any = {
        ...restFormData,
        userId: user!.uid,
        updatedAt: new Date().toISOString(),
      };

      if (isVerb && verbForms) {
        data.verbForms = verbForms;
      }

      if (id) {
        await updateVocabulary.mutateAsync({ id, data });
        toast.success("Vocabulary updated successfully");
      } else {
        await addVocabulary.mutateAsync({
          ...data,
          createdAt: new Date().toISOString(),
        } as Omit<Vocabulary, "id">);
        toast.success("Vocabulary added successfully");
      }
      navigate("/vocabularies");
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      toast.error("Failed to save vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDuplicateAdd = async () => {
    setShowDuplicateDialog(false);
    await saveVocabulary();
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...(prev.examples || []), { bn: "", en: "" }],
    }));
  };

  const removeExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index),
    }));
  };

  const updateExample = (index: number, field: keyof VocabularyExample, value: string) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  // Helper to check if current POS is exactly "Verb"
  const isCurrentVerb = formData.partOfSpeech === "Verb";

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
      >
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold mb-1">
            {id ? "Edit Vocabulary" : "Add Vocabulary"}
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            {id ? "Update existing word details" : "Add a new word to the collection"}
          </p>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 md:p-6 shadow-hover">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Bangla First (Mobile-First) */}
              <div className="space-y-2">
                <Label htmlFor="bangla" className="text-base md:text-sm font-medium">
                  Bangla Meaning
                </Label>
                <Input
                  id="bangla"
                  value={formData.bangla}
                  onChange={(e) =>
                    setFormData({ ...formData, bangla: e.target.value })
                  }
                  placeholder="e.g. আকস্মিক প্রাপ্তি"
                  required
                  className="h-12 md:h-10 text-base md:text-sm"
                />
              </div>

              {/* English Word Input */}
              <div className="space-y-2">
                <Label htmlFor="english" className="text-base md:text-sm font-medium">
                  English Word
                </Label>
                <Input
                  id="english"
                  value={formData.english}
                  onChange={(e) =>
                    setFormData({ ...formData, english: e.target.value })
                  }
                  placeholder="e.g. Serendipity"
                  required
                  className="h-12 md:h-10 text-base md:text-sm"
                />
              </div>

              {/* ChatGPT Auto-fill Button - Full width on mobile, inline on desktop */}
              <div className="space-y-2 md:space-y-0 md:flex md:items-end md:gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={generating || !formData.english}
                  className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm"
                >
                  {generating ? (
                    <Loader2 className="h-5 w-5 md:h-4 md:w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                  )}
                  ChatGPT Auto-fill
                </Button>
                <p className="text-xs text-muted-foreground mt-2 md:hidden">
                  AI will generate part of speech, pronunciation, explanation, and examples
                </p>
              </div>

              {/* Part of Speech & Pronunciation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech" className="text-base md:text-sm font-medium">
                    Part of Speech
                  </Label>
                  <Select
                    value={formData.partOfSpeech}
                    onValueChange={(value) => {
                      const newData = { ...formData, partOfSpeech: value };
                      // Clear verbForms if switching away from "Verb"
                      if (value !== "Verb" && formData.verbForms) {
                        newData.verbForms = undefined;
                      }
                      setFormData(newData);
                    }}
                  >
                    <SelectTrigger className="h-12 md:h-10 text-base md:text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTS_OF_SPEECH.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pronunciation" className="text-base md:text-sm font-medium">
                    Pronunciation
                  </Label>
                  <Input
                    id="pronunciation"
                    value={formData.pronunciation}
                    onChange={(e) =>
                      setFormData({ ...formData, pronunciation: e.target.value })
                    }
                    placeholder="e.g. US: /ˌser.ənˈdɪp.ə.ti/ | Bangla: শেরেনডিপিটি"
                    className="h-12 md:h-10 text-base md:text-sm"
                  />
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-base md:text-sm font-medium">
                  Detailed Explanation
                </Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Explain the word usage and context..."
                  className="min-h-[100px] text-base md:text-sm"
                />
              </div>

              {/* Verb Forms - Responsive Grid */}
              {isCurrentVerb && (
                <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-lg bg-muted/30">
                  <Label className="text-base md:text-base font-semibold">Verb Forms</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="verbBase" className="text-sm md:text-xs text-muted-foreground">
                        Base Form
                      </Label>
                      <Input
                        id="verbBase"
                        value={formData.verbForms?.base || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verbForms: { ...formData.verbForms!, base: e.target.value }
                          })
                        }
                        placeholder="e.g. run"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verbV2" className="text-sm md:text-xs text-muted-foreground">
                        Past (V2)
                      </Label>
                      <Input
                        id="verbV2"
                        value={formData.verbForms?.v2 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verbForms: { ...formData.verbForms!, v2: e.target.value }
                          })
                        }
                        placeholder="e.g. ran"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verbV3" className="text-sm md:text-xs text-muted-foreground">
                        Past Participle (V3)
                      </Label>
                      <Input
                        id="verbV3"
                        value={formData.verbForms?.v3 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verbForms: { ...formData.verbForms!, v3: e.target.value }
                          })
                        }
                        placeholder="e.g. run"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verbIng" className="text-sm md:text-xs text-muted-foreground">
                        Present Participle (-ing)
                      </Label>
                      <Input
                        id="verbIng"
                        value={formData.verbForms?.ing || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verbForms: { ...formData.verbForms!, ing: e.target.value }
                          })
                        }
                        placeholder="e.g. running"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verbSEs" className="text-sm md:text-xs text-muted-foreground">
                        Third Person (s/es)
                      </Label>
                      <Input
                        id="verbSEs"
                        value={formData.verbForms?.s_es || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verbForms: { ...formData.verbForms!, s_es: e.target.value }
                          })
                        }
                        placeholder="e.g. runs"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="synonyms" className="text-base md:text-sm font-medium">
                    Synonyms (comma separated)
                  </Label>
                  <Input
                    id="synonyms"
                    value={formData.synonyms?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        synonyms: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="luck, chance, fortune"
                    className="h-12 md:h-10 text-base md:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="antonyms" className="text-base md:text-sm font-medium">
                    Antonyms (comma separated)
                  </Label>
                  <Input
                    id="antonyms"
                    value={formData.antonyms?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antonyms: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="misfortune, bad luck"
                    className="h-12 md:h-10 text-base md:text-sm"
                  />
                </div>
              </div>

              {/* Related Words - New section based on generated data */}
              {formData.relatedWords && formData.relatedWords.length > 0 && (
                <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-lg bg-muted/30">
                  <Label className="text-base md:text-sm font-medium">Related Words</Label>
                  <div className="space-y-2">
                    {formData.relatedWords.map((related, index) => (
                      <div key={index} className="flex flex-col space-y-1 p-2 bg-background rounded">
                        <div className="font-medium">{related.word} ({related.partOfSpeech})</div>
                        <div className="text-sm text-muted-foreground">Bangla: {related.meaning}</div>
                        <div className="text-sm italic">Example: {related.example}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples Section - Mobile Optimized */}
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base md:text-sm font-medium">Examples</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExample}
                    className="h-10 md:h-9"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Example
                  </Button>
                </div>
                {formData.examples?.map((example, index) => (
                  <div key={index} className="grid gap-3 md:gap-4 p-3 md:p-4 border rounded-lg bg-muted/30 relative group">
                    {/* Delete button - always visible on mobile, hover on desktop */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExample(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid gap-2">
                      <Label className="text-sm md:text-xs text-muted-foreground font-medium">
                        English Sentence
                      </Label>
                      <Input
                        value={example.en}
                        onChange={(e) => updateExample(index, "en", e.target.value)}
                        placeholder="Example sentence in English"
                        className="h-12 md:h-10 text-base md:text-sm pr-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm md:text-xs text-muted-foreground font-medium">
                        Bangla Translation
                      </Label>
                      <Input
                        value={example.bn}
                        onChange={(e) => updateExample(index, "bn", e.target.value)}
                        placeholder="Example sentence in Bangla"
                        className="h-12 md:h-10 text-base md:text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
              <div className="pt-4 flex flex-col md:flex-row justify-end gap-3 md:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vocabularies")}
                  className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm order-2 md:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm order-1 md:order-2"
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 md:h-4 md:w-4 animate-spin" />}
                  {id ? "Update Vocabulary" : "Add Vocabulary"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Duplicate Warning Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Duplicate Vocabulary Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{duplicateCheckResult?.message}</p>
              {duplicateCheckResult?.duplicates && duplicateCheckResult.duplicates.length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-semibold text-sm mb-2">Existing entries:</p>
                  {duplicateCheckResult.duplicates.map((dup, idx) => (
                    <div key={idx} className="text-sm space-y-1 mb-2 pb-2 border-b last:border-0">
                      <p><strong>English:</strong> {dup.english}</p>
                      <p><strong>Bangla:</strong> {dup.bangla}</p>
                      <p><strong>Part of Speech:</strong> {dup.partOfSpeech}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-3">
                Do you want to add this vocabulary anyway? This will create a duplicate entry.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicateAdd}>
              Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
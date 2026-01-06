import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, LogOut, Shield, Download, BookOpen, TrendingUp, Monitor, Layout, Mic, ExternalLink, Heart, Sparkles, Zap, Gift, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTTS } from "@/hooks/useTTS";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useViewPreference } from "@/hooks/useViewPreference";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { motion } from "framer-motion";
import { dexieService } from "@/lib/dexieDb";

export default function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [totalWords, setTotalWords] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { preference, savePreference } = useViewPreference();
  const { voices, selectedVoiceName, setVoice, testVoice, rate, setRate, pitch, setPitch } = useTTS();
  const { isInstallable, installApp } = useInstallPrompt();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const cachedVocabs = await dexieService.getAllVocabularies();
        setTotalWords(cachedVocabs.length);
        const favorites = await dexieService.getAllFavorites();
        setFavoritesCount(favorites.length);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground px-4 pt-12 pb-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="max-w-lg mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black mb-1 tracking-tight"
          >
            My Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 text-sm font-medium"
          >
            Manage your progress and preferences
          </motion.p>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-6 relative z-10">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-2xl border-0 bg-card/80 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            <div className="flex items-center gap-5 relative">
              {user?.photoURL ? (
                <div className="relative group/avatar">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-violet-500 rounded-full blur opacity-40 group-hover/avatar:opacity-100 transition duration-500" />
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover relative border-4 border-background shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-foreground truncate tracking-tight mb-1">
                  {user?.displayName || "Member"}
                </h2>
                <p className="text-sm text-muted-foreground font-medium truncate mb-3">{user?.email}</p>
                {isAdmin && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 border-0 text-white font-bold px-3 py-1 rounded-lg shadow-lg shadow-amber-500/20">
                    <Shield className="h-3.5 w-3.5 mr-1.5" />
                    Board Member
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-card to-primary/5 group hover:to-primary/10 transition-all duration-500">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Mastered</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">{totalWords}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-card to-amber-500/5 group hover:to-amber-500/10 transition-all duration-500">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <Heart className="h-6 w-6 text-amber-500 fill-amber-500/20" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Favorites</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">{favoritesCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* App Utilities - High Impact Reordering */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black flex items-center gap-2 tracking-tight">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
              Exclusive Utilities
            </h3>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-[10px] font-black px-2.5">PREMIUM HUB</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Print Button */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500 animate-gradient-xy" />
              <Button
                onClick={() => navigate("/print-vocabularies")}
                className="relative w-full h-24 bg-card hover:bg-card border-0 rounded-3xl flex items-center justify-between px-7 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center gap-6 z-10 relative">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
                    <div className="w-14 h-14 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl transform group-hover:rotate-[10deg] transition-transform duration-500">
                      <Printer className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex flex-col items-start transition-transform duration-500 group-hover:translate-x-1">
                    <span className="text-lg font-black text-foreground tracking-tight leading-none mb-1">Print Vocabulary</span>
                    <span className="text-xs text-muted-foreground font-bold opacity-60">Generate Stunning PDFs & Lists</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 z-10 shadow-inner">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
              </Button>
            </motion.div>

            {/* Surprise Button */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500 animate-gradient-xy" />
              <Button
                onClick={() => navigate("/meet-developer")}
                className="relative w-full h-24 bg-card hover:bg-card border-0 rounded-3xl flex items-center justify-between px-7 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center gap-6 z-10 relative">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-xl animate-pulse" />
                    <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl transform group-hover:-rotate-[10deg] transition-transform duration-500">
                      <Gift className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex flex-col items-start transition-transform duration-500 group-hover:translate-x-1">
                    <span className="text-lg font-black text-foreground tracking-tight leading-none mb-1">Developer Gift</span>
                    <span className="text-xs text-muted-foreground font-bold opacity-60">Claim Your Special Surprise 🎁❤️</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 z-10 shadow-inner">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="px-1">
            <h3 className="text-lg font-black tracking-tight">System Preferences</h3>
            <p className="text-xs text-muted-foreground font-medium">Customize your interface and voice engine</p>
          </div>

          <div className="space-y-4">
            {/* View Mode */}
            <Card className="p-6 border-0 shadow-xl bg-card/50 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Monitor className="h-12 w-12" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-foreground">Vocabulary View</h4>
                  <p className="text-[10px] text-muted-foreground font-bold">DESKTOP EXPERIENCE</p>
                </div>
              </div>

              <RadioGroup
                value={preference || "modal"}
                onValueChange={(val) => savePreference(val as "modal" | "page")}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative">
                  <RadioGroupItem value="modal" id="modal" className="peer sr-only" />
                  <Label
                    htmlFor="modal"
                    className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-muted bg-muted/20 hover:bg-accent/50 cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-lg"
                  >
                    <Monitor className="mb-2 h-6 w-6 opacity-60 group-peer-checked:opacity-100" />
                    <span className="font-black text-xs uppercase tracking-tighter">Modal View</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="page" id="page" className="peer sr-only" />
                  <Label
                    htmlFor="page"
                    className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-muted bg-muted/20 hover:bg-accent/50 cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-lg"
                  >
                    <Layout className="mb-2 h-6 w-6 opacity-60" />
                    <span className="font-black text-xs uppercase tracking-tighter">Page View</span>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {/* TTS Voice */}
            <Card className="p-6 border-0 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                <Mic className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="font-bold text-foreground">TTS Voice Engine</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global Language Synthesis</p>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="secondary" size="icon" onClick={() => testVoice()} className="rounded-xl h-10 w-10 shadow-md">
                    <Mic className="h-5 w-5 text-primary" />
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-6">
                <Select value={selectedVoiceName || "default"} onValueChange={(val) => val !== "default" && setVoice(val)}>
                  <SelectTrigger className="w-full rounded-2xl border-0 bg-muted/50 h-12 px-5 font-bold shadow-inner">
                    <SelectValue placeholder="System Default" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-2xl bg-card/95 backdrop-blur-2xl max-h-[300px]">
                    <SelectItem value="default" className="font-bold">System Default</SelectItem>
                    {voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name} className="px-4 py-3 border-b border-muted/30 last:border-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-sm">{voice.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-tighter">{voice.lang}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-black uppercase tracking-widest opacity-70">Speech Rate</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary font-black">{rate.toFixed(1)}x</Badge>
                    </div>
                    <Slider
                      value={[rate]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueChange={(val) => setRate(val[0])}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-black uppercase tracking-widest opacity-70">Voice Pitch</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary font-black">{pitch.toFixed(1)}</Badge>
                    </div>
                    <Slider
                      value={[pitch]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueChange={(val) => setPitch(val[0])}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Admin Dashboard Access */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="px-1">
              <h3 className="text-lg font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-700 bg-clip-text text-transparent inline-flex items-center gap-2 tracking-tight">
                <Shield className="h-5 w-5 text-amber-500" />
                Administrative Suite
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate("/admin/users")}
                variant="outline"
                className="w-full border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-600 rounded-2xl h-14 font-black shadow-lg shadow-amber-500/5 group"
              >
                <Users className="mr-2.5 h-4 w-4 group-hover:scale-110 transition-transform" />
                Staff Hub
              </Button>
              <Button
                onClick={() => navigate("/admin/duplicates")}
                variant="outline"
                className="w-full border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-600 rounded-2xl h-14 font-black shadow-lg shadow-amber-500/5 group"
              >
                <Shield className="mr-2.5 h-4 w-4 group-peer-hover:scale-110 transition-transform" />
                Inspector
              </Button>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={() => navigate("/admin/ai-enhancement-studio")}
                className="w-full rounded-2xl h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-500 border-0 flex items-center justify-center gap-3 font-black text-base group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-1000 -skew-x-12 -ml-20" />
                <Zap className="h-6 w-6 text-white fill-white animate-pulse" />
                <span>AI Enhancement Studio</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase">PRO</span>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Action Center */}
        <div className="pt-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full h-16 rounded-[2rem] bg-gray-500/5 hover:bg-amber-500/10 hover:text-amber-600 text-muted-foreground font-black text-lg shadow-sm border border-muted/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <LogOut className="mr-3 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              Sign Out of Terminal
            </Button>
          </motion.div>

          {isInstallable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={installApp}
                variant="secondary"
                className="w-full h-14 rounded-[2rem] font-black border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all shadow-xl hover:shadow-primary/10 group"
              >
                <Download className="mr-3 h-6 w-6 group-hover:bounce transition-transform" />
                Install Native Experience
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="text-center pt-8 pb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Precision Built for Language Mastery
          </p>
        </motion.div>
      </div>
    </div>
  );
}

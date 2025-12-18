import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getCountFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Shield, Download, BookOpen, TrendingUp, Monitor, Layout, Mic } from "lucide-react";
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
        // Get total vocabularies count from Dexie cache (faster)
        const cachedVocabs = await dexieService.getAllVocabularies();
        setTotalWords(cachedVocabs.length);

        // Get favorites count from Dexie
        const favorites = await dexieService.getAllFavorites();
        setFavoritesCount(favorites.length);

        console.log('[Dexie] Loaded profile stats:', {
          vocabularies: cachedVocabs.length,
          favorites: favorites.length
        });
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-primary-foreground/80 text-sm">
            Manage your account and settings
          </p>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-hover mb-4">
            <div className="flex items-start gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-foreground mb-1">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
                {isAdmin && (
                  <Badge variant="default" className="bg-accent">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card className="p-4 shadow-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Words</p>
                <p className="text-xl font-bold text-foreground">{totalWords}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Favorites</p>
                <p className="text-xl font-bold text-foreground">{favoritesCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold mb-3 px-1">Preferences</h3>
          <Card className="p-4 shadow-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Vocabulary View</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose how to view vocabulary details on desktop
                  </p>
                </div>
                <Layout className="h-5 w-5 text-muted-foreground" />
              </div>

              <RadioGroup
                value={preference || "modal"}
                onValueChange={(val) => savePreference(val as "modal" | "page")}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem value="modal" id="modal" className="peer sr-only" />
                  <Label
                    htmlFor="modal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Monitor className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Modal View</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="page" id="page" className="peer sr-only" />
                  <Label
                    htmlFor="page"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Layout className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Details Page</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </Card>
        </motion.div>

        {/* TTS Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-6"
        >
          <Card className="p-4 shadow-hover">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Text-to-Speech Voice</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose the voice used for pronunciation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => testVoice()}>
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={selectedVoiceName || "default"} onValueChange={(val) => val !== "default" && setVoice(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default System Voice</SelectItem>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <span className="truncate block max-w-[280px] md:max-w-md">
                        {voice.name} <span className="text-muted-foreground text-xs">({voice.lang})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rate & Pitch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Speed (Rate)</Label>
                    <span className="text-xs text-muted-foreground w-8 text-right">{rate.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[rate]}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    onValueChange={(val) => setRate(val[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Pitch</Label>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pitch.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[pitch]}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    onValueChange={(val) => setPitch(val[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>





        {/* Admin Actions */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-6"
          >
            <h3 className="text-lg font-semibold mb-3">Admin Tools</h3>
            <Button
              onClick={() => navigate("/admin/users")}
              variant="outline"
              className="w-full border-primary/20"
            >
              <User className="mr-2 h-4 w-4 text-primary" />
              Manage Users
            </Button>
            <Button
              onClick={() => navigate("/admin/duplicates")}
              variant="outline"
              className="w-full border-primary/20"
            >
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Duplicate Manager
            </Button>
          </motion.div>
        )}

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* PWA Install Button */}
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={installApp}
              variant="outline"
              className="w-full mt-4 border-primary/20"
            >
              <Download className="mr-2 h-4 w-4 text-primary" />
              Install App
            </Button>
          </motion.div>
        )}
      </div>

    </div >
  );
}

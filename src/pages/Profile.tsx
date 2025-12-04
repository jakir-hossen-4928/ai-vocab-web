import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getCountFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Shield, Download, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { motion } from "framer-motion";


import { dexieService } from "@/lib/dexieDb";

export default function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [totalWords, setTotalWords] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

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

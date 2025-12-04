import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./authentication/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Vocabularies from "./pages/Vocabularies";
import AddVocabulary from "./admin/AddVocabulary";
import BulkAddVocabulary from "./admin/BulkAddVocabulary";
import VocabularyDetail from "./pages/VocabularyDetail";
import ResourceDetail from "./pages/ResourceDetail";
import ResourcesGallery from "./pages/ResourcesGallery";
import AdminUsers from "./admin/AdminUsers";
import AdminTools from "./admin/AdminTools";
import Favorites from "./pages/Favorites";
import DuplicateManager from "./admin/DuplicateManager";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "@/routes/AdminRoute";

import { LoadingSpinner } from "@/components/LoadingSpinner";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};



import { Layout } from "@/layouts/Layout";
import { LandingLayout } from "@/layouts/LandingLayout";
import LandingPage from "./pages/LandingPage";
import WordChatPage from "./pages/WordChatPage";
import OnlineDictionary from "./pages/OnlineDictionary";
import AIActivity from "./openrouterAi/AIActivity";
import APIKeySetup from "./openrouterAi/APIKeySetup";
import Flashcards from "./pages/Flashcards";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Landing Page - No Sidebar/BottomNav (for non-authenticated users) */}
      <Route element={<LandingLayout />}>
        {/* Show LandingPage only if not authenticated */}
        <Route path="/" element={!loading && !user ? <LandingPage /> : <Navigate to="/home" replace />} />
        <Route path="/auth" element={<Auth />} />
      </Route>

      {/* App Pages - With Sidebar/BottomNav (for authenticated users) */}
      <Route element={<Layout />}>
        {/* Home dashboard with navigation bars */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/vocabularies" element={<ProtectedRoute><Vocabularies /></ProtectedRoute>} />
        <Route path="/vocabularies/add" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/bulk-add" element={<AdminRoute><BulkAddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/edit/:id" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/:id" element={<ProtectedRoute><VocabularyDetail /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ResourcesGallery /></ProtectedRoute>} />
        <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><WordChatPage /></ProtectedRoute>} />
        <Route path="/dictionary" element={<ProtectedRoute><OnlineDictionary /></ProtectedRoute>} />
        <Route path="/ai-activity" element={<ProtectedRoute><AIActivity /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/api-key-setup" element={<ProtectedRoute><APIKeySetup /></ProtectedRoute>} />

        {/* Redirects from old grammar routes to new resources routes */}
        <Route path="/grammar" element={<Navigate to="/resources" replace />} />
        <Route path="/grammar/:id" element={<Navigate to="/resources/:id" replace />} />

        {/* Redirect old admin routes to resources gallery */}
        <Route path="/admin/resources" element={<Navigate to="/resources" replace />} />
        <Route path="/admin/grammar" element={<Navigate to="/resources" replace />} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/tools" element={<AdminRoute><AdminTools /></AdminRoute>} />
        <Route path="/admin/duplicates" element={<AdminRoute><DuplicateManager /></AdminRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

import { NetworkStatus } from "@/components/NetworkStatus";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

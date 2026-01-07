import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

import { NetworkStatus } from "@/components/NetworkStatus";
import { lazy, Suspense, useEffect } from "react";
import Auth from "./authentication/Auth";
import { Layout } from "@/layouts/Layout";
import { LandingLayout } from "@/layouts/LandingLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { AdminRoute } from "@/routes/AdminRoute";
import { syncService } from "@/services/syncService";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Vocabularies = lazy(() => import("./pages/Vocabularies"));
const AddVocabulary = lazy(() => import("./admin/AddVocabulary"));
const BulkAddVocabulary = lazy(() => import("./admin/BulkAddVocabulary"));
const VocabularyDetail = lazy(() => import("./pages/VocabularyDetail"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const ResourcesGallery = lazy(() => import("./pages/ResourcesGallery"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AiEnhancementStudio = lazy(() => import("./admin/AiEnhancementStudio"));
const Favorites = lazy(() => import("./pages/Favorites"));
const DuplicateManager = lazy(() => import("./admin/DuplicateManager"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

const AdminResourceGallery = lazy(() => import("./admin/AdminResourceGallery"));
const AdminAddResource = lazy(() => import("./admin/AdminAddResource"));
const PrintVocabulary = lazy(() => import("./pages/PrintVocabulary"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OnlineDictionary = lazy(() => import("./pages/OnlineDictionary"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const DownloadPage = lazy(() => import("./pages/DownloadPage"));
const MeetDeveloper = lazy(() => import("./pages/MeetDeveloper"));
const ListeningList = lazy(() => import("./pages/ListeningList"));
const ListeningDetail = lazy(() => import("./pages/ListeningDetail"));
const ListeningBuilder = lazy(() => import("./admin/ListeningBuilder"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <Routes>
        {/* Auth routes */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Navigate to={!loading && user ? "/home" : "/auth"} replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/download" element={<DownloadPage />} />
        </Route>

        {/* App Pages - With Sidebar/BottomNav (for authenticated users) */}
        <Route element={<Layout />}>
          {/* Home dashboard with navigation bars */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* Publicly accessible pages but within Layout */}
          <Route path="/resources" element={<ResourcesGallery />} />
          <Route path="/resources/:slug" element={<ResourceDetail />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/vocabularies" element={<ProtectedRoute><Vocabularies /></ProtectedRoute>} />
          <Route path="/vocabularies/:id" element={<ProtectedRoute><VocabularyDetail /></ProtectedRoute>} />
          <Route path="/vocabularies/add" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
          <Route path="/vocabularies/bulk-add" element={<AdminRoute><BulkAddVocabulary /></AdminRoute>} />
          <Route path="/vocabularies/edit/:id" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
          <Route path="/dictionary" element={<ProtectedRoute><OnlineDictionary /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/meet-developer" element={<ProtectedRoute><MeetDeveloper /></ProtectedRoute>} />

          {/* Listening Routes (Protected) */}
          <Route path="/ielts-listing" element={<ProtectedRoute><ListeningList /></ProtectedRoute>} />
          <Route path="/ielts-listing/:id" element={<ProtectedRoute><ListeningDetail /></ProtectedRoute>} />

          {/* Redirects from old grammar routes to new resources routes */}
          <Route path="/grammar" element={<Navigate to="/resources" replace />} />
          <Route path="/grammar/:slug" element={<Navigate to="/resources/:slug" replace />} />

          {/* Redirect old admin routes to resources gallery */}
          <Route path="/admin/resources" element={<AdminRoute><AdminResourceGallery /></AdminRoute>} />
          <Route path="/admin/resources/add" element={<AdminRoute><AdminAddResource /></AdminRoute>} />
          <Route path="/admin/resources/edit/:id" element={<AdminRoute><AdminAddResource /></AdminRoute>} />
          <Route path="/admin/grammar" element={<Navigate to="/admin/resources" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/ai-enhancement-studio" element={<AdminRoute><AiEnhancementStudio /></AdminRoute>} />
          <Route path="/print-vocabularies" element={<ProtectedRoute><PrintVocabulary /></ProtectedRoute>} />
          <Route path="/admin/duplicates" element={<AdminRoute><DuplicateManager /></AdminRoute>} />

          <Route path="/admin/ielts-listening-builder" element={<AdminRoute><ListeningBuilder /></AdminRoute>} />

          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


import { ShareProvider } from "@/contexts/ShareContext";
import { GlobalShareProxy } from "@/components/GlobalShareProxy";
import { UTMProvider } from "@/contexts/UTMContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShareProvider>
          <GlobalShareProxy />
          <FavoritesProvider>
            <Toaster />
            <Sonner />
            <NetworkStatus />
            <BrowserRouter>
              <UTMProvider>
                <AuthProvider>
                  <AnalyticsProvider>
                    <AppContent />
                  </AnalyticsProvider>
                </AuthProvider>
              </UTMProvider>
            </BrowserRouter>
          </FavoritesProvider>
        </ShareProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

import { useScrollToTop } from "@/hooks/useScrollToTop";

// Separate component to use hooks that exist inside the providers (like Router)
const AppContent = () => {
  useScrollToTop();
  usePageTitle();

  useEffect(() => {
    // Start background synchronization
    syncService.startRealtimeSync();
    return () => syncService.stopSyncManager();
  }, []);

  return <AppRoutes />;
}

export default App;

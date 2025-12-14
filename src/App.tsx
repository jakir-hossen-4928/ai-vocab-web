import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";

import { NetworkStatus } from "@/components/NetworkStatus";
import { lazy, Suspense } from "react";
import Auth from "./authentication/Auth";
import { Layout } from "@/layouts/Layout";
import { LandingLayout } from "@/layouts/LandingLayout";
import LandingPage from "./pages/LandingPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { AdminRoute } from "@/routes/AdminRoute";

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
const AdminTools = lazy(() => import("./admin/AdminTools"));
const Favorites = lazy(() => import("./pages/Favorites"));
const DuplicateManager = lazy(() => import("./admin/DuplicateManager"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const BackendTest = lazy(() => import("./admin/BackendTest"));
const AdminResourceGallery = lazy(() => import("./admin/ResourceGallery"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WordChatPage = lazy(() => import("./pages/WordChatPage"));
const OnlineDictionary = lazy(() => import("./pages/OnlineDictionary"));
const AIActivity = lazy(() => import("./openrouterAi/AIActivity"));
const APIKeySetup = lazy(() => import("./openrouterAi/APIKeySetup"));
const Flashcards = lazy(() => import("./pages/Flashcards"));

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
          <Route path="/admin/resources" element={<AdminRoute><AdminResourceGallery /></AdminRoute>} />
          <Route path="/admin/grammar" element={<Navigate to="/admin/resources" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tools" element={<AdminRoute><AdminTools /></AdminRoute>} />
          <Route path="/admin/duplicates" element={<AdminRoute><DuplicateManager /></AdminRoute>} />
          <Route path="/admin/test" element={<AdminRoute><BackendTest /></AdminRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};



const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Separate component to use hooks that exist inside the providers (like Router)
const AppContent = () => {
  usePageTitle();
  return <AppRoutes />;
}


export default App;

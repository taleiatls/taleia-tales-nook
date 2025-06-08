
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NovelPage from "./pages/NovelPage";
import ChapterReader from "./pages/ChapterReader";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Load AdSense script
    const loadAdSenseScript = () => {
      if (typeof window !== 'undefined' && !document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7277063954373465';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        script.onload = () => {
          console.log('AdSense script loaded successfully');
        };
        
        script.onerror = () => {
          console.error('Failed to load AdSense script');
        };
      }
    };

    loadAdSenseScript();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/novel/:id" element={<NovelPage />} />
                  <Route path="/novel/:id/chapter/:chapterId" element={<ChapterReader />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;

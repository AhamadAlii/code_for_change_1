
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import BloodBank from "./pages/BloodBank";
import HealthNews from "./pages/HealthNews";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EmergencyButton from "./components/EmergencyButton";
import { useEffect } from "react";

// const queryClient = new QueryClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Register service worker for offline functionality
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js")
        .then((registration) => console.log("Service Worker registered", registration))
        .catch((error) => console.log("Service Worker registration failed", error));
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/blood-bank" element={<BloodBank />} />
                <Route path="/health-news" element={<HealthNews />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <EmergencyButton />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;

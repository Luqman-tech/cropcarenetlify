
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import updateManager from "@/lib/update-manager";
import deploymentConfig from "../deploy.config.js";
import Index from "./pages/Index";
import Camera from "./pages/Camera";
import Results from "./pages/Results";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import Community from "./pages/Community";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TestOnnx from "./pages/TestOnnx";
import CameraTest from "./pages/CameraTest";
import DeploymentStatus from "./pages/DeploymentStatus";
import ExpertDashboard from "./pages/ExpertDashboard";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize update manager and deployment config
    const initializeApp = async () => {
      try {
        // Log deployment info
        console.log('🚀 CropCare AI Starting...');
        console.log('Environment:', deploymentConfig.getEnvironmentName());
        console.log('Build Info:', deploymentConfig.getBuildInfo());
        
        // Request notification permission for updates
        if (deploymentConfig.isFeatureEnabled('updateChecks')) {
          await updateManager.requestNotificationPermission();
        }
        
        // Check for updates if enabled
        if (deploymentConfig.isFeatureEnabled('updateChecks')) {
          const updateStatus = await updateManager.checkForUpdates();
          if (updateStatus.hasUpdate) {
            console.log('📦 Update available:', updateStatus.latestVersion);
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/home" element={<Index />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/community" element={<Community />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/test-onnx" element={<TestOnnx />} />
            <Route path="/camera-test" element={<CameraTest />} />
            <Route path="/deployment-status" element={<DeploymentStatus />} />
            <Route path="/expert-dashboard" element={<ExpertDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

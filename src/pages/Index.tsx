
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, History, Leaf, Smartphone, Shield, CheckCircle, Download, BarChart2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUserRoleFromToken } from "@/lib/auth";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("onboarding_shown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboarding_shown", "true");
    }
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }
    // Check for expert role
    const token = localStorage.getItem("token");
    if (token) {
      setRole(getUserRoleFromToken(token));
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
          <div className="flex items-center justify-center space-x-2 w-full">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">CropCare AI</h1>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 w-full">
            <Link to="/camera">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 text-lg shadow">
                <Camera className="h-5 w-5" /> Start Detection
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg flex items-center gap-2 text-lg">
                <History className="h-5 w-5" /> Scan History
              </Button>
            </Link>
            {role === 'expert' && (
              <Link to="/expert-dashboard">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg flex items-center gap-2 text-lg">
                  <span role="img" aria-label="Expert">🧑‍🔬</span> Expert Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/90 rounded-xl shadow p-6 flex flex-col items-center">
          <Smartphone className="h-10 w-10 text-green-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Empowering Farmers with AI</h2>
          <p className="text-gray-700 text-center text-base mb-2">
            CropCare AI is a professional AI-powered platform for instant crop disease detection and management. Our mission is to support smallholder farmers and agricultural experts worldwide by providing accessible, accurate, and actionable insights—anytime, anywhere, even offline.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-800">Real-time Disease Detection</span>
              </div>
              <p className="text-gray-600 text-sm">Snap a photo of your crops and receive instant AI-powered diagnosis and treatment recommendations.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-800">Offline Capability</span>
              </div>
              <p className="text-gray-600 text-sm">Works seamlessly in remote areas—no internet required for disease detection or history access.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-800">Comprehensive Insights</span>
              </div>
              <p className="text-gray-600 text-sm">Access detailed disease information, treatment plans, prevention tips, and scan analytics.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-800">Community & Support</span>
              </div>
              <p className="text-gray-600 text-sm">Connect with experts and a global community of farmers for advice and knowledge sharing.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

// Type for the PWA install prompt event (not in standard TypeScript DOM lib)
type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
};

export default Index;

import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { OfflineModeProvider } from "./contexts/OfflineModeContext";
import { initializeAdSense } from "./lib/ads";
import {
  initializeMobileAds,
  isNativeMobile,
  showAppOpenAd,
} from "./lib/mobileAds";
import { Game } from "./pages/Game";
import { ModeSelection } from "./pages/ModeSelection";
import { StartupScreen } from "./pages/StartupScreen";

export type GameMode =
  | "timeAttack"
  | "endless"
  | "strategy"
  | "powerBoost"
  | "advancedStrategy";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appOpenAdShown, setAppOpenAdShown] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("blockverse-user");
    if (savedUser) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Initialize ads and show App Open ad ONCE at app startup
  useEffect(() => {
    if (!appOpenAdShown) {
      if (isNativeMobile()) {
        initializeMobileAds();
        // Show App Open ad with 24-hour frequency control
        showAppOpenAd();
      } else {
        initializeAdSense();
      }
      setAppOpenAdShown(true);
    }
  }, [appOpenAdShown]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("blockverse-user");
    setIsAuthenticated(false);
    setSelectedMode(null);
  };

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageProvider>
      <OfflineModeProvider>
        {!isAuthenticated ? (
          <StartupScreen onLogin={handleLogin} />
        ) : !selectedMode ? (
          <ModeSelection onModeSelect={handleModeSelect} />
        ) : (
          <Game
            onLogout={handleLogout}
            gameMode={selectedMode}
            onBackToModeSelection={handleBackToModeSelection}
          />
        )}
        <Toaster />
      </OfflineModeProvider>
    </LanguageProvider>
  );
}

export default App;

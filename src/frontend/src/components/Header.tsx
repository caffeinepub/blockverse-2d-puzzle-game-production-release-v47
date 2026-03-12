import { HomeButton } from "@/components/HomeButton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOfflineMode } from "@/contexts/OfflineModeContext";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import {
  BarChart2,
  Medal,
  Pause,
  RotateCcw,
  Target,
  User,
  WifiOff,
} from "lucide-react";

interface HeaderProps {
  onRestart: () => void;
  onOpenProfile: () => void;
  onOpenMissions?: () => void;
  onNavigateHome?: () => void;
  onPause?: () => void;
  onOpenStats?: () => void;
  onOpenAchievements?: () => void;
  theme: Theme;
  playerLevel: number;
  isPaused?: boolean;
}

export function Header({
  onRestart,
  onOpenProfile,
  onOpenMissions,
  onNavigateHome,
  onPause,
  onOpenStats,
  onOpenAchievements,
  theme,
  playerLevel: _playerLevel,
  isPaused: _isPaused,
}: HeaderProps) {
  const { t } = useLanguage();
  const { isOffline } = useOfflineMode();

  const getButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "dark":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "neon":
        return "bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50";
      default:
        return "bg-purple-600 hover:bg-purple-700 text-white";
    }
  };

  const getIconButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200";
      case "dark":
        return "bg-gray-700 hover:bg-gray-600 text-blue-300 border border-gray-600";
      case "neon":
        return "bg-pink-900/40 hover:bg-pink-800/60 text-pink-300 border border-pink-600/50";
      default:
        return "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200";
    }
  };

  const getOfflineBadgeClass = () => {
    switch (theme) {
      case "light":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "dark":
        return "bg-orange-900/50 text-orange-300 border-orange-700";
      case "neon":
        return "bg-orange-900/70 text-orange-300 border-orange-500 shadow-lg shadow-orange-500/30";
      default:
        return "bg-orange-100 text-orange-700 border-orange-300";
    }
  };

  const handleOpenProfile = () => {
    playSound("button");
    onOpenProfile();
  };

  const handleOpenMissions = () => {
    if (onOpenMissions) {
      playSound("button");
      onOpenMissions();
    }
  };

  return (
    <header className="w-full py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/assets/generated/blockverse-logo-transparent.dim_300x100.png"
            alt="BlockVerse Master"
            className="h-6 sm:h-8 md:h-10 w-auto"
          />
          {isOffline && (
            <div
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border ${getOfflineBadgeClass()} backdrop-blur-sm`}
            >
              <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-xs sm:text-sm font-semibold">
                {t("offline.mode")}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onNavigateHome && (
            <HomeButton onNavigateHome={onNavigateHome} theme={theme} />
          )}

          {/* Pause button */}
          {onPause && (
            <Button
              onClick={() => {
                playSound("button");
                onPause();
              }}
              size="sm"
              className={`w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg touch-manipulation ${getIconButtonClass()}`}
              data-ocid="game.toggle"
              title={t("pause.title")}
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}

          {/* Stats button */}
          {onOpenStats && (
            <Button
              onClick={() => {
                playSound("button");
                onOpenStats();
              }}
              size="sm"
              className={`w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg touch-manipulation ${getIconButtonClass()}`}
              data-ocid="stats.open_modal_button"
              title={t("stats.title")}
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}

          {/* Achievements button */}
          {onOpenAchievements && (
            <Button
              onClick={() => {
                playSound("button");
                onOpenAchievements();
              }}
              size="sm"
              className={`w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg touch-manipulation ${getIconButtonClass()}`}
              data-ocid="achievements.open_modal_button"
              title={t("achievements.title")}
            >
              <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}

          {onOpenMissions && (
            <Button
              onClick={handleOpenMissions}
              className={`${getButtonClass()} flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm touch-manipulation`}
              size="sm"
              data-ocid="missions.open_modal_button"
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t("missions.short")}</span>
            </Button>
          )}

          <Button
            onClick={handleOpenProfile}
            size="sm"
            className={`${getButtonClass()} w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg touch-manipulation`}
            data-ocid="profile.open_modal_button"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>

          <Button
            onClick={() => {
              playSound("button");
              onRestart();
            }}
            size="sm"
            className={`${getButtonClass()} w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg touch-manipulation`}
            data-ocid="game.primary_button"
            title={t("header.restart")}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

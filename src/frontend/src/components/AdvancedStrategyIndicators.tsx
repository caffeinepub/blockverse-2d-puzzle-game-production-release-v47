import { useLanguage } from "@/contexts/LanguageContext";
import type { PowerUp } from "@/lib/leaderboard";
import type { Theme } from "@/pages/Game";
import { AlertTriangle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface AdvancedStrategyIndicatorsProps {
  theme: Theme;
  showFallingBlockWarning: boolean;
  powerUpChainActive: boolean;
  chainedPowerUps: PowerUp["type"][];
}

export function AdvancedStrategyIndicators({
  theme,
  showFallingBlockWarning,
  powerUpChainActive,
  chainedPowerUps,
}: AdvancedStrategyIndicatorsProps) {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(3);

  // Countdown 3→2→1 when falling block warning is shown
  useEffect(() => {
    if (showFallingBlockWarning) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showFallingBlockWarning]);

  const getWarningClass = () => {
    switch (theme) {
      case "light":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "dark":
        return "bg-yellow-900/80 border-yellow-600 text-yellow-200";
      case "neon":
        return "bg-yellow-900/80 border-yellow-400 text-yellow-100 shadow-lg shadow-yellow-500/30";
      default:
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
    }
  };

  const getChainClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-100 border-purple-400 text-purple-800";
      case "dark":
        return "bg-purple-900/80 border-purple-600 text-purple-200";
      case "neon":
        return "bg-purple-900/80 border-pink-400 text-pink-100 shadow-lg shadow-pink-500/30";
      default:
        return "bg-purple-100 border-purple-400 text-purple-800";
    }
  };

  return (
    <div className="w-full flex flex-col gap-1 sm:gap-2">
      {showFallingBlockWarning && (
        <div
          className={`flex items-center justify-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg border-2 ${getWarningClass()} animate-pulse`}
        >
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-bold">
            {t("advancedStrategy.fallingBlockWarning")}
          </span>
          {/* Countdown indicator */}
          <span className="text-lg sm:text-xl font-black tabular-nums min-w-[1.5rem] text-center">
            {countdown}
          </span>
          <img
            src="/assets/generated/falling-block-warning-transparent.dim_64x64.png"
            alt="Warning"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </div>
      )}

      {powerUpChainActive && (
        <div
          className={`flex items-center justify-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg border-2 ${getChainClass()} animate-pulse`}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-bold">
            {t("advancedStrategy.powerUpChain")} ({chainedPowerUps.length}x)
          </span>
          {/* Chain lightning flicker dots */}
          <span className="flex items-center gap-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-current animate-ping"
              style={{ animationDuration: "0.6s" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-current animate-ping"
              style={{ animationDelay: "0.15s", animationDuration: "0.6s" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-current animate-ping"
              style={{ animationDelay: "0.3s", animationDuration: "0.6s" }}
            />
          </span>
          <img
            src="/assets/generated/power-up-chain-effect-transparent.dim_200x200.png"
            alt="Chain"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </div>
      )}
    </div>
  );
}

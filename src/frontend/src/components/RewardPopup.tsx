import { useLanguage } from "@/contexts/LanguageContext";
import { type PowerUp, getPowerUpImage } from "@/lib/leaderboard";
import type { Theme } from "@/pages/Game";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

interface RewardPopupProps {
  powerUpType: PowerUp["type"];
  theme: Theme;
  onDismiss: () => void;
}

export function RewardPopup({
  powerUpType,
  theme,
  onDismiss,
}: RewardPopupProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getCardClass = () => {
    switch (theme) {
      case "light":
        return "bg-white border-purple-300 shadow-purple-200";
      case "dark":
        return "bg-gray-800 border-cyan-500 shadow-cyan-500/30";
      case "neon":
        return "bg-black border-pink-500 shadow-pink-500/50";
      default:
        return "bg-white border-purple-300 shadow-purple-200";
    }
  };

  const getTitleClass = () => {
    switch (theme) {
      case "light":
        return "text-purple-700";
      case "dark":
        return "text-cyan-300";
      case "neon":
        return "text-pink-300";
      default:
        return "text-purple-700";
    }
  };

  const getBadgeClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-600 text-white";
      case "dark":
        return "bg-cyan-600 text-white";
      case "neon":
        return "bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.6)]";
      default:
        return "bg-purple-600 text-white";
    }
  };

  const getSparkleClass = () => {
    switch (theme) {
      case "light":
        return "text-yellow-500";
      case "dark":
        return "text-cyan-400";
      case "neon":
        return "text-pink-400";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
      <button
        type="button"
        className={`animate-in zoom-in-95 duration-300 rounded-2xl border-2 shadow-2xl p-6 flex flex-col items-center gap-3 min-w-[200px] pointer-events-auto cursor-pointer ${getCardClass()}`}
        data-ocid="reward-popup.dialog"
        onClick={onDismiss}
        aria-label="Reward earned — click to dismiss"
      >
        {/* Sparkles top */}
        <div className="flex gap-1 animate-pulse">
          <Sparkles className={`w-5 h-5 ${getSparkleClass()}`} />
          <Sparkles className={`w-4 h-4 ${getSparkleClass()} mt-1`} />
          <Sparkles className={`w-5 h-5 ${getSparkleClass()}`} />
        </div>

        {/* Power-up icon */}
        <div className="relative">
          <img
            src={getPowerUpImage(powerUpType)}
            alt={t(`powerups.${powerUpType}.name`)}
            className="w-16 h-16 animate-bounce"
          />
          {/* +1 badge */}
          <span
            className={`absolute -top-2 -right-2 text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center ${getBadgeClass()}`}
          >
            +1
          </span>
        </div>

        {/* Power-up name */}
        <p className={`text-lg font-bold text-center ${getTitleClass()}`}>
          {t(`powerups.${powerUpType}.name`)}
        </p>

        {/* Reward earned label */}
        <p className="text-sm opacity-70 text-center">
          {t("ads.rewardEarned")}
        </p>

        {/* Sparkles bottom */}
        <div className="flex gap-1 animate-pulse">
          <Sparkles className={`w-4 h-4 ${getSparkleClass()} mt-1`} />
          <Sparkles className={`w-5 h-5 ${getSparkleClass()}`} />
          <Sparkles className={`w-4 h-4 ${getSparkleClass()} mt-1`} />
        </div>
      </button>
    </div>
  );
}

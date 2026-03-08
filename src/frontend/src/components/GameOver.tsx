import { MobileRewardedAdButton } from "@/components/ads/MobileRewardedAdButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Theme } from "@/pages/Game";
import { RotateCcw, Trophy } from "lucide-react";

interface GameOverProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  theme: Theme;
  userCode?: string;
  isOffline?: boolean;
  onRewardEarned?: () => void;
}

export function GameOver({
  score,
  bestScore,
  onRestart,
  theme,
  userCode,
  isOffline,
  onRewardEarned,
}: GameOverProps) {
  const { t } = useLanguage();
  const isNewRecord = score === bestScore && score > 0;

  const getCardClass = () => {
    switch (theme) {
      case "light":
        return "bg-white";
      case "dark":
        return "bg-gray-800";
      case "neon":
        return "bg-black border-2 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)] sm:shadow-[0_0_50px_rgba(236,72,153,0.6)]";
      default:
        return "bg-white";
    }
  };

  const getTitleClass = () => {
    switch (theme) {
      case "light":
        return "text-gray-800";
      case "dark":
        return "text-gray-100";
      case "neon":
        return "text-pink-100";
      default:
        return "text-gray-800";
    }
  };

  const getScoreBoxClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-r from-purple-100 to-pink-100";
      case "dark":
        return "bg-gradient-to-r from-blue-900/50 to-cyan-900/50";
      case "neon":
        return "bg-gradient-to-r from-pink-900/50 to-purple-900/50 border border-pink-500/50";
      default:
        return "bg-gradient-to-r from-purple-100 to-pink-100";
    }
  };

  const getBestBoxClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-r from-yellow-100 to-orange-100";
      case "dark":
        return "bg-gradient-to-r from-cyan-900/50 to-blue-900/50";
      case "neon":
        return "bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50";
      default:
        return "bg-gradient-to-r from-yellow-100 to-orange-100";
    }
  };

  const getTextClass = () => {
    switch (theme) {
      case "light":
        return "text-gray-600";
      case "dark":
        return "text-gray-400";
      case "neon":
        return "text-pink-200";
      default:
        return "text-gray-600";
    }
  };

  const getScoreColorClass = () => {
    switch (theme) {
      case "light":
        return "text-purple-600";
      case "dark":
        return "text-cyan-400";
      case "neon":
        return "text-pink-400";
      default:
        return "text-purple-600";
    }
  };

  const getBestColorClass = () => {
    switch (theme) {
      case "light":
        return "text-orange-600";
      case "dark":
        return "text-blue-400";
      case "neon":
        return "text-purple-400";
      default:
        return "text-orange-600";
    }
  };

  const getButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600";
      case "dark":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600";
      case "neon":
        return "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] sm:shadow-[0_0_20px_rgba(236,72,153,0.6)]";
      default:
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600";
    }
  };

  const getTrophyClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-purple-500 to-pink-500";
      case "dark":
        return "bg-gradient-to-br from-blue-500 to-cyan-500";
      case "neon":
        return "bg-gradient-to-br from-pink-500 to-purple-500 shadow-[0_0_20px_rgba(236,72,153,0.6)] sm:shadow-[0_0_30px_rgba(236,72,153,0.8)]";
      default:
        return "bg-gradient-to-br from-purple-500 to-pink-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <Card
        className={`rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-[90vw] sm:max-w-md w-full text-center animate-in zoom-in-95 duration-300 transition-all ${getCardClass()}`}
      >
        <div className="mb-4 sm:mb-6">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 ${getTrophyClass()}`}
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${getTitleClass()}`}
          >
            {t("gameover.title")}
          </h2>
          {isNewRecord && (
            <p className="text-base sm:text-lg font-semibold text-yellow-600 animate-pulse">
              {t("gameover.newrecord")}
            </p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div
            className={`rounded-lg p-3 sm:p-4 transition-all duration-300 ${getScoreBoxClass()}`}
          >
            <p className={`text-xs sm:text-sm mb-1 ${getTextClass()}`}>
              {t("gameover.yourscore")}
            </p>
            <p
              className={`text-3xl sm:text-4xl font-bold ${getScoreColorClass()}`}
            >
              {score}
            </p>
          </div>

          <div
            className={`rounded-lg p-3 sm:p-4 transition-all duration-300 ${getBestBoxClass()}`}
          >
            <p className={`text-xs sm:text-sm mb-1 ${getTextClass()}`}>
              {t("gameover.bestscore")}
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${getBestColorClass()}`}
            >
              {bestScore}
            </p>
          </div>
        </div>

        {userCode && !isOffline && (
          <div className="mb-3">
            <MobileRewardedAdButton
              theme={theme}
              userCode={userCode}
              onRewardEarned={onRewardEarned}
            />
          </div>
        )}

        <Button
          onClick={onRestart}
          size="lg"
          className={`w-full text-white font-bold text-base sm:text-lg shadow-lg transition-all duration-300 touch-manipulation ${getButtonClass()}`}
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t("gameover.playagain")}
        </Button>
      </Card>
    </div>
  );
}

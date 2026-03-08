import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Theme } from "@/pages/Game";
import { Star, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  score: number;
  bestScore: number;
  comboLines?: number;
  theme: Theme;
  userCode: string;
}

export function ScoreDisplay({
  score,
  bestScore,
  comboLines = 0,
  theme,
}: ScoreDisplayProps) {
  const { t } = useLanguage();
  const [showCombo, setShowCombo] = useState(false);

  useEffect(() => {
    if (comboLines > 1) {
      setShowCombo(true);
      const timer = setTimeout(() => {
        setShowCombo(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [comboLines]);

  const getCardClass = () => {
    switch (theme) {
      case "light":
        return "bg-white/95 backdrop-blur-sm shadow-lg sm:shadow-xl";
      case "dark":
        return "bg-gray-800/95 backdrop-blur-sm shadow-lg sm:shadow-xl";
      case "neon":
        return "bg-black/80 backdrop-blur-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] sm:shadow-[0_0_30px_rgba(236,72,153,0.4)]";
      default:
        return "bg-white/95 backdrop-blur-sm shadow-lg sm:shadow-xl";
    }
  };

  const getScoreBorderClass = () => {
    switch (theme) {
      case "light":
        return "border sm:border-2 border-yellow-400";
      case "dark":
        return "border sm:border-2 border-cyan-400";
      case "neon":
        return "border sm:border-2 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)] sm:shadow-[0_0_15px_rgba(236,72,153,0.6)]";
      default:
        return "border sm:border-2 border-yellow-400";
    }
  };

  const getBestBorderClass = () => {
    switch (theme) {
      case "light":
        return "border sm:border-2 border-purple-400";
      case "dark":
        return "border sm:border-2 border-blue-400";
      case "neon":
        return "border sm:border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] sm:shadow-[0_0_15px_rgba(168,85,247,0.6)]";
      default:
        return "border sm:border-2 border-purple-400";
    }
  };

  const getTextClass = () => {
    switch (theme) {
      case "light":
        return "text-gray-700";
      case "dark":
        return "text-gray-300";
      case "neon":
        return "text-pink-100";
      default:
        return "text-gray-700";
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

  const getComboClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-r from-orange-500 to-pink-500 border sm:border-2 border-yellow-400";
      case "dark":
        return "bg-gradient-to-r from-blue-600 to-cyan-600 border sm:border-2 border-cyan-400";
      case "neon":
        return "bg-gradient-to-r from-pink-600 to-purple-600 border sm:border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.6)] sm:shadow-[0_0_30px_rgba(236,72,153,0.8)]";
      default:
        return "bg-gradient-to-r from-orange-500 to-pink-500 border sm:border-2 border-yellow-400";
    }
  };

  return (
    <div className="relative w-full">
      {/* Enforced horizontal layout - always side by side, no wrapping */}
      <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
        <Card
          className={`flex-1 min-w-0 transition-all duration-300 ${getCardClass()} ${getScoreBorderClass()}`}
        >
          <div className="p-1.5 sm:p-3 md:p-4 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-2 min-w-0 flex-shrink">
              <Star
                className={`flex-shrink-0 w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current ${theme === "neon" ? "text-pink-400" : "text-yellow-500"}`}
              />
              <span
                className={`text-[9px] xs:text-[10px] sm:text-sm font-semibold ${getTextClass()} whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                {t("score.current")}
              </span>
            </div>
            <span
              className={`flex-shrink-0 text-xs xs:text-sm sm:text-lg md:text-xl font-bold ${getScoreColorClass()}`}
            >
              {score}
            </span>
          </div>
        </Card>

        <Card
          className={`flex-1 min-w-0 transition-all duration-300 ${getCardClass()} ${getBestBorderClass()}`}
        >
          <div className="p-1.5 sm:p-3 md:p-4 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-2 min-w-0 flex-shrink">
              <Trophy
                className={`flex-shrink-0 w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current ${theme === "neon" ? "text-purple-400" : theme === "dark" ? "text-blue-400" : "text-purple-500"}`}
              />
              <span
                className={`text-[9px] xs:text-[10px] sm:text-sm font-semibold ${getTextClass()} whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                {t("score.best")}
              </span>
            </div>
            <span
              className={`flex-shrink-0 text-xs xs:text-sm sm:text-lg md:text-xl font-bold ${getScoreColorClass()}`}
            >
              {bestScore}
            </span>
          </div>
        </Card>
      </div>

      {showCombo && (
        <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <Card
            className={`transition-all duration-300 ${getComboClass()} shadow-xl sm:shadow-2xl`}
          >
            <div className="px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-1 sm:gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white fill-white" />
              <span className="text-sm sm:text-base md:text-lg font-bold text-white whitespace-nowrap">
                {t("score.combo").replace("{count}", comboLines.toString())}
              </span>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white fill-white" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Theme } from "@/pages/Game";
import { Sparkles, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface LevelTransitionProps {
  newLevel: number;
  theme: Theme;
  onComplete: () => void;
}

export function LevelTransition({
  newLevel,
  theme,
  onComplete,
}: LevelTransitionProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getOverlayClass = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-purple-500/95 via-pink-500/95 to-orange-500/95";
      case "dark":
        return "bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-pink-900/95";
      case "neon":
        return "bg-gradient-to-br from-pink-600/95 via-purple-600/95 to-cyan-600/95";
      default:
        return "bg-gradient-to-br from-purple-500/95 via-pink-500/95 to-orange-500/95";
    }
  };

  const getTextClass = () => {
    return "text-white";
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"} ${getOverlayClass()}`}
    >
      <div className="relative">
        {/* Celebration image */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 animate-bounce">
          <img
            src="/assets/generated/level-up-celebration-transparent.dim_400x400.png"
            alt="Level Up"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-2xl"
          />
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-4 border-white/30 shadow-2xl animate-in zoom-in-95">
          <div className="p-8 sm:p-12 md:p-16 flex flex-col items-center gap-6">
            {/* Sparkles */}
            <div className="flex gap-4 animate-pulse">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 fill-yellow-300" />
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300 fill-yellow-300" />
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 fill-yellow-300" />
            </div>

            {/* Level Up Text */}
            <div className="text-center space-y-2">
              <h2
                className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getTextClass()} drop-shadow-lg`}
              >
                {t("level.levelUp")}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 fill-yellow-300" />
                <p
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextClass()}`}
                >
                  {t("level.reached").replace("{level}", newLevel.toString())}
                </p>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 fill-yellow-300" />
              </div>
            </div>

            {/* Rewards message */}
            <p
              className={`text-lg sm:text-xl ${getTextClass()} text-center max-w-md`}
            >
              {t("level.newFeatures")}
            </p>

            {/* Animated stars */}
            <div className="flex gap-2 animate-bounce">
              {[...Array(5)].map((_, i) => {
                const starKey = `star-${i}`;
                return (
                  <Star
                    key={starKey}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-yellow-300"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Flame, Gift, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface DailyRewardModalProps {
  theme: Theme;
  onClaim: (reward: DailyReward) => void;
}

export interface DailyReward {
  type: "points" | "powerup" | "combo";
  points?: number;
  powerUpType?: "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks";
  powerUpCount?: number;
  streak: number;
  multiplier: number;
}

export function DailyRewardModal({ theme, onClaim }: DailyRewardModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState<DailyReward | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    checkDailyReward();
  }, []);

  const checkDailyReward = () => {
    const lastClaimStr = localStorage.getItem("blockverse-last-daily-reward");
    const streakStr = localStorage.getItem("blockverse-daily-streak");

    const now = Date.now();
    const lastClaim = lastClaimStr ? Number.parseInt(lastClaimStr, 10) : 0;
    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

    // Check if 24 hours have passed
    if (hoursSinceLastClaim >= 24 || lastClaim === 0) {
      let currentStreak = streakStr ? Number.parseInt(streakStr, 10) : 0;

      // Reset streak if more than 48 hours have passed
      if (hoursSinceLastClaim > 48 && lastClaim !== 0) {
        currentStreak = 0;
      }

      // Increment streak
      currentStreak += 1;

      // Calculate multiplier based on streak
      let multiplier = 1.0;
      if (currentStreak >= 7) {
        multiplier = 2.5;
      } else if (currentStreak >= 5) {
        multiplier = 2.0;
      } else if (currentStreak >= 3) {
        multiplier = 1.5;
      }

      // Generate random reward
      const rewardType = Math.random();
      let generatedReward: DailyReward;

      if (rewardType < 0.4) {
        // Points reward
        const basePoints = Math.floor(Math.random() * 400) + 100; // 100-500
        generatedReward = {
          type: "points",
          points: Math.floor(basePoints * multiplier),
          streak: currentStreak,
          multiplier,
        };
      } else if (rewardType < 0.8) {
        // Power-up reward
        const powerUpTypes: Array<
          "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks"
        > = ["blockBreak", "columnBreak", "rowBreak", "shuffleBlocks"];
        const randomPowerUp =
          powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const baseCount = Math.floor(Math.random() * 2) + 1; // 1-2

        generatedReward = {
          type: "powerup",
          powerUpType: randomPowerUp,
          powerUpCount: Math.floor(baseCount * multiplier),
          streak: currentStreak,
          multiplier,
        };
      } else {
        // Combo reward (points + power-up)
        const basePoints = Math.floor(Math.random() * 200) + 100; // 100-300
        const powerUpTypes: Array<
          "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks"
        > = ["blockBreak", "columnBreak", "rowBreak", "shuffleBlocks"];
        const randomPowerUp =
          powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        generatedReward = {
          type: "combo",
          points: Math.floor(basePoints * multiplier),
          powerUpType: randomPowerUp,
          powerUpCount: 1,
          streak: currentStreak,
          multiplier,
        };
      }

      setReward(generatedReward);
      setIsOpen(true);
      playSound("powerUp");
    }
  };

  const handleClaim = () => {
    if (!reward) return;

    // Save claim timestamp and streak
    localStorage.setItem("blockverse-last-daily-reward", Date.now().toString());
    localStorage.setItem("blockverse-daily-streak", reward.streak.toString());

    // Show particles
    setShowParticles(true);
    playSound("rankUp");

    setTimeout(() => {
      onClaim(reward);
      setIsOpen(false);
      setShowParticles(false);
    }, 1500);
  };

  const getRewardDescription = () => {
    if (!reward) return "";

    if (reward.type === "points") {
      return t("dailyReward.pointsReward").replace(
        "{points}",
        reward.points?.toString() || "0",
      );
    }
    if (reward.type === "powerup") {
      const powerUpName = t(`powerups.${reward.powerUpType}.name`);
      return t("dailyReward.powerUpReward")
        .replace("{count}", reward.powerUpCount?.toString() || "1")
        .replace("{name}", powerUpName);
    }
    const powerUpName = t(`powerups.${reward.powerUpType}.name`);
    return t("dailyReward.comboReward")
      .replace("{points}", reward.points?.toString() || "0")
      .replace("{count}", reward.powerUpCount?.toString() || "1")
      .replace("{name}", powerUpName);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200";
      case "dark":
        return "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700";
      case "neon":
        return "bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-pink-500";
      default:
        return "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200";
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`max-w-md ${getThemeClasses()} border-4`}>
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Gift className="w-8 h-8 text-yellow-500" />
            {t("dailyReward.title")}
            <Gift className="w-8 h-8 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-base sm:text-lg pt-2">
            {t("dailyReward.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Streak indicator */}
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-semibold">
              {t("dailyReward.streak").replace(
                "{days}",
                reward.streak.toString(),
              )}
            </span>
            {reward.multiplier > 1 && (
              <span className="text-sm font-bold text-green-500">
                ({reward.multiplier}x {t("dailyReward.multiplier")})
              </span>
            )}
          </div>

          {/* Reward display */}
          <div className="relative">
            <div
              className={`p-6 rounded-lg border-2 ${
                theme === "light"
                  ? "bg-white border-purple-300"
                  : theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-black/50 border-pink-400"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/assets/generated/daily-reward-chest-transparent.dim_128x128.png"
                  alt="Daily Reward"
                  className="w-24 h-24 animate-bounce"
                />
                <p className="text-center text-lg font-semibold">
                  {getRewardDescription()}
                </p>
              </div>
            </div>

            {/* Particles */}
            {showParticles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => {
                  const sparkleKey = `sparkle-${i}`;
                  return (
                    <Sparkles
                      key={sparkleKey}
                      className="absolute w-6 h-6 text-yellow-400 animate-ping"
                      style={{
                        left: `${(i * 8 + 5) % 95}%`,
                        top: `${(i * 7 + 10) % 85}%`,
                        animationDelay: `${(i * 0.1) % 0.5}s`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Claim button */}
          <Button
            onClick={handleClaim}
            disabled={showParticles}
            className="w-full text-lg py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {showParticles ? t("dailyReward.claiming") : t("dailyReward.claim")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

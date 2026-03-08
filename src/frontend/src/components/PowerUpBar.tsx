import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOfflineMode } from "@/contexts/OfflineModeContext";
import {
  type PowerUp,
  addPowerUp,
  consumePowerUp,
  getPowerUpImage,
  getPowerUps,
} from "@/lib/leaderboard";
import {
  getRandomPowerUpType,
  isNativeMobile,
  showRewardedAd,
} from "@/lib/mobileAds";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { useState } from "react";

interface PowerUpBarProps {
  theme: Theme;
  userCode: string;
  onUsePowerUp: (type: PowerUp["type"]) => void;
  activePowerUp: PowerUp["type"] | null;
}

export function PowerUpBar({
  theme,
  userCode,
  onUsePowerUp,
  activePowerUp,
}: PowerUpBarProps) {
  const { t } = useLanguage();
  const { isOffline } = useOfflineMode();
  const [powerUps, setPowerUps] = useState<PowerUp[]>(getPowerUps(userCode));
  const [showRefillDialog, setShowRefillDialog] = useState(false);
  const [refillType, setRefillType] = useState<PowerUp["type"] | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const handleUsePowerUp = (type: PowerUp["type"]) => {
    const success = consumePowerUp(userCode, type);
    if (success) {
      setPowerUps(getPowerUps(userCode));
      onUsePowerUp(type);
    }
  };

  const handleRefillClick = (type: PowerUp["type"]) => {
    if (isOffline) {
      // Don't show ad dialog in offline mode
      return;
    }
    setRefillType(type);
    setShowRefillDialog(true);
  };

  const handleWatchAd = () => {
    if (isOffline || !refillType) return;

    setIsWatchingAd(true);
    playSound("button");

    // Show rewarded ad with callbacks
    showRewardedAd(
      () => {
        // onRewarded callback
        const randomType = getRandomPowerUpType();
        addPowerUp(userCode, randomType, 1);
        setPowerUps(getPowerUps(userCode));
        playSound("powerUp");
      },
      () => {
        // onClosed callback
        setIsWatchingAd(false);
        setShowRefillDialog(false);
        setRefillType(null);
      },
    );
  };

  const getButtonClass = (isActive: boolean, count: number) => {
    const baseClass =
      "relative flex flex-col items-center justify-center gap-0.5 p-1 xs:p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 touch-manipulation flex-shrink-0";

    if (count === 0) {
      return `${baseClass} ${
        theme === "light"
          ? "bg-gray-200 text-gray-400"
          : theme === "dark"
            ? "bg-gray-800 text-gray-600"
            : "bg-gray-900 text-gray-700"
      } cursor-pointer opacity-60 hover:opacity-80`;
    }

    if (isActive) {
      return `${baseClass} ${
        theme === "light"
          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
          : theme === "dark"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
            : "bg-pink-600 text-white shadow-lg shadow-pink-500/50"
      } scale-105`;
    }

    return `${baseClass} ${
      theme === "light"
        ? "bg-white/90 text-purple-700 hover:bg-purple-100"
        : theme === "dark"
          ? "bg-gray-800/90 text-cyan-400 hover:bg-gray-700"
          : "bg-black/70 text-pink-400 hover:bg-pink-900/50"
    } hover:scale-105`;
  };

  const getCountBadgeClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-600 text-white";
      case "dark":
        return "bg-blue-600 text-white";
      case "neon":
        return "bg-pink-600 text-white shadow-lg shadow-pink-500/50";
      default:
        return "bg-purple-600 text-white";
    }
  };

  const getDialogClass = () => {
    switch (theme) {
      case "light":
        return "bg-white text-gray-900";
      case "dark":
        return "bg-gray-900 text-white border-gray-700";
      case "neon":
        return "bg-black text-white border-pink-500";
      default:
        return "bg-white text-gray-900";
    }
  };

  const powerUpTypes: Array<{ type: PowerUp["type"]; shortKey: string }> = [
    { type: "blockBreak", shortKey: "blockBreak" },
    { type: "columnBreak", shortKey: "columnBreak" },
    { type: "rowBreak", shortKey: "rowBreak" },
    { type: "shuffleBlocks", shortKey: "shuffleBlocks" },
  ];

  return (
    <>
      {/* Fixed horizontal layout - no wrapping, always in one row */}
      <div className="flex flex-row items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 w-full overflow-x-auto scrollbar-hide">
        <TooltipProvider>
          {powerUpTypes.map(({ type, shortKey }) => {
            const powerUp = powerUps.find((p) => p.type === type);
            const count = powerUp?.count || 0;
            const isActive = activePowerUp === type;

            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (count > 0) {
                        playSound("button");
                        handleUsePowerUp(type);
                      } else {
                        handleRefillClick(type);
                      }
                    }}
                    className={getButtonClass(isActive, count)}
                    disabled={isActive}
                  >
                    <img
                      src={getPowerUpImage(type)}
                      alt={t(`powerups.${shortKey}.name`)}
                      className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                    />
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-semibold leading-tight whitespace-nowrap">
                      {t(`powerups.${shortKey}.shortName`)}
                    </span>
                    <div
                      className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 ${getCountBadgeClass()} rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] xs:text-[9px] sm:text-[10px] font-bold`}
                    >
                      {count}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">
                    {t(`powerups.${shortKey}.name`)}
                  </p>
                  <p className="text-sm">
                    {t(`powerups.${shortKey}.description`)}
                  </p>
                  {count === 0 && !isOffline && (
                    <p className="text-xs mt-1 text-orange-400">
                      {t("powerups.clickToRefill")}
                    </p>
                  )}
                  {count === 0 && isOffline && (
                    <p className="text-xs mt-1 text-orange-400">
                      {t("offline.adsDisabled")}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <Dialog open={showRefillDialog} onOpenChange={setShowRefillDialog}>
        <DialogContent className={getDialogClass()}>
          <DialogHeader>
            <DialogTitle>{t("ads.watchForReward")}</DialogTitle>
            <DialogDescription
              className={
                theme === "dark"
                  ? "text-gray-400"
                  : theme === "neon"
                    ? "text-pink-300"
                    : ""
              }
            >
              {refillType &&
                `${t("ads.refillDescription").replace("{name}", t(`powerups.${refillType}.name`))}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={handleWatchAd}
              disabled={isWatchingAd}
              className={`w-full ${
                theme === "light"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-pink-600 hover:bg-pink-700"
              } text-white`}
            >
              {isWatchingAd ? t("ads.watchingAd") : t("powerups.watchAd")}
            </Button>
            <p className="text-sm text-center opacity-70">
              {t("ads.orEarnFromLeaderboard")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

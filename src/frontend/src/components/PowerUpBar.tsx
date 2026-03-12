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
import { useEffect, useState } from "react";

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
  const [scalingButton, setScalingButton] = useState<PowerUp["type"] | null>(
    null,
  );

  // Reset scale animation after 300ms
  useEffect(() => {
    if (scalingButton) {
      const timer = setTimeout(() => setScalingButton(null), 300);
      return () => clearTimeout(timer);
    }
  }, [scalingButton]);

  // Listen to storage events to sync powerup counts
  useEffect(() => {
    const handleStorage = () => setPowerUps(getPowerUps(userCode));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userCode]);

  const handleUsePowerUp = (type: PowerUp["type"]) => {
    const success = consumePowerUp(userCode, type);
    if (success) {
      setPowerUps(getPowerUps(userCode));
      setScalingButton(type);
      onUsePowerUp(type);
    }
  };

  const handleRefillClick = (type: PowerUp["type"]) => {
    if (isOffline) {
      return;
    }
    setRefillType(type);
    setShowRefillDialog(true);
  };

  const handleWatchAd = () => {
    if (isOffline || !refillType) return;

    setIsWatchingAd(true);
    playSound("button");

    showRewardedAd(
      () => {
        const randomType = getRandomPowerUpType();
        addPowerUp(userCode, randomType, 1);
        setPowerUps(getPowerUps(userCode));
        playSound("powerUp");
      },
      () => {
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
      return `${baseClass} opacity-40 cursor-pointer`;
    }

    if (isActive) {
      switch (theme) {
        case "light":
          return `${baseClass} bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-1 animate-pulse`;
        case "dark":
          return `${baseClass} bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-gray-900 animate-pulse`;
        case "neon":
          return `${baseClass} bg-pink-500 text-white ring-2 ring-pink-300 ring-offset-1 ring-offset-black animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.8)]`;
        default:
          return `${baseClass} bg-purple-500 text-white ring-2 ring-purple-300 animate-pulse`;
      }
    }

    switch (theme) {
      case "light":
        return `${baseClass} bg-white/70 hover:bg-purple-50 border border-purple-200 text-purple-700`;
      case "dark":
        return `${baseClass} bg-gray-800/70 hover:bg-gray-700 border border-gray-600 text-blue-300`;
      case "neon":
        return `${baseClass} bg-black/60 hover:bg-pink-900/40 border border-pink-700/50 text-pink-300`;
      default:
        return `${baseClass} bg-white/70 hover:bg-purple-50 border border-purple-200 text-purple-700`;
    }
  };

  const getContainerClass = () => {
    switch (theme) {
      case "light":
        return "bg-white/60 backdrop-blur-sm border border-purple-100 rounded-xl p-1.5 sm:p-2";
      case "dark":
        return "bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl p-1.5 sm:p-2";
      case "neon":
        return "bg-black/50 backdrop-blur-sm border border-pink-800/50 rounded-xl p-1.5 sm:p-2";
      default:
        return "bg-white/60 backdrop-blur-sm border border-purple-100 rounded-xl p-1.5 sm:p-2";
    }
  };

  const getCountBadgeClass = (count: number, isActive: boolean) => {
    if (isActive)
      return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-yellow-400 text-yellow-900";
    if (count === 0)
      return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-gray-400 text-white";
    switch (theme) {
      case "light":
        return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-purple-600 text-white";
      case "dark":
        return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-blue-500 text-white";
      case "neon":
        return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-pink-500 text-white";
      default:
        return "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 bg-purple-600 text-white";
    }
  };

  const getDialogClass = () => {
    switch (theme) {
      case "light":
        return "";
      case "dark":
        return "bg-gray-900 border-gray-700";
      case "neon":
        return "bg-black border-pink-600";
      default:
        return "";
    }
  };

  const getPowerUpName = (type: PowerUp["type"]) => {
    return t(`powerups.${type}.shortName`);
  };

  return (
    <>
      <div className={getContainerClass()}>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <TooltipProvider delayDuration={300}>
            {powerUps.map((powerUp) => {
              const isActive = activePowerUp === powerUp.type;
              const isEmpty = powerUp.count === 0;
              const isScaling = scalingButton === powerUp.type;

              return (
                <Tooltip key={powerUp.type}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`${getButtonClass(isActive, powerUp.count)} ${
                        isScaling ? "scale-110" : ""
                      }`}
                      onClick={() => {
                        if (isEmpty) {
                          handleRefillClick(powerUp.type);
                        } else {
                          handleUsePowerUp(powerUp.type);
                        }
                      }}
                      data-ocid="powerup.button"
                    >
                      {/* Active glow border */}
                      {isActive && (
                        <span className="absolute inset-0 rounded-md sm:rounded-lg ring-2 ring-current animate-ping opacity-30" />
                      )}

                      {/* Count badge */}
                      <span
                        className={getCountBadgeClass(powerUp.count, isActive)}
                      >
                        {powerUp.count}
                      </span>

                      <img
                        src={getPowerUpImage(powerUp.type)}
                        alt={getPowerUpName(powerUp.type)}
                        className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-center leading-tight max-w-[48px] sm:max-w-[56px] truncate">
                        {getPowerUpName(powerUp.type)}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-semibold">
                      {t(`powerups.${powerUp.type}.name`)}
                    </p>
                    <p className="text-muted-foreground">
                      {t(`powerups.${powerUp.type}.description`)}
                    </p>
                    {isEmpty && !isOffline && isNativeMobile() && (
                      <p className="text-yellow-600 mt-1">
                        {t("powerups.clickToRefill")}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      {/* Refill Dialog */}
      <Dialog open={showRefillDialog} onOpenChange={setShowRefillDialog}>
        <DialogContent className={getDialogClass()} data-ocid="powerup.dialog">
          <DialogHeader>
            <DialogTitle>{t("powerups.outOfStock")}</DialogTitle>
            <DialogDescription>
              {refillType
                ? t("ads.refillDescription").replace(
                    "{name}",
                    t(`powerups.${refillType}.name`),
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {!isOffline && isNativeMobile() && (
              <Button
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                data-ocid="powerup.confirm_button"
              >
                {isWatchingAd ? t("ads.watchingAd") : t("powerups.watchAd")}
              </Button>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {t("ads.orEarnFromLeaderboard")}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowRefillDialog(false)}
              data-ocid="powerup.cancel_button"
            >
              {t("profile.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

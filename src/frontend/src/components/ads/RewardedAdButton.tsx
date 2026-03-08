import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { AD_CONFIG, getRandomPowerUpType, trackAdEvent } from "@/lib/ads";
import { addPowerUp } from "@/lib/leaderboard";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RewardedAdButtonProps {
  theme: Theme;
  userCode: string;
  onRewardEarned?: () => void;
}

export function RewardedAdButton({
  theme,
  userCode,
  onRewardEarned,
}: RewardedAdButtonProps) {
  const { t } = useLanguage();
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getButtonClass = () => {
    let baseClass = "gap-2 font-semibold transition-all duration-300 ";

    switch (theme) {
      case "light":
        baseClass +=
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl";
        break;
      case "dark":
        baseClass +=
          "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50";
        break;
      case "neon":
        baseClass +=
          "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)]";
        break;
    }

    return baseClass;
  };

  const handleWatchAd = () => {
    playSound("button");
    setShowAdDialog(true);
    setIsLoading(true);

    // Simulate ad loading and watching (3 seconds)
    setTimeout(() => {
      setIsLoading(false);

      // Simulate ad completion and reward
      setTimeout(() => {
        const powerUpType = getRandomPowerUpType();
        addPowerUp(userCode, powerUpType, 1);
        trackAdEvent("rewarded", "rewarded");

        playSound("powerUp");
        toast.success(t("ads.rewardEarned"), {
          description: t("ads.powerUpAdded").replace(
            "{name}",
            t(`powerups.${powerUpType}.name`),
          ),
          duration: 3000,
        });

        setShowAdDialog(false);

        if (onRewardEarned) {
          onRewardEarned();
        }

        // Trigger storage event to update UI
        window.dispatchEvent(new Event("storage"));
      }, 2000);
    }, 3000);
  };

  return (
    <>
      <Button onClick={handleWatchAd} className={getButtonClass()} size="lg">
        <Gift className="w-5 h-5" />
        {t("ads.watchForReward")}
      </Button>

      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent
          className={
            theme === "neon"
              ? "bg-purple-900 border-pink-500 text-pink-100"
              : theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-purple-200 text-gray-800"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {isLoading ? t("ads.loadingAd") : t("ads.watchingAd")}
            </DialogTitle>
            <DialogDescription
              className={theme === "light" ? "text-gray-600" : "text-gray-300"}
            >
              {isLoading ? t("ads.pleaseWait") : t("ads.almostDone")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {isLoading ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
                <p className="text-sm opacity-75">{t("ads.preparingAd")}</p>
              </>
            ) : (
              <>
                <div className="w-full aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-500/30">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">📺</div>
                    <p className="text-sm font-semibold">
                      {t("ads.adPlaying")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-xs opacity-75">
                    {t("ads.completingSoon")}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

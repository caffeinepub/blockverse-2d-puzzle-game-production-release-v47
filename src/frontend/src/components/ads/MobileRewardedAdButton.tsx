import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { addPowerUp } from "@/lib/leaderboard";
import {
  getRandomPowerUpType,
  isNativeMobile,
  showRewardedAd,
  trackMobileAdEvent,
} from "@/lib/mobileAds";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RewardedAdButton } from "./RewardedAdButton";

interface MobileRewardedAdButtonProps {
  theme: Theme;
  userCode: string;
  onRewardEarned?: () => void;
}

export function MobileRewardedAdButton({
  theme,
  userCode,
  onRewardEarned,
}: MobileRewardedAdButtonProps) {
  const { t } = useLanguage();
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);

  // Use web rewarded ad for non-mobile environments
  if (!isNativeMobile()) {
    return (
      <RewardedAdButton
        theme={theme}
        userCode={userCode}
        onRewardEarned={onRewardEarned}
      />
    );
  }

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

    // Show native rewarded ad
    showRewardedAd(
      () => {
        // On reward earned
        const powerUpType = getRandomPowerUpType();
        addPowerUp(userCode, powerUpType, 1);
        trackMobileAdEvent("rewarded", "rewarded");

        playSound("powerUp");
        toast.success(t("ads.rewardEarned"), {
          description: t("ads.powerUpAdded").replace(
            "{name}",
            t(`powerups.${powerUpType}.name`),
          ),
          duration: 3000,
        });

        setShowAdDialog(false);
        setIsLoading(false);

        if (onRewardEarned) {
          onRewardEarned();
        }

        // Trigger storage event to update UI
        window.dispatchEvent(new Event("storage"));
      },
      () => {
        // On ad closed
        setShowAdDialog(false);
        setIsLoading(false);
      },
    );
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
              {t("ads.loadingAd")}
            </DialogTitle>
            <DialogDescription
              className={theme === "light" ? "text-gray-600" : "text-gray-300"}
            >
              {t("ads.pleaseWait")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
            <p className="text-sm opacity-75">{t("ads.preparingAd")}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

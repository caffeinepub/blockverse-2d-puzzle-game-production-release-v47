import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { shouldShowAd, trackAdEvent } from "@/lib/ads";
import type { Theme } from "@/pages/Game";
import { useEffect, useRef, useState } from "react";

interface InterstitialAdTriggerProps {
  theme: Theme;
  trigger: boolean;
  onClose: () => void;
}

export function InterstitialAdTrigger({
  theme,
  trigger,
  onClose,
}: InterstitialAdTriggerProps) {
  const { t } = useLanguage();
  const [showAd, setShowAd] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    if (trigger && !hasShown.current && shouldShowAd("interstitial", 5)) {
      hasShown.current = true;
      setShowAd(true);
      trackAdEvent("shown", "interstitial");

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setShowAd(false);
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onClose]);

  const handleClose = () => {
    setShowAd(false);
    onClose();
  };

  if (!showAd) return null;

  return (
    <Dialog open={showAd} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-2xl ${
          theme === "neon"
            ? "bg-purple-900 border-pink-500"
            : theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-purple-200"
        }`}
      >
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm opacity-75">{t("ads.interstitialMessage")}</p>
          </div>

          <div className="w-full aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-500/20">
            <div className="text-center space-y-2">
              <div className="text-6xl">📺</div>
              <p className="text-sm font-semibold opacity-75">
                {t("ads.adSpace")}
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm underline opacity-75 hover:opacity-100 transition-opacity"
            >
              {t("ads.closeAd")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

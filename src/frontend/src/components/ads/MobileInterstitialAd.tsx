import { isNativeMobile, showInterstitialAd } from "@/lib/mobileAds";
import type { Theme } from "@/pages/Game";
import { useEffect, useRef } from "react";
import { InterstitialAdTrigger } from "./InterstitialAdTrigger";

interface MobileInterstitialAdProps {
  theme: Theme;
  show: boolean;
  onClose: () => void;
}

export function MobileInterstitialAd({
  theme,
  show,
  onClose,
}: MobileInterstitialAdProps) {
  const hasShown = useRef(false);

  useEffect(() => {
    if (show && !hasShown.current) {
      hasShown.current = true;

      if (isNativeMobile()) {
        // Show native mobile interstitial ad with built-in frequency control
        // The showInterstitialAd function now handles the "every third game" logic
        showInterstitialAd(() => {
          onClose();
          hasShown.current = false;
        });
      }
    }
  }, [show, onClose]);

  // Use web interstitial for non-mobile environments
  if (!isNativeMobile()) {
    return (
      <InterstitialAdTrigger theme={theme} trigger={show} onClose={onClose} />
    );
  }

  // Native mobile ads are handled by the native bridge
  return null;
}

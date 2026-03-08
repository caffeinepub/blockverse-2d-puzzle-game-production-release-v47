import { AD_CONFIG, pushAd, trackAdEvent } from "@/lib/ads";
import type { Theme } from "@/pages/Game";
import { useEffect, useRef } from "react";

interface BannerAdProps {
  theme: Theme;
  className?: string;
}

export function BannerAd({ theme, className = "" }: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      pushAd();
      trackAdEvent("shown", "banner");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getContainerClass = () => {
    let baseClass =
      "w-full flex justify-center items-center py-2 sm:py-3 rounded-lg overflow-hidden ";

    switch (theme) {
      case "light":
        baseClass += "bg-white/80 backdrop-blur-sm border border-purple-200";
        break;
      case "dark":
        baseClass += "bg-gray-800/80 backdrop-blur-sm border border-gray-700";
        break;
      case "neon":
        baseClass += "bg-black/60 backdrop-blur-sm border border-pink-500/30";
        break;
    }

    return baseClass;
  };

  return (
    <div className={`${getContainerClass()} ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CONFIG.appId}
        data-ad-slot={AD_CONFIG.bannerAdId.split("/")[1]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

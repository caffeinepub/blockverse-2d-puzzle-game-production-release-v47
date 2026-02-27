import { useEffect, useRef } from 'react';
import { loadBannerAd, isNativeMobile, trackMobileAdEvent } from '@/lib/mobileAds';
import { BannerAd } from './BannerAd';
import type { Theme } from '@/pages/Game';

interface MobileBannerAdProps {
  theme: Theme;
  className?: string;
}

export function MobileBannerAd({ theme, className = '' }: MobileBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (isNativeMobile() && containerRef.current) {
      const containerId = `banner-ad-${Date.now()}`;
      containerRef.current.id = containerId;
      
      setTimeout(() => {
        loadBannerAd(containerId);
        trackMobileAdEvent('shown', 'banner');
      }, 100);
    }
  }, []);

  // Use web banner ad for non-mobile environments
  if (!isNativeMobile()) {
    return <BannerAd theme={theme} className={className} />;
  }

  const getContainerClass = () => {
    let baseClass = 'w-full flex justify-center items-center py-2 sm:py-3 rounded-lg overflow-hidden min-h-[50px] ';
    
    switch (theme) {
      case 'light':
        baseClass += 'bg-white/80 backdrop-blur-sm border border-purple-200';
        break;
      case 'dark':
        baseClass += 'bg-gray-800/80 backdrop-blur-sm border border-gray-700';
        break;
      case 'neon':
        baseClass += 'bg-black/60 backdrop-blur-sm border border-pink-500/30';
        break;
    }
    
    return baseClass;
  };

  return (
    <div 
      ref={containerRef}
      className={`${getContainerClass()} ${className}`}
    />
  );
}

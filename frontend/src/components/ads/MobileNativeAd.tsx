import { useEffect, useRef } from 'react';
import { loadNativeAd, isNativeMobile, trackMobileAdEvent } from '@/lib/mobileAds';
import { NativeAd } from './NativeAd';
import type { Theme } from '@/pages/Game';

interface MobileNativeAdProps {
  theme: Theme;
  className?: string;
}

export function MobileNativeAd({ theme, className = '' }: MobileNativeAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (isNativeMobile() && containerRef.current) {
      const containerId = `native-ad-${Date.now()}`;
      containerRef.current.id = containerId;
      
      setTimeout(() => {
        loadNativeAd(containerId);
        trackMobileAdEvent('shown', 'native');
      }, 100);
    }
  }, []);

  // Use web native ad for non-mobile environments
  if (!isNativeMobile()) {
    return <NativeAd theme={theme} className={className} />;
  }

  const getContainerClass = () => {
    let baseClass = 'w-full rounded-lg overflow-hidden p-3 sm:p-4 min-h-[120px] ';
    
    switch (theme) {
      case 'light':
        baseClass += 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200';
        break;
      case 'dark':
        baseClass += 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700';
        break;
      case 'neon':
        baseClass += 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30';
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

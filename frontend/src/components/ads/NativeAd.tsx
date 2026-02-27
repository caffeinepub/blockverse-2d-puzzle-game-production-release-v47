import { useEffect, useRef } from 'react';
import { AD_CONFIG, pushAd, trackAdEvent } from '@/lib/ads';
import type { Theme } from '@/pages/Game';

interface NativeAdProps {
  theme: Theme;
  className?: string;
}

export function NativeAd({ theme, className = '' }: NativeAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const timer = setTimeout(() => {
      pushAd();
      trackAdEvent('shown', 'native');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getContainerClass = () => {
    let baseClass = 'w-full rounded-lg overflow-hidden p-3 sm:p-4 ';
    
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
    <div className={`${getContainerClass()} ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client={AD_CONFIG.appId}
        data-ad-slot={AD_CONFIG.nativeAdId.split('/')[1]}
      />
    </div>
  );
}

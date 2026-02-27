// Google AdSense integration for web
// Note: Google Mobile Ads SDK is for native mobile apps. For web apps, we use AdSense.

export interface AdConfig {
  appId: string;
  appOpenAdId: string;
  bannerAdId: string;
  interstitialAdId: string;
  nativeAdId: string;
  rewardedAdId: string;
}

export const AD_CONFIG: AdConfig = {
  appId: 'ca-app-pub-7936595519986908~6613777633',
  appOpenAdId: 'ca-app-pub-7936595519986908/6422205940',
  bannerAdId: 'ca-app-pub-7936595519986908/6966993242',
  interstitialAdId: 'ca-app-pub-7936595519986908/8683399593',
  nativeAdId: 'ca-app-pub-7936595519986908/5053283958',
  rewardedAdId: 'ca-app-pub-7936595519986908/5767599823',
};

// Initialize Google AdSense script
export function initializeAdSense(): void {
  if (typeof window === 'undefined') return;
  
  // Check if script already exists
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.appId}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// Push ad to display queue
export function pushAd(): void {
  if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }
}

// Track ad events in localStorage
export function trackAdEvent(eventType: 'shown' | 'clicked' | 'rewarded', adType: string): void {
  const key = `blockverse-ad-${adType}-${eventType}`;
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, (count + 1).toString());
}

// Get random power-up type for rewarded ads
export function getRandomPowerUpType(): 'blockBreak' | 'columnBreak' | 'rowBreak' | 'shuffleBlocks' {
  const types: Array<'blockBreak' | 'columnBreak' | 'rowBreak' | 'shuffleBlocks'> = [
    'blockBreak',
    'columnBreak',
    'rowBreak',
    'shuffleBlocks',
  ];
  return types[Math.floor(Math.random() * types.length)];
}

// Check if ad should be shown based on frequency
export function shouldShowAd(adType: string, minIntervalMinutes: number = 5): boolean {
  const lastShownKey = `blockverse-ad-${adType}-last-shown`;
  const lastShown = localStorage.getItem(lastShownKey);
  
  if (!lastShown) {
    localStorage.setItem(lastShownKey, Date.now().toString());
    return true;
  }
  
  const timeSinceLastShown = Date.now() - parseInt(lastShown, 10);
  const minInterval = minIntervalMinutes * 60 * 1000;
  
  if (timeSinceLastShown >= minInterval) {
    localStorage.setItem(lastShownKey, Date.now().toString());
    return true;
  }
  
  return false;
}

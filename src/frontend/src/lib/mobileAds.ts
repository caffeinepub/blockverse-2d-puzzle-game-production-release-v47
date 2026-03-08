// Google Mobile Ads integration for Android Studio / Capacitor
// This module provides a bridge between the web frontend and native mobile ads

export interface MobileAdConfig {
  appId: string;
  appOpenAdId: string;
  bannerAdId: string;
  interstitialAdId: string;
  nativeAdId: string;
  rewardedAdId: string;
}

export const MOBILE_AD_CONFIG: MobileAdConfig = {
  appId: "ca-app-pub-7936595519986908~6613777633",
  appOpenAdId: "ca-app-pub-7936595519986908/6422205940",
  bannerAdId: "ca-app-pub-7936595519986908/6966993242",
  interstitialAdId: "ca-app-pub-7936595519986908/8683399593",
  nativeAdId: "ca-app-pub-7936595519986908/5053283958",
  rewardedAdId: "ca-app-pub-7936595519986908/5767599823",
};

// Check if running in native mobile environment (Capacitor/WebView)
export function isNativeMobile(): boolean {
  if (typeof window === "undefined") return false;

  // Check for Capacitor
  if ((window as any).Capacitor) {
    return true;
  }

  // Check for Android WebView
  if ((window as any).Android) {
    return true;
  }

  // Check user agent for mobile
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

// Initialize mobile ads
export function initializeMobileAds(): void {
  if (!isNativeMobile()) {
    console.log("Not in native mobile environment, using web ads");
    return;
  }

  console.log("Initializing Google Mobile Ads for native environment");

  // Call native bridge if available
  if ((window as any).MobileAds) {
    (window as any).MobileAds.initialize(MOBILE_AD_CONFIG.appId);
  }
}

// App Open Ad frequency control - once per 24 hours minimum
export function shouldShowAppOpenAd(): boolean {
  const lastShownKey = "blockverse-app-open-ad-last-shown";
  const lastShown = localStorage.getItem(lastShownKey);

  if (!lastShown) {
    return true;
  }

  const timeSinceLastShown = Date.now() - Number.parseInt(lastShown, 10);
  const minInterval = 24 * 60 * 60 * 1000; // 24 hours minimum

  return timeSinceLastShown >= minInterval;
}

// Mark app open ad as shown
function markAppOpenAdShown(): void {
  const lastShownKey = "blockverse-app-open-ad-last-shown";
  localStorage.setItem(lastShownKey, Date.now().toString());
}

// Show app open ad (called ONLY on app launch) with 24-hour frequency control
export function showAppOpenAd(): void {
  if (!isNativeMobile()) return;

  if (!shouldShowAppOpenAd()) {
    console.log("App open ad skipped - minimum 24-hour interval not reached");
    return;
  }

  console.log("Showing app open ad at startup");
  markAppOpenAdShown();

  if ((window as any).MobileAds) {
    (window as any).MobileAds.showAppOpenAd(MOBILE_AD_CONFIG.appOpenAdId);
  }
}

// Load and show banner ad
export function loadBannerAd(containerId: string): void {
  if (!isNativeMobile()) return;

  if ((window as any).MobileAds) {
    (window as any).MobileAds.loadBannerAd({
      adUnitId: MOBILE_AD_CONFIG.bannerAdId,
      containerId: containerId,
      position: "bottom",
    });
  }
}

// Interstitial ad frequency control - every third completed game
export function shouldShowInterstitialAd(): boolean {
  const gameCountKey = "blockverse-completed-games-count";
  const gameCount = Number.parseInt(
    localStorage.getItem(gameCountKey) || "0",
    10,
  );

  // Increment game count
  const newCount = gameCount + 1;
  localStorage.setItem(gameCountKey, newCount.toString());

  // Show ad every third game
  if (newCount % 3 === 0) {
    return true;
  }

  return false;
}

// Show interstitial ad with frequency control (NEVER during app startup)
export function showInterstitialAd(onClosed?: () => void): void {
  if (!isNativeMobile()) {
    // Fallback for web
    if (onClosed) onClosed();
    return;
  }

  if (!shouldShowInterstitialAd()) {
    console.log("Interstitial ad skipped - not every third game");
    if (onClosed) onClosed();
    return;
  }

  if ((window as any).MobileAds) {
    (window as any).MobileAds.showInterstitialAd(
      MOBILE_AD_CONFIG.interstitialAdId,
      onClosed,
    );
  } else if (onClosed) {
    onClosed();
  }
}

// Load native ad (NEVER during app startup)
export function loadNativeAd(containerId: string): void {
  if (!isNativeMobile()) return;

  if ((window as any).MobileAds) {
    (window as any).MobileAds.loadNativeAd({
      adUnitId: MOBILE_AD_CONFIG.nativeAdId,
      containerId: containerId,
    });
  }
}

// Show rewarded ad - only user-triggered, NEVER during app startup
export function showRewardedAd(
  onRewarded: () => void,
  onClosed?: () => void,
): void {
  if (!isNativeMobile()) {
    // Simulate reward for web testing
    setTimeout(() => {
      onRewarded();
      if (onClosed) onClosed();
    }, 3000);
    return;
  }

  if ((window as any).MobileAds) {
    (window as any).MobileAds.showRewardedAd(
      MOBILE_AD_CONFIG.rewardedAdId,
      onRewarded,
      onClosed,
    );
  } else {
    // Fallback
    onRewarded();
    if (onClosed) onClosed();
  }
}

// Track ad events
export function trackMobileAdEvent(
  eventType: "shown" | "clicked" | "rewarded",
  adType: string,
): void {
  const key = `blockverse-mobile-ad-${adType}-${eventType}`;
  const count = Number.parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, (count + 1).toString());

  // Also track timestamp
  const timestampKey = `blockverse-mobile-ad-${adType}-last-${eventType}`;
  localStorage.setItem(timestampKey, Date.now().toString());
}

// Get random power-up type for rewarded ads
export function getRandomPowerUpType():
  | "blockBreak"
  | "columnBreak"
  | "rowBreak"
  | "shuffleBlocks" {
  const types: Array<
    "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks"
  > = ["blockBreak", "columnBreak", "rowBreak", "shuffleBlocks"];
  return types[Math.floor(Math.random() * types.length)];
}

// Get game completion count for debugging
export function getGameCompletionCount(): number {
  const gameCountKey = "blockverse-completed-games-count";
  return Number.parseInt(localStorage.getItem(gameCountKey) || "0", 10);
}

// Reset game completion count (for testing)
export function resetGameCompletionCount(): void {
  localStorage.setItem("blockverse-completed-games-count", "0");
}

// Get time until next app open ad
export function getTimeUntilNextAppOpenAd(): number {
  const lastShownKey = "blockverse-app-open-ad-last-shown";
  const lastShown = localStorage.getItem(lastShownKey);

  if (!lastShown) return 0;

  const timeSinceLastShown = Date.now() - Number.parseInt(lastShown, 10);
  const minInterval = 24 * 60 * 60 * 1000; // 24 hours
  const timeRemaining = minInterval - timeSinceLastShown;

  return Math.max(0, timeRemaining);
}

// Preload ads for better performance (NEVER includes app open ads)
export function preloadAds(): void {
  if (!isNativeMobile()) return;

  if ((window as any).MobileAds) {
    (window as any).MobileAds.preloadInterstitialAd(
      MOBILE_AD_CONFIG.interstitialAdId,
    );
    (window as any).MobileAds.preloadRewardedAd(MOBILE_AD_CONFIG.rewardedAdId);
  }
}

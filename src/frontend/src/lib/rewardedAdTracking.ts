// lib/rewardedAdTracking.ts
const MAX_ADS_PER_DAY = 5;

function getTodayKey(userCode: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `blockverse-ads-watched-${userCode}-${today}`;
}

export function getAdsWatchedToday(userCode: string): number {
  const saved = localStorage.getItem(getTodayKey(userCode));
  return saved ? Number.parseInt(saved, 10) : 0;
}

export function getAdsRemainingToday(userCode: string): number {
  return Math.max(0, MAX_ADS_PER_DAY - getAdsWatchedToday(userCode));
}

export function incrementAdsWatched(userCode: string): void {
  const current = getAdsWatchedToday(userCode);
  localStorage.setItem(getTodayKey(userCode), (current + 1).toString());
}

export interface PlayerStats {
  totalGames: number;
  totalLinesCleared: number;
  totalScore: number;
  totalTimePlayed: number; // seconds
  bestCombo: number;
  bestScore: number;
  powerUpsUsed: number;
  longestStreak: number;
}

const STATS_KEY_PREFIX = "blockverse-player-stats";

function getStatsKey(userCode: string): string {
  return `${STATS_KEY_PREFIX}-${userCode}`;
}

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  totalLinesCleared: 0,
  totalScore: 0,
  totalTimePlayed: 0,
  bestCombo: 0,
  bestScore: 0,
  powerUpsUsed: 0,
  longestStreak: 0,
};

export function getPlayerStats(userCode: string): PlayerStats {
  const key = getStatsKey(userCode);
  const saved = localStorage.getItem(key);
  if (!saved) return { ...DEFAULT_STATS };
  try {
    return { ...DEFAULT_STATS, ...(JSON.parse(saved) as PlayerStats) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function updateStats(
  userCode: string,
  delta: Partial<PlayerStats>,
): PlayerStats {
  const current = getPlayerStats(userCode);
  const updated: PlayerStats = {
    totalGames: current.totalGames + (delta.totalGames || 0),
    totalLinesCleared:
      current.totalLinesCleared + (delta.totalLinesCleared || 0),
    totalScore: current.totalScore + (delta.totalScore || 0),
    totalTimePlayed: current.totalTimePlayed + (delta.totalTimePlayed || 0),
    bestCombo: Math.max(current.bestCombo, delta.bestCombo || 0),
    bestScore: Math.max(current.bestScore, delta.bestScore || 0),
    powerUpsUsed: current.powerUpsUsed + (delta.powerUpsUsed || 0),
    longestStreak: Math.max(current.longestStreak, delta.longestStreak || 0),
  };
  localStorage.setItem(getStatsKey(userCode), JSON.stringify(updated));
  return updated;
}

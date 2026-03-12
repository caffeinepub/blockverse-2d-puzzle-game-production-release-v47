import type { PlayerStats } from "@/lib/playerStats";

export interface Achievement {
  id: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementContext {
  comboLines?: number;
  survivalSeconds?: number;
  modesPlayed?: string[];
}

interface AchievementDef {
  id: string;
  icon: string;
  checkFn: (stats: PlayerStats, context: AchievementContext) => boolean;
}

const ACHIEVEMENTS_KEY_PREFIX = "blockverse-achievements";
const MODES_PLAYED_KEY_PREFIX = "blockverse-modes-played";

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_game",
    icon: "🎮",
    checkFn: (stats) => stats.totalGames >= 1,
  },
  {
    id: "score_1000",
    icon: "⭐",
    checkFn: (stats) => stats.bestScore >= 1000,
  },
  {
    id: "score_10000",
    icon: "🌟",
    checkFn: (stats) => stats.bestScore >= 10000,
  },
  {
    id: "lines_10",
    icon: "📏",
    checkFn: (stats) => stats.totalLinesCleared >= 10,
  },
  {
    id: "lines_100",
    icon: "🏆",
    checkFn: (stats) => stats.totalLinesCleared >= 100,
  },
  {
    id: "combo_3",
    icon: "🔥",
    checkFn: (_, ctx) => (ctx.comboLines || 0) >= 3,
  },
  {
    id: "powerup_10",
    icon: "⚡",
    checkFn: (stats) => stats.powerUpsUsed >= 10,
  },
  {
    id: "streak_3",
    icon: "📅",
    checkFn: (stats) => stats.longestStreak >= 3,
  },
  {
    id: "all_modes",
    icon: "🗺️",
    checkFn: (_, ctx) => (ctx.modesPlayed?.length || 0) >= 5,
  },
  {
    id: "survival_300",
    icon: "⏱️",
    checkFn: (_, ctx) => (ctx.survivalSeconds || 0) >= 300,
  },
];

function getAchievementsKey(userCode: string): string {
  return `${ACHIEVEMENTS_KEY_PREFIX}-${userCode}`;
}

export function trackModePlayed(userCode: string, mode: string): void {
  const key = `${MODES_PLAYED_KEY_PREFIX}-${userCode}`;
  const saved = localStorage.getItem(key);
  const modes: string[] = saved ? JSON.parse(saved) : [];
  if (!modes.includes(mode)) {
    modes.push(mode);
    localStorage.setItem(key, JSON.stringify(modes));
  }
}

export function getModesPlayed(userCode: string): string[] {
  const key = `${MODES_PLAYED_KEY_PREFIX}-${userCode}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
}

export function getAchievements(userCode: string): Achievement[] {
  const key = getAchievementsKey(userCode);
  const saved = localStorage.getItem(key);
  const savedData: Achievement[] = saved ? JSON.parse(saved) : [];
  return ACHIEVEMENT_DEFS.map((def) => {
    const existing = savedData.find((a) => a.id === def.id);
    return existing || { id: def.id, icon: def.icon, unlocked: false };
  });
}

export function checkAndUnlockAchievements(
  userCode: string,
  stats: PlayerStats,
  context: AchievementContext,
): string[] {
  const key = getAchievementsKey(userCode);
  const current = getAchievements(userCode);
  const newlyUnlocked: string[] = [];

  const updated = current.map((achievement) => {
    if (achievement.unlocked) return achievement;
    const def = ACHIEVEMENT_DEFS.find((d) => d.id === achievement.id);
    if (def?.checkFn(stats, context)) {
      newlyUnlocked.push(achievement.id);
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
    return achievement;
  });

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(key, JSON.stringify(updated));
  }

  return newlyUnlocked;
}

export function getAchievementDefs(): AchievementDef[] {
  return ACHIEVEMENT_DEFS;
}

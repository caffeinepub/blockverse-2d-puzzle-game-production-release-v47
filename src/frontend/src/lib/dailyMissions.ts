export type MissionType =
  | "clearLines"
  | "scorePoints"
  | "usePowerUps"
  | "triggerChains"
  | "completeGames"
  | "clearTotalLines"
  | "comboMultiplier"
  | "placeBlocksCount"
  | "achieveCombo"
  | "surviveTime";

export type RewardType = "points" | "powerUps" | "comboBoost";

export interface DailyMission {
  id: string;
  type: MissionType;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardType: RewardType;
  rewardValue: number;
  rewardPowerUpType?:
    | "blockBreak"
    | "columnBreak"
    | "rowBreak"
    | "shuffleBlocks";
}

export interface WeeklyMission {
  id: string;
  type: MissionType;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardType: RewardType;
  rewardValue: number;
  rewardPowerUpType?:
    | "blockBreak"
    | "columnBreak"
    | "rowBreak"
    | "shuffleBlocks";
}

export interface DailyMissionsData {
  missions: DailyMission[];
  lastResetDate: string;
}

export interface WeeklyMissionsData {
  missions: WeeklyMission[];
  lastResetDate: string;
}

const MISSION_TEMPLATES: Array<{
  type: MissionType;
  baseTarget: number;
  levelMultiplier: number;
  rewardType: RewardType;
  baseReward: number;
}> = [
  {
    type: "clearLines",
    baseTarget: 3,
    levelMultiplier: 0.5,
    rewardType: "points",
    baseReward: 300,
  },
  {
    type: "scorePoints",
    baseTarget: 5000,
    levelMultiplier: 1000,
    rewardType: "powerUps",
    baseReward: 2,
  },
  {
    type: "usePowerUps",
    baseTarget: 3,
    levelMultiplier: 0.3,
    rewardType: "points",
    baseReward: 400,
  },
  {
    type: "triggerChains",
    baseTarget: 2,
    levelMultiplier: 0.2,
    rewardType: "comboBoost",
    baseReward: 1.3,
  },
  {
    type: "completeGames",
    baseTarget: 2,
    levelMultiplier: 0.1,
    rewardType: "powerUps",
    baseReward: 1,
  },
  {
    type: "clearTotalLines",
    baseTarget: 10,
    levelMultiplier: 2,
    rewardType: "points",
    baseReward: 500,
  },
  {
    type: "comboMultiplier",
    baseTarget: 3,
    levelMultiplier: 0.3,
    rewardType: "comboBoost",
    baseReward: 1.5,
  },
  {
    type: "placeBlocksCount",
    baseTarget: 20,
    levelMultiplier: 5,
    rewardType: "points",
    baseReward: 200,
  },
  {
    type: "achieveCombo",
    baseTarget: 3,
    levelMultiplier: 0.3,
    rewardType: "powerUps",
    baseReward: 1,
  },
  {
    type: "surviveTime",
    baseTarget: 60,
    levelMultiplier: 10,
    rewardType: "points",
    baseReward: 350,
  },
];

// Weekly missions are harder with bigger rewards
const WEEKLY_MISSION_TEMPLATES: Array<{
  type: MissionType;
  baseTarget: number;
  levelMultiplier: number;
  rewardType: RewardType;
  baseReward: number;
}> = [
  {
    type: "completeGames",
    baseTarget: 10,
    levelMultiplier: 1,
    rewardType: "powerUps",
    baseReward: 5,
  },
  {
    type: "scorePoints",
    baseTarget: 30000,
    levelMultiplier: 5000,
    rewardType: "powerUps",
    baseReward: 3,
  },
  {
    type: "clearTotalLines",
    baseTarget: 50,
    levelMultiplier: 10,
    rewardType: "points",
    baseReward: 2000,
  },
  {
    type: "usePowerUps",
    baseTarget: 15,
    levelMultiplier: 2,
    rewardType: "points",
    baseReward: 1500,
  },
  {
    type: "triggerChains",
    baseTarget: 10,
    levelMultiplier: 1,
    rewardType: "powerUps",
    baseReward: 4,
  },
  {
    type: "comboMultiplier",
    baseTarget: 10,
    levelMultiplier: 1,
    rewardType: "points",
    baseReward: 2500,
  },
];

function getStorageKey(userCode: string): string {
  return `blockverse-daily-missions-${userCode}`;
}

function getWeeklyStorageKey(userCode: string): string {
  return `blockverse-weekly-missions-${userCode}`;
}

function shouldResetMissions(lastResetDate: string): boolean {
  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Reset if it's been more than 24 hours
  const hoursSinceReset =
    (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
  return hoursSinceReset >= 24;
}

function shouldResetWeeklyMissions(lastResetDate: string): boolean {
  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Reset if it's been more than 7 days
  const daysSinceReset =
    (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReset >= 7;
}

function generateRandomMissions(playerLevel: number): DailyMission[] {
  // Shuffle templates and pick 3
  const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((template, index) => {
    const target = Math.ceil(
      template.baseTarget + playerLevel * template.levelMultiplier,
    );
    const rewardValue =
      template.rewardType === "comboBoost"
        ? template.baseReward
        : Math.ceil(template.baseReward * (1 + playerLevel * 0.1));

    const mission: DailyMission = {
      id: `mission-${Date.now()}-${index}`,
      type: template.type,
      target,
      progress: 0,
      completed: false,
      claimed: false,
      rewardType: template.rewardType,
      rewardValue,
    };

    // Add random power-up type for power-up rewards
    if (template.rewardType === "powerUps") {
      const powerUpTypes: Array<
        "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks"
      > = ["blockBreak", "columnBreak", "rowBreak", "shuffleBlocks"];
      mission.rewardPowerUpType =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    }

    return mission;
  });
}

function generateWeeklyMissions(playerLevel: number): WeeklyMission[] {
  // Shuffle weekly templates and pick 3
  const shuffled = [...WEEKLY_MISSION_TEMPLATES].sort(
    () => Math.random() - 0.5,
  );
  const selected = shuffled.slice(0, 3);

  return selected.map((template, index) => {
    const target = Math.ceil(
      template.baseTarget + playerLevel * template.levelMultiplier,
    );
    const rewardValue =
      template.rewardType === "comboBoost"
        ? template.baseReward
        : Math.ceil(template.baseReward * (1 + playerLevel * 0.15));

    const mission: WeeklyMission = {
      id: `weekly-${Date.now()}-${index}`,
      type: template.type,
      target,
      progress: 0,
      completed: false,
      claimed: false,
      rewardType: template.rewardType,
      rewardValue,
    };

    if (template.rewardType === "powerUps") {
      const powerUpTypes: Array<
        "blockBreak" | "columnBreak" | "rowBreak" | "shuffleBlocks"
      > = ["blockBreak", "columnBreak", "rowBreak", "shuffleBlocks"];
      mission.rewardPowerUpType =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    }

    return mission;
  });
}

export function getDailyMissions(
  userCode: string,
  playerLevel: number,
): DailyMission[] {
  const storageKey = getStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    // First time - generate new missions
    const missions = generateRandomMissions(playerLevel);
    const data: DailyMissionsData = {
      missions,
      lastResetDate: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return missions;
  }

  try {
    const data: DailyMissionsData = JSON.parse(saved);

    // Check if we need to reset
    if (shouldResetMissions(data.lastResetDate)) {
      const missions = generateRandomMissions(playerLevel);
      const newData: DailyMissionsData = {
        missions,
        lastResetDate: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      return missions;
    }

    return data.missions;
  } catch {
    // If parsing fails, generate new missions
    const missions = generateRandomMissions(playerLevel);
    const data: DailyMissionsData = {
      missions,
      lastResetDate: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return missions;
  }
}

export function updateMissionProgress(
  userCode: string,
  missionType: MissionType,
  increment = 1,
): DailyMission[] {
  const storageKey = getStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) return [];

  try {
    const data: DailyMissionsData = JSON.parse(saved);

    data.missions = data.missions.map((mission) => {
      if (mission.type === missionType && !mission.completed) {
        const newProgress = mission.progress + increment;
        return {
          ...mission,
          progress: Math.min(newProgress, mission.target),
          completed: newProgress >= mission.target,
        };
      }
      return mission;
    });

    localStorage.setItem(storageKey, JSON.stringify(data));
    return data.missions;
  } catch {
    return [];
  }
}

export function claimMissionReward(
  userCode: string,
  missionId: string,
): DailyMission | null {
  const storageKey = getStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) return null;

  try {
    const data: DailyMissionsData = JSON.parse(saved);

    const mission = data.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) {
      return null;
    }

    data.missions = data.missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m,
    );

    localStorage.setItem(storageKey, JSON.stringify(data));
    return mission;
  } catch {
    return null;
  }
}

export function getCompletedUnclaimedCount(userCode: string): number {
  const dailyCount = (() => {
    const storageKey = getStorageKey(userCode);
    const saved = localStorage.getItem(storageKey);
    if (!saved) return 0;
    try {
      const data: DailyMissionsData = JSON.parse(saved);
      return data.missions.filter((m) => m.completed && !m.claimed).length;
    } catch {
      return 0;
    }
  })();

  const weeklyCount = (() => {
    const storageKey = getWeeklyStorageKey(userCode);
    const saved = localStorage.getItem(storageKey);
    if (!saved) return 0;
    try {
      const data: WeeklyMissionsData = JSON.parse(saved);
      return data.missions.filter((m) => m.completed && !m.claimed).length;
    } catch {
      return 0;
    }
  })();

  return dailyCount + weeklyCount;
}

export function getWeeklyMissions(
  userCode: string,
  playerLevel: number,
): WeeklyMission[] {
  const storageKey = getWeeklyStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    const missions = generateWeeklyMissions(playerLevel);
    const data: WeeklyMissionsData = {
      missions,
      lastResetDate: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return missions;
  }

  try {
    const data: WeeklyMissionsData = JSON.parse(saved);

    if (shouldResetWeeklyMissions(data.lastResetDate)) {
      const missions = generateWeeklyMissions(playerLevel);
      const newData: WeeklyMissionsData = {
        missions,
        lastResetDate: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      return missions;
    }

    return data.missions;
  } catch {
    const missions = generateWeeklyMissions(playerLevel);
    const data: WeeklyMissionsData = {
      missions,
      lastResetDate: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return missions;
  }
}

export function updateWeeklyMissionProgress(
  userCode: string,
  missionType: MissionType,
  increment = 1,
): WeeklyMission[] {
  const storageKey = getWeeklyStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) return [];

  try {
    const data: WeeklyMissionsData = JSON.parse(saved);

    data.missions = data.missions.map((mission) => {
      if (mission.type === missionType && !mission.completed) {
        const newProgress = mission.progress + increment;
        return {
          ...mission,
          progress: Math.min(newProgress, mission.target),
          completed: newProgress >= mission.target,
        };
      }
      return mission;
    });

    localStorage.setItem(storageKey, JSON.stringify(data));
    return data.missions;
  } catch {
    return [];
  }
}

export function claimWeeklyMissionReward(
  userCode: string,
  missionId: string,
): WeeklyMission | null {
  const storageKey = getWeeklyStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);

  if (!saved) return null;

  try {
    const data: WeeklyMissionsData = JSON.parse(saved);

    const mission = data.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) {
      return null;
    }

    data.missions = data.missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m,
    );

    localStorage.setItem(storageKey, JSON.stringify(data));
    return mission;
  } catch {
    return null;
  }
}

export function getWeeklyResetTimeRemaining(userCode: string): number {
  const storageKey = getWeeklyStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);
  if (!saved) return 0;
  try {
    const data: WeeklyMissionsData = JSON.parse(saved);
    const lastReset = new Date(data.lastResetDate).getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const remaining = weekMs - (Date.now() - lastReset);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

// Streak tracking
interface StreakData {
  count: number;
  lastUpdatedDate: string;
}

function getStreakStorageKey(userCode: string): string {
  return `blockverse-mission-streak-${userCode}`;
}

export function getStreakCount(userCode: string): number {
  const saved = localStorage.getItem(getStreakStorageKey(userCode));
  if (!saved) return 0;
  try {
    const data: StreakData = JSON.parse(saved);
    return data.count;
  } catch {
    return 0;
  }
}

export function updateStreak(userCode: string): void {
  const storageKey = getStorageKey(userCode);
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  try {
    const data: DailyMissionsData = JSON.parse(saved);
    const allCompleted = data.missions.every((m) => m.completed);
    if (!allCompleted) return;

    const streakKey = getStreakStorageKey(userCode);
    const streakSaved = localStorage.getItem(streakKey);
    const today = new Date().toISOString().split("T")[0];

    if (!streakSaved) {
      const newStreak: StreakData = { count: 1, lastUpdatedDate: today };
      localStorage.setItem(streakKey, JSON.stringify(newStreak));
      return;
    }

    const streakData: StreakData = JSON.parse(streakSaved);
    const lastDate = new Date(streakData.lastUpdatedDate);
    const todayDate = new Date(today);
    const daysDiff =
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff < 1) {
      // Already updated today, skip
      return;
    }
    if (daysDiff <= 2) {
      // Continue streak
      streakData.count += 1;
      streakData.lastUpdatedDate = today;
    } else {
      // Streak broken (>2 days gap), reset
      streakData.count = 1;
      streakData.lastUpdatedDate = today;
    }

    localStorage.setItem(streakKey, JSON.stringify(streakData));
  } catch {
    // Ignore errors
  }
}

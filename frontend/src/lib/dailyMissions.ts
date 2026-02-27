export type MissionType = 
    | 'clearLines'
    | 'scorePoints'
    | 'usePowerUps'
    | 'triggerChains'
    | 'completeGames'
    | 'clearTotalLines'
    | 'comboMultiplier';

export type RewardType = 'points' | 'powerUps' | 'comboBoost';

export interface DailyMission {
    id: string;
    type: MissionType;
    target: number;
    progress: number;
    completed: boolean;
    claimed: boolean;
    rewardType: RewardType;
    rewardValue: number;
    rewardPowerUpType?: 'blockBreak' | 'columnBreak' | 'rowBreak' | 'shuffleBlocks';
}

export interface DailyMissionsData {
    missions: DailyMission[];
    lastResetDate: string;
}

const MISSION_TEMPLATES: Array<{
    type: MissionType;
    baseTarget: number;
    levelMultiplier: number;
    rewardType: RewardType;
    baseReward: number;
}> = [
    { type: 'clearLines', baseTarget: 3, levelMultiplier: 0.5, rewardType: 'points', baseReward: 300 },
    { type: 'scorePoints', baseTarget: 5000, levelMultiplier: 1000, rewardType: 'powerUps', baseReward: 2 },
    { type: 'usePowerUps', baseTarget: 3, levelMultiplier: 0.3, rewardType: 'points', baseReward: 400 },
    { type: 'triggerChains', baseTarget: 2, levelMultiplier: 0.2, rewardType: 'comboBoost', baseReward: 1.3 },
    { type: 'completeGames', baseTarget: 2, levelMultiplier: 0.1, rewardType: 'powerUps', baseReward: 1 },
    { type: 'clearTotalLines', baseTarget: 10, levelMultiplier: 2, rewardType: 'points', baseReward: 500 },
    { type: 'comboMultiplier', baseTarget: 3, levelMultiplier: 0.3, rewardType: 'comboBoost', baseReward: 1.5 },
];

function getStorageKey(userCode: string): string {
    return `blockverse-daily-missions-${userCode}`;
}

function shouldResetMissions(lastResetDate: string): boolean {
    const lastReset = new Date(lastResetDate);
    const now = new Date();
    
    // Reset if it's been more than 24 hours
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    return hoursSinceReset >= 24;
}

function generateRandomMissions(playerLevel: number): DailyMission[] {
    // Shuffle templates and pick 3
    const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    return selected.map((template, index) => {
        const target = Math.ceil(template.baseTarget + (playerLevel * template.levelMultiplier));
        const rewardValue = template.rewardType === 'comboBoost' 
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
        if (template.rewardType === 'powerUps') {
            const powerUpTypes: Array<'blockBreak' | 'columnBreak' | 'rowBreak' | 'shuffleBlocks'> = 
                ['blockBreak', 'columnBreak', 'rowBreak', 'shuffleBlocks'];
            mission.rewardPowerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        }
        
        return mission;
    });
}

export function getDailyMissions(userCode: string, playerLevel: number): DailyMission[] {
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
    increment: number = 1
): DailyMission[] {
    const storageKey = getStorageKey(userCode);
    const saved = localStorage.getItem(storageKey);
    
    if (!saved) return [];
    
    try {
        const data: DailyMissionsData = JSON.parse(saved);
        
        data.missions = data.missions.map(mission => {
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

export function claimMissionReward(userCode: string, missionId: string): DailyMission | null {
    const storageKey = getStorageKey(userCode);
    const saved = localStorage.getItem(storageKey);
    
    if (!saved) return null;
    
    try {
        const data: DailyMissionsData = JSON.parse(saved);
        
        const mission = data.missions.find(m => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) {
            return null;
        }
        
        data.missions = data.missions.map(m => 
            m.id === missionId ? { ...m, claimed: true } : m
        );
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        return mission;
    } catch {
        return null;
    }
}

export function getCompletedUnclaimedCount(userCode: string): number {
    const storageKey = getStorageKey(userCode);
    const saved = localStorage.getItem(storageKey);
    
    if (!saved) return 0;
    
    try {
        const data: DailyMissionsData = JSON.parse(saved);
        return data.missions.filter(m => m.completed && !m.claimed).length;
    } catch {
        return 0;
    }
}

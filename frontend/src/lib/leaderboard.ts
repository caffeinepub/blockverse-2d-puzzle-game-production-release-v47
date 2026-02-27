import type { GameMode } from '@/App';

export interface LeaderboardEntry {
    username: string;
    userCode: string;
    score: number;
    level: number;
    timestamp: string;
}

export interface PowerUp {
    type: 'blockBreak' | 'columnBreak' | 'rowBreak' | 'shuffleBlocks';
    count: number;
}

export interface PlayerProgress {
    level: number;
    powerUps: PowerUp[];
}

const LEADERBOARD_KEY_PREFIX = 'blockverse-leaderboard';
const PLAYER_PROGRESS_KEY = 'blockverse-player-progress';
const LAST_RESET_KEY = 'blockverse-last-reset';

function getLeaderboardKey(gameMode: GameMode): string {
    return `${LEADERBOARD_KEY_PREFIX}-${gameMode}`;
}

export function getLeaderboard(gameMode: GameMode = 'endless'): LeaderboardEntry[] {
    const key = getLeaderboardKey(gameMode);
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    
    try {
        const entries = JSON.parse(saved) as LeaderboardEntry[];
        return entries.sort((a, b) => b.score - a.score).slice(0, 100);
    } catch {
        return [];
    }
}

export function updateLeaderboard(username: string, userCode: string, score: number, gameMode: GameMode = 'endless'): void {
    const key = getLeaderboardKey(gameMode);
    const entries = getLeaderboard(gameMode);
    
    const existingIndex = entries.findIndex(e => e.userCode === userCode);
    const level = getLevelFromScore(score);
    
    if (existingIndex >= 0) {
        if (score > entries[existingIndex].score) {
            entries[existingIndex] = {
                username,
                userCode,
                score,
                level,
                timestamp: new Date().toISOString(),
            };
        }
    } else {
        entries.push({
            username,
            userCode,
            score,
            level,
            timestamp: new Date().toISOString(),
        });
    }
    
    const sorted = entries.sort((a, b) => b.score - a.score).slice(0, 100);
    localStorage.setItem(key, JSON.stringify(sorted));
    
    updatePlayerLevel(userCode, level);
}

function getLevelFromScore(score: number): number {
    if (score >= 35000) return 10;
    if (score >= 25000) return 9;
    if (score >= 17000) return 8;
    if (score >= 12000) return 7;
    if (score >= 8000) return 6;
    if (score >= 5000) return 5;
    if (score >= 3000) return 4;
    if (score >= 1500) return 3;
    if (score >= 500) return 2;
    return 1;
}

export function checkAndResetMonth(): void {
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    if (lastReset !== currentMonth) {
        const gameModes: GameMode[] = ['timeAttack', 'endless', 'strategy', 'powerBoost'];
        const allEntries: { [key in GameMode]?: LeaderboardEntry[] } = {};
        
        gameModes.forEach(mode => {
            allEntries[mode] = getLeaderboard(mode);
        });
        
        gameModes.forEach(mode => {
            const entries = allEntries[mode] || [];
            if (entries.length > 0) {
                if (entries[0]) addPowerUp(entries[0].userCode, 'blockBreak', 5);
                if (entries[0]) addPowerUp(entries[0].userCode, 'columnBreak', 5);
                if (entries[0]) addPowerUp(entries[0].userCode, 'rowBreak', 5);
                if (entries[0]) addPowerUp(entries[0].userCode, 'shuffleBlocks', 5);
                
                if (entries[1]) addPowerUp(entries[1].userCode, 'blockBreak', 3);
                if (entries[1]) addPowerUp(entries[1].userCode, 'columnBreak', 3);
                if (entries[1]) addPowerUp(entries[1].userCode, 'rowBreak', 3);
                if (entries[1]) addPowerUp(entries[1].userCode, 'shuffleBlocks', 3);
                
                if (entries[2]) addPowerUp(entries[2].userCode, 'blockBreak', 2);
                if (entries[2]) addPowerUp(entries[2].userCode, 'columnBreak', 2);
                if (entries[2]) addPowerUp(entries[2].userCode, 'rowBreak', 2);
                if (entries[2]) addPowerUp(entries[2].userCode, 'shuffleBlocks', 2);
            }
            
            localStorage.removeItem(getLeaderboardKey(mode));
        });
        
        localStorage.setItem(LAST_RESET_KEY, currentMonth);
    }
}

export function getPlayerProgress(userCode: string): PlayerProgress | null {
    const saved = localStorage.getItem(PLAYER_PROGRESS_KEY);
    if (!saved) return null;
    
    try {
        const allProgress = JSON.parse(saved) as Record<string, PlayerProgress>;
        return allProgress[userCode] || null;
    } catch {
        return null;
    }
}

export function getPowerUps(userCode: string): PowerUp[] {
    const progress = getPlayerProgress(userCode);
    return progress?.powerUps || [];
}

function updatePlayerLevel(userCode: string, level: number): void {
    const saved = localStorage.getItem(PLAYER_PROGRESS_KEY);
    let allProgress: Record<string, PlayerProgress> = {};
    
    if (saved) {
        try {
            allProgress = JSON.parse(saved);
        } catch {
            allProgress = {};
        }
    }
    
    if (!allProgress[userCode]) {
        allProgress[userCode] = {
            level: 1,
            powerUps: [],
        };
    }
    
    if (level > allProgress[userCode].level) {
        allProgress[userCode].level = level;
    }
    
    localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(allProgress));
}

export function addPowerUp(userCode: string, type: PowerUp['type'], count: number = 1): void {
    const saved = localStorage.getItem(PLAYER_PROGRESS_KEY);
    let allProgress: Record<string, PlayerProgress> = {};
    
    if (saved) {
        try {
            allProgress = JSON.parse(saved);
        } catch {
            allProgress = {};
        }
    }
    
    if (!allProgress[userCode]) {
        allProgress[userCode] = {
            level: 1,
            powerUps: [],
        };
    }
    
    const existingPowerUp = allProgress[userCode].powerUps.find(p => p.type === type);
    if (existingPowerUp) {
        existingPowerUp.count += count;
    } else {
        allProgress[userCode].powerUps.push({ type, count });
    }
    
    localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(allProgress));
}

export function consumePowerUp(userCode: string, type: PowerUp['type']): boolean {
    const saved = localStorage.getItem(PLAYER_PROGRESS_KEY);
    if (!saved) return false;
    
    try {
        const allProgress = JSON.parse(saved) as Record<string, PlayerProgress>;
        const progress = allProgress[userCode];
        
        if (!progress) return false;
        
        const powerUp = progress.powerUps.find(p => p.type === type);
        if (!powerUp || powerUp.count <= 0) return false;
        
        powerUp.count--;
        localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(allProgress));
        return true;
    } catch {
        return false;
    }
}

export function getPowerUpImage(type: PowerUp['type']): string {
    switch (type) {
        case 'blockBreak':
            return '/assets/generated/break-block-powerup-transparent.dim_64x64.png';
        case 'columnBreak':
            return '/assets/generated/column-break-powerup-transparent.dim_64x64.png';
        case 'rowBreak':
            return '/assets/generated/row-break-powerup-transparent.dim_64x64.png';
        case 'shuffleBlocks':
            return '/assets/generated/shuffle-powerup-transparent.dim_64x64.png';
        default:
            return '/assets/generated/break-block-powerup-transparent.dim_64x64.png';
    }
}

export function getBadgeForLevel(level: number): { name: string; image: string } {
    if (level >= 9) return { name: 'Diamond', image: '/assets/generated/diamond-badge-transparent.dim_128x128.png' };
    if (level >= 7) return { name: 'Platinum', image: '/assets/generated/platinum-badge-transparent.dim_128x128.png' };
    if (level >= 5) return { name: 'Gold', image: '/assets/generated/gold-badge-transparent.dim_128x128.png' };
    if (level >= 3) return { name: 'Silver', image: '/assets/generated/silver-badge-transparent.dim_128x128.png' };
    return { name: 'Bronze', image: '/assets/generated/bronze-badge-transparent.dim_128x128.png' };
}

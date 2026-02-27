import { type PowerUp } from './leaderboard';

export function generateUserCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    
    return code;
}

export interface UserData {
    username: string;
    code: string;
    createdAt: string;
}

export function saveUser(userData: UserData): void {
    localStorage.setItem('blockverse-user', JSON.stringify(userData));
}

export function getUser(): UserData | null {
    const saved = localStorage.getItem('blockverse-user');
    if (!saved) return null;
    
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

export function clearUser(): void {
    localStorage.removeItem('blockverse-user');
}

// Initialize starter power-ups for new users - 3 of each type (total 12)
export function initializeStarterPowerUps(userCode: string): void {
    const starterPowerUps: PowerUp[] = [
        { type: 'blockBreak', count: 3 },
        { type: 'columnBreak', count: 3 },
        { type: 'rowBreak', count: 3 },
        { type: 'shuffleBlocks', count: 3 },
    ];
    
    // Check if user already has power-ups initialized
    const existingProgress = localStorage.getItem(`blockverse-progress-${userCode}`);
    
    if (!existingProgress) {
        // Create new player progress with starter power-ups
        const newProgress = {
            userCode,
            level: 1,
            badge: 'bronze' as const,
            powerUps: starterPowerUps,
        };
        localStorage.setItem(`blockverse-progress-${userCode}`, JSON.stringify(newProgress));
    }
}

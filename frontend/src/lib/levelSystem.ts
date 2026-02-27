export interface LevelConfig {
    level: number;
    backgroundImage: string;
    particleImage: string;
    blockColors: string[];
    difficulty: {
        minShapeComplexity: number;
        maxShapeComplexity: number;
        colorCount: number;
        powerUpDropRate: number; // Percentage of base rate
    };
    visualEffects: {
        glowIntensity: number;
        particleCount: number;
        animationSpeed: number;
    };
    rewards: {
        bonusPointsMultiplier: number;
        powerUpChance: number;
    };
    scoreThreshold: number; // Score needed to reach this level
}

// Enhanced vivid and colorful base colors with bright, saturated neon tones
const BASE_COLORS = [
    'from-red-500 via-red-400 to-rose-500',
    'from-blue-500 via-blue-400 to-indigo-500',
    'from-green-500 via-green-400 to-emerald-500',
    'from-yellow-400 via-yellow-300 to-amber-400',
    'from-purple-500 via-purple-400 to-violet-500',
    'from-pink-500 via-pink-400 to-fuchsia-500',
    'from-cyan-400 via-cyan-300 to-teal-400',
    'from-orange-500 via-orange-400 to-red-500',
];

// Advanced colors with enhanced vibrancy and neon effects
const ADVANCED_COLORS = [
    ...BASE_COLORS,
    'from-lime-400 via-lime-300 to-green-400',
    'from-sky-400 via-sky-300 to-blue-400',
    'from-violet-500 via-violet-400 to-purple-500',
    'from-rose-500 via-rose-400 to-pink-500',
    'from-emerald-400 via-emerald-300 to-teal-400',
    'from-fuchsia-500 via-fuchsia-400 to-pink-500',
];

// Expert colors with maximum saturation and vivid gradients
const EXPERT_COLORS = [
    ...ADVANCED_COLORS,
    'from-amber-400 via-amber-300 to-orange-400',
    'from-teal-400 via-teal-300 to-cyan-400',
    'from-indigo-500 via-indigo-400 to-blue-500',
    'from-red-500 via-red-400 to-pink-500',
    'from-green-400 via-green-300 to-lime-400',
    'from-blue-400 via-blue-300 to-sky-400',
    'from-purple-500 via-purple-400 to-fuchsia-500',
    'from-yellow-400 via-yellow-300 to-lime-400',
];

// Master colors with electric and neon tones
const MASTER_COLORS = [
    ...EXPERT_COLORS,
    'from-pink-500 via-fuchsia-500 to-purple-600',
    'from-cyan-400 via-blue-500 to-indigo-600',
    'from-lime-400 via-green-500 to-emerald-600',
    'from-orange-400 via-red-500 to-pink-600',
    'from-yellow-300 via-amber-400 to-orange-500',
    'from-teal-400 via-cyan-500 to-blue-600',
];

export const LEVEL_CONFIGS: { [key: number]: LevelConfig } = {
    1: {
        level: 1,
        backgroundImage: '/assets/generated/level-1-background-clean.dim_800x600.png',
        particleImage: '/assets/generated/level-1-particles-transparent.dim_200x200.png',
        blockColors: BASE_COLORS.slice(0, 5),
        difficulty: {
            minShapeComplexity: 1,
            maxShapeComplexity: 3,
            colorCount: 5,
            powerUpDropRate: 1.0,
        },
        visualEffects: {
            glowIntensity: 0.3,
            particleCount: 3,
            animationSpeed: 1.0,
        },
        rewards: {
            bonusPointsMultiplier: 1.0,
            powerUpChance: 0.05,
        },
        scoreThreshold: 0,
    },
    2: {
        level: 2,
        backgroundImage: '/assets/generated/level-2-background-clean.dim_800x600.png',
        particleImage: '/assets/generated/level-2-particles-transparent.dim_200x200.png',
        blockColors: BASE_COLORS.slice(0, 6),
        difficulty: {
            minShapeComplexity: 1,
            maxShapeComplexity: 3,
            colorCount: 6,
            powerUpDropRate: 1.0,
        },
        visualEffects: {
            glowIntensity: 0.35,
            particleCount: 4,
            animationSpeed: 1.05,
        },
        rewards: {
            bonusPointsMultiplier: 1.05,
            powerUpChance: 0.06,
        },
        scoreThreshold: 500,
    },
    3: {
        level: 3,
        backgroundImage: '/assets/generated/level-3-background-clean.dim_800x600.png',
        particleImage: '/assets/generated/level-3-particles-transparent.dim_200x200.png',
        blockColors: BASE_COLORS,
        difficulty: {
            minShapeComplexity: 1,
            maxShapeComplexity: 3,
            colorCount: 8,
            powerUpDropRate: 1.0,
        },
        visualEffects: {
            glowIntensity: 0.4,
            particleCount: 5,
            animationSpeed: 1.1,
        },
        rewards: {
            bonusPointsMultiplier: 1.1,
            powerUpChance: 0.08,
        },
        scoreThreshold: 1500,
    },
    4: {
        level: 4,
        backgroundImage: '/assets/generated/level-4-background-clean.dim_800x600.png',
        particleImage: '/assets/generated/level-4-particles-transparent.dim_200x200.png',
        blockColors: ADVANCED_COLORS.slice(0, 10),
        difficulty: {
            minShapeComplexity: 2,
            maxShapeComplexity: 5,
            colorCount: 10,
            powerUpDropRate: 0.85,
        },
        visualEffects: {
            glowIntensity: 0.5,
            particleCount: 7,
            animationSpeed: 1.15,
        },
        rewards: {
            bonusPointsMultiplier: 1.15,
            powerUpChance: 0.10,
        },
        scoreThreshold: 3000,
    },
    5: {
        level: 5,
        backgroundImage: '/assets/generated/level-5-background-clean.dim_800x600.png',
        particleImage: '/assets/generated/level-5-particles-transparent.dim_200x200.png',
        blockColors: ADVANCED_COLORS,
        difficulty: {
            minShapeComplexity: 3,
            maxShapeComplexity: 6,
            colorCount: 14,
            powerUpDropRate: 0.8,
        },
        visualEffects: {
            glowIntensity: 0.55,
            particleCount: 8,
            animationSpeed: 1.2,
        },
        rewards: {
            bonusPointsMultiplier: 1.2,
            powerUpChance: 0.12,
        },
        scoreThreshold: 5000,
    },
    6: {
        level: 6,
        backgroundImage: '/assets/generated/level-6-background.dim_800x600.png',
        particleImage: '/assets/generated/level-1-particles-transparent.dim_200x200.png',
        blockColors: EXPERT_COLORS.slice(0, 18),
        difficulty: {
            minShapeComplexity: 3,
            maxShapeComplexity: 6,
            colorCount: 18,
            powerUpDropRate: 0.75,
        },
        visualEffects: {
            glowIntensity: 0.6,
            particleCount: 10,
            animationSpeed: 1.25,
        },
        rewards: {
            bonusPointsMultiplier: 1.25,
            powerUpChance: 0.14,
        },
        scoreThreshold: 8000,
    },
    7: {
        level: 7,
        backgroundImage: '/assets/generated/level-7-background.dim_800x600.png',
        particleImage: '/assets/generated/level-2-particles-transparent.dim_200x200.png',
        blockColors: EXPERT_COLORS,
        difficulty: {
            minShapeComplexity: 4,
            maxShapeComplexity: 8,
            colorCount: 22,
            powerUpDropRate: 0.7,
        },
        visualEffects: {
            glowIntensity: 0.65,
            particleCount: 12,
            animationSpeed: 1.3,
        },
        rewards: {
            bonusPointsMultiplier: 1.3,
            powerUpChance: 0.16,
        },
        scoreThreshold: 12000,
    },
    8: {
        level: 8,
        backgroundImage: '/assets/generated/level-8-background.dim_800x600.png',
        particleImage: '/assets/generated/level-3-particles-transparent.dim_200x200.png',
        blockColors: MASTER_COLORS.slice(0, 24),
        difficulty: {
            minShapeComplexity: 5,
            maxShapeComplexity: 9,
            colorCount: 24,
            powerUpDropRate: 0.6,
        },
        visualEffects: {
            glowIntensity: 0.7,
            particleCount: 14,
            animationSpeed: 1.35,
        },
        rewards: {
            bonusPointsMultiplier: 1.35,
            powerUpChance: 0.18,
        },
        scoreThreshold: 17000,
    },
    9: {
        level: 9,
        backgroundImage: '/assets/generated/level-9-background.dim_800x600.png',
        particleImage: '/assets/generated/level-4-particles-transparent.dim_200x200.png',
        blockColors: MASTER_COLORS,
        difficulty: {
            minShapeComplexity: 6,
            maxShapeComplexity: 10,
            colorCount: 28,
            powerUpDropRate: 0.55,
        },
        visualEffects: {
            glowIntensity: 0.75,
            particleCount: 16,
            animationSpeed: 1.4,
        },
        rewards: {
            bonusPointsMultiplier: 1.4,
            powerUpChance: 0.20,
        },
        scoreThreshold: 25000,
    },
    10: {
        level: 10,
        backgroundImage: '/assets/generated/level-10-background.dim_800x600.png',
        particleImage: '/assets/generated/level-5-particles-transparent.dim_200x200.png',
        blockColors: MASTER_COLORS,
        difficulty: {
            minShapeComplexity: 7,
            maxShapeComplexity: 10,
            colorCount: 28,
            powerUpDropRate: 0.5,
        },
        visualEffects: {
            glowIntensity: 0.8,
            particleCount: 20,
            animationSpeed: 1.5,
        },
        rewards: {
            bonusPointsMultiplier: 1.5,
            powerUpChance: 0.25,
        },
        scoreThreshold: 35000,
    },
};

export function getLevelConfig(playerLevel: number): LevelConfig {
    // Clamp level between 1 and 10
    const level = Math.min(10, Math.max(1, playerLevel));
    return LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
}

export function getLevelFromScore(score: number): number {
    // Determine level based on score thresholds
    for (let level = 10; level >= 1; level--) {
        if (score >= LEVEL_CONFIGS[level].scoreThreshold) {
            return level;
        }
    }
    return 1;
}

export function getNextLevelThreshold(currentLevel: number): number | null {
    if (currentLevel >= 10) return null;
    return LEVEL_CONFIGS[currentLevel + 1].scoreThreshold;
}

export function shouldShowLevelTransition(oldScore: number, newScore: number): { shouldShow: boolean; newLevel: number } {
    const oldLevel = getLevelFromScore(oldScore);
    const newLevel = getLevelFromScore(newScore);
    
    return {
        shouldShow: newLevel > oldLevel,
        newLevel,
    };
}

export function getBadgeForLevel(level: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (level >= 9) return 'diamond';
    if (level >= 7) return 'platinum';
    if (level >= 5) return 'gold';
    if (level >= 3) return 'silver';
    return 'bronze';
}

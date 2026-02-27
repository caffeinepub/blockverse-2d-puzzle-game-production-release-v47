import { getLevelConfig } from './levelSystem';

export interface BlockShape {
    shape: number[][];
    color: string;
}

// Enhanced block shapes with progressive complexity for 10-level system
// Complexity levels: 1-3 (Basic), 4-6 (Mid-Difficulty), 7-10 (Advanced)

const BLOCK_SHAPES: number[][][] = [
    // LEVELS 1-3: Basic Blocks (Complexity 1-3)
    // Single block - complexity 1
    [[1]],
    
    // 2x1 horizontal - complexity 1
    [[1, 1]],
    
    // 2x1 vertical - complexity 1
    [[1], [1]],
    
    // 2x2 square - complexity 2
    [[1, 1], [1, 1]],
    
    // 3x1 horizontal - complexity 2
    [[1, 1, 1]],
    
    // 3x1 vertical - complexity 2
    [[1], [1], [1]],
    
    // Small L shape - complexity 3
    [[1, 0], [1, 1]],
    
    // Small reverse L - complexity 3
    [[0, 1], [1, 1]],
    
    // Basic T shape (3-cell) - complexity 3
    [[1, 1, 1], [0, 1, 0]],
    
    // LEVELS 4-6: Mid-Difficulty Blocks (Complexity 4-6)
    // Standard L shape - complexity 4
    [[1, 0], [1, 0], [1, 1]],
    
    // Standard reverse L - complexity 4
    [[0, 1], [0, 1], [1, 1]],
    
    // Z shape - complexity 4
    [[1, 1, 0], [0, 1, 1]],
    
    // S shape - complexity 4
    [[0, 1, 1], [1, 1, 0]],
    
    // Extended L (5-cell) - complexity 5
    [[1, 0], [1, 0], [1, 0], [1, 1]],
    
    // Extended reverse L (5-cell) - complexity 5
    [[0, 1], [0, 1], [0, 1], [1, 1]],
    
    // Large T shape (5-cell cross) - complexity 5
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    
    // 4x1 horizontal line - complexity 5
    [[1, 1, 1, 1]],
    
    // 4x1 vertical line - complexity 5
    [[1], [1], [1], [1]],
    
    // Corner piece - complexity 6
    [[1, 1], [1, 0]],
    
    // Reverse corner - complexity 6
    [[1, 1], [0, 1]],
    
    // Wide Z shape - complexity 6
    [[1, 1, 0, 0], [0, 1, 1, 0]],
    
    // Wide S shape - complexity 6
    [[0, 1, 1, 0], [1, 1, 0, 0]],
    
    // LEVELS 7-10: Advanced Complex Blocks (Complexity 7-10)
    // 3x3 cube (9-cell) - complexity 7
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    
    // Large plus/cross (7-cell) - complexity 7
    [[0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    
    // Compact plus (5-cell) - complexity 7
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    
    // Large L (6-cell) - complexity 8
    [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
    
    // Large reverse L (6-cell) - complexity 8
    [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
    
    // U-shape (6-cell) - complexity 8
    [[1, 0, 1], [1, 0, 1], [1, 1, 1]],
    
    // Pyramid (6-cell) - complexity 8
    [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 1]],
    
    // Complex zigzag (7-cell) - complexity 9
    [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]],
    
    // Staircase (6-cell) - complexity 9
    [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
    
    // T-junction (7-cell) - complexity 9
    [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    
    // Diamond (5-cell) - complexity 9
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    
    // Large cross (9-cell) - complexity 10
    [[0, 1, 0], [0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0]],
    
    // Complex L-junction (8-cell) - complexity 10
    [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0]],
    
    // Irregular shape (8-cell) - complexity 10
    [[1, 1, 0], [1, 1, 1], [0, 0, 1]],
    
    // Large zigzag (8-cell) - complexity 10
    [[1, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1]],
];

// Map complexity levels to block indices for level-based filtering
const COMPLEXITY_MAP = {
    1: [0, 1, 2], // Single, 2x1 blocks
    2: [3, 4, 5], // 2x2, 3x1 blocks
    3: [6, 7, 8], // Small L, T shapes
    4: [9, 10, 11, 12], // Standard L, Z, S shapes
    5: [13, 14, 15, 16, 17], // Extended L, large T, 4x1 lines
    6: [18, 19, 20, 21], // Corners, wide Z/S
    7: [22, 23, 24], // 3x3 cube, large plus, compact plus
    8: [25, 26, 27, 28], // Large L, U-shape, pyramid
    9: [29, 30, 31, 32], // Complex zigzag, staircase, T-junction, diamond
    10: [33, 34, 35, 36], // Large cross, complex L-junction, irregular shapes
};

export function generateBlockSet(playerLevel: number = 1): BlockShape[] {
    const levelConfig = getLevelConfig(playerLevel);
    const blocks: BlockShape[] = [];
    
    // Build available shapes based on min/max complexity
    const availableIndices: number[] = [];
    for (let complexity = levelConfig.difficulty.minShapeComplexity; complexity <= levelConfig.difficulty.maxShapeComplexity; complexity++) {
        const indices = COMPLEXITY_MAP[complexity as keyof typeof COMPLEXITY_MAP] || [];
        availableIndices.push(...indices);
    }
    
    // Filter to valid indices
    const validIndices = availableIndices.filter(idx => idx < BLOCK_SHAPES.length);
    
    // Fallback to basic shapes if no valid indices
    const shapesToUse = validIndices.length > 0 ? validIndices : [0, 1, 2, 3, 4, 5];
    
    // Get available colors based on level
    const availableColors = levelConfig.blockColors;
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = shapesToUse[Math.floor(Math.random() * shapesToUse.length)];
        const randomShape = BLOCK_SHAPES[randomIndex];
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        
        blocks.push({
            shape: randomShape,
            color: randomColor,
        });
    }
    
    return blocks;
}

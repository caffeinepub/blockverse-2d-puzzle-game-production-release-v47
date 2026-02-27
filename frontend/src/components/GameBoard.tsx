import { useState, useCallback, useEffect, useRef } from 'react';
import { canPlaceBlock, placeBlock, clearLines, calculateScore } from '@/lib/gameLogic';
import { type BlockShape } from '@/lib/blockShapes';
import { playSound } from '@/lib/sounds';
import type { Theme } from '@/pages/Game';
import type { PowerUp } from '@/lib/leaderboard';
import type { LevelConfig } from '@/lib/levelSystem';
import type { GameMode } from '@/App';
import type { MovingObstacle, FallingBlock } from '@/pages/Game';

interface GameBoardProps {
    board: (number | string)[][];
    selectedBlock: BlockShape | null;
    onBlockPlaced: (newBoard: (number | string)[][], points: number, linesCleared: number) => void;
    theme: Theme;
    activePowerUp?: PowerUp['type'] | null;
    onPowerUpUsed?: (newBoard: (number | string)[][], points: number, linesCleared: number) => void;
    levelConfig: LevelConfig;
    gameMode?: GameMode;
    movingObstacles?: MovingObstacle[];
    fallingBlocks?: FallingBlock[];
}

export function GameBoard({ 
    board, 
    selectedBlock, 
    onBlockPlaced, 
    theme, 
    activePowerUp, 
    onPowerUpUsed, 
    levelConfig,
    gameMode,
    movingObstacles = [],
    fallingBlocks = []
}: GameBoardProps) {
    const [hoverPosition, setHoverPosition] = useState<{ row: number; col: number } | null>(null);
    const [canPlace, setCanPlace] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const touchStartTimeRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);

    // Check if position is blocked by moving obstacle
    const isObstacleAt = useCallback((row: number, col: number): boolean => {
        if (gameMode !== 'advancedStrategy') return false;
        return movingObstacles.some(obs => obs.row === row && obs.col === col);
    }, [gameMode, movingObstacles]);

    useEffect(() => {
        if (hoverPosition && selectedBlock) {
            // Check if any cell would overlap with obstacle
            let valid = canPlaceBlock(board, selectedBlock, hoverPosition.row, hoverPosition.col);
            
            if (valid && gameMode === 'advancedStrategy') {
                const { shape } = selectedBlock;
                for (let row = 0; row < shape.length; row++) {
                    for (let col = 0; col < shape[row].length; col++) {
                        if (shape[row][col] === 1) {
                            const boardRow = hoverPosition.row + row;
                            const boardCol = hoverPosition.col + col;
                            if (isObstacleAt(boardRow, boardCol)) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    if (!valid) break;
                }
            }
            
            setCanPlace(valid);
        } else {
            setCanPlace(false);
        }
    }, [hoverPosition, selectedBlock, board, gameMode, isObstacleAt]);

    const handleCellClick = useCallback((row: number, col: number) => {
        // Handle Block Break power-up
        if (activePowerUp === 'blockBreak') {
            if (board[row][col] !== 0) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = 0;
                playSound('powerUp');
                if (onPowerUpUsed) {
                    onPowerUpUsed(newBoard, 10, 0);
                }
            }
            return;
        }

        // Handle Column Break power-up
        if (activePowerUp === 'columnBreak') {
            const newBoard = board.map(r => [...r]);
            let blocksCleared = 0;
            
            // Clear entire column
            for (let r = 0; r < newBoard.length; r++) {
                if (newBoard[r][col] !== 0) {
                    newBoard[r][col] = 0;
                    blocksCleared++;
                }
            }
            
            if (blocksCleared > 0) {
                playSound('powerUp');
                const points = blocksCleared * 10;
                if (onPowerUpUsed) {
                    onPowerUpUsed(newBoard, points, 0);
                }
            }
            return;
        }

        // Handle Row Break power-up
        if (activePowerUp === 'rowBreak') {
            const newBoard = board.map(r => [...r]);
            let blocksCleared = 0;
            
            // Clear entire row
            for (let c = 0; c < newBoard[row].length; c++) {
                if (newBoard[row][c] !== 0) {
                    newBoard[row][c] = 0;
                    blocksCleared++;
                }
            }
            
            if (blocksCleared > 0) {
                playSound('powerUp');
                const points = blocksCleared * 10;
                if (onPowerUpUsed) {
                    onPowerUpUsed(newBoard, points, 0);
                }
            }
            return;
        }

        if (!selectedBlock) return;

        // Check obstacle collision for Advanced Strategy Mode
        if (gameMode === 'advancedStrategy') {
            const { shape } = selectedBlock;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] === 1) {
                        const boardRow = row + r;
                        const boardCol = col + c;
                        if (isObstacleAt(boardRow, boardCol)) {
                            playSound('button'); // Error sound
                            return;
                        }
                    }
                }
            }
        }

        if (canPlaceBlock(board, selectedBlock, row, col)) {
            playSound('place');
            
            const newBoard = placeBlock(board, selectedBlock, row, col);
            const { clearedBoard, linesCleared } = clearLines(newBoard);
            
            if (linesCleared > 0) {
                playSound('clear', levelConfig.level);
            }
            
            const points = calculateScore(linesCleared);
            onBlockPlaced(clearedBoard, points, linesCleared);
        }
    }, [selectedBlock, board, onBlockPlaced, activePowerUp, onPowerUpUsed, levelConfig, gameMode, isObstacleAt]);

    const getCellFromPoint = useCallback((x: number, y: number): { row: number; col: number } | null => {
        if (!boardRef.current) return null;
        
        const rect = boardRef.current.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        if (relativeX < 0 || relativeY < 0 || relativeX > rect.width || relativeY > rect.height) {
            return null;
        }
        
        const col = Math.floor((relativeX / rect.width) * 8);
        const row = Math.floor((relativeY / rect.height) * 8);
        
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return { row, col };
        }
        
        return null;
    }, []);

    const updateHoverPosition = useCallback((x: number, y: number) => {
        // Use requestAnimationFrame for smooth 60fps updates
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
            const cell = getCellFromPoint(x, y);
            if (cell) {
                setHoverPosition(cell);
            } else if (isDraggingRef.current) {
                setHoverPosition(null);
            }
            rafIdRef.current = null;
        });
    }, [getCellFromPoint]);

    const handleCellHover = useCallback((row: number, col: number) => {
        if (selectedBlock || activePowerUp) {
            setHoverPosition({ row, col });
        }
    }, [selectedBlock, activePowerUp]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (selectedBlock || activePowerUp) {
            updateHoverPosition(e.clientX, e.clientY);
        }
    }, [selectedBlock, activePowerUp, updateHoverPosition]);

    const handleMouseLeave = useCallback(() => {
        if (!isDraggingRef.current) {
            setHoverPosition(null);
        }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!selectedBlock && !activePowerUp) return;
        
        isDraggingRef.current = true;
        touchStartTimeRef.current = Date.now();
        
        const touch = e.touches[0];
        updateHoverPosition(touch.clientX, touch.clientY);
    }, [selectedBlock, activePowerUp, updateHoverPosition]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!selectedBlock && !activePowerUp) return;
        
        // Prevent scrolling while dragging - critical for mobile
        e.preventDefault();
        
        if (!isDraggingRef.current) {
            isDraggingRef.current = true;
        }
        
        const touch = e.touches[0];
        updateHoverPosition(touch.clientX, touch.clientY);
    }, [selectedBlock, activePowerUp, updateHoverPosition]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const touchDuration = Date.now() - touchStartTimeRef.current;
        
        // Only trigger placement if we have a valid hover position
        if (hoverPosition && isDraggingRef.current) {
            // Allow placement for both quick taps and drags
            if (touchDuration < 1000) {
                handleCellClick(hoverPosition.row, hoverPosition.col);
            }
        }
        
        isDraggingRef.current = false;
        setHoverPosition(null);
        
        // Clean up any pending animation frames
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }, [hoverPosition, handleCellClick]);

    const handleTouchCancel = useCallback(() => {
        isDraggingRef.current = false;
        setHoverPosition(null);
        
        // Clean up any pending animation frames
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    const getCellClass = (row: number, col: number) => {
        const cellValue = board[row][col];
        const isOccupied = cellValue !== 0;
        const isHovered = hoverPosition?.row === row && hoverPosition?.col === col;
        const isPreview = hoverPosition && selectedBlock && !isOccupied &&
            row >= hoverPosition.row &&
            row < hoverPosition.row + selectedBlock.shape.length &&
            col >= hoverPosition.col &&
            col < hoverPosition.col + selectedBlock.shape[0].length &&
            selectedBlock.shape[row - hoverPosition.row][col - hoverPosition.col] === 1;
        
        // Check if this cell has a moving obstacle
        const hasObstacle = isObstacleAt(row, col);
        
        // Check if this cell has a falling block
        const fallingBlock = fallingBlocks.find(fb => fb.row === row && fb.col === col);

        let baseClass = 'game-cell aspect-square rounded-sm sm:rounded-md transition-all duration-100';

        // Moving obstacle styling
        if (hasObstacle) {
            baseClass += ' relative';
            switch (theme) {
                case 'light':
                    baseClass += ' bg-gray-400/80 border-2 border-gray-600';
                    break;
                case 'dark':
                    baseClass += ' bg-gray-600/80 border-2 border-gray-400';
                    break;
                case 'neon':
                    baseClass += ' bg-purple-600/80 border-2 border-pink-400 shadow-lg shadow-purple-500/50';
                    break;
            }
        }
        // Falling block styling
        else if (fallingBlock) {
            baseClass += ` bg-gradient-to-br ${fallingBlock.color} shadow-lg animate-pulse border-2 border-yellow-400`;
        }
        // Regular occupied cell
        else if (isOccupied) {
            const glowIntensity = levelConfig.visualEffects.glowIntensity;
            
            // Use the stored color gradient if it's a string, otherwise use theme-based color
            if (typeof cellValue === 'string') {
                // Cell has its original block color stored
                baseClass += ` bg-gradient-to-br ${cellValue} shadow-md`;
                
                // Add glow effect based on theme
                if (theme === 'dark' && glowIntensity > 0.5) {
                    baseClass += ' shadow-cyan-500/30';
                } else if (theme === 'neon') {
                    baseClass += ` shadow-lg shadow-pink-500/${Math.floor(glowIntensity * 100)}`;
                }
            } else {
                // Fallback to theme-based colors for legacy cells
                switch (theme) {
                    case 'light':
                        baseClass += ` bg-gradient-to-br from-purple-500 to-pink-500 shadow-md`;
                        if (glowIntensity > 0.5) {
                            baseClass += ' shadow-purple-500/50';
                        }
                        break;
                    case 'dark':
                        baseClass += ` bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md shadow-cyan-500/${Math.floor(glowIntensity * 100)}`;
                        break;
                    case 'neon':
                        baseClass += ` bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg shadow-pink-500/${Math.floor(glowIntensity * 100)}`;
                        break;
                }
            }
            
            // Highlight blocks that can be broken
            if (activePowerUp === 'blockBreak' && isHovered) {
                baseClass += ' ring-4 ring-red-500 ring-offset-2 scale-110 animate-pulse';
            }
        } else if (isPreview && canPlace) {
            // Enhanced preview visibility with stronger opacity and border
            // Use the selected block's color for preview
            if (selectedBlock) {
                baseClass += ` bg-gradient-to-br ${selectedBlock.color} opacity-70 border-2 shadow-lg`;
                
                // Add theme-specific border color
                switch (theme) {
                    case 'light':
                        baseClass += ' border-purple-600';
                        break;
                    case 'dark':
                        baseClass += ' border-cyan-300 shadow-cyan-400/60';
                        break;
                    case 'neon':
                        baseClass += ' border-pink-300 shadow-xl shadow-[0_0_20px_rgba(236,72,153,0.7)]';
                        break;
                }
            }
        } else if (isPreview && !canPlace) {
            baseClass += ' bg-red-400/70 border-2 border-red-500 shadow-lg';
        } else {
            switch (theme) {
                case 'light':
                    baseClass += ' bg-white/40 hover:bg-white/60';
                    break;
                case 'dark':
                    baseClass += ' bg-gray-700/40 hover:bg-gray-600/60';
                    break;
                case 'neon':
                    baseClass += ' bg-black/40 hover:bg-black/60 border border-pink-500/20';
                    break;
            }
        }

        // Highlight column for columnBreak power-up
        if (activePowerUp === 'columnBreak' && hoverPosition?.col === col) {
            baseClass += ' ring-2 ring-yellow-400 ring-inset';
        }

        // Highlight row for rowBreak power-up
        if (activePowerUp === 'rowBreak' && hoverPosition?.row === row) {
            baseClass += ' ring-2 ring-orange-400 ring-inset';
        }

        return baseClass;
    };

    const getBoardClass = () => {
        const glowIntensity = levelConfig.visualEffects.glowIntensity;
        let baseClass = 'game-board bg-gradient-to-br backdrop-blur-sm shadow-2xl border-4';
        
        switch (theme) {
            case 'light':
                baseClass += ' from-blue-200/50 to-purple-200/50 border-white/50';
                break;
            case 'dark':
                baseClass += ` from-gray-800/80 to-gray-900/80 border-gray-700/50`;
                if (glowIntensity > 0.5) {
                    baseClass += ' shadow-cyan-500/30';
                }
                break;
            case 'neon':
                baseClass += ` from-black/80 to-purple-900/50 border-pink-500/50 shadow-[0_0_${Math.floor(glowIntensity * 50)}px_rgba(236,72,153,${glowIntensity * 0.5})]`;
                break;
            default:
                baseClass += ' from-blue-200/50 to-purple-200/50 border-white/50';
        }

        // Add special border for active power-ups
        if (activePowerUp === 'blockBreak') {
            baseClass += ' ring-4 ring-red-500 ring-offset-4 ring-offset-transparent';
        } else if (activePowerUp === 'columnBreak') {
            baseClass += ' ring-4 ring-yellow-500 ring-offset-4 ring-offset-transparent';
        } else if (activePowerUp === 'rowBreak') {
            baseClass += ' ring-4 ring-orange-500 ring-offset-4 ring-offset-transparent';
        }

        return baseClass;
    };

    const getCursorClass = () => {
        if (activePowerUp === 'blockBreak') {
            return 'cursor-crosshair';
        }
        if (activePowerUp === 'columnBreak' || activePowerUp === 'rowBreak') {
            return 'cursor-pointer';
        }
        return selectedBlock ? 'cursor-pointer' : 'cursor-default';
    };

    return (
        <div 
            ref={boardRef}
            className={`grid grid-cols-8 gap-0.5 sm:gap-1.5 md:gap-2 p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl w-full max-w-[min(88vw,500px)] aspect-square transition-all duration-300 overflow-hidden ${getBoardClass()} ${getCursorClass()}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
        >
            {board.map((row, rowIndex) =>
                row.map((_, colIndex) => {
                    const hasObstacle = isObstacleAt(rowIndex, colIndex);
                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={getCellClass(rowIndex, colIndex)}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                        >
                            {hasObstacle && (
                                <img 
                                    src="/assets/generated/moving-obstacle-indicator-transparent.dim_64x64.png"
                                    alt="Obstacle"
                                    className="absolute inset-0 w-full h-full object-contain p-0.5 animate-pulse"
                                />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

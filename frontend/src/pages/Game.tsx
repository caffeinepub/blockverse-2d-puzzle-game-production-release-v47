import { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { BlockPicker } from '@/components/BlockPicker';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { GameOver } from '@/components/GameOver';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SoundToggle } from '@/components/SoundToggle';
import { Leaderboard } from '@/components/Leaderboard';
import { PowerUpBar } from '@/components/PowerUpBar';
import { LeaderboardButton } from '@/components/LeaderboardButton';
import { DailyMissionsButton } from '@/components/DailyMissionsButton';
import { DailyMissionsModal } from '@/components/DailyMissionsModal';
import { UserProfile } from '@/components/UserProfile';
import { LevelTransition } from '@/components/LevelTransition';
import { DailyRewardModal, type DailyReward } from '@/components/DailyRewardModal';
import { ParticleEffect } from '@/components/ParticleEffect';
import { MobileInterstitialAd } from '@/components/ads/MobileInterstitialAd';
import { TimerDisplay } from '@/components/TimerDisplay';
import { AdvancedStrategyIndicators } from '@/components/AdvancedStrategyIndicators';
import { useOfflineMode } from '@/contexts/OfflineModeContext';
import { generateBlockSet, type BlockShape } from '@/lib/blockShapes';
import { checkGameOver } from '@/lib/gameLogic';
import { getUser } from '@/lib/userAuth';
import { updateLeaderboard, checkAndResetMonth, getPlayerProgress, type PowerUp, addPowerUp } from '@/lib/leaderboard';
import { playSound, initSoundPreference } from '@/lib/sounds';
import { getLevelConfig, getLevelFromScore, shouldShowLevelTransition } from '@/lib/levelSystem';
import { preloadAds } from '@/lib/mobileAds';
import { updateMissionProgress, getDailyMissions } from '@/lib/dailyMissions';
import type { GameMode } from '@/App';

export type Theme = 'light' | 'dark' | 'neon';

export interface MovingObstacle {
    row: number;
    col: number;
    id: string;
}

export interface FallingBlock {
    row: number;
    col: number;
    id: string;
    color: string;
}

interface GameProps {
    onLogout: () => void;
    gameMode: GameMode;
    onBackToModeSelection: () => void;
}

export function Game({ onLogout, gameMode, onBackToModeSelection }: GameProps) {
    const { isOffline } = useOfflineMode();
    const [theme, setTheme] = useState<Theme>('light');
    const [board, setBoard] = useState<(number | string)[][]>(() => 
        Array(8).fill(null).map(() => Array(8).fill(0))
    );
    const [currentBlocks, setCurrentBlocks] = useState<BlockShape[]>([]);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => {
        const saved = localStorage.getItem(`blockverse-best-score-${gameMode}`);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [isGameOver, setIsGameOver] = useState(false);
    const [comboLines, setComboLines] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showDailyMissions, setShowDailyMissions] = useState(false);
    const [activePowerUp, setActivePowerUp] = useState<PowerUp['type'] | null>(null);
    const [showLevelTransition, setShowLevelTransition] = useState(false);
    const [transitionLevel, setTransitionLevel] = useState(1);
    const [showInterstitialAd, setShowInterstitialAd] = useState(false);
    const [particleEffect, setParticleEffect] = useState<{ type: 'lineClear' | 'levelUp' | 'combo'; position?: { x: number; y: number } } | null>(null);
    const [backgroundTransitioning, setBackgroundTransitioning] = useState(false);
    
    // Mission tracking
    const [powerUpsUsedThisGame, setPowerUpsUsedThisGame] = useState(0);
    const [chainsTriggeredThisGame, setChainsTriggeredThisGame] = useState(0);
    const [totalLinesCleared, setTotalLinesCleared] = useState(0);
    const [gamesCompleted, setGamesCompleted] = useState(0);
    
    // Time Attack mode state
    const [timeRemaining, setTimeRemaining] = useState(gameMode === 'timeAttack' ? 120 : 0);
    const [isTimerActive, setIsTimerActive] = useState(gameMode === 'timeAttack');

    // Advanced Strategy Mode state
    const [movingObstacles, setMovingObstacles] = useState<MovingObstacle[]>([]);
    const [fallingBlocks, setFallingBlocks] = useState<FallingBlock[]>([]);
    const [powerUpChainActive, setPowerUpChainActive] = useState(false);
    const [chainedPowerUps, setChainedPowerUps] = useState<PowerUp['type'][]>([]);
    const [showFallingBlockWarning, setShowFallingBlockWarning] = useState(false);
    const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fallingBlockTimerRef = useRef<NodeJS.Timeout | null>(null);

    const user = getUser();
    const playerProgress = user ? getPlayerProgress(user.code) : null;
    
    // Calculate current level based on score
    const currentLevel = getLevelFromScore(score);
    const levelConfig = getLevelConfig(currentLevel);
    const [previousLevel, setPreviousLevel] = useState(currentLevel);

    // Initialize sound preference and preload ads (only when online)
    useEffect(() => {
        if (!isOffline) {
            preloadAds();
        }
        initSoundPreference();
    }, [isOffline]);

    // Check for month reset on mount
    useEffect(() => {
        checkAndResetMonth();
    }, []);

    // Initialize game with first block set
    useEffect(() => {
        setCurrentBlocks(generateBlockSet(currentLevel));
        playSound('gameStart');
    }, []);

    // Initialize daily missions on mount
    useEffect(() => {
        if (user) {
            getDailyMissions(user.code, currentLevel);
        }
    }, [user, currentLevel]);

    // Advanced Strategy Mode: Initialize moving obstacles
    useEffect(() => {
        if (gameMode === 'advancedStrategy' && !isGameOver) {
            // Initialize 3-5 random obstacles
            const obstacleCount = 3 + Math.floor(Math.random() * 3);
            const initialObstacles: MovingObstacle[] = [];
            
            for (let i = 0; i < obstacleCount; i++) {
                initialObstacles.push({
                    row: Math.floor(Math.random() * 8),
                    col: Math.floor(Math.random() * 8),
                    id: `obstacle-${i}-${Date.now()}`
                });
            }
            
            setMovingObstacles(initialObstacles);
        }
    }, [gameMode, isGameOver]);

    // Advanced Strategy Mode: Move obstacles periodically
    useEffect(() => {
        if (gameMode === 'advancedStrategy' && !isGameOver && movingObstacles.length > 0) {
            obstacleTimerRef.current = setInterval(() => {
                setMovingObstacles(prev => prev.map(obstacle => {
                    // Random movement in any direction
                    const directions = [
                        { row: -1, col: 0 }, { row: 1, col: 0 },
                        { row: 0, col: -1 }, { row: 0, col: 1 }
                    ];
                    const direction = directions[Math.floor(Math.random() * directions.length)];
                    const newRow = Math.max(0, Math.min(7, obstacle.row + direction.row));
                    const newCol = Math.max(0, Math.min(7, obstacle.col + direction.col));
                    
                    return {
                        ...obstacle,
                        row: newRow,
                        col: newCol
                    };
                }));
            }, 12000 + Math.random() * 6000); // 12-18 seconds

            return () => {
                if (obstacleTimerRef.current) {
                    clearInterval(obstacleTimerRef.current);
                }
            };
        }
    }, [gameMode, isGameOver, movingObstacles.length]);

    // Advanced Strategy Mode: Drop falling blocks periodically
    useEffect(() => {
        if (gameMode === 'advancedStrategy' && !isGameOver) {
            fallingBlockTimerRef.current = setInterval(() => {
                // Show warning 3 seconds before block falls
                setShowFallingBlockWarning(true);
                playSound('button'); // Warning beep
                
                setTimeout(() => {
                    setShowFallingBlockWarning(false);
                    
                    // Drop 1-2 random blocks
                    const blockCount = 1 + Math.floor(Math.random() * 2);
                    const newFallingBlocks: FallingBlock[] = [];
                    
                    for (let i = 0; i < blockCount; i++) {
                        const col = Math.floor(Math.random() * 8);
                        const colors = [
                            'from-red-500 to-orange-500',
                            'from-blue-500 to-cyan-500',
                            'from-green-500 to-emerald-500',
                            'from-purple-500 to-pink-500'
                        ];
                        
                        newFallingBlocks.push({
                            row: 0,
                            col: col,
                            id: `falling-${Date.now()}-${i}`,
                            color: colors[Math.floor(Math.random() * colors.length)]
                        });
                    }
                    
                    setFallingBlocks(prev => [...prev, ...newFallingBlocks]);
                    playSound('place');
                }, 3000);
            }, 20000 + Math.random() * 10000); // 20-30 seconds

            return () => {
                if (fallingBlockTimerRef.current) {
                    clearInterval(fallingBlockTimerRef.current);
                }
            };
        }
    }, [gameMode, isGameOver]);

    // Advanced Strategy Mode: Animate falling blocks downward
    useEffect(() => {
        if (gameMode === 'advancedStrategy' && fallingBlocks.length > 0 && !isGameOver) {
            const animationTimer = setInterval(() => {
                setFallingBlocks(prev => {
                    const updated = prev.map(block => {
                        if (block.row < 7 && board[block.row + 1][block.col] === 0) {
                            return { ...block, row: block.row + 1 };
                        }
                        return block;
                    });
                    
                    // Place blocks that reached bottom or hit obstacle
                    const toPlace = updated.filter(block => 
                        block.row === 7 || board[block.row + 1][block.col] !== 0
                    );
                    
                    if (toPlace.length > 0) {
                        const newBoard = board.map(row => [...row]);
                        toPlace.forEach(block => {
                            newBoard[block.row][block.col] = block.color;
                        });
                        setBoard(newBoard);
                    }
                    
                    return updated.filter(block => 
                        block.row < 7 && board[block.row + 1][block.col] === 0
                    );
                });
            }, 500); // Move down every 500ms

            return () => clearInterval(animationTimer);
        }
    }, [gameMode, fallingBlocks, board, isGameOver]);

    // Time Attack timer
    useEffect(() => {
        if (gameMode === 'timeAttack' && isTimerActive && timeRemaining > 0 && !isGameOver) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsGameOver(true);
                        setIsTimerActive(false);
                        playSound('gameOver');
                        if (user && score > 0) {
                            updateLeaderboard(user.username, user.code, score, gameMode);
                            // Update mission: complete game
                            updateMissionProgress(user.code, 'completeGames', 1);
                        }
                        if (!isOffline) {
                            setTimeout(() => setShowInterstitialAd(true), 1500);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameMode, isTimerActive, timeRemaining, isGameOver, user, score, isOffline]);

    // Update blocks when level changes
    useEffect(() => {
        if (currentBlocks.length === 0 && !isGameOver) {
            setCurrentBlocks(generateBlockSet(currentLevel));
        }
    }, [currentLevel, currentBlocks.length, isGameOver]);

    // Check for game over when blocks change
    useEffect(() => {
        if (currentBlocks.length > 0 && !isGameOver && gameMode !== 'timeAttack') {
            const gameOver = checkGameOver(board, currentBlocks);
            if (gameOver) {
                setIsGameOver(true);
                playSound('gameOver');
                
                if (user && score > 0) {
                    updateLeaderboard(user.username, user.code, score, gameMode);
                    // Update mission: complete game
                    updateMissionProgress(user.code, 'completeGames', 1);
                }
                
                if (!isOffline) {
                    setTimeout(() => {
                        setShowInterstitialAd(true);
                    }, 1500);
                }
            }
        }
    }, [currentBlocks, board, isGameOver, score, user, isOffline, gameMode]);

    // Update best score
    useEffect(() => {
        if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem(`blockverse-best-score-${gameMode}`, score.toString());
        }
    }, [score, bestScore, gameMode]);

    // Handle background transition when level changes
    useEffect(() => {
        if (currentLevel !== previousLevel) {
            setBackgroundTransitioning(true);
            setTimeout(() => {
                setBackgroundTransitioning(false);
                setPreviousLevel(currentLevel);
            }, 1000);
        }
    }, [currentLevel, previousLevel]);

    // Cleanup function for timers and state when navigating home
    const cleanupGameState = useCallback(() => {
        // Stop Time Attack timer
        if (gameMode === 'timeAttack') {
            setIsTimerActive(false);
        }

        // Clear Advanced Strategy Mode timers
        if (obstacleTimerRef.current) {
            clearInterval(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        if (fallingBlockTimerRef.current) {
            clearInterval(fallingBlockTimerRef.current);
            fallingBlockTimerRef.current = null;
        }

        // Reset Advanced Strategy Mode state
        setMovingObstacles([]);
        setFallingBlocks([]);
        setPowerUpChainActive(false);
        setChainedPowerUps([]);
        setShowFallingBlockWarning(false);
    }, [gameMode]);

    const handleBlockPlaced = useCallback((newBoard: (number | string)[][], points: number, linesCleared: number, blockIndex: number) => {
        setBoard(newBoard);
        
        const oldScore = score;
        
        // Apply mode-specific scoring
        let modeMultiplier = 1;
        if (gameMode === 'timeAttack' && timeRemaining <= 30) {
            modeMultiplier = 1.5; // 1.5x points in final 30 seconds
        } else if (gameMode === 'powerBoost') {
            modeMultiplier = 1.2; // 1.2x points in power boost mode
        } else if (gameMode === 'advancedStrategy') {
            modeMultiplier = 1.3; // 1.3x points in advanced strategy mode
        }
        
        const bonusPoints = Math.floor(points * levelConfig.rewards.bonusPointsMultiplier * modeMultiplier);
        const newScore = oldScore + bonusPoints;
        
        setScore(newScore);
        setComboLines(linesCleared);
        
        // Update mission progress
        if (user) {
            if (linesCleared > 0) {
                updateMissionProgress(user.code, 'clearTotalLines', linesCleared);
                setTotalLinesCleared(prev => prev + linesCleared);
            }
            if (linesCleared >= 3) {
                updateMissionProgress(user.code, 'clearLines', 1);
            }
            if (linesCleared >= 3) {
                updateMissionProgress(user.code, 'comboMultiplier', 1);
            }
            // Update score mission
            updateMissionProgress(user.code, 'scorePoints', bonusPoints);
        }
        
        // Time Attack: Add bonus time for clearing lines
        if (gameMode === 'timeAttack' && linesCleared > 0) {
            const timeBonus = linesCleared === 1 ? 10 : 15 * (linesCleared - 1) + 10;
            setTimeRemaining(prev => Math.min(prev + timeBonus, 300)); // Cap at 5 minutes
        }
        
        // Check for level transition
        const transition = shouldShowLevelTransition(oldScore, newScore);
        if (transition.shouldShow) {
            setTransitionLevel(transition.newLevel);
            setShowLevelTransition(true);
            playSound('levelUp', transition.newLevel);
            setParticleEffect({ type: 'levelUp', position: { x: 50, y: 50 } });
        } else {
            if (linesCleared > 1) {
                playSound('combo', currentLevel);
                setParticleEffect({ type: 'combo', position: { x: 50, y: 50 } });
            } else if (linesCleared > 0) {
                playSound('clear', currentLevel);
                setParticleEffect({ type: 'lineClear', position: { x: 50, y: 50 } });
            } else {
                playSound('place');
            }
        }
        
        const updatedBlocks = currentBlocks.filter((_, idx) => idx !== blockIndex);
        setCurrentBlocks(updatedBlocks);
        setSelectedBlockIndex(null);

        if (activePowerUp) {
            setActivePowerUp(null);
        }

        if (updatedBlocks.length === 0) {
            setTimeout(() => {
                setCurrentBlocks(generateBlockSet(getLevelFromScore(newScore)));
            }, 300);
        }
    }, [currentBlocks, activePowerUp, levelConfig, currentLevel, score, gameMode, timeRemaining, user]);

    const handleRestart = useCallback(() => {
        playSound('button');
        cleanupGameState();
        onBackToModeSelection();
    }, [onBackToModeSelection, cleanupGameState]);

    const handleNavigateHome = useCallback(() => {
        playSound('button');
        cleanupGameState();
        onBackToModeSelection();
    }, [onBackToModeSelection, cleanupGameState]);

    const handleUsePowerUp = useCallback((type: PowerUp['type']) => {
        setSelectedBlockIndex(null);
        
        // Update mission progress
        if (user) {
            updateMissionProgress(user.code, 'usePowerUps', 1);
            setPowerUpsUsedThisGame(prev => prev + 1);
        }
        
        // Advanced Strategy Mode: Power-up chain system
        if (gameMode === 'advancedStrategy' && !powerUpChainActive) {
            setPowerUpChainActive(true);
            setChainedPowerUps([type]);
            setActivePowerUp(type);
            playSound('powerUp');
            
            // Update mission: trigger chain
            if (user) {
                updateMissionProgress(user.code, 'triggerChains', 1);
                setChainsTriggeredThisGame(prev => prev + 1);
            }
            
            // Chain effect: trigger another random power-up after 1 second
            setTimeout(() => {
                const availablePowerUps: PowerUp['type'][] = ['blockBreak', 'columnBreak', 'rowBreak'];
                const nextPowerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
                setChainedPowerUps(prev => [...prev, nextPowerUp]);
                playSound('combo', currentLevel);
                
                // Add bonus points for chain
                setScore(prev => prev + 75);
                setParticleEffect({ type: 'combo', position: { x: 50, y: 50 } });
                
                setTimeout(() => {
                    setPowerUpChainActive(false);
                    setChainedPowerUps([]);
                }, 2000);
            }, 1000);
        } else {
            setActivePowerUp(type);
            playSound('powerUp');
        }
        
        if (type === 'shuffleBlocks') {
            setCurrentBlocks(generateBlockSet(currentLevel));
            setActivePowerUp(null);
            playSound('clear', currentLevel);
        }
    }, [currentLevel, gameMode, powerUpChainActive, user]);

    const handlePowerUpUsed = useCallback((newBoard: (number | string)[][], points: number, linesCleared: number) => {
        setBoard(newBoard);
        if (points > 0) {
            const bonusPoints = Math.floor(points * levelConfig.rewards.bonusPointsMultiplier);
            setScore(prev => prev + bonusPoints);
            
            // Update mission progress
            if (user) {
                updateMissionProgress(user.code, 'scorePoints', bonusPoints);
            }
        }
        if (linesCleared > 0) {
            setComboLines(linesCleared);
            playSound('clear', currentLevel);
            
            // Update mission progress
            if (user) {
                updateMissionProgress(user.code, 'clearTotalLines', linesCleared);
            }
        }
        setActivePowerUp(null);
    }, [levelConfig, currentLevel, user]);

    const handleDailyRewardClaim = useCallback((reward: DailyReward) => {
        if (!user) return;

        if (reward.points) {
            setScore(prev => prev + reward.points!);
        }

        if (reward.powerUpType && reward.powerUpCount) {
            for (let i = 0; i < reward.powerUpCount; i++) {
                addPowerUp(user.code, reward.powerUpType);
            }
        }

        playSound('rankUp');
    }, [user]);

    const handleMissionRewardClaimed = useCallback((points?: number) => {
        if (points) {
            setScore(prev => prev + points);
        }
        playSound('rankUp');
    }, []);

    const getBackgroundClass = () => {
        const baseTransition = backgroundTransitioning ? 'transition-all duration-1000' : 'transition-colors duration-500';
        
        switch (theme) {
            case 'light':
                return `bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${baseTransition}`;
            case 'dark':
                return `bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 ${baseTransition}`;
            case 'neon':
                return `bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 ${baseTransition}`;
            default:
                return `bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${baseTransition}`;
        }
    };

    return (
        <div className={`min-h-[100dvh] flex flex-col ${getBackgroundClass()} relative overflow-hidden`}>
            <div 
                className={`absolute inset-0 bg-cover bg-center pointer-events-none ${
                    backgroundTransitioning ? 'opacity-0' : 'opacity-20'
                } transition-opacity duration-1000`}
                style={{ backgroundImage: `url(${levelConfig.backgroundImage})` }}
            />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(levelConfig.visualEffects.particleCount)].map((_, i) => (
                    <img
                        key={i}
                        src={levelConfig.particleImage}
                        alt=""
                        className="absolute w-8 h-8 sm:w-12 sm:h-12 opacity-30 animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 / levelConfig.visualEffects.animationSpeed}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col min-h-[100dvh]">
                <Header 
                    onRestart={handleRestart} 
                    onOpenProfile={() => setShowProfile(true)}
                    onOpenMissions={() => {
                        playSound('button');
                        setShowDailyMissions(true);
                    }}
                    onNavigateHome={handleNavigateHome}
                    theme={theme}
                    playerLevel={currentLevel}
                />
                
                <main className="flex-1 container mx-auto px-2 sm:px-4 md:px-6 py-1 sm:py-2 md:py-4 flex flex-col items-center justify-center gap-1 sm:gap-2 md:gap-4">
                    <div className="w-full max-w-[min(90vw,600px)] flex flex-col gap-0.5 sm:gap-1.5">
                        {gameMode === 'timeAttack' && (
                            <TimerDisplay 
                                timeRemaining={timeRemaining}
                                theme={theme}
                            />
                        )}
                        
                        {gameMode === 'advancedStrategy' && (
                            <AdvancedStrategyIndicators
                                theme={theme}
                                showFallingBlockWarning={showFallingBlockWarning}
                                powerUpChainActive={powerUpChainActive}
                                chainedPowerUps={chainedPowerUps}
                            />
                        )}
                        
                        <div className="w-full">
                            <ScoreDisplay 
                                score={score} 
                                bestScore={bestScore} 
                                comboLines={comboLines} 
                                theme={theme}
                                userCode={user?.code || ''}
                            />
                        </div>
                        
                        {user && (
                            <div className="w-full">
                                <PowerUpBar
                                    theme={theme}
                                    userCode={user.code}
                                    onUsePowerUp={handleUsePowerUp}
                                    activePowerUp={activePowerUp}
                                />
                            </div>
                        )}
                    </div>
                    
                    <GameBoard
                        board={board}
                        selectedBlock={selectedBlockIndex !== null ? currentBlocks[selectedBlockIndex] : null}
                        onBlockPlaced={(newBoard, points, linesCleared) => {
                            if (selectedBlockIndex !== null) {
                                handleBlockPlaced(newBoard, points, linesCleared, selectedBlockIndex);
                            }
                        }}
                        theme={theme}
                        activePowerUp={activePowerUp}
                        onPowerUpUsed={handlePowerUpUsed}
                        levelConfig={levelConfig}
                        gameMode={gameMode}
                        movingObstacles={movingObstacles}
                        fallingBlocks={fallingBlocks}
                    />

                    <div className="w-full max-w-[min(90vw,600px)] flex flex-col items-center gap-0.5 sm:gap-1.5">
                        <div className={`text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold ${
                            theme === 'light' ? 'text-gray-700' :
                            theme === 'dark' ? 'text-gray-300' :
                            'text-pink-300'
                        }`}>
                            Sıradaki Bloklar
                        </div>
                        <BlockPicker
                            blocks={currentBlocks}
                            selectedIndex={selectedBlockIndex}
                            onSelectBlock={(index) => {
                                playSound('button');
                                setSelectedBlockIndex(index);
                                if (activePowerUp) {
                                    setActivePowerUp(null);
                                }
                            }}
                            disabled={isGameOver}
                            theme={theme}
                        />
                    </div>
                </main>

                <Footer theme={theme} />
            </div>

            <ThemeSelector currentTheme={theme} onThemeChange={(newTheme) => {
                playSound('button');
                setTheme(newTheme);
            }} />
            <LanguageSelector theme={theme} />
            <SoundToggle theme={theme} />
            
            {user && (
                <>
                    <LeaderboardButton theme={theme} onClick={() => {
                        playSound('button');
                        setShowLeaderboard(true);
                    }} />
                    <DailyMissionsButton 
                        theme={theme}
                        userCode={user.code}
                        onClick={() => {
                            playSound('button');
                            setShowDailyMissions(true);
                        }}
                    />
                </>
            )}

            {isGameOver && (
                <GameOver
                    score={score}
                    bestScore={bestScore}
                    onRestart={handleRestart}
                    theme={theme}
                />
            )}

            {showLeaderboard && user && (
                <Leaderboard
                    theme={theme}
                    onClose={() => {
                        playSound('button');
                        setShowLeaderboard(false);
                    }}
                    currentUserCode={user.code}
                    gameMode={gameMode}
                />
            )}

            {showProfile && (
                <UserProfile
                    theme={theme}
                    onClose={() => setShowProfile(false)}
                    onLogout={onLogout}
                />
            )}

            {showDailyMissions && user && (
                <DailyMissionsModal
                    theme={theme}
                    userCode={user.code}
                    playerLevel={currentLevel}
                    onClose={() => setShowDailyMissions(false)}
                    onRewardClaimed={handleMissionRewardClaimed}
                />
            )}

            {showLevelTransition && (
                <LevelTransition
                    newLevel={transitionLevel}
                    theme={theme}
                    onComplete={() => setShowLevelTransition(false)}
                />
            )}

            {!isOffline && user && (
                <DailyRewardModal
                    theme={theme}
                    onClaim={handleDailyRewardClaim}
                />
            )}

            {particleEffect && (
                <ParticleEffect
                    type={particleEffect.type}
                    theme={theme}
                    position={particleEffect.position}
                    onComplete={() => setParticleEffect(null)}
                />
            )}

            {!isOffline && (
                <MobileInterstitialAd
                    theme={theme}
                    show={showInterstitialAd}
                    onClose={() => setShowInterstitialAd(false)}
                />
            )}
        </div>
    );
}

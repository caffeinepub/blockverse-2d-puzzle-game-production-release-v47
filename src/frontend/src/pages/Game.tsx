import type { GameMode } from "@/App";
import { AchievementsModal } from "@/components/AchievementsModal";
import { AdvancedStrategyIndicators } from "@/components/AdvancedStrategyIndicators";
import { BlockPicker } from "@/components/BlockPicker";
import { DailyMissionsButton } from "@/components/DailyMissionsButton";
import { DailyMissionsModal } from "@/components/DailyMissionsModal";
import {
  type DailyReward,
  DailyRewardModal,
} from "@/components/DailyRewardModal";
import { Footer } from "@/components/Footer";
import { GameBoard } from "@/components/GameBoard";
import { GameOver } from "@/components/GameOver";
import { Header } from "@/components/Header";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Leaderboard } from "@/components/Leaderboard";
import { LeaderboardButton } from "@/components/LeaderboardButton";
import { LevelTransition } from "@/components/LevelTransition";
import { ParticleEffect } from "@/components/ParticleEffect";
import { PowerUpBar } from "@/components/PowerUpBar";
import { PowerUpGlowOverlay } from "@/components/PowerUpGlowOverlay";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { SoundToggle } from "@/components/SoundToggle";
import { StatsModal } from "@/components/StatsModal";
import { ThemeSelector } from "@/components/ThemeSelector";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TutorialOverlay, isTutorialDone } from "@/components/TutorialOverlay";
import { UserProfile } from "@/components/UserProfile";
import { MobileInterstitialAd } from "@/components/ads/MobileInterstitialAd";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOfflineMode } from "@/contexts/OfflineModeContext";
import {
  checkAndUnlockAchievements,
  getModesPlayed,
  trackModePlayed,
} from "@/lib/achievements";
import { type BlockShape, generateBlockSet } from "@/lib/blockShapes";
import {
  getDailyMissions,
  getWeeklyMissions,
  updateMissionProgress,
  updateWeeklyMissionProgress,
} from "@/lib/dailyMissions";
import { checkGameOver } from "@/lib/gameLogic";
import {
  clearSavedGame,
  hasSavedGame,
  loadGame,
  saveGame,
} from "@/lib/gameSave";
import {
  type PowerUp,
  addPowerUp,
  checkAndResetMonth,
  getPlayerProgress,
  updateLeaderboard,
} from "@/lib/leaderboard";
import {
  getLevelConfig,
  getLevelFromScore,
  shouldShowLevelTransition,
} from "@/lib/levelSystem";
import { preloadAds } from "@/lib/mobileAds";
import { updateStats } from "@/lib/playerStats";
import {
  initSoundPreference,
  playBackgroundMusic,
  playSound,
  stopBackgroundMusic,
} from "@/lib/sounds";
import { getUser } from "@/lib/userAuth";
import { Home, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type Theme = "light" | "dark" | "neon";

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
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [board, setBoard] = useState<(number | string)[][]>(() =>
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(0)),
  );
  const [currentBlocks, setCurrentBlocks] = useState<BlockShape[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem(`blockverse-best-score-${gameMode}`);
    return saved ? Number.parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [comboLines, setComboLines] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDailyMissions, setShowDailyMissions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUp["type"] | null>(
    null,
  );
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [transitionLevel, setTransitionLevel] = useState(1);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [particleEffect, setParticleEffect] = useState<{
    type: "lineClear" | "levelUp" | "combo";
    position?: { x: number; y: number };
  } | null>(null);
  const [backgroundTransitioning, setBackgroundTransitioning] = useState(false);

  // Mission tracking
  const [_powerUpsUsedThisGame, setPowerUpsUsedThisGame] = useState(0);
  const [_chainsTriggeredThisGame, setChainsTriggeredThisGame] = useState(0);
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);
  const [_gamesCompleted, _setGamesCompleted] = useState(0);

  // New mission tracking states
  const [_blocksPlacedCount, setBlocksPlacedCount] = useState(0);
  const [maxComboReached, setMaxComboReached] = useState(0);
  const [gameSurvivalSeconds, setGameSurvivalSeconds] = useState(0);
  const survivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dangerAlertTriggeredRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Time Attack mode state
  const [timeRemaining, setTimeRemaining] = useState(
    gameMode === "timeAttack" ? 120 : 0,
  );
  const [isTimerActive, setIsTimerActive] = useState(gameMode === "timeAttack");

  // Advanced Strategy Mode state
  const [movingObstacles, setMovingObstacles] = useState<MovingObstacle[]>([]);
  const [fallingBlocks, setFallingBlocks] = useState<FallingBlock[]>([]);
  const [powerUpChainActive, setPowerUpChainActive] = useState(false);
  const [chainedPowerUps, setChainedPowerUps] = useState<PowerUp["type"][]>([]);
  const [showFallingBlockWarning, setShowFallingBlockWarning] = useState(false);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fallingBlockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const user = getUser();
  const _playerProgress = user ? getPlayerProgress(user.code) : null;

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
    playBackgroundMusic();
    return () => {
      stopBackgroundMusic();
    };
  }, [isOffline]);

  // Check for month reset on mount
  useEffect(() => {
    checkAndResetMonth();
  }, []);

  // Track mode played for achievements
  useEffect(() => {
    if (user) {
      trackModePlayed(user.code, gameMode);
    }
  }, [user, gameMode]);

  // Check for saved game & show resume prompt
  useEffect(() => {
    if (hasSavedGame(gameMode)) {
      setShowResumePrompt(true);
    } else if (!isTutorialDone()) {
      setShowTutorial(true);
    }
  }, [gameMode]);

  // Initialize game with first block set
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    setCurrentBlocks(generateBlockSet(currentLevel));
    playSound("gameStart");
  }, []);

  // Initialize daily & weekly missions on mount
  useEffect(() => {
    if (user) {
      getDailyMissions(user.code, currentLevel);
      getWeeklyMissions(user.code, currentLevel);
    }
  }, [user, currentLevel]);

  // Survival time tracking: count up every second while game is active and not paused
  useEffect(() => {
    if (!isGameOver && !isPaused) {
      survivalTimerRef.current = setInterval(() => {
        setGameSurvivalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (survivalTimerRef.current) {
        clearInterval(survivalTimerRef.current);
        survivalTimerRef.current = null;
      }
    }
    return () => {
      if (survivalTimerRef.current) {
        clearInterval(survivalTimerRef.current);
        survivalTimerRef.current = null;
      }
    };
  }, [isGameOver, isPaused]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!isGameOver && !isPaused) {
      autoSaveTimerRef.current = setInterval(() => {
        saveGame({
          board,
          score,
          currentBlocks,
          currentLevel,
          gameMode,
          survivalSeconds: gameSurvivalSeconds,
          timeRemaining: gameMode === "timeAttack" ? timeRemaining : undefined,
          savedAt: new Date().toISOString(),
        });
      }, 10000);
    } else {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    isGameOver,
    isPaused,
    board,
    score,
    currentBlocks,
    currentLevel,
    gameMode,
    gameSurvivalSeconds,
    timeRemaining,
  ]);

  // Danger alert: trigger when timeRemaining === 10 in timeAttack
  useEffect(() => {
    if (
      gameMode === "timeAttack" &&
      timeRemaining === 10 &&
      !dangerAlertTriggeredRef.current
    ) {
      dangerAlertTriggeredRef.current = true;
      playSound("dangerAlert");
    }
  }, [gameMode, timeRemaining]);

  // Obstacle warning sound: trigger when showFallingBlockWarning becomes true
  useEffect(() => {
    if (showFallingBlockWarning) {
      playSound("obstacleWarning");
    }
  }, [showFallingBlockWarning]);

  // Advanced Strategy Mode: Moving Obstacles
  useEffect(() => {
    if (gameMode === "advancedStrategy" && !isGameOver && !isPaused) {
      obstacleTimerRef.current = setInterval(() => {
        setMovingObstacles((prev) => {
          if (prev.length < 3) {
            const newObstacle: MovingObstacle = {
              row: Math.floor(Math.random() * 8),
              col: Math.floor(Math.random() * 8),
              id: `obstacle-${Date.now()}`,
            };
            return [...prev, newObstacle];
          }
          return prev.map((o) => ({
            ...o,
            col: (o.col + 1) % 8,
          }));
        });
      }, 3000);

      return () => {
        if (obstacleTimerRef.current) {
          clearInterval(obstacleTimerRef.current);
        }
      };
    }
  }, [gameMode, isGameOver, isPaused]);

  // Advanced Strategy Mode: Falling Blocks
  useEffect(() => {
    if (gameMode === "advancedStrategy" && !isGameOver && !isPaused) {
      fallingBlockTimerRef.current = setInterval(
        () => {
          setShowFallingBlockWarning(true);
          setTimeout(() => setShowFallingBlockWarning(false), 3000);

          const blockCount = 1 + Math.floor(Math.random() * 2);
          const newFallingBlocks: FallingBlock[] = [];

          for (let i = 0; i < blockCount; i++) {
            const col = Math.floor(Math.random() * 8);
            const colors = [
              "from-red-500 to-orange-500",
              "from-blue-500 to-cyan-500",
              "from-green-500 to-emerald-500",
              "from-purple-500 to-pink-500",
            ];

            newFallingBlocks.push({
              row: 0,
              col: col,
              id: `falling-${Date.now()}-${i}`,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }

          setFallingBlocks((prev) => [...prev, ...newFallingBlocks]);
          playSound("place");
        },
        20000 + Math.random() * 10000,
      );

      return () => {
        if (fallingBlockTimerRef.current) {
          clearInterval(fallingBlockTimerRef.current);
        }
      };
    }
  }, [gameMode, isGameOver, isPaused]);

  // Advanced Strategy Mode: Animate falling blocks downward
  useEffect(() => {
    if (
      gameMode === "advancedStrategy" &&
      fallingBlocks.length > 0 &&
      !isGameOver &&
      !isPaused
    ) {
      const animationTimer = setInterval(() => {
        setFallingBlocks((prev) => {
          const updated = prev.map((block) => {
            if (block.row < 7 && board[block.row + 1][block.col] === 0) {
              return { ...block, row: block.row + 1 };
            }
            return block;
          });

          const toPlace = updated.filter(
            (block) => block.row === 7 || board[block.row + 1][block.col] !== 0,
          );

          if (toPlace.length > 0) {
            const newBoard = board.map((row) => [...row]);
            for (const block of toPlace) {
              newBoard[block.row][block.col] = block.color;
            }
            setBoard(newBoard);
          }

          return updated.filter(
            (block) => block.row < 7 && board[block.row + 1][block.col] === 0,
          );
        });
      }, 500);

      return () => clearInterval(animationTimer);
    }
  }, [gameMode, fallingBlocks, board, isGameOver, isPaused]);

  // Time Attack timer - pause-aware
  useEffect(() => {
    if (
      gameMode === "timeAttack" &&
      isTimerActive &&
      timeRemaining > 0 &&
      !isGameOver &&
      !isPaused
    ) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setIsTimerActive(false);
            playSound("gameOver");
            if (user && score > 0) {
              updateLeaderboard(user.username, user.code, score, gameMode);
              updateMissionProgress(user.code, "completeGames", 1);
              updateWeeklyMissionProgress(user.code, "completeGames", 1);
              updateMissionProgress(
                user.code,
                "surviveTime",
                gameSurvivalSeconds,
              );
              updateWeeklyMissionProgress(
                user.code,
                "surviveTime",
                gameSurvivalSeconds,
              );
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
  }, [
    gameMode,
    isTimerActive,
    timeRemaining,
    isGameOver,
    isPaused,
    user,
    score,
    isOffline,
    gameSurvivalSeconds,
  ]);

  // Update blocks when level changes
  useEffect(() => {
    if (currentBlocks.length === 0 && !isGameOver) {
      setCurrentBlocks(generateBlockSet(currentLevel));
    }
  }, [currentLevel, currentBlocks.length, isGameOver]);

  // Check for game over when blocks change
  useEffect(() => {
    if (currentBlocks.length > 0 && !isGameOver && gameMode !== "timeAttack") {
      const gameOver = checkGameOver(board, currentBlocks);
      if (gameOver) {
        setIsGameOver(true);
        playSound("gameOver");

        // Clear saved game
        clearSavedGame(gameMode);

        if (user && score > 0) {
          updateLeaderboard(user.username, user.code, score, gameMode);
          updateMissionProgress(user.code, "completeGames", 1);
          updateWeeklyMissionProgress(user.code, "completeGames", 1);
          updateMissionProgress(user.code, "surviveTime", gameSurvivalSeconds);
          updateWeeklyMissionProgress(
            user.code,
            "surviveTime",
            gameSurvivalSeconds,
          );

          // Update player stats
          const updatedStats = updateStats(user.code, {
            totalGames: 1,
            totalLinesCleared: totalLinesCleared,
            totalScore: score,
            totalTimePlayed: gameSurvivalSeconds,
            bestScore: score,
            bestCombo: maxComboReached,
            powerUpsUsed: _powerUpsUsedThisGame,
          });

          // Check achievements
          const modesPlayed = getModesPlayed(user.code);
          checkAndUnlockAchievements(user.code, updatedStats, {
            comboLines: maxComboReached,
            survivalSeconds: gameSurvivalSeconds,
            modesPlayed,
          });
        }

        if (!isOffline) {
          setTimeout(() => {
            setShowInterstitialAd(true);
          }, 1500);
        }
      }
    }
  }, [
    currentBlocks,
    board,
    isGameOver,
    score,
    user,
    isOffline,
    gameMode,
    gameSurvivalSeconds,
    totalLinesCleared,
    maxComboReached,
    _powerUpsUsedThisGame,
  ]);

  // Update best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem(
        `blockverse-best-score-${gameMode}`,
        score.toString(),
      );
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
    if (gameMode === "timeAttack") {
      setIsTimerActive(false);
    }
    if (obstacleTimerRef.current) {
      clearInterval(obstacleTimerRef.current);
      obstacleTimerRef.current = null;
    }
    if (fallingBlockTimerRef.current) {
      clearInterval(fallingBlockTimerRef.current);
      fallingBlockTimerRef.current = null;
    }
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setMovingObstacles([]);
    setFallingBlocks([]);
    setPowerUpChainActive(false);
    setChainedPowerUps([]);
    setShowFallingBlockWarning(false);
  }, [gameMode]);

  const handleBlockPlaced = useCallback(
    (
      newBoard: (number | string)[][],
      points: number,
      linesCleared: number,
      blockIndex: number,
    ) => {
      setBoard(newBoard);
      setBlocksPlacedCount((prev) => prev + 1);

      const oldScore = score;

      let modeMultiplier = 1;
      if (gameMode === "timeAttack" && timeRemaining <= 30) {
        modeMultiplier = 1.5;
      } else if (gameMode === "powerBoost") {
        modeMultiplier = 1.2;
      } else if (gameMode === "advancedStrategy") {
        modeMultiplier = 1.3;
      }

      const bonusPoints = Math.floor(
        points * levelConfig.rewards.bonusPointsMultiplier * modeMultiplier,
      );
      const newScore = oldScore + bonusPoints;

      setScore(newScore);
      setComboLines(linesCleared);

      if (user) {
        if (linesCleared > 0) {
          updateMissionProgress(user.code, "clearTotalLines", linesCleared);
          updateWeeklyMissionProgress(
            user.code,
            "clearTotalLines",
            linesCleared,
          );
          setTotalLinesCleared((prev) => prev + linesCleared);
        }
        if (linesCleared >= 3) {
          updateMissionProgress(user.code, "clearLines", 1);
          updateWeeklyMissionProgress(user.code, "clearLines", 1);
          updateMissionProgress(user.code, "comboMultiplier", 1);
          updateWeeklyMissionProgress(user.code, "comboMultiplier", 1);
          updateMissionProgress(user.code, "achieveCombo", 1);
          updateWeeklyMissionProgress(user.code, "achieveCombo", 1);
          setMaxComboReached((prev) => Math.max(prev, linesCleared));
        }
        updateMissionProgress(user.code, "scorePoints", bonusPoints);
        updateWeeklyMissionProgress(user.code, "scorePoints", bonusPoints);
        updateMissionProgress(user.code, "placeBlocksCount", 1);
        updateWeeklyMissionProgress(user.code, "placeBlocksCount", 1);
      }

      if (gameMode === "timeAttack" && linesCleared > 0) {
        const timeBonus =
          linesCleared === 1 ? 10 : 15 * (linesCleared - 1) + 10;
        setTimeRemaining((prev) => Math.min(prev + timeBonus, 300));
      }

      const transition = shouldShowLevelTransition(oldScore, newScore);
      if (transition.shouldShow) {
        setTransitionLevel(transition.newLevel);
        setShowLevelTransition(true);
        playSound("levelUp", transition.newLevel);
        setParticleEffect({ type: "levelUp", position: { x: 50, y: 50 } });
      } else {
        if (linesCleared > 1) {
          playSound("combo", currentLevel);
          setParticleEffect({ type: "combo", position: { x: 50, y: 50 } });
        } else if (linesCleared > 0) {
          playSound("clear", currentLevel);
          setParticleEffect({ type: "lineClear", position: { x: 50, y: 50 } });
        } else {
          playSound("place");
        }
      }

      const updatedBlocks = currentBlocks.filter(
        (_, idx) => idx !== blockIndex,
      );
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

      // Auto-save on block placed
      saveGame({
        board: newBoard,
        score: newScore,
        currentBlocks: updatedBlocks,
        currentLevel,
        gameMode,
        survivalSeconds: gameSurvivalSeconds,
        timeRemaining: gameMode === "timeAttack" ? timeRemaining : undefined,
        savedAt: new Date().toISOString(),
      });
    },
    [
      currentBlocks,
      activePowerUp,
      levelConfig,
      currentLevel,
      score,
      gameMode,
      timeRemaining,
      user,
      gameSurvivalSeconds,
    ],
  );

  const handleRestart = useCallback(() => {
    playSound("button");
    clearSavedGame(gameMode);
    cleanupGameState();
    onBackToModeSelection();
  }, [onBackToModeSelection, cleanupGameState, gameMode]);

  const handleNavigateHome = useCallback(() => {
    playSound("button");
    cleanupGameState();
    onBackToModeSelection();
  }, [onBackToModeSelection, cleanupGameState]);

  const handleUsePowerUp = useCallback(
    (type: PowerUp["type"]) => {
      setSelectedBlockIndex(null);

      if (user) {
        updateMissionProgress(user.code, "usePowerUps", 1);
        updateWeeklyMissionProgress(user.code, "usePowerUps", 1);
        setPowerUpsUsedThisGame((prev) => prev + 1);
      }

      if (gameMode === "advancedStrategy" && !powerUpChainActive) {
        setPowerUpChainActive(true);
        setChainedPowerUps([type]);
        setActivePowerUp(type);
        playSound("powerUp");

        if (user) {
          updateMissionProgress(user.code, "triggerChains", 1);
          updateWeeklyMissionProgress(user.code, "triggerChains", 1);
          setChainsTriggeredThisGame((prev) => prev + 1);
        }

        setTimeout(() => {
          const availablePowerUps: PowerUp["type"][] = [
            "blockBreak",
            "columnBreak",
            "rowBreak",
          ];
          const nextPowerUp =
            availablePowerUps[
              Math.floor(Math.random() * availablePowerUps.length)
            ];
          setChainedPowerUps((prev) => [...prev, nextPowerUp]);
          playSound("chainReaction");

          setScore((prev) => prev + 75);
          setParticleEffect({ type: "combo", position: { x: 50, y: 50 } });

          setTimeout(() => {
            setPowerUpChainActive(false);
            setChainedPowerUps([]);
          }, 2000);
        }, 1000);
      } else {
        setActivePowerUp(type);
        playSound("powerUp");
      }

      if (type === "shuffleBlocks") {
        setCurrentBlocks(generateBlockSet(currentLevel));
        setActivePowerUp(null);
        playSound("clear", currentLevel);
      }
    },
    [currentLevel, gameMode, powerUpChainActive, user],
  );

  const handlePowerUpUsed = useCallback(
    (newBoard: (number | string)[][], points: number, linesCleared: number) => {
      setBoard(newBoard);
      if (points > 0) {
        const bonusPoints = Math.floor(
          points * levelConfig.rewards.bonusPointsMultiplier,
        );
        setScore((prev) => prev + bonusPoints);

        if (user) {
          updateMissionProgress(user.code, "scorePoints", bonusPoints);
        }
      }
      if (linesCleared > 0) {
        setComboLines(linesCleared);
        playSound("clear", currentLevel);

        if (user) {
          updateMissionProgress(user.code, "clearTotalLines", linesCleared);
        }
      }
      setActivePowerUp(null);
    },
    [levelConfig, currentLevel, user],
  );

  const handleDailyRewardClaim = useCallback(
    (reward: DailyReward) => {
      if (!user) return;

      if (reward.points) {
        setScore((prev) => prev + reward.points!);
      }

      if (reward.powerUpType && reward.powerUpCount) {
        for (let i = 0; i < reward.powerUpCount; i++) {
          addPowerUp(user.code, reward.powerUpType);
        }
      }

      playSound("rankUp");
    },
    [user],
  );

  const handleMissionRewardClaimed = useCallback((points?: number) => {
    if (points) {
      setScore((prev) => prev + points);
    }
    playSound("rankUp");
  }, []);

  const handleResumeGame = useCallback(() => {
    const saved = loadGame(gameMode);
    if (saved) {
      setBoard(saved.board);
      setScore(saved.score);
      setCurrentBlocks(saved.currentBlocks);
      setGameSurvivalSeconds(saved.survivalSeconds);
      if (saved.timeRemaining !== undefined) {
        setTimeRemaining(saved.timeRemaining);
      }
    }
    setShowResumePrompt(false);
  }, [gameMode]);

  const handleNewGame = useCallback(() => {
    clearSavedGame(gameMode);
    setShowResumePrompt(false);
    if (!isTutorialDone()) {
      setShowTutorial(true);
    }
  }, [gameMode]);

  const getBackgroundClass = () => {
    const baseTransition = backgroundTransitioning
      ? "transition-all duration-1000"
      : "transition-colors duration-500";

    switch (theme) {
      case "light":
        return `bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${baseTransition}`;
      case "dark":
        return `bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 ${baseTransition}`;
      case "neon":
        return `bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 ${baseTransition}`;
      default:
        return `bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${baseTransition}`;
    }
  };

  const getPauseOverlayClass = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 border border-gray-700 text-gray-100";
      case "neon":
        return "bg-black border-2 border-pink-500 text-pink-100 shadow-[0_0_40px_rgba(236,72,153,0.5)]";
      default:
        return "bg-white border border-purple-200 text-gray-800";
    }
  };

  const getPauseBtnClass = () => {
    switch (theme) {
      case "dark":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "neon":
        return "bg-pink-600 hover:bg-pink-700 text-white";
      default:
        return "bg-purple-600 hover:bg-purple-700 text-white";
    }
  };

  const getResumeTitleClass = () => {
    switch (theme) {
      case "dark":
        return "text-white";
      case "neon":
        return "text-pink-300";
      default:
        return "text-purple-700";
    }
  };

  return (
    <div
      className={`min-h-[100dvh] flex flex-col ${getBackgroundClass()} relative overflow-hidden`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center pointer-events-none ${
          backgroundTransitioning ? "opacity-0" : "opacity-20"
        } transition-opacity duration-1000`}
        style={{ backgroundImage: `url(${levelConfig.backgroundImage})` }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(levelConfig.visualEffects.particleCount)].map((_, i) => (
          <img
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative background particles — fixed count per level, never reordered
            key={i}
            src={levelConfig.particleImage}
            alt=""
            className="absolute w-8 h-8 sm:w-12 sm:h-12 opacity-30 animate-float"
            style={{
              left: `${(i * 9 + 5) % 95}%`,
              top: `${(i * 11 + 7) % 90}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
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
            playSound("button");
            setShowDailyMissions(true);
          }}
          onNavigateHome={handleNavigateHome}
          onPause={() => setIsPaused((p) => !p)}
          onOpenStats={user ? () => setShowStats(true) : undefined}
          onOpenAchievements={
            user ? () => setShowAchievements(true) : undefined
          }
          theme={theme}
          playerLevel={currentLevel}
          isPaused={isPaused}
        />

        <main className="flex-1 container mx-auto px-2 sm:px-4 md:px-6 py-1 sm:py-2 md:py-4 flex flex-col items-center justify-center gap-1 sm:gap-2 md:gap-4">
          <div className="w-full max-w-[min(90vw,600px)] flex flex-col gap-0.5 sm:gap-1.5">
            {gameMode === "timeAttack" && (
              <TimerDisplay timeRemaining={timeRemaining} theme={theme} />
            )}

            {gameMode === "advancedStrategy" && (
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
                userCode={user?.code || ""}
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

          <div className="relative">
            <PowerUpGlowOverlay activePowerUp={activePowerUp} theme={theme} />
            <GameBoard
              board={board}
              selectedBlock={
                selectedBlockIndex !== null
                  ? currentBlocks[selectedBlockIndex]
                  : null
              }
              onBlockPlaced={(newBoard, points, linesCleared) => {
                if (selectedBlockIndex !== null && !isPaused) {
                  handleBlockPlaced(
                    newBoard,
                    points,
                    linesCleared,
                    selectedBlockIndex,
                  );
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
          </div>

          <div className="w-full max-w-[min(90vw,600px)] flex flex-col items-center gap-0.5 sm:gap-1.5">
            <div
              className={`text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold ${
                theme === "light"
                  ? "text-gray-700"
                  : theme === "dark"
                    ? "text-gray-300"
                    : "text-pink-300"
              }`}
            >
              {t("game.nextBlocks")}
            </div>
            <BlockPicker
              blocks={currentBlocks}
              selectedIndex={selectedBlockIndex}
              onSelectBlock={(index) => {
                if (!isPaused) {
                  playSound("button");
                  setSelectedBlockIndex(index);
                  if (activePowerUp) {
                    setActivePowerUp(null);
                  }
                }
              }}
              disabled={isGameOver || isPaused}
              theme={theme}
            />
          </div>
        </main>

        <Footer theme={theme} />
      </div>

      <ThemeSelector
        currentTheme={theme}
        onThemeChange={(newTheme) => {
          playSound("button");
          setTheme(newTheme);
        }}
      />
      <LanguageSelector theme={theme} />
      <SoundToggle theme={theme} />

      {user && (
        <>
          <LeaderboardButton
            theme={theme}
            onClick={() => {
              playSound("button");
              setShowLeaderboard(true);
            }}
          />
          <DailyMissionsButton
            theme={theme}
            userCode={user.code}
            onClick={() => {
              playSound("button");
              setShowDailyMissions(true);
            }}
          />
        </>
      )}

      {/* Pause overlay */}
      {isPaused && !isGameOver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xs rounded-2xl p-6 shadow-2xl flex flex-col gap-3 ${getPauseOverlayClass()}`}
            data-ocid="pause.modal"
          >
            <h2
              className={`text-2xl font-bold text-center mb-2 ${getResumeTitleClass()}`}
            >
              {t("pause.title")}
            </h2>
            <Button
              size="lg"
              className={`w-full flex items-center gap-2 justify-center ${getPauseBtnClass()}`}
              onClick={() => setIsPaused(false)}
              data-ocid="pause.confirm_button"
            >
              <Play className="w-4 h-4" />
              {t("pause.resume")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full flex items-center gap-2 justify-center"
              onClick={handleRestart}
              data-ocid="pause.secondary_button"
            >
              <RotateCcw className="w-4 h-4" />
              {t("pause.restart")}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full flex items-center gap-2 justify-center"
              onClick={handleNavigateHome}
              data-ocid="pause.cancel_button"
            >
              <Home className="w-4 h-4" />
              {t("pause.home")}
            </Button>
          </div>
        </div>
      )}

      {/* Resume prompt */}
      {showResumePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xs rounded-2xl p-6 shadow-2xl flex flex-col gap-3 ${getPauseOverlayClass()}`}
            data-ocid="resume.dialog"
          >
            <h2
              className={`text-xl font-bold text-center mb-1 ${getResumeTitleClass()}`}
            >
              {t("resume.title")}
            </h2>
            <p className="text-sm text-center opacity-70">
              {t("resume.description").replace("{mode}", gameMode)}
            </p>
            <Button
              size="lg"
              className={`w-full ${getPauseBtnClass()}`}
              onClick={handleResumeGame}
              data-ocid="resume.confirm_button"
            >
              {t("resume.continue")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleNewGame}
              data-ocid="resume.cancel_button"
            >
              {t("resume.new")}
            </Button>
          </div>
        </div>
      )}

      {isGameOver && (
        <GameOver
          score={score}
          bestScore={bestScore}
          onRestart={handleRestart}
          theme={theme}
          userCode={user?.code}
          isOffline={isOffline}
          onRewardEarned={() => {
            window.dispatchEvent(new Event("storage"));
          }}
        />
      )}

      {showLeaderboard && user && (
        <Leaderboard
          theme={theme}
          onClose={() => {
            playSound("button");
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
        <DailyRewardModal theme={theme} onClaim={handleDailyRewardClaim} />
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

      {/* Tutorial overlay */}
      {showTutorial && (
        <TutorialOverlay
          theme={theme}
          onComplete={() => setShowTutorial(false)}
        />
      )}

      {/* Stats modal */}
      {showStats && user && (
        <StatsModal
          theme={theme}
          userCode={user.code}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Achievements modal */}
      {showAchievements && user && (
        <AchievementsModal
          theme={theme}
          userCode={user.code}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}

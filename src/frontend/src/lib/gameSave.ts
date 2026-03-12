import type { GameMode } from "@/App";
import type { BlockShape } from "@/lib/blockShapes";

export interface SavedGameState {
  board: (number | string)[][];
  score: number;
  currentBlocks: BlockShape[];
  currentLevel: number;
  gameMode: GameMode;
  survivalSeconds: number;
  timeRemaining?: number;
  savedAt: string;
}

const SAVE_KEY_PREFIX = "blockverse-saved-game";

function getSaveKey(gameMode: GameMode): string {
  return `${SAVE_KEY_PREFIX}-${gameMode}`;
}

export function saveGame(state: SavedGameState): void {
  const key = getSaveKey(state.gameMode);
  localStorage.setItem(
    key,
    JSON.stringify({ ...state, savedAt: new Date().toISOString() }),
  );
}

export function loadGame(gameMode: GameMode): SavedGameState | null {
  const key = getSaveKey(gameMode);
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as SavedGameState;
  } catch {
    return null;
  }
}

export function clearSavedGame(gameMode: GameMode): void {
  const key = getSaveKey(gameMode);
  localStorage.removeItem(key);
}

export function hasSavedGame(gameMode: GameMode): boolean {
  return localStorage.getItem(getSaveKey(gameMode)) !== null;
}

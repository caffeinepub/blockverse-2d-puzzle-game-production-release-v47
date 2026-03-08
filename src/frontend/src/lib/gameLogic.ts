import type { BlockShape } from "./blockShapes";

export function canPlaceBlock(
  board: (number | string)[][],
  block: BlockShape,
  startRow: number,
  startCol: number,
): boolean {
  const { shape } = block;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const boardRow = startRow + row;
        const boardCol = startCol + col;

        // Check bounds
        if (boardRow < 0 || boardRow >= board.length) return false;
        if (boardCol < 0 || boardCol >= board[0].length) return false;

        // Check if cell is already occupied (not 0)
        if (board[boardRow][boardCol] !== 0) return false;
      }
    }
  }

  return true;
}

export function placeBlock(
  board: (number | string)[][],
  block: BlockShape,
  startRow: number,
  startCol: number,
): (number | string)[][] {
  const newBoard = board.map((row) => [...row]);
  const { shape, color } = block;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        // Store the color gradient class instead of just 1
        newBoard[startRow + row][startCol + col] = color;
      }
    }
  }

  return newBoard;
}

export function clearLines(board: (number | string)[][]): {
  clearedBoard: (number | string)[][];
  linesCleared: number;
} {
  let newBoard = board.map((row) => [...row]);
  let linesCleared = 0;

  // Check and clear full rows
  for (let row = 0; row < newBoard.length; row++) {
    if (newBoard[row].every((cell) => cell !== 0)) {
      newBoard[row] = Array(newBoard[row].length).fill(0);
      linesCleared++;
    }
  }

  // Check and clear full columns
  for (let col = 0; col < newBoard[0].length; col++) {
    if (newBoard.every((row) => row[col] !== 0)) {
      for (let row = 0; row < newBoard.length; row++) {
        newBoard[row][col] = 0;
      }
      linesCleared++;
    }
  }

  return { clearedBoard: newBoard, linesCleared };
}

export function calculateScore(linesCleared: number): number {
  if (linesCleared === 0) return 0;

  // First line: 100 points
  // Each additional line: +50 points
  // Example: 1 line = 100, 2 lines = 150, 3 lines = 200, 4 lines = 250
  return 100 + (linesCleared - 1) * 50;
}

export function checkGameOver(
  board: (number | string)[][],
  blocks: BlockShape[],
): boolean {
  // Check if any block can be placed anywhere on the board
  for (const block of blocks) {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (canPlaceBlock(board, block, row, col)) {
          return false; // Found a valid placement
        }
      }
    }
  }

  return true; // No valid placements found
}

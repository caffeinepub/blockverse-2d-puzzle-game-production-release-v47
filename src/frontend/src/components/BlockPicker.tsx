import type { BlockShape } from "@/lib/blockShapes";
import type { Theme } from "@/pages/Game";

interface BlockPickerProps {
  blocks: BlockShape[];
  selectedIndex: number | null;
  onSelectBlock: (index: number) => void;
  disabled?: boolean;
  theme: Theme;
}

export function BlockPicker({
  blocks,
  selectedIndex,
  onSelectBlock,
  disabled,
  theme,
}: BlockPickerProps) {
  const getCardClass = () => {
    switch (theme) {
      case "light":
        return "bg-white/95 backdrop-blur-sm";
      case "dark":
        return "bg-gray-800/95 backdrop-blur-sm";
      case "neon":
        return "bg-black/80 backdrop-blur-sm";
      default:
        return "bg-white/95 backdrop-blur-sm";
    }
  };

  const getBorderClass = (isSelected: boolean) => {
    if (isSelected) {
      switch (theme) {
        case "light":
          return "border-yellow-400 shadow-lg sm:shadow-xl";
        case "dark":
          return "border-cyan-400 shadow-lg sm:shadow-xl";
        case "neon":
          return "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] sm:shadow-[0_0_20px_rgba(236,72,153,0.6)]";
        default:
          return "border-yellow-400 shadow-lg sm:shadow-xl";
      }
    }
    switch (theme) {
      case "light":
        return "border-gray-200 hover:border-yellow-300 active:border-yellow-400";
      case "dark":
        return "border-gray-700 hover:border-cyan-300 active:border-cyan-400";
      case "neon":
        return "border-pink-900/50 hover:border-pink-400 active:border-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.3)] sm:hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]";
      default:
        return "border-gray-200 hover:border-yellow-300 active:border-yellow-400";
    }
  };

  return (
    <div className="block-picker flex flex-row flex-nowrap gap-1.5 sm:gap-3 md:gap-5 justify-center items-center w-full px-1 sm:px-2 overflow-hidden">
      {blocks.map((block, index) => {
        // Calculate the dimensions of the block shape
        const rows = block.shape.length;
        const cols = block.shape[0].length;
        const maxDim = Math.max(rows, cols);

        // Smaller cell sizes for mobile single-row layout with better containment
        const cellSize = maxDim === 1 ? 13 : maxDim === 2 ? 10 : 8;
        const cellSizeSm = maxDim === 1 ? 28 : maxDim === 2 ? 22 : 18;

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelectBlock(index)}
            disabled={disabled}
            className={`
                            block-item rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-4 md:p-5 transition-all duration-200
                            border sm:border-2 md:border-4 shadow-md sm:shadow-lg hover:scale-105 active:scale-95
                            flex items-center justify-center flex-shrink-0
                            min-w-[48px] min-h-[48px] sm:min-w-[100px] sm:min-h-[100px] md:min-w-[120px] md:min-h-[120px]
                            overflow-hidden
                            ${getCardClass()}
                            ${getBorderClass(selectedIndex === index)}
                            ${selectedIndex === index ? "scale-105" : ""}
                            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                        `}
          >
            <div
              className="grid sm:hidden"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                gap: "0",
              }}
            >
              {block.shape.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  // Check if this cell is filled
                  if (cell !== 1) {
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="bg-transparent"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                      />
                    );
                  }

                  // Check adjacent cells to determine border rendering
                  const hasTop =
                    rowIndex > 0 && block.shape[rowIndex - 1][colIndex] === 1;
                  const hasBottom =
                    rowIndex < rows - 1 &&
                    block.shape[rowIndex + 1][colIndex] === 1;
                  const hasLeft =
                    colIndex > 0 && block.shape[rowIndex][colIndex - 1] === 1;
                  const hasRight =
                    colIndex < cols - 1 &&
                    block.shape[rowIndex][colIndex + 1] === 1;

                  // Build border classes - only show borders on edges
                  const borderClasses = [
                    !hasTop && "border-t",
                    !hasBottom && "border-b",
                    !hasLeft && "border-l",
                    !hasRight && "border-r",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                                                transition-all
                                                bg-gradient-to-br ${block.color}
                                                ${borderClasses}
                                                border-black/20
                                                ${theme === "neon" ? "shadow-[0_0_4px_rgba(236,72,153,0.3)]" : "shadow-sm"}
                                            `}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        margin: "0",
                        padding: "0",
                      }}
                    />
                  );
                }),
              )}
            </div>
            <div
              className="hidden sm:grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSizeSm}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSizeSm}px)`,
                gap: "0",
              }}
            >
              {block.shape.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  // Check if this cell is filled
                  if (cell !== 1) {
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="bg-transparent"
                        style={{
                          width: `${cellSizeSm}px`,
                          height: `${cellSizeSm}px`,
                        }}
                      />
                    );
                  }

                  // Check adjacent cells to determine border rendering
                  const hasTop =
                    rowIndex > 0 && block.shape[rowIndex - 1][colIndex] === 1;
                  const hasBottom =
                    rowIndex < rows - 1 &&
                    block.shape[rowIndex + 1][colIndex] === 1;
                  const hasLeft =
                    colIndex > 0 && block.shape[rowIndex][colIndex - 1] === 1;
                  const hasRight =
                    colIndex < cols - 1 &&
                    block.shape[rowIndex][colIndex + 1] === 1;

                  // Build border classes - only show borders on edges
                  const borderClasses = [
                    !hasTop && "border-t",
                    !hasBottom && "border-b",
                    !hasLeft && "border-l",
                    !hasRight && "border-r",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                                                transition-all
                                                bg-gradient-to-br ${block.color}
                                                ${borderClasses}
                                                border-black/20
                                                ${theme === "neon" ? "shadow-[0_0_6px_rgba(236,72,153,0.3)]" : "shadow-sm"}
                                            `}
                      style={{
                        width: `${cellSizeSm}px`,
                        height: `${cellSizeSm}px`,
                        margin: "0",
                        padding: "0",
                      }}
                    />
                  );
                }),
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

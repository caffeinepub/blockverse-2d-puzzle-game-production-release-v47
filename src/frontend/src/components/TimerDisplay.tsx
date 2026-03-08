import type { Theme } from "@/pages/Game";
import { Clock } from "lucide-react";

interface TimerDisplayProps {
  timeRemaining: number;
  theme: Theme;
}

export function TimerDisplay({ timeRemaining, theme }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 30;

  const getTimerClass = () => {
    const baseClass =
      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-lg sm:text-xl transition-all duration-300";

    if (isLowTime) {
      return `${baseClass} ${
        theme === "light"
          ? "bg-red-100 text-red-700 border-2 border-red-300 animate-pulse"
          : theme === "dark"
            ? "bg-red-900/50 text-red-300 border-2 border-red-700 animate-pulse"
            : "bg-red-900/70 text-red-200 border-2 border-red-500 animate-pulse"
      }`;
    }

    return `${baseClass} ${
      theme === "light"
        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
        : theme === "dark"
          ? "bg-blue-900/50 text-blue-300 border-2 border-blue-700"
          : "bg-blue-900/70 text-blue-200 border-2 border-blue-500"
    }`;
  };

  return (
    <div className={getTimerClass()}>
      <Clock className={`w-5 h-5 ${isLowTime ? "animate-pulse" : ""}`} />
      <span className="font-mono">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

import type { PowerUp } from "@/lib/leaderboard";
import type { Theme } from "@/pages/Game";

interface PowerUpGlowOverlayProps {
  activePowerUp: PowerUp["type"] | null;
  theme: Theme;
}

export function PowerUpGlowOverlay({
  activePowerUp,
  theme,
}: PowerUpGlowOverlayProps) {
  if (!activePowerUp) return null;

  const getGlowClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-500/20 shadow-[inset_0_0_40px_rgba(168,85,247,0.35)]";
      case "dark":
        return "bg-cyan-500/20 shadow-[inset_0_0_40px_rgba(6,182,212,0.35)]";
      case "neon":
        return "bg-pink-500/20 shadow-[inset_0_0_40px_rgba(236,72,153,0.4)]";
      default:
        return "bg-purple-500/20 shadow-[inset_0_0_40px_rgba(168,85,247,0.35)]";
    }
  };

  const getBorderClass = () => {
    switch (theme) {
      case "light":
        return "border-2 border-purple-400/60";
      case "dark":
        return "border-2 border-cyan-400/60";
      case "neon":
        return "border-2 border-pink-400/70";
      default:
        return "border-2 border-purple-400/60";
    }
  };

  return (
    <div
      className={`absolute inset-0 rounded-lg pointer-events-none z-10 animate-pulse ${getGlowClass()} ${getBorderClass()}`}
      aria-hidden="true"
    />
  );
}

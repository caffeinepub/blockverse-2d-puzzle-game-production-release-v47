import type { Theme } from "@/pages/Game";
import { useEffect, useState } from "react";

interface ParticleEffectProps {
  type: "lineClear" | "levelUp" | "combo";
  theme: Theme;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function ParticleEffect({
  type,
  theme,
  position,
  onComplete,
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }>
  >([]);

  useEffect(() => {
    const particleCount = type === "levelUp" ? 30 : type === "combo" ? 20 : 15;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: position?.x || 50,
      y: position?.y || 50,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1.0,
    }));

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // Gravity
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0);

        if (updated.length === 0) {
          clearInterval(interval);
          if (onComplete) onComplete();
        }

        return updated;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [type, position, onComplete]);

  const getParticleImage = () => {
    switch (type) {
      case "lineClear":
        return "/assets/generated/line-clear-particles-transparent.dim_200x200.png";
      case "levelUp":
        return "/assets/generated/level-up-particles-transparent.dim_200x200.png";
      case "combo":
        return "/assets/generated/combo-celebration-particles-transparent.dim_200x200.png";
      default:
        return "/assets/generated/line-clear-particles-transparent.dim_200x200.png";
    }
  };

  const getParticleColor = () => {
    switch (theme) {
      case "light":
        return "brightness-110 saturate-150";
      case "dark":
        return "brightness-125 saturate-125";
      case "neon":
        return "brightness-150 saturate-200 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]";
      default:
        return "brightness-110 saturate-150";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((p) => (
        <img
          key={p.id}
          src={getParticleImage()}
          alt=""
          className={`absolute w-8 h-8 ${getParticleColor()}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.life,
            transform: `scale(${p.life})`,
            transition: "none",
          }}
        />
      ))}
    </div>
  );
}

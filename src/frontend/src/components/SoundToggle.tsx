import { Button } from "@/components/ui/button";
import {
  initSoundPreference,
  resumeAudioContext,
  toggleSound,
} from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

interface SoundToggleProps {
  theme: Theme;
}

export function SoundToggle({ theme }: SoundToggleProps) {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(initSoundPreference());
  }, []);

  const handleToggle = async () => {
    const newState = toggleSound();
    setSoundOn(newState);

    // If turning sound on, ensure audio context is resumed
    if (newState) {
      await resumeAudioContext();
    }
  };

  const getButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-300";
      case "dark":
        return "bg-gray-800/90 hover:bg-gray-800 text-cyan-400 border-2 border-cyan-500";
      case "neon":
        return "bg-black/80 hover:bg-black text-pink-400 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] sm:shadow-[0_0_20px_rgba(236,72,153,0.6)]";
      default:
        return "bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-300";
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40">
      <Button
        onClick={handleToggle}
        size="lg"
        className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-xl sm:shadow-2xl transition-all duration-300 touch-manipulation ${getButtonClass()}`}
        title={soundOn ? "Sesi Kapat" : "Sesi Aç"}
      >
        {soundOn ? (
          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </Button>
    </div>
  );
}

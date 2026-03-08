import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Palette } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const { t } = useLanguage();

  const getButtonClass = () => {
    switch (currentTheme) {
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

  const getMenuClass = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white border-gray-200";
      case "dark":
        return "bg-gray-800 border-gray-700 text-gray-100";
      case "neon":
        return "bg-black border-pink-500 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.4)] sm:shadow-[0_0_30px_rgba(236,72,153,0.5)]";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getItemClass = (theme: Theme) => {
    const isActive = currentTheme === theme;
    switch (currentTheme) {
      case "light":
        return isActive ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100";
      case "dark":
        return isActive ? "bg-cyan-900/50 text-cyan-300" : "hover:bg-gray-700";
      case "neon":
        return isActive
          ? "bg-pink-900/50 text-pink-300"
          : "hover:bg-pink-900/30";
      default:
        return isActive ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100";
    }
  };

  const handleThemeChange = (theme: Theme) => {
    playSound("button");
    onThemeChange(theme);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-xl sm:shadow-2xl transition-all duration-300 touch-manipulation ${getButtonClass()}`}
          >
            <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={`transition-all duration-300 ${getMenuClass()}`}
        >
          <DropdownMenuItem
            onClick={() => handleThemeChange("light")}
            className={`cursor-pointer transition-colors touch-manipulation ${getItemClass("light")}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 border-2 border-gray-300" />
              <span className="font-medium text-sm sm:text-base">
                {t("theme.light")}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("dark")}
            className={`cursor-pointer transition-colors touch-manipulation ${getItemClass("dark")}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600" />
              <span className="font-medium text-sm sm:text-base">
                {t("theme.dark")}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("neon")}
            className={`cursor-pointer transition-colors touch-manipulation ${getItemClass("neon")}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
              <span className="font-medium text-sm sm:text-base">
                {t("theme.neon")}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

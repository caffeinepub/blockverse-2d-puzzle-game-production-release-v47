import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import { Home } from "lucide-react";

interface HomeButtonProps {
  onNavigateHome: () => void;
  theme: Theme;
}

export function HomeButton({ onNavigateHome, theme }: HomeButtonProps) {
  const { t } = useLanguage();

  const getButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "dark":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "neon":
        return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
  };

  const handleClick = () => {
    playSound("button");
    onNavigateHome();
  };

  return (
    <Button
      onClick={handleClick}
      className={`${getButtonClass()} h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base`}
      size="sm"
      title={t("header.home")}
    >
      <Home className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      <span className="hidden xs:inline ml-1 sm:ml-2">{t("header.home")}</span>
    </Button>
  );
}

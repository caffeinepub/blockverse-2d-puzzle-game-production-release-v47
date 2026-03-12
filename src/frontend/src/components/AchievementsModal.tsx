import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Achievement, getAchievements } from "@/lib/achievements";
import type { Theme } from "@/pages/Game";
import { Medal, X } from "lucide-react";
import { useMemo } from "react";

interface AchievementsModalProps {
  theme: Theme;
  userCode: string;
  onClose: () => void;
}

interface AchievementCardProps {
  achievement: Achievement;
  name: string;
  desc: string;
  theme: Theme;
}

function AchievementCard({
  achievement,
  name,
  desc,
  theme,
}: AchievementCardProps) {
  const cardClass = (() => {
    if (!achievement.unlocked) {
      switch (theme) {
        case "dark":
          return "bg-gray-800/50 border border-gray-700 opacity-50";
        case "neon":
          return "bg-gray-900/50 border border-gray-700 opacity-50";
        default:
          return "bg-gray-100 border border-gray-200 opacity-60";
      }
    }
    switch (theme) {
      case "dark":
        return "bg-blue-900/40 border border-blue-500/50";
      case "neon":
        return "bg-pink-900/40 border border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.3)]";
      default:
        return "bg-purple-50 border border-purple-300";
    }
  })();

  const nameClass = (() => {
    if (!achievement.unlocked) {
      switch (theme) {
        case "dark":
          return "text-gray-400";
        case "neon":
          return "text-gray-500";
        default:
          return "text-gray-400";
      }
    }
    switch (theme) {
      case "dark":
        return "text-white";
      case "neon":
        return "text-pink-200";
      default:
        return "text-gray-800";
    }
  })();

  const descClass = (() => {
    switch (theme) {
      case "dark":
        return "text-gray-500";
      case "neon":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  })();

  return (
    <div
      className={`rounded-xl p-3 flex items-start gap-3 transition-all duration-200 ${cardClass}`}
    >
      <div className="text-2xl flex-shrink-0">
        {achievement.unlocked ? achievement.icon : "🔒"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${nameClass}`}>{name}</p>
        <p className={`text-xs mt-0.5 ${descClass}`}>{desc}</p>
      </div>
    </div>
  );
}

export function AchievementsModal({
  theme,
  userCode,
  onClose,
}: AchievementsModalProps) {
  const { t } = useLanguage();
  const achievements = useMemo(() => getAchievements(userCode), [userCode]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const cardClass = (() => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 border border-gray-700 text-gray-100";
      case "neon":
        return "bg-black border-2 border-pink-500 text-pink-100 shadow-[0_0_30px_rgba(236,72,153,0.5)]";
      default:
        return "bg-white border border-purple-100 text-gray-800";
    }
  })();

  const titleClass = (() => {
    switch (theme) {
      case "dark":
        return "text-white";
      case "neon":
        return "text-pink-300";
      default:
        return "text-purple-700";
    }
  })();

  const iconClass = (() => {
    switch (theme) {
      case "dark":
        return "text-blue-400";
      case "neon":
        return "text-pink-400";
      default:
        return "text-purple-500";
    }
  })();

  const subClass = (() => {
    switch (theme) {
      case "dark":
        return "text-gray-400";
      case "neon":
        return "text-pink-300/60";
      default:
        return "text-gray-500";
    }
  })();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      data-ocid="achievements.modal"
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl max-h-[80vh] flex flex-col ${cardClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Medal className={`w-5 h-5 ${iconClass}`} />
            <h2 className={`text-lg font-bold ${titleClass}`}>
              {t("achievements.title")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full"
            data-ocid="achievements.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className={`text-xs mb-4 flex-shrink-0 ${subClass}`}>
          {unlockedCount} / {achievements.length} {t("achievements.unlocked")}
        </p>

        {/* Scrollable list */}
        <div
          className="flex flex-col gap-2 overflow-y-auto"
          data-ocid="achievements.list"
        >
          {achievements.map((achievement, idx) => (
            <div
              key={achievement.id}
              data-ocid={`achievements.item.${idx + 1}`}
            >
              <AchievementCard
                achievement={achievement}
                name={t(`achievement.${achievement.id}.name`)}
                desc={t(`achievement.${achievement.id}.desc`)}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

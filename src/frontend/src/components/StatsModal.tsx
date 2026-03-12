import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { type PlayerStats, getPlayerStats } from "@/lib/playerStats";
import type { Theme } from "@/pages/Game";
import { BarChart2, Clock, Star, Target, Trophy, X, Zap } from "lucide-react";
import { useMemo } from "react";

interface StatsModalProps {
  theme: Theme;
  userCode: string;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  theme: Theme;
}

function StatCard({ icon, label, value, theme }: StatCardProps) {
  const cardClass = (() => {
    switch (theme) {
      case "dark":
        return "bg-gray-800 border border-gray-700";
      case "neon":
        return "bg-gray-900 border border-pink-500/30";
      default:
        return "bg-purple-50 border border-purple-100";
    }
  })();

  const labelClass = (() => {
    switch (theme) {
      case "dark":
        return "text-gray-400";
      case "neon":
        return "text-pink-300/70";
      default:
        return "text-gray-500";
    }
  })();

  const valueClass = (() => {
    switch (theme) {
      case "dark":
        return "text-white";
      case "neon":
        return "text-pink-200";
      default:
        return "text-gray-800";
    }
  })();

  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1 ${cardClass}`}>
      <div className={`flex items-center gap-1.5 ${labelClass}`}>
        <span className="w-3.5 h-3.5">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-lg font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

export function StatsModal({ theme, userCode, onClose }: StatsModalProps) {
  const { t } = useLanguage();
  const stats: PlayerStats = useMemo(
    () => getPlayerStats(userCode),
    [userCode],
  );

  const overlayClass =
    "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";

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

  return (
    <div className={overlayClass} data-ocid="stats.modal">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl ${cardClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className={`w-5 h-5 ${iconClass}`} />
            <h2 className={`text-lg font-bold ${titleClass}`}>
              {t("stats.title")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full"
            data-ocid="stats.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3" data-ocid="stats.panel">
          <StatCard
            icon={<Target className="w-3.5 h-3.5" />}
            label={t("stats.totalGames")}
            value={stats.totalGames}
            theme={theme}
          />
          <StatCard
            icon={<Trophy className="w-3.5 h-3.5" />}
            label={t("stats.bestScore")}
            value={stats.bestScore.toLocaleString()}
            theme={theme}
          />
          <StatCard
            icon={<Star className="w-3.5 h-3.5" />}
            label={t("stats.totalLines")}
            value={stats.totalLinesCleared}
            theme={theme}
          />
          <StatCard
            icon={<BarChart2 className="w-3.5 h-3.5" />}
            label={t("stats.totalScore")}
            value={stats.totalScore.toLocaleString()}
            theme={theme}
          />
          <StatCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label={t("stats.timePlayed")}
            value={formatTime(stats.totalTimePlayed)}
            theme={theme}
          />
          <StatCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label={t("stats.bestCombo")}
            value={stats.bestCombo}
            theme={theme}
          />
          <StatCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label={t("stats.powerUpsUsed")}
            value={stats.powerUpsUsed}
            theme={theme}
          />
          <StatCard
            icon={<Star className="w-3.5 h-3.5" />}
            label={t("stats.longestStreak")}
            value={stats.longestStreak}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

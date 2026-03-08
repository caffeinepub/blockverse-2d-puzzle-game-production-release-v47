import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type DailyMission,
  type WeeklyMission,
  claimMissionReward,
  claimWeeklyMissionReward,
  getDailyMissions,
  getWeeklyMissions,
  getWeeklyResetTimeRemaining,
} from "@/lib/dailyMissions";
import { addPowerUp } from "@/lib/leaderboard";
import { playSound } from "@/lib/sounds";
import type { Theme } from "@/pages/Game";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DailyMissionsModalProps {
  theme: Theme;
  userCode: string;
  playerLevel: number;
  onClose: () => void;
  onRewardClaimed: (points?: number) => void;
}

export function DailyMissionsModal({
  theme,
  userCode,
  playerLevel,
  onClose,
  onRewardClaimed,
}: DailyMissionsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMission[]>([]);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);
  const [weeklyResetMs, setWeeklyResetMs] = useState(0);

  useEffect(() => {
    setDailyMissions(getDailyMissions(userCode, playerLevel));
    setWeeklyMissions(getWeeklyMissions(userCode, playerLevel));
    setWeeklyResetMs(getWeeklyResetTimeRemaining(userCode));
  }, [userCode, playerLevel]);

  const formatTimeRemaining = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}g ${hours}s`;
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}s ${minutes}d`;
  };

  const getModalClass = () => {
    switch (theme) {
      case "light":
        return "bg-white/95 backdrop-blur-md border-purple-200";
      case "dark":
        return "bg-gray-900/95 backdrop-blur-md border-blue-500";
      case "neon":
        return "bg-purple-900/95 backdrop-blur-md border-pink-500 shadow-2xl shadow-pink-500/50";
      default:
        return "bg-white/95 backdrop-blur-md border-purple-200";
    }
  };

  const getTextClass = () => {
    switch (theme) {
      case "light":
        return "text-gray-800";
      case "dark":
        return "text-gray-100";
      case "neon":
        return "text-pink-100";
      default:
        return "text-gray-800";
    }
  };

  const getButtonClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "dark":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "neon":
        return "bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50";
      default:
        return "bg-purple-600 hover:bg-purple-700 text-white";
    }
  };

  const getTabClass = (tab: "daily" | "weekly") => {
    const isActive = activeTab === tab;
    if (isActive) {
      switch (theme) {
        case "light":
          return "bg-purple-600 text-white";
        case "dark":
          return "bg-blue-600 text-white";
        case "neon":
          return "bg-pink-600 text-white shadow-pink-500/50";
        default:
          return "bg-purple-600 text-white";
      }
    }
    switch (theme) {
      case "light":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "dark":
        return "bg-gray-700 text-gray-300 hover:bg-gray-600";
      case "neon":
        return "bg-purple-900/50 text-pink-300 hover:bg-purple-800/50";
      default:
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
    }
  };

  const getProgressClass = () => {
    switch (theme) {
      case "light":
        return "bg-purple-200";
      case "dark":
        return "bg-blue-900";
      case "neon":
        return "bg-pink-900";
      default:
        return "bg-purple-200";
    }
  };

  const handleClaimDailyReward = async (mission: DailyMission) => {
    if (!mission.completed || mission.claimed || claimingMission) return;
    setClaimingMission(mission.id);
    playSound("powerUp");
    const claimedMission = claimMissionReward(userCode, mission.id);
    if (claimedMission) {
      if (claimedMission.rewardType === "points") {
        onRewardClaimed(claimedMission.rewardValue);
      } else if (
        claimedMission.rewardType === "powerUps" &&
        claimedMission.rewardPowerUpType
      ) {
        for (let i = 0; i < claimedMission.rewardValue; i++) {
          addPowerUp(userCode, claimedMission.rewardPowerUpType);
        }
        onRewardClaimed();
      } else {
        onRewardClaimed();
      }
      setDailyMissions(getDailyMissions(userCode, playerLevel));
      playSound("rankUp");
    }
    setTimeout(() => setClaimingMission(null), 1000);
  };

  const handleClaimWeeklyReward = async (mission: WeeklyMission) => {
    if (!mission.completed || mission.claimed || claimingMission) return;
    setClaimingMission(mission.id);
    playSound("powerUp");
    const claimedMission = claimWeeklyMissionReward(userCode, mission.id);
    if (claimedMission) {
      if (claimedMission.rewardType === "points") {
        onRewardClaimed(claimedMission.rewardValue);
      } else if (
        claimedMission.rewardType === "powerUps" &&
        claimedMission.rewardPowerUpType
      ) {
        for (let i = 0; i < claimedMission.rewardValue; i++) {
          addPowerUp(userCode, claimedMission.rewardPowerUpType);
        }
        onRewardClaimed();
      } else {
        onRewardClaimed();
      }
      setWeeklyMissions(getWeeklyMissions(userCode, playerLevel));
      playSound("rankUp");
    }
    setTimeout(() => setClaimingMission(null), 1000);
  };

  const getMissionIcon = (type: DailyMission["type"]) => {
    switch (type) {
      case "clearLines":
      case "clearTotalLines":
        return <Trophy className="h-5 w-5" />;
      case "scorePoints":
        return <TrendingUp className="h-5 w-5" />;
      case "usePowerUps":
      case "triggerChains":
        return <Zap className="h-5 w-5" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getRewardText = (mission: DailyMission | WeeklyMission) => {
    if (mission.rewardType === "points") {
      return `${mission.rewardValue} ${t("missions.rewardPoints")}`;
    }
    if (mission.rewardType === "powerUps" && mission.rewardPowerUpType) {
      const powerUpName = t(`powerups.${mission.rewardPowerUpType}.shortName`);
      return `${mission.rewardValue}x ${powerUpName}`;
    }
    if (mission.rewardType === "comboBoost") {
      return `${mission.rewardValue}x ${t("missions.rewardCombo")}`;
    }
    return "";
  };

  const getMissionCardClass = (completed: boolean) => {
    if (completed) {
      switch (theme) {
        case "light":
          return "bg-green-50 border-green-300";
        case "dark":
          return "bg-green-900/30 border-green-600";
        case "neon":
          return "bg-green-900/40 border-green-500";
      }
    }
    switch (theme) {
      case "light":
        return "bg-purple-50 border-purple-200";
      case "dark":
        return "bg-gray-800 border-gray-700";
      case "neon":
        return "bg-purple-900/30 border-purple-700";
    }
    return "bg-purple-50 border-purple-200";
  };

  const getIconBoxClass = (completed: boolean) => {
    if (completed) return "bg-green-500 text-white";
    switch (theme) {
      case "light":
        return "bg-purple-200 text-purple-700";
      case "dark":
        return "bg-blue-700 text-blue-100";
      case "neon":
        return "bg-pink-700 text-pink-100";
      default:
        return "bg-purple-200 text-purple-700";
    }
  };

  const renderMissions = (
    missions: (DailyMission | WeeklyMission)[],
    isWeekly: boolean,
  ) => (
    <div className="space-y-4">
      {missions.map((mission) => (
        <div
          key={mission.id}
          className={`p-4 rounded-xl border-2 ${getMissionCardClass(mission.completed)} transition-all`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${getIconBoxClass(mission.completed)}`}
            >
              {getMissionIcon(mission.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg ${getTextClass()}`}>
                  {t(`missions.${mission.type}.name`)}
                </h3>
                {isWeekly && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      theme === "light"
                        ? "bg-amber-100 text-amber-700"
                        : theme === "dark"
                          ? "bg-amber-900/50 text-amber-300"
                          : "bg-amber-900/50 text-amber-200"
                    }`}
                  >
                    {t("missions.weekly")}
                  </span>
                )}
              </div>
              <p className={`text-sm ${getTextClass()} opacity-70`}>
                {t(`missions.${mission.type}.description`).replace(
                  "{target}",
                  mission.target.toString(),
                )}
              </p>
            </div>
            {mission.completed && (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            )}
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className={getTextClass()}>
                {t("missions.progress")}: {mission.progress} / {mission.target}
              </span>
              <span className={getTextClass()}>
                {Math.round((mission.progress / mission.target) * 100)}%
              </span>
            </div>
            <Progress
              value={(mission.progress / mission.target) * 100}
              className={`h-2 ${getProgressClass()}`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className={`text-sm font-semibold ${getTextClass()}`}>
              {t("missions.reward")}: {getRewardText(mission)}
            </div>
            {mission.completed && !mission.claimed && (
              <Button
                onClick={() =>
                  isWeekly
                    ? handleClaimWeeklyReward(mission as WeeklyMission)
                    : handleClaimDailyReward(mission as DailyMission)
                }
                disabled={claimingMission === mission.id}
                className={`${getButtonClass()} text-sm px-4 py-2`}
              >
                {claimingMission === mission.id
                  ? t("missions.claiming")
                  : t("missions.claim")}
              </Button>
            )}
            {mission.claimed && (
              <span className="text-sm text-green-600 font-semibold">
                ✓ {t("missions.claimed")}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const dailyUnclaimedCount = dailyMissions.filter(
    (m) => m.completed && !m.claimed,
  ).length;
  const weeklyUnclaimedCount = weeklyMissions.filter(
    (m) => m.completed && !m.claimed,
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${getModalClass()} p-6 shadow-2xl`}
      >
        <button
          type="button"
          onClick={() => {
            playSound("button");
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full ${getButtonClass()} transition-all hover:scale-110`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src="/assets/generated/daily-missions-icon-transparent.dim_64x64.png"
            alt="Missions"
            className="h-12 w-12"
          />
          <div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${getTextClass()}`}>
              {t("missions.title")}
            </h2>
            <p className={`text-sm ${getTextClass()} opacity-80`}>
              {t("missions.description")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${getTabClass("daily")}`}
          >
            <Calendar className="h-4 w-4" />
            {t("missions.daily")}
            {dailyUnclaimedCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {dailyUnclaimedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${getTabClass("weekly")}`}
          >
            <CalendarDays className="h-4 w-4" />
            {t("missions.weekly")}
            {weeklyUnclaimedCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {weeklyUnclaimedCount}
              </span>
            )}
          </button>
        </div>

        {/* Mission list */}
        {activeTab === "daily"
          ? renderMissions(dailyMissions, false)
          : renderMissions(weeklyMissions, true)}

        {/* Reset info */}
        <div
          className={`mt-6 p-4 rounded-lg ${
            theme === "light"
              ? "bg-blue-50 border-blue-200"
              : theme === "dark"
                ? "bg-blue-900/30 border-blue-700"
                : "bg-blue-900/40 border-blue-500"
          } border`}
        >
          <p className={`text-sm ${getTextClass()} text-center`}>
            {activeTab === "daily"
              ? t("missions.resetInfo")
              : weeklyResetMs > 0
                ? t("missions.weeklyResetIn").replace(
                    "{time}",
                    formatTimeRemaining(weeklyResetMs),
                  )
                : t("missions.weeklyResetInfo")}
          </p>
        </div>
      </div>
    </div>
  );
}

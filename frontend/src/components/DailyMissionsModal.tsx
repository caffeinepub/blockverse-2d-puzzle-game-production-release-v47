import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Trophy, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { getDailyMissions, claimMissionReward, type DailyMission } from '@/lib/dailyMissions';
import { addPowerUp } from '@/lib/leaderboard';
import type { Theme } from '@/pages/Game';

interface DailyMissionsModalProps {
    theme: Theme;
    userCode: string;
    playerLevel: number;
    onClose: () => void;
    onRewardClaimed: (points?: number) => void;
}

export function DailyMissionsModal({ theme, userCode, playerLevel, onClose, onRewardClaimed }: DailyMissionsModalProps) {
    const { t } = useLanguage();
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [claimingMission, setClaimingMission] = useState<string | null>(null);

    useEffect(() => {
        const loadedMissions = getDailyMissions(userCode, playerLevel);
        setMissions(loadedMissions);
    }, [userCode, playerLevel]);

    const getModalClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white/95 backdrop-blur-md border-purple-200';
            case 'dark':
                return 'bg-gray-900/95 backdrop-blur-md border-blue-500';
            case 'neon':
                return 'bg-purple-900/95 backdrop-blur-md border-pink-500 shadow-2xl shadow-pink-500/50';
            default:
                return 'bg-white/95 backdrop-blur-md border-purple-200';
        }
    };

    const getTextClass = () => {
        switch (theme) {
            case 'light':
                return 'text-gray-800';
            case 'dark':
                return 'text-gray-100';
            case 'neon':
                return 'text-pink-100';
            default:
                return 'text-gray-800';
        }
    };

    const getButtonClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-purple-600 hover:bg-purple-700 text-white';
            case 'dark':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            case 'neon':
                return 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50';
            default:
                return 'bg-purple-600 hover:bg-purple-700 text-white';
        }
    };

    const getProgressClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-purple-200';
            case 'dark':
                return 'bg-blue-900';
            case 'neon':
                return 'bg-pink-900';
            default:
                return 'bg-purple-200';
        }
    };

    const handleClaimReward = async (mission: DailyMission) => {
        if (!mission.completed || mission.claimed || claimingMission) return;

        setClaimingMission(mission.id);
        playSound('powerUp');

        const claimedMission = claimMissionReward(userCode, mission.id);
        
        if (claimedMission) {
            // Apply rewards
            if (claimedMission.rewardType === 'points') {
                onRewardClaimed(claimedMission.rewardValue);
            } else if (claimedMission.rewardType === 'powerUps' && claimedMission.rewardPowerUpType) {
                for (let i = 0; i < claimedMission.rewardValue; i++) {
                    addPowerUp(userCode, claimedMission.rewardPowerUpType);
                }
                onRewardClaimed();
            } else if (claimedMission.rewardType === 'comboBoost') {
                // Combo boost is applied in-game, just notify
                onRewardClaimed();
            }

            // Reload missions
            const updatedMissions = getDailyMissions(userCode, playerLevel);
            setMissions(updatedMissions);
            
            playSound('rankUp');
        }

        setTimeout(() => setClaimingMission(null), 1000);
    };

    const getMissionIcon = (type: DailyMission['type']) => {
        switch (type) {
            case 'clearLines':
            case 'clearTotalLines':
                return <Trophy className="h-5 w-5" />;
            case 'scorePoints':
                return <TrendingUp className="h-5 w-5" />;
            case 'usePowerUps':
            case 'triggerChains':
                return <Zap className="h-5 w-5" />;
            default:
                return <CheckCircle2 className="h-5 w-5" />;
        }
    };

    const getRewardText = (mission: DailyMission) => {
        if (mission.rewardType === 'points') {
            return `${mission.rewardValue} ${t('missions.rewardPoints')}`;
        } else if (mission.rewardType === 'powerUps' && mission.rewardPowerUpType) {
            const powerUpName = t(`powerups.${mission.rewardPowerUpType}.shortName`);
            return `${mission.rewardValue}x ${powerUpName}`;
        } else if (mission.rewardType === 'comboBoost') {
            return `${mission.rewardValue}x ${t('missions.rewardCombo')}`;
        }
        return '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${getModalClass()} p-6 shadow-2xl`}
                style={{
                    backgroundImage: 'url(/assets/generated/daily-missions-modal-bg-transparent.dim_400x300.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button
                    onClick={() => {
                        playSound('button');
                        onClose();
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full ${getButtonClass()} transition-all hover:scale-110`}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <img 
                        src="/assets/generated/daily-missions-icon-transparent.dim_64x64.png"
                        alt="Daily Missions"
                        className="h-12 w-12"
                    />
                    <div>
                        <h2 className={`text-2xl sm:text-3xl font-bold ${getTextClass()}`}>
                            {t('missions.title')}
                        </h2>
                        <p className={`text-sm ${getTextClass()} opacity-80`}>
                            {t('missions.description')}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {missions.map((mission) => (
                        <div
                            key={mission.id}
                            className={`p-4 rounded-xl border-2 ${
                                mission.completed 
                                    ? theme === 'light' ? 'bg-green-50 border-green-300' :
                                      theme === 'dark' ? 'bg-green-900/30 border-green-600' :
                                      'bg-green-900/40 border-green-500'
                                    : theme === 'light' ? 'bg-purple-50 border-purple-200' :
                                      theme === 'dark' ? 'bg-gray-800 border-gray-700' :
                                      'bg-purple-900/30 border-purple-700'
                            } transition-all`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${
                                    mission.completed 
                                        ? 'bg-green-500 text-white' 
                                        : theme === 'light' ? 'bg-purple-200 text-purple-700' :
                                          theme === 'dark' ? 'bg-blue-700 text-blue-100' :
                                          'bg-pink-700 text-pink-100'
                                }`}>
                                    {getMissionIcon(mission.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg ${getTextClass()}`}>
                                        {t(`missions.${mission.type}.name`)}
                                    </h3>
                                    <p className={`text-sm ${getTextClass()} opacity-70`}>
                                        {t(`missions.${mission.type}.description`).replace('{target}', mission.target.toString())}
                                    </p>
                                </div>
                                {mission.completed && (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                )}
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={getTextClass()}>
                                        {t('missions.progress')}: {mission.progress} / {mission.target}
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
                                    {t('missions.reward')}: {getRewardText(mission)}
                                </div>
                                {mission.completed && !mission.claimed && (
                                    <Button
                                        onClick={() => handleClaimReward(mission)}
                                        disabled={claimingMission === mission.id}
                                        className={`${getButtonClass()} text-sm px-4 py-2`}
                                    >
                                        {claimingMission === mission.id ? t('missions.claiming') : t('missions.claim')}
                                    </Button>
                                )}
                                {mission.claimed && (
                                    <span className="text-sm text-green-600 font-semibold">
                                        ✓ {t('missions.claimed')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-6 p-4 rounded-lg ${
                    theme === 'light' ? 'bg-blue-50' :
                    theme === 'dark' ? 'bg-blue-900/30' :
                    'bg-blue-900/40'
                } border ${
                    theme === 'light' ? 'border-blue-200' :
                    theme === 'dark' ? 'border-blue-700' :
                    'border-blue-500'
                }`}>
                    <p className={`text-sm ${getTextClass()} text-center`}>
                        {t('missions.resetInfo')}
                    </p>
                </div>
            </div>
        </div>
    );
}

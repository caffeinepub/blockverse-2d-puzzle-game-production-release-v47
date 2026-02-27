import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { MobileNativeAd } from './ads/MobileNativeAd';
import { getLeaderboard, getBadgeForLevel, type LeaderboardEntry } from '@/lib/leaderboard';
import type { Theme } from '@/pages/Game';
import type { GameMode } from '@/App';

interface LeaderboardProps {
    theme: Theme;
    onClose: () => void;
    currentUserCode: string;
    gameMode?: GameMode;
}

export function Leaderboard({ theme, onClose, currentUserCode, gameMode = 'endless' }: LeaderboardProps) {
    const { t } = useLanguage();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const leaderboardData = getLeaderboard(gameMode);
        setEntries(leaderboardData);
    }, [gameMode]);

    const getDialogClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white border-purple-200';
            case 'dark':
                return 'bg-gray-900 border-gray-700 text-white';
            case 'neon':
                return 'bg-black border-pink-500 text-white';
            default:
                return 'bg-white border-purple-200';
        }
    };

    const getRowClass = (isCurrentUser: boolean) => {
        const baseClass = 'flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg transition-colors';
        
        if (isCurrentUser) {
            return `${baseClass} ${
                theme === 'light' ? 'bg-purple-100 border-2 border-purple-300' :
                theme === 'dark' ? 'bg-purple-900/50 border-2 border-purple-700' :
                'bg-pink-900/50 border-2 border-pink-500'
            }`;
        }
        
        return `${baseClass} ${
            theme === 'light' ? 'hover:bg-gray-50' :
            theme === 'dark' ? 'hover:bg-gray-800' :
            'hover:bg-gray-900'
        }`;
    };

    const getRankBadgeClass = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500 text-white';
        if (rank === 2) return 'bg-gray-400 text-white';
        if (rank === 3) return 'bg-orange-600 text-white';
        return theme === 'light' ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300';
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className={`${getDialogClass()} max-w-2xl max-h-[85vh] sm:max-h-[90vh]`}>
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
                        {t('leaderboard.title')}
                    </DialogTitle>
                    <p className={`text-xs sm:text-sm text-center mt-2 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                        {t('leaderboard.monthlyReset')}
                    </p>
                </DialogHeader>

                <ScrollArea className="h-[50vh] sm:h-[60vh] pr-4">
                    <div className="space-y-2">
                        {entries.length === 0 ? (
                            <div className={`text-center py-8 ${
                                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                {t('leaderboard.empty')}
                            </div>
                        ) : (
                            entries.map((entry, index) => {
                                const isCurrentUser = entry.userCode === currentUserCode;
                                const badge = getBadgeForLevel(entry.level);
                                
                                return (
                                    <div key={entry.userCode}>
                                        <div className={getRowClass(isCurrentUser)}>
                                            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${getRankBadgeClass(index + 1)}`}>
                                                {index + 1}
                                            </div>
                                            
                                            <img 
                                                src={badge.image} 
                                                alt={badge.name}
                                                className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                                                title={badge.name}
                                            />
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm sm:text-base truncate">
                                                    {entry.username}
                                                    {isCurrentUser && (
                                                        <span className={`ml-2 text-xs ${
                                                            theme === 'light' ? 'text-purple-600' :
                                                            theme === 'dark' ? 'text-purple-400' :
                                                            'text-pink-400'
                                                        }`}>
                                                            ({t('leaderboard.you')})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs sm:text-sm ${
                                                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                                }`}>
                                                    {t('leaderboard.level')} {entry.level}
                                                </div>
                                            </div>
                                            
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-bold text-sm sm:text-base md:text-lg">
                                                    {entry.score.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {index === 4 && (
                                            <div className="my-4">
                                                <MobileNativeAd theme={theme} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

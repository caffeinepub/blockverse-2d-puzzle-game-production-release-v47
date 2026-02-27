import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { getCompletedUnclaimedCount } from '@/lib/dailyMissions';
import type { Theme } from '@/pages/Game';

interface DailyMissionsButtonProps {
    theme: Theme;
    userCode: string;
    onClick: () => void;
}

export function DailyMissionsButton({ theme, userCode, onClick }: DailyMissionsButtonProps) {
    const { t } = useLanguage();
    const [unclaimedCount, setUnclaimedCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const count = getCompletedUnclaimedCount(userCode);
            setUnclaimedCount(count);
        };

        updateCount();
        const interval = setInterval(updateCount, 2000);
        return () => clearInterval(interval);
    }, [userCode]);

    const getButtonClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg';
            case 'dark':
                return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg';
            case 'neon':
                return 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50';
            default:
                return 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg';
        }
    };

    return (
        <Button
            onClick={onClick}
            className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 h-12 sm:h-14 w-12 sm:w-14 rounded-full ${getButtonClass()} transition-all hover:scale-110 flex items-center justify-center`}
            title={t('missions.title')}
        >
            <Target className="h-5 w-5 sm:h-6 sm:w-6" />
            {unclaimedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unclaimedCount}
                </span>
            )}
        </Button>
    );
}

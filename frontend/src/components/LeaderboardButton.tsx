import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Theme } from '@/pages/Game';

interface LeaderboardButtonProps {
    theme: Theme;
    onClick: () => void;
}

export function LeaderboardButton({ theme, onClick }: LeaderboardButtonProps) {
    const { t } = useLanguage();

    const getButtonClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg';
            case 'dark':
                return 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg';
            case 'neon':
                return 'bg-pink-600 hover:bg-pink-700 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]';
            default:
                return 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg';
        }
    };

    return (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40">
            <Button
                onClick={onClick}
                className={`${getButtonClass()} rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 transition-all duration-300 hover:scale-110`}
                title={t('leaderboard.title')}
            >
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
            </Button>
        </div>
    );
}

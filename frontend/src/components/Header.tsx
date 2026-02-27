import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineMode } from '@/contexts/OfflineModeContext';
import { Button } from '@/components/ui/button';
import { RotateCcw, User, WifiOff, Target } from 'lucide-react';
import { HomeButton } from '@/components/HomeButton';
import { playSound } from '@/lib/sounds';
import type { Theme } from '@/pages/Game';

interface HeaderProps {
    onRestart: () => void;
    onOpenProfile: () => void;
    onOpenMissions?: () => void;
    onNavigateHome?: () => void;
    theme: Theme;
    playerLevel: number;
}

export function Header({ onRestart, onOpenProfile, onOpenMissions, onNavigateHome, theme, playerLevel }: HeaderProps) {
    const { t } = useLanguage();
    const { isOffline } = useOfflineMode();

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

    const getOfflineBadgeClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'dark':
                return 'bg-orange-900/50 text-orange-300 border-orange-700';
            case 'neon':
                return 'bg-orange-900/70 text-orange-300 border-orange-500 shadow-lg shadow-orange-500/30';
            default:
                return 'bg-orange-100 text-orange-700 border-orange-300';
        }
    };

    const handleOpenProfile = () => {
        playSound('button');
        onOpenProfile();
    };

    const handleOpenMissions = () => {
        if (onOpenMissions) {
            playSound('button');
            onOpenMissions();
        }
    };

    return (
        <header className="w-full py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img 
                        src="/assets/generated/blockverse-logo-transparent.dim_300x100.png" 
                        alt="BlockVerse" 
                        className="h-6 sm:h-8 md:h-10 w-auto"
                    />
                    {isOffline && (
                        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border ${getOfflineBadgeClass()} backdrop-blur-sm`}>
                            <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="text-xs sm:text-sm font-semibold">
                                {t('offline.mode')}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onNavigateHome && (
                        <HomeButton
                            onNavigateHome={onNavigateHome}
                            theme={theme}
                        />
                    )}
                    {onOpenMissions && (
                        <Button
                            onClick={handleOpenMissions}
                            className={`${getButtonClass()} h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base`}
                            size="sm"
                            title={t('missions.title')}
                        >
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            <span className="hidden md:inline ml-1 sm:ml-2">{t('missions.short')}</span>
                        </Button>
                    )}
                    <Button
                        onClick={onRestart}
                        className={`${getButtonClass()} h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base`}
                        size="sm"
                    >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        <span className="hidden xs:inline ml-1 sm:ml-2">{t('header.restart')}</span>
                    </Button>
                    <Button
                        onClick={handleOpenProfile}
                        className={`${getButtonClass()} h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base`}
                        size="sm"
                    >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        <span className="hidden sm:inline ml-1 sm:ml-2">{t('header.profile')}</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

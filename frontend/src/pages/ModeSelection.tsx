import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeSelector } from '@/components/ThemeSelector';
import { SoundToggle } from '@/components/SoundToggle';
import { playSound } from '@/lib/sounds';
import { Clock, Infinity, Target, Zap, Sparkles } from 'lucide-react';
import type { Theme } from './Game';
import type { GameMode } from '@/App';

interface ModeSelectionProps {
    onModeSelect: (mode: GameMode) => void;
}

export function ModeSelection({ onModeSelect }: ModeSelectionProps) {
    const { t } = useLanguage();
    const [theme, setTheme] = useState<Theme>('light');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const getBackgroundGradientClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100';
            case 'dark':
                return 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900';
            case 'neon':
                return 'bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900';
            default:
                return 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100';
        }
    };

    const getCardClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white/95 backdrop-blur-md border-purple-200 shadow-xl hover:shadow-2xl';
            case 'dark':
                return 'bg-gray-900/95 backdrop-blur-md border-gray-700 text-white shadow-xl hover:shadow-2xl';
            case 'neon':
                return 'bg-black/90 backdrop-blur-md border-pink-500 text-white shadow-xl shadow-pink-500/20 hover:shadow-pink-500/30';
            default:
                return 'bg-white/95 backdrop-blur-md border-purple-200 shadow-xl hover:shadow-2xl';
        }
    };

    const modes: Array<{
        id: GameMode;
        icon: typeof Clock;
        iconSrc: string;
    }> = [
        { id: 'timeAttack', icon: Clock, iconSrc: '/assets/generated/time-attack-icon-transparent.dim_128x128.png' },
        { id: 'endless', icon: Infinity, iconSrc: '/assets/generated/endless-mode-icon-transparent.dim_128x128.png' },
        { id: 'strategy', icon: Target, iconSrc: '/assets/generated/strategy-mode-icon-transparent.dim_128x128.png' },
        { id: 'powerBoost', icon: Zap, iconSrc: '/assets/generated/power-boost-icon-transparent.dim_128x128.png' },
        { id: 'advancedStrategy', icon: Sparkles, iconSrc: '/assets/generated/advanced-strategy-mode-icon-transparent.dim_128x128.png' },
    ];

    const handleModeSelect = (mode: GameMode) => {
        playSound('button');
        setTimeout(() => {
            playSound('gameStart');
            onModeSelect(mode);
        }, 200);
    };

    return (
        <div className={`min-h-[100dvh] flex flex-col ${getBackgroundGradientClass()} relative overflow-hidden`}>
            {/* Animated particles */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute startup-particle-motion"
                        style={{
                            left: `${(i * 13 + 5) % 95}%`,
                            top: `${(i * 17 + 10) % 90}%`,
                            animationDelay: `${i * 0.8}s`,
                            animationDuration: `${12 + i * 1.5}s`,
                        }}
                    >
                        <div 
                            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full opacity-15 ${
                                theme === 'light' ? 'bg-purple-400' :
                                theme === 'dark' ? 'bg-purple-500' :
                                'bg-pink-500'
                            }`}
                            style={{ filter: 'blur(6px)' }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-[100dvh]">
                <header className="w-full py-6 sm:py-8 md:py-10 px-4 sm:px-6">
                    <div 
                        className={`container mx-auto flex items-center justify-center transition-all duration-1000 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                        }`}
                    >
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center ${
                            theme === 'light' ? 'text-gray-800' :
                            theme === 'dark' ? 'text-white' :
                            'text-pink-100'
                        }`}>
                            {t('mode.selectTitle')}
                        </h1>
                    </div>
                </header>

                <main className="flex-1 container mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center gap-4 sm:gap-6">
                    <div 
                        className={`w-full max-w-5xl transition-all duration-1000 delay-200 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {modes.map((mode, index) => (
                                <Card 
                                    key={mode.id}
                                    className={`${getCardClass()} border-2 transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                                        mode.id === 'advancedStrategy' ? 'sm:col-span-2 lg:col-span-1' : ''
                                    }`}
                                    style={{ 
                                        transitionDelay: `${index * 100}ms`,
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                                    }}
                                    onClick={() => handleModeSelect(mode.id)}
                                >
                                    <CardHeader className="text-center space-y-3 pb-3">
                                        <div className="flex justify-center">
                                            <img 
                                                src={mode.iconSrc} 
                                                alt={t(`mode.${mode.id}.name`)}
                                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                                            />
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
                                            {t(`mode.${mode.id}.name`)}
                                        </CardTitle>
                                        <CardDescription className={`text-sm sm:text-base ${
                                            theme === 'light' ? 'text-gray-600' :
                                            theme === 'dark' ? 'text-gray-300' :
                                            'text-pink-200'
                                        }`}>
                                            {t(`mode.${mode.id}.description`)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <Button 
                                            className="w-full h-12 text-base font-semibold"
                                            size="lg"
                                        >
                                            {t('mode.select')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
            <LanguageSelector theme={theme} />
            <SoundToggle theme={theme} />
        </div>
    );
}

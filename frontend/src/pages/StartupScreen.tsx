import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeSelector } from '@/components/ThemeSelector';
import { SoundToggle } from '@/components/SoundToggle';
import { MobileBannerAd } from '@/components/ads/MobileBannerAd';
import { generateUserCode, initializeStarterPowerUps } from '@/lib/userAuth';
import { playSound, resumeAudioContext, isSoundEnabled } from '@/lib/sounds';
import { toast } from 'sonner';
import type { Theme } from './Game';

interface StartupScreenProps {
    onLogin: () => void;
}

export function StartupScreen({ onLogin }: StartupScreenProps) {
    const { t } = useLanguage();
    const [theme, setTheme] = useState<Theme>('light');
    const [mode, setMode] = useState<'select' | 'register' | 'login'>('select');
    const [username, setUsername] = useState('');
    const [userCode, setUserCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Sequential fade-in animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Set up audio context resume on first user interaction
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (isSoundEnabled()) {
                resumeAudioContext();
            }
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
        
        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    const getCardClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white/95 backdrop-blur-md border-purple-200 shadow-2xl';
            case 'dark':
                return 'bg-gray-900/95 backdrop-blur-md border-gray-700 text-white shadow-2xl';
            case 'neon':
                return 'bg-black/90 backdrop-blur-md border-pink-500 text-white shadow-2xl shadow-pink-500/20';
            default:
                return 'bg-white/95 backdrop-blur-md border-purple-200 shadow-2xl';
        }
    };

    const getLogoGlowClass = () => {
        switch (theme) {
            case 'light':
                return 'drop-shadow-[0_0_25px_rgba(147,51,234,0.6)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]';
            case 'dark':
                return 'drop-shadow-[0_0_40px_rgba(168,85,247,0.8)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]';
            case 'neon':
                return 'drop-shadow-[0_0_45px_rgba(236,72,153,1)] drop-shadow-[0_12px_24px_rgba(236,72,153,0.5)]';
            default:
                return 'drop-shadow-[0_0_25px_rgba(147,51,234,0.6)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]';
        }
    };

    const getBackgroundGradientClass = () => {
        switch (theme) {
            case 'light':
                return 'startup-gradient-bg-light';
            case 'dark':
                return 'startup-gradient-bg-dark';
            case 'neon':
                return 'startup-gradient-bg-neon';
            default:
                return 'startup-gradient-bg-light';
        }
    };

    const handleRegister = () => {
        playSound('button');
        
        if (!username.trim()) {
            toast.error(t('auth.error.emptyUsername'));
            return;
        }

        const code = generateUserCode();
        const userData = {
            username: username.trim(),
            code: code,
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem('blockverse-user', JSON.stringify(userData));
        
        initializeStarterPowerUps(code);
        
        setGeneratedCode(code);
        toast.success(t('auth.success.registered'));
        playSound('badgeUnlock');
    };

    const handleLogin = () => {
        playSound('button');
        
        if (!userCode.trim()) {
            toast.error(t('auth.error.emptyCode'));
            return;
        }

        const savedUser = localStorage.getItem('blockverse-user');
        if (!savedUser) {
            toast.error(t('auth.error.noUser'));
            return;
        }

        const userData = JSON.parse(savedUser);
        if (userData.code === userCode.trim()) {
            toast.success(t('auth.success.loggedIn').replace('{username}', userData.username));
            playSound('gameStart');
            setTimeout(() => onLogin(), 300);
        } else {
            toast.error(t('auth.error.invalidCode'));
        }
    };

    const handleContinue = () => {
        playSound('gameStart');
        setTimeout(() => onLogin(), 300);
    };

    const handleCopyCode = () => {
        playSound('button');
        navigator.clipboard.writeText(generatedCode);
        toast.success(t('auth.success.copied'));
    };

    const handleButtonClick = (action: () => void) => {
        playSound('button');
        action();
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Rich animated gradient background - no level images */}
            <div className={`absolute inset-0 z-0 ${getBackgroundGradientClass()}`} />

            {/* Enhanced animated particles with better distribution */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute startup-particle-motion"
                        style={{
                            left: `${(i * 11 + 5) % 95}%`,
                            top: `${(i * 13 + 10) % 90}%`,
                            animationDelay: `${i * 0.6}s`,
                            animationDuration: `${10 + i * 1.5}s`,
                        }}
                    >
                        <div 
                            className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full opacity-20 ${
                                theme === 'light' ? 'bg-purple-400' :
                                theme === 'dark' ? 'bg-purple-500' :
                                'bg-pink-500'
                            }`}
                            style={{
                                filter: 'blur(8px)',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="w-full py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
                    <div 
                        className={`container mx-auto flex items-center justify-center transition-all duration-1200 ${
                            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'
                        }`}
                    >
                        {/* Prominently enlarged logo (30-40% larger) with enhanced soft glow effects */}
                        <img 
                            src="/assets/generated/blockverse-logo-transparent.dim_300x100.png" 
                            alt="BlockVerse" 
                            className={`h-20 sm:h-28 md:h-36 lg:h-44 xl:h-48 w-auto transition-all duration-1000 animate-logo-pulse-glow ${getLogoGlowClass()}`}
                        />
                    </div>
                </header>

                <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center gap-6">
                    <div 
                        className={`w-full max-w-md transition-all duration-1200 delay-400 ${
                            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                        }`}
                    >
                        <Card className={`${getCardClass()} border-2 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl`}>
                            {mode === 'select' && (
                                <>
                                    <CardHeader className="text-center space-y-3">
                                        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                            {t('auth.welcome')}
                                        </CardTitle>
                                        <CardDescription className={`text-base sm:text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {t('auth.selectOption')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-6">
                                        <Button
                                            onClick={() => handleButtonClick(() => setMode('register'))}
                                            className="w-full h-14 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                                            size="lg"
                                        >
                                            {t('auth.newUser')}
                                        </Button>
                                        <Button
                                            onClick={() => handleButtonClick(() => setMode('login'))}
                                            variant="outline"
                                            className="w-full h-14 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                                            size="lg"
                                        >
                                            {t('auth.existingUser')}
                                        </Button>
                                    </CardContent>
                                </>
                            )}

                            {mode === 'register' && !generatedCode && (
                                <>
                                    <CardHeader className="space-y-2">
                                        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
                                            {t('auth.register.title')}
                                        </CardTitle>
                                        <CardDescription className={`text-sm sm:text-base ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {t('auth.register.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-base">{t('auth.register.username')}</Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder={t('auth.register.usernamePlaceholder')}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="h-12 text-base"
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleRegister}
                                                className="flex-1 h-12 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                            >
                                                {t('auth.register.submit')}
                                            </Button>
                                            <Button
                                                onClick={() => handleButtonClick(() => {
                                                    setMode('select');
                                                    setUsername('');
                                                })}
                                                variant="outline"
                                                className="h-12 px-6 text-base transition-all duration-300 hover:scale-105 active:scale-95"
                                            >
                                                {t('auth.back')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </>
                            )}

                            {mode === 'register' && generatedCode && (
                                <>
                                    <CardHeader className="space-y-2">
                                        <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center font-bold">
                                            {t('auth.register.success')}
                                        </CardTitle>
                                        <CardDescription className={`text-center text-sm sm:text-base ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {t('auth.register.codeGenerated')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="space-y-2">
                                            <Label className="text-base">{t('auth.register.yourUsername')}</Label>
                                            <div className={`p-4 rounded-lg font-mono text-lg ${
                                                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                                            }`}>
                                                {username}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-base">{t('auth.register.yourCode')}</Label>
                                            <div className={`p-4 rounded-lg font-mono text-xl font-bold text-center ${
                                                theme === 'light' ? 'bg-purple-100 text-purple-900' : 
                                                theme === 'dark' ? 'bg-purple-900 text-purple-100' :
                                                'bg-pink-900 text-pink-100'
                                            }`}>
                                                {generatedCode}
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg text-sm ${
                                            theme === 'light' ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' :
                                            theme === 'dark' ? 'bg-yellow-900/20 text-yellow-200 border border-yellow-700' :
                                            'bg-orange-900/20 text-orange-200 border border-orange-700'
                                        }`}>
                                            {t('auth.register.saveCode')}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleCopyCode}
                                                variant="outline"
                                                className="flex-1 h-12 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                                            >
                                                {t('auth.register.copyCode')}
                                            </Button>
                                            <Button
                                                onClick={handleContinue}
                                                className="flex-1 h-12 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                            >
                                                {t('auth.register.continue')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </>
                            )}

                            {mode === 'login' && (
                                <>
                                    <CardHeader className="space-y-2">
                                        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
                                            {t('auth.login.title')}
                                        </CardTitle>
                                        <CardDescription className={`text-sm sm:text-base ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {t('auth.login.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="userCode" className="text-base">{t('auth.login.code')}</Label>
                                            <Input
                                                id="userCode"
                                                type="text"
                                                placeholder={t('auth.login.codePlaceholder')}
                                                value={userCode}
                                                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                                                className="h-12 text-base font-mono"
                                                maxLength={10}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleLogin}
                                                className="flex-1 h-12 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                            >
                                                {t('auth.login.submit')}
                                            </Button>
                                            <Button
                                                onClick={() => handleButtonClick(() => {
                                                    setMode('select');
                                                    setUserCode('');
                                                })}
                                                variant="outline"
                                                className="h-12 px-6 text-base transition-all duration-300 hover:scale-105 active:scale-95"
                                            >
                                                {t('auth.back')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </>
                            )}
                        </Card>
                    </div>

                    {/* Mobile-optimized Banner Ad at bottom of startup screen */}
                    <div 
                        className={`max-w-md transition-all duration-1200 delay-600 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    >
                        <MobileBannerAd theme={theme} className="max-w-md" />
                    </div>
                </main>
            </div>

            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
            <LanguageSelector theme={theme} />
            <SoundToggle theme={theme} />
        </div>
    );
}

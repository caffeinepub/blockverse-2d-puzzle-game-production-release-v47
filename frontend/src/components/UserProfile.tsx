import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Key, X, ExternalLink } from 'lucide-react';
import { getUser } from '@/lib/userAuth';
import { playSound } from '@/lib/sounds';
import type { Theme } from '@/pages/Game';

interface UserProfileProps {
    theme: Theme;
    onClose: () => void;
    onLogout: () => void;
}

export function UserProfile({ theme, onClose, onLogout }: UserProfileProps) {
    const { t } = useLanguage();
    const user = getUser();

    if (!user) {
        return null;
    }

    const getOverlayClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-black/30';
            case 'dark':
                return 'bg-black/60';
            case 'neon':
                return 'bg-black/70';
            default:
                return 'bg-black/30';
        }
    };

    const getCardClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white border-purple-200 shadow-xl';
            case 'dark':
                return 'bg-gray-800 border-blue-500 shadow-2xl shadow-blue-500/20';
            case 'neon':
                return 'bg-gray-900 border-pink-500 shadow-2xl shadow-pink-500/50';
            default:
                return 'bg-white border-purple-200 shadow-xl';
        }
    };

    const getTextClass = () => {
        switch (theme) {
            case 'light':
                return 'text-gray-800';
            case 'dark':
                return 'text-white';
            case 'neon':
                return 'text-white';
            default:
                return 'text-gray-800';
        }
    };

    const getSubTextClass = () => {
        switch (theme) {
            case 'light':
                return 'text-gray-600';
            case 'dark':
                return 'text-gray-300';
            case 'neon':
                return 'text-gray-300';
            default:
                return 'text-gray-600';
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

    const getCloseButtonClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300 hover:border-gray-400 font-bold shadow-sm hover:shadow-md transition-all duration-200';
            case 'dark':
                return 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500 hover:border-gray-400 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200';
            case 'neon':
                return 'bg-pink-600 hover:bg-pink-500 text-white border-2 border-pink-400 hover:border-pink-300 font-bold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-200';
            default:
                return 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300 hover:border-gray-400 font-bold shadow-sm hover:shadow-md transition-all duration-200';
        }
    };

    const getIconClass = () => {
        switch (theme) {
            case 'light':
                return 'text-purple-600';
            case 'dark':
                return 'text-blue-400';
            case 'neon':
                return 'text-pink-400';
            default:
                return 'text-purple-600';
        }
    };

    const getPrivacyLinkClass = () => {
        switch (theme) {
            case 'light':
                return 'text-purple-600 hover:text-purple-700';
            case 'dark':
                return 'text-blue-400 hover:text-blue-300';
            case 'neon':
                return 'text-pink-400 hover:text-pink-300';
            default:
                return 'text-purple-600 hover:text-purple-700';
        }
    };

    const handleLogout = () => {
        playSound('button');
        onLogout();
    };

    const handleClose = () => {
        playSound('button');
        onClose();
    };

    const handlePrivacyClick = () => {
        playSound('button');
        window.open('https://sites.google.com/view/blockverseapp/privacy-policy', '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${getOverlayClass()} backdrop-blur-sm`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
        >
            <Card 
                className={`w-full max-w-md ${getCardClass()} animate-in fade-in zoom-in duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="text-center">
                    <CardTitle id="profile-title" className={`text-2xl sm:text-3xl font-bold ${getTextClass()}`}>
                        {t('profile.title')}
                    </CardTitle>
                    <CardDescription className={getSubTextClass()}>
                        {t('profile.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-opacity-50" style={{
                            backgroundColor: theme === 'light' ? 'rgba(243, 232, 255, 0.5)' : 
                                           theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 
                                           'rgba(131, 24, 67, 0.3)'
                        }}>
                            <User className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconClass()}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${getSubTextClass()}`}>
                                    {t('profile.username')}
                                </p>
                                <p className={`text-lg font-bold ${getTextClass()} break-words`}>
                                    {user.username}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-opacity-50" style={{
                            backgroundColor: theme === 'light' ? 'rgba(243, 232, 255, 0.5)' : 
                                           theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 
                                           'rgba(131, 24, 67, 0.3)'
                        }}>
                            <Key className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconClass()}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${getSubTextClass()}`}>
                                    {t('profile.userCode')}
                                </p>
                                <p className={`text-lg font-bold font-mono ${getTextClass()} break-all`}>
                                    {user.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center pt-2">
                        <button
                            onClick={handlePrivacyClick}
                            className={`text-xs sm:text-sm font-medium ${getPrivacyLinkClass()} hover:underline transition-colors duration-200 flex items-center gap-1.5`}
                            aria-label={t('profile.privacyPolicy')}
                        >
                            {t('profile.privacyPolicy')}
                            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={handleLogout}
                            className={`flex-1 ${getButtonClass()}`}
                            size="lg"
                            aria-label={t('profile.logout')}
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            {t('profile.logout')}
                        </Button>
                        <Button
                            onClick={handleClose}
                            className={`flex-1 ${getCloseButtonClass()}`}
                            size="lg"
                            aria-label={t('profile.close')}
                        >
                            <X className="h-5 w-5 mr-2" />
                            {t('profile.close')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

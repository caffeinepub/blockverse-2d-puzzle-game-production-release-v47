import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import type { Theme } from '@/pages/Game';

interface LanguageSelectorProps {
    theme: Theme;
}

const languageNames: Record<Language, string> = {
    en: '🇬🇧 English',
    tr: '🇹🇷 Türkçe',
    es: '🇪🇸 Español',
    fr: '🇫🇷 Français',
    de: '🇩🇪 Deutsch',
    ja: '🇯🇵 日本語',
    zh: '🇨🇳 简体中文',
    ru: '🇷🇺 Русский',
    ar: '🇸🇦 العربية',
    pt: '🇵🇹 Português',
};

export function LanguageSelector({ theme }: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguage();

    const getButtonClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-300';
            case 'dark':
                return 'bg-gray-800/90 hover:bg-gray-800 text-cyan-400 border-2 border-cyan-500';
            case 'neon':
                return 'bg-black/80 hover:bg-black text-pink-400 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] sm:shadow-[0_0_20px_rgba(236,72,153,0.6)]';
            default:
                return 'bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-300';
        }
    };

    const getMenuClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white border-gray-200';
            case 'dark':
                return 'bg-gray-800 border-gray-700 text-gray-100';
            case 'neon':
                return 'bg-black border-pink-500 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.4)] sm:shadow-[0_0_30px_rgba(236,72,153,0.5)]';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const getItemClass = (lang: Language) => {
        const isActive = language === lang;
        switch (theme) {
            case 'light':
                return isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100';
            case 'dark':
                return isActive ? 'bg-cyan-900/50 text-cyan-300' : 'hover:bg-gray-700';
            case 'neon':
                return isActive ? 'bg-pink-900/50 text-pink-300' : 'hover:bg-pink-900/30';
            default:
                return isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100';
        }
    };

    return (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="lg"
                        className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-xl sm:shadow-2xl transition-all duration-300 touch-manipulation ${getButtonClass()}`}
                    >
                        <Languages className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="start" 
                    className={`transition-all duration-300 max-h-[60vh] sm:max-h-96 overflow-y-auto ${getMenuClass()}`}
                >
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                        <DropdownMenuItem
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`cursor-pointer transition-colors touch-manipulation ${getItemClass(lang)}`}
                        >
                            <span className="font-medium text-sm sm:text-base">{languageNames[lang]}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

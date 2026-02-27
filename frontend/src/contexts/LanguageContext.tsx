import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import trTranslations from '../locales/tr.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import jaTranslations from '../locales/ja.json';
import zhTranslations from '../locales/zh.json';
import ruTranslations from '../locales/ru.json';
import arTranslations from '../locales/ar.json';
import ptTranslations from '../locales/pt.json';

export type Language = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ru' | 'ar' | 'pt';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: enTranslations,
    tr: trTranslations,
    es: esTranslations,
    fr: frTranslations,
    de: deTranslations,
    ja: jaTranslations,
    zh: zhTranslations,
    ru: ruTranslations,
    ar: arTranslations,
    pt: ptTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('blockverse-language');
        return (saved as Language) || 'tr';
    });

    useEffect(() => {
        localStorage.setItem('blockverse-language', language);
        // Set document direction for RTL languages
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

import type { Theme } from '@/pages/Game';

interface FooterProps {
    theme: Theme;
}

export function Footer({ theme }: FooterProps) {
    const getFooterClass = () => {
        switch (theme) {
            case 'light':
                return 'bg-white/80 backdrop-blur-md border-t border-gray-200';
            case 'dark':
                return 'bg-gray-800/80 backdrop-blur-md border-t border-gray-700';
            case 'neon':
                return 'bg-black/60 backdrop-blur-md border-t border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] sm:shadow-[0_0_20px_rgba(236,72,153,0.3)]';
            default:
                return 'bg-white/80 backdrop-blur-md border-t border-gray-200';
        }
    };

    return (
        <footer className={`w-full py-2 sm:py-3 md:py-4 transition-all duration-300 ${getFooterClass()}`}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6">
                {/* Footer content removed as per user request */}
            </div>
        </footer>
    );
}

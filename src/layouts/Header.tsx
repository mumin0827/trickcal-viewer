import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { toggleTheme } = useTheme();

    const toggleLanguage = () => {
        const nextLang = i18n.language.startsWith('ko') ? 'en' : 'ko';
        i18n.changeLanguage(nextLang);
    };

    return (
        <header className="h-14 md:h-16 bg-header-bg border-b border-header-border backdrop-blur-[10px] flex items-center px-5 md:px-10 z-[4000] shrink-0 sticky top-0 transition-colors duration-300">
            <div className="w-full max-w-[1200px] mx-auto flex justify-between items-center h-14 md:h-16">
                <Link to="/" className="flex items-center gap-3 no-underline text-inherit hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 md:w-8 md:h-8" />
                    <span className="text-xl font-bold text-text-main tracking-tighter hidden md:block">{t('header.title')}</span>
                </Link>

                <div className="hidden md:flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleLanguage} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-text-sub hover:text-tc-green hover:bg-tc-green/10 transition-all font-bold"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="text-xs uppercase">{i18n.language.startsWith('ko') ? 'KO' : 'EN'}</span>
                    </Button>
                    <ThemeToggle />
                </div>

                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[170px] rounded-xl shadow-xl border-tc-green/20">
                            <DropdownMenuItem onClick={toggleLanguage} className="gap-3 py-2.5 focus:bg-tc-green/10 focus:text-tc-green cursor-pointer">
                                <Languages className="w-4 h-4 opacity-70" />
                                <span className="font-bold">{i18n.language.startsWith('ko') ? 'English' : '한국어'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-tc-green/10" />
                            <DropdownMenuItem onClick={() => toggleTheme()} className="gap-3 py-2.5 cursor-pointer">
                                <ThemeToggle minimal />
                                <span className="font-medium">{t('header.changeTheme')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
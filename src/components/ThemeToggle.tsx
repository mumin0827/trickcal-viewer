import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button.tsx';

interface ThemeToggleProps {
    minimal?: boolean;
}

const ThemeToggle = ({ minimal }: ThemeToggleProps) => {
    const { toggleTheme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const icons = (
        <>
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
            <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        </>
    );

    if (minimal) {
        return (
            <div className="relative flex items-center justify-center w-5 h-5 text-text-main">
                {icons}
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-pressed={isDark}
            className="rounded-full text-text-main hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden h-9 w-9"
        >
            {icons}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

export default ThemeToggle;

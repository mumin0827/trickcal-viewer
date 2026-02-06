import { useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
    const { theme, setTheme, resolvedTheme } = useNextTheme();

    const toggleTheme = useCallback(() => {
        // 시스템 모드인 경우, resolvedTheme은 현재 렌더링 중인 테마를 알랴줌
        // 현재 다크 모드(시스템 또는 수동)인 경우 라이트 모드로 전환합
        // 현재 라이트 모드인 경우 다크 모드로 전환
        const current = resolvedTheme === 'dark' ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    return {
        theme: theme as 'light' | 'dark' | 'system',
        resolvedTheme: resolvedTheme as 'light' | 'dark',
        setTheme,
        toggleTheme,
    };
};

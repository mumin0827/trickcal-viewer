import { cva } from 'class-variance-authority';

export const toggleGroupItemVariants = cva(
    'inline-flex items-center justify-center gap-1 rounded-xl border text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-green/40 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-tc-green data-[state=on]:text-white',
    {
        variants: {
            variant: {
                outline: 'border-tc-line-soft bg-white/70 dark:bg-black/20 text-text-main',
                ghost: 'border-transparent bg-transparent text-text-main',
            },
            size: {
                default: 'h-10 px-3',
                sm: 'h-8 px-2 text-[11px]',
                lg: 'h-12 px-4 text-sm',
            },
        },
        defaultVariants: {
            variant: 'outline',
            size: 'default',
        },
    },
);

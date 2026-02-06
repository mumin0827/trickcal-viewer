import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-tc-green/90 text-white border-tc-green-dark',
                secondary: 'bg-tc-line-soft text-tc-green-dark border-tc-green/30',
                outline: 'bg-transparent text-text-main border-tc-line-soft',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none',
    {
        variants: {
            variant: {
                default:
                    'bg-btn-bg text-btn-text border-[3px] border-btn-border shadow-tc-btn hover:translate-y-[1px] hover:shadow-tc-btn-active active:translate-y-[3px] active:shadow-none',
                primary:
                    'bg-tc-green text-white border-[3px] border-tc-green-dark shadow-tc-btn hover:translate-y-[1px] hover:shadow-tc-btn-active active:translate-y-[3px] active:shadow-none',
                secondary:
                    'bg-btn-bg text-btn-text border-[3px] border-tc-green shadow-tc-btn hover:translate-y-[1px] hover:shadow-tc-btn-active active:translate-y-[3px] active:shadow-none',
                ghost: 'hover:bg-tc-line-soft text-text-main',
                icon: 'bg-btn-bg border-[3px] border-btn-border shadow-tc-btn p-0 hover:translate-y-[1px] hover:shadow-tc-btn-active active:translate-y-[3px] active:shadow-none aspect-square',
                'icon-primary':
                    'bg-tc-green border-[3px] border-tc-green-dark shadow-tc-btn p-0 hover:translate-y-[1px] hover:shadow-tc-btn-active active:translate-y-[3px] active:shadow-none aspect-square text-white',
            },
            size: {
                default: 'h-[46px] px-6 py-2',
                sm: 'h-9 px-4 text-xs',
                lg: 'h-14 px-8 text-base',
                icon: 'h-[52px] w-[52px] rounded-2xl',
                'icon-sm': 'h-10 w-10 rounded-xl',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

// 하..
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };

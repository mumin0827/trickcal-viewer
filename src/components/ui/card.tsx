import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
    variants: {
        variant: {
            default: 'rounded-lg bg-card text-card-foreground shadow-sm',
            stage: 'relative border-[5px] border-tc-green rounded-[32px] bg-gradient-to-b from-card-bg-start to-card-bg-end shadow-tc-card overflow-hidden p-4',
            controls: 'relative border-[5px] border-tc-green rounded-[32px] bg-gradient-to-b from-controls-bg-start to-controls-bg-end shadow-tc-card p-[24px_30px]',
            modal: 'relative border-[6px] border-tc-green rounded-[36px] bg-gradient-to-b from-modal-bg-start to-modal-bg-end shadow-[0_6px_0_rgba(0,0,0,0.1),0_24px_48px_rgba(0,0,0,0.2)] p-[30px]',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

type CardVariant = NonNullable<VariantProps<typeof cardVariants>['variant']>;

type CardDecoratedVariant = Exclude<CardVariant, 'default'>;

const innerBorderVariants: Record<CardDecoratedVariant, string> = {
    stage: 'absolute inset-[6px] border-[4px] border-white/80 dark:border-white/10 rounded-[24px] pointer-events-none z-[2]',
    controls: 'absolute inset-[6px] border-[3px] border-white/60 dark:border-white/10 rounded-[24px] pointer-events-none',
    modal: 'absolute inset-[10px] border-[4px] border-white/75 dark:border-white/10 rounded-[28px] pointer-events-none',
};

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const needsInnerBorder = variant !== 'default';
        return (
            <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
                {needsInnerBorder && (
                    <div className={innerBorderVariants[variant as CardDecoratedVariant]} />
                )}
                <div className="relative z-10 w-full h-full">
                    {props.children}
                </div>
            </div>
        );
    },
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
    ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
    ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

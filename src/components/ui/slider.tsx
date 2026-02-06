import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-3.5 w-full grow overflow-hidden rounded-full bg-tc-line-soft border border-black/5 box-shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)]">
            <SliderPrimitive.Range className="absolute h-full bg-tc-green" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-[26px] w-[26px] rounded-full border-[4px] border-tc-green-dark bg-white shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer" />
        {typeof props.defaultValue?.[1] === 'number' && (
            <SliderPrimitive.Thumb className="block h-[26px] w-[26px] rounded-full border-[4px] border-tc-green-dark bg-white shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer" />
        )}
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

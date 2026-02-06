import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const parseHexWithAlpha = (value: string) => {
    const raw = value.startsWith('#') ? value.slice(1) : value;
    if (![3, 4, 6, 8].includes(raw.length)) {
        return { color: value, alpha: 1 };
    }
    const expand = (char: string) => `${char}${char}`;
    let r = '';
    let g = '';
    let b = '';
    let a = 'ff';

    if (raw.length === 3 || raw.length === 4) {
        r = expand(raw[0]);
        g = expand(raw[1]);
        b = expand(raw[2]);
        if (raw.length === 4) a = expand(raw[3]);
    } else {
        r = raw.slice(0, 2);
        g = raw.slice(2, 4);
        b = raw.slice(4, 6);
        if (raw.length === 8) a = raw.slice(6, 8);
    }

    const alpha = Number.isNaN(parseInt(a, 16)) ? 1 : parseInt(a, 16) / 255;
    return { color: `#${r}${g}${b}`, alpha };
};

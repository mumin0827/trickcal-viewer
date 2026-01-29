export interface Skin {
    name: string;
    file: string;
    hasIngame?: boolean;
}

export interface Character {
    id: string;
    name: string;
    name_kr: string;
    skins: Skin[];
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spine: any;
    }
}

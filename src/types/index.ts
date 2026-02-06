export interface Skin {
    name: string;
    file: string;
    hasIngame?: boolean;
}

export const Personality = {
    Cool: 0,
    Gloomy: 1,
    Jolly: 2,
    Mad: 3,
    Naive: 4,
    Resonance: 5,
} as const;
export type Personality = (typeof Personality)[keyof typeof Personality];

export const PersonalityMap: Record<Personality, string> = {
    [Personality.Cool]: 'Cool',
    [Personality.Gloomy]: 'Gloomy',
    [Personality.Jolly]: 'Jolly',
    [Personality.Mad]: 'Mad',
    [Personality.Naive]: 'Naive',
    [Personality.Resonance]: 'Resonance',
};

export const Race = {
    Dragon: 0,
    Elf: 1,
    Fairy: 2,
    Furry: 3,
    Ghost: 4,
    Spirit: 5,
    Witch: 6,
    Mystic: 7,
} as const;
export type Race = (typeof Race)[keyof typeof Race];

export const RaceMap: Record<Race, string> = {
    [Race.Dragon]: 'Dragon',
    [Race.Elf]: 'Elf',
    [Race.Fairy]: 'Fairy',
    [Race.Furry]: 'Furry',
    [Race.Ghost]: 'Ghost',
    [Race.Spirit]: 'Spirit',
    [Race.Witch]: 'Witch',
    [Race.Mystic]: 'Mystic',
};

export const Attack = {
    Magic: 0,
    Physic: 1,
} as const;
export type Attack = (typeof Attack)[keyof typeof Attack];

export const AttackMap: Record<Attack, string> = {
    [Attack.Magic]: 'Magic',
    [Attack.Physic]: 'Physic',
};

export const Position = {
    Front: 0,
    Middle: 1,
    Back: 2,
    Free: 3,
} as const;
export type Position = (typeof Position)[keyof typeof Position];

export const PositionMap: Record<Position, string> = {
    [Position.Front]: 'Front',
    [Position.Middle]: 'Middle',
    [Position.Back]: 'Back',
    [Position.Free]: 'Free',
};

export const Class = {
    Class_0001: 1,
    Class_0002: 2,
    Class_0003: 3,
} as const;
export type Class = (typeof Class)[keyof typeof Class];

export const ClassMap: Record<Class, string> = {
    [Class.Class_0001]: 'Class_0001',
    [Class.Class_0002]: 'Class_0002',
    [Class.Class_0003]: 'Class_0003',
};

export interface Sado {
    id: string;
    name: string;
    name_kr: string;
    skins: Skin[];
    personality?: Personality;
    initialStar?: number;
    race?: Race;
    attackType?: Attack;
    position?: Position;
    unitClass?: Class;
}

export interface SadoFilterState {
    personalities: Personality[];
    races: Race[];
    stars: number[];
}

export const SadoSortKey = {
    Name: 'name',
    Star: 'star',
    Personality: 'personality',
    Race: 'race',
} as const;
export type SadoSortKey = (typeof SadoSortKey)[keyof typeof SadoSortKey];

export interface SpineAnimation {
    name: string;
    duration: number;
}

export interface SpineSkin {
    name: string;
}

export interface SpineTrackEntry {
    animation: SpineAnimation;
    loop: boolean;
    trackTime: number;
}

export interface SpineAnimationState {
    getCurrent(trackIndex: number): SpineTrackEntry | null;
    setAnimation(trackIndex: number, animName: string, loop: boolean): void;
    apply(skeleton: SpineSkeleton): void;
}

export interface SpineSkeletonData {
    animations: SpineAnimation[];
    skins: SpineSkin[];
    findAnimation(name: string): SpineAnimation | null;
}

export interface SpineSkeleton {
    data: SpineSkeletonData;
    skin: SpineSkin | null;
    setSkinByName(name: string): void;
    setSlotsToSetupPose(): void;
    updateWorldTransform(): void;
}

export interface SpinePlayer {
    dispose(): void;
    paused: boolean;
    skeleton: SpineSkeleton;
    animationState: SpineAnimationState;
    setAnimation(name: string, loop?: boolean): void;
}

export interface SpinePlayerConfig {
    skelUrl: string;
    atlasUrl: string;
    backgroundColor?: string;
    alpha?: boolean;
    interactive?: boolean;
    skin?: string;
    animation?: string;
    showControls?: boolean;
    showLoading?: boolean;
    preserveDrawingBuffer?: boolean;
    loop?: boolean;
    viewport?: {
        padLeft?: string;
        padRight?: string;
        padTop?: string;
        padBottom?: string;
    };
    success?: (player: SpinePlayer) => void;
    error?: (player: SpinePlayer, reason: string) => void;
}

declare global {
    interface Window {
        spine: {
            SpinePlayer: new (element: HTMLElement, config: SpinePlayerConfig) => SpinePlayer;
        };
    }
}

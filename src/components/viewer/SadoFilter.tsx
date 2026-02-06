import React from 'react';
import { ArrowDown, ArrowUp, Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Personality,
    PersonalityMap,
    Race,
    RaceMap,
    SadoSortKey,
    type SadoFilterState,
    type SadoSortKey as SadoSortKeyType,
} from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';

interface SadoFilterProps {
    filters: SadoFilterState;
    setFilters: React.Dispatch<React.SetStateAction<SadoFilterState>>;
    onReset: () => void;
    totalCount: number;
    sortKey: SadoSortKeyType;
    setSortKey: (key: SadoSortKeyType) => void;
    sortAsc: boolean;
    setSortAsc: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SadoFilter: React.FC<SadoFilterProps> = ({
    filters,
    setFilters,
    onReset,
    totalCount,
    sortKey,
    setSortKey,
    sortAsc,
    setSortAsc,
}) => {
    const { t, i18n } = useTranslation();
    const initialFocusRef = React.useRef<HTMLButtonElement | null>(null);

    const handleSortChange = (value: string) => {
        if (!value) {
            setSortAsc((prev) => !prev);
            return;
        }

        if (value !== sortKey) {
            setSortKey(value as SadoSortKeyType);
            setSortAsc(true);
        }
    };

    const toggleFilter = <K extends keyof SadoFilterState>(
        key: K,
        values: string[],
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: values.map((v) => Number(v)),
        }));
    };

    const personalities: Personality[] = [
        Personality.Cool,
        Personality.Gloomy,
        Personality.Jolly,
        Personality.Mad,
        Personality.Naive,
        Personality.Resonance,
    ];

    const races: Race[] = [
        Race.Dragon,
        Race.Elf,
        Race.Fairy,
        Race.Furry,
        Race.Ghost,
        Race.Spirit,
        Race.Witch,
        Race.Mystic,
    ];

    const stars = [3, 2, 1];

    const sortOptions = [
        { key: SadoSortKey.Name, label: t('selector.sortName') },
        { key: SadoSortKey.Star, label: t('selector.sortStar') },
        { key: SadoSortKey.Personality, label: t('selector.sortPersonality') },
        { key: SadoSortKey.Race, label: t('selector.sortRace') },
    ];

    const isFilterActive =
        filters.personalities.length > 0 ||
        filters.races.length > 0 ||
        filters.stars.length > 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className={`relative w-9 h-9 md:w-10 md:h-10 rounded-xl border-2 transition-all ${isFilterActive ? 'border-tc-green bg-tc-green/10 text-tc-green' : 'border-tc-green/30 text-text-sub'}`}
                >
                    <Filter className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5px]" />
                    {isFilterActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-tc-green rounded-full border-2 border-white animate-in zoom-in" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="w-[92vw] max-w-[360px] sm:max-w-[420px]"
                withCard={false}
                overlayClassName="backdrop-blur-none"
                onOpenAutoFocus={(event) => {
                    if (initialFocusRef.current) {
                        event.preventDefault();
                        initialFocusRef.current.focus();
                    }
                }}
            >
                <div className="bg-controls-bg-start/90 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl border border-tc-line-soft flex flex-col gap-3 md:gap-4 max-h-[78vh] md:max-h-[85vh]">
                    <div className="flex items-center justify-between pb-2 border-b border-tc-line-soft">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            <DialogTitle className="text-lg font-bold text-text-main">
                                {t('selector.filterTitle')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="sr-only">
                            {t('selector.filterDescription')}
                        </DialogDescription>
                    </div>

                    <Tabs defaultValue="filter" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="sort" className="flex-1">
                                {t('selector.tabSort')}
                            </TabsTrigger>
                            <TabsTrigger
                                ref={initialFocusRef}
                                value="filter"
                                className="flex-1"
                            >
                                {t('selector.tabFilter')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sort">
                            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-2.5 md:p-3">
                                <div className="flex flex-col gap-3">
                                    <ToggleGroup
                                        type="single"
                                        value={sortKey}
                                        onValueChange={handleSortChange}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        {sortOptions.map((option) => (
                                            <ToggleGroupItem
                                                key={option.key}
                                                value={option.key}
                                                className="justify-between w-full"
                                            >
                                                <span>{option.label}</span>
                                                {sortKey === option.key && (
                                                    sortAsc ? (
                                                        <ArrowUp className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDown className="w-4 h-4" />
                                                    )
                                                )}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="filter">
                            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-2.5 md:p-3">
                                <ScrollArea className="h-[240px] sm:h-[280px] md:h-[320px] pr-2">
                                    <div className="flex flex-col gap-5 py-1">
                                        <section className="flex flex-col gap-2.5">
                                            <span className="text-sm font-bold text-text-main opacity-80">
                                                {t('selector.filterPersonality')}
                                            </span>
                                            <ToggleGroup
                                                type="multiple"
                                                value={filters.personalities.map((v) => v.toString())}
                                                onValueChange={(values) => toggleFilter('personalities', values)}
                                                className="grid grid-cols-3 gap-2"
                                            >
                                                {personalities.map((p) => {
                                                    const pName = PersonalityMap[p];
                                                    return (
                                                        <ToggleGroupItem
                                                            key={p}
                                                            value={p.toString()}
                                                            className="h-10 px-1 gap-1.5 text-xs"
                                                        >
                                                            <img
                                                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/Common_UnitPersonality_${pName}.png`}
                                                                className="w-5 h-5 shrink-0"
                                                                alt=""
                                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                            />
                                                            <span className="truncate">
                                                                {t(`personality.${pName}`)}
                                                            </span>
                                                        </ToggleGroupItem>
                                                    );
                                                })}
                                            </ToggleGroup>
                                        </section>

                                        <section className="flex flex-col gap-2.5">
                                            <span className="text-sm font-bold text-text-main opacity-80">
                                                {t('selector.filterRace')}
                                            </span>
                                            <ToggleGroup
                                                type="multiple"
                                                value={filters.races.map((v) => v.toString())}
                                                onValueChange={(values) => toggleFilter('races', values)}
                                                className="grid grid-cols-4 gap-2"
                                            >
                                                {races.map((r) => {
                                                    const rName = RaceMap[r];
                                                    return (
                                                        <ToggleGroupItem
                                                            key={r}
                                                            value={r.toString()}
                                                            className="h-[64px] px-0.5 flex-col justify-center items-center gap-1.5"
                                                        >
                                                            <img
                                                                src={`${RESOURCE_PATHS.IMAGE.ALBUM}/Album_Icon_${rName}.png`}
                                                                className="w-6 h-6 shrink-0"
                                                                alt=""
                                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                            />
                                                            <span className="text-[11px] font-bold truncate w-full text-center leading-none">
                                                                {t(`race.${rName}`)}
                                                            </span>
                                                        </ToggleGroupItem>
                                                    );
                                                })}
                                            </ToggleGroup>
                                        </section>

                                        <section className="flex flex-col gap-2.5">
                                            <span className="text-sm font-bold text-text-main opacity-80">
                                                {t('selector.filterStars')}
                                            </span>
                                            <ToggleGroup
                                                type="multiple"
                                                value={filters.stars.map((v) => v.toString())}
                                                onValueChange={(values) => toggleFilter('stars', values)}
                                                className="grid grid-cols-3 gap-2"
                                            >
                                                {stars.map((s) => {
                                                    const starIcon = [0, 3, 3, 4][s];
                                                    return (
                                                        <ToggleGroupItem
                                                            key={s}
                                                            value={s.toString()}
                                                            className="h-10 px-1 gap-1.5"
                                                        >
                                                            <div className="flex -space-x-1.5 shrink-0">
                                                                {Array(s).fill(0).map((_, i) => (
                                                                    <img
                                                                        key={i}
                                                                        src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroGrade_000${starIcon}.png`}
                                                                        className="w-4 h-4"
                                                                        alt=""
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-bold ml-0.5 shrink-0">
                                                                {s}{i18n.language.startsWith('ko') ? '성' : ''}
                                                            </span>
                                                        </ToggleGroupItem>
                                                    );
                                                })}
                                            </ToggleGroup>
                                        </section>
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-2.5 pt-3 mt-1 border-t border-tc-line-soft">
                        <Button variant="secondary" className="flex-1 h-10 md:h-11 text-sm" onClick={onReset}>
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            {t('selector.reset')}
                        </Button>
                        <DialogClose asChild>
                            <Button className="flex-[1.5] h-10 md:h-11 bg-tc-green hover:bg-tc-green-dark text-white text-sm">
                                {t('selector.apply')} ({totalCount})
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SadoFilter;

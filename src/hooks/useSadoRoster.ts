import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChoseong } from 'es-hangul';
import { useTranslation } from 'react-i18next';

import {
    Personality,
    PersonalityMap,
    RaceMap,
    type Sado,
    SadoSortKey,
} from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';
import { useSadoStore } from '@/stores/useSadoStore';

const fetchSados = async (): Promise<Sado[]> => {
    const response = await fetch(RESOURCE_PATHS.DATA.SADOS);
    if (!response.ok) {
        throw new Error('Failed to fetch sados');
    }
    return response.json();
};

export function useSadoRoster() {
    const { t, i18n } = useTranslation();
    const {
        selectedSado,
        setSelectedSado,
        selectedSkin,
        setSelectedSkin,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        resetFilters,
        sortKey,
        setSortKey,
        sortAsc,
        setSortAsc,
    } = useSadoStore();

    const { data: sadoRoster = [], isLoading, error } = useQuery({
        queryKey: ['sadoRoster'],
        queryFn: fetchSados,
        staleTime: 1000 * 60 * 60,
    });

    const choseongMap = useMemo(() => {
        return new Map(
            sadoRoster.map((sado) => [sado.name_kr, getChoseong(sado.name_kr)]),
        );
    }, [sadoRoster]);

    const filteredSados = useMemo(() => {
        let result = sadoRoster;

        const query = searchTerm.trim();
        if (query) {
            const lowerQuery = query.toLowerCase();
            result = result.filter((sado) => {
                const matchName = sado.name.toLowerCase().includes(lowerQuery);
                const matchKr = sado.name_kr.includes(query);
                const matchChoseong = choseongMap.get(sado.name_kr)?.includes(query);
                return matchName || matchKr || matchChoseong;
            });
        }

        if (filters.personalities.length > 0) {
            result = result.filter(
                (sado) =>
                    sado.personality !== undefined &&
                    (filters.personalities.includes(sado.personality) ||
                        sado.personality === Personality.Resonance),
            );
        }

        if (filters.races.length > 0) {
            result = result.filter(
                (sado) =>
                    sado.race !== undefined && filters.races.includes(sado.race),
            );
        }

        if (filters.stars.length > 0) {
            result = result.filter(
                (sado) =>
                    sado.initialStar !== undefined &&
                    filters.stars.includes(sado.initialStar),
            );
        }

        const isKorean = i18n.language.startsWith('ko');
        const sortLocale = isKorean ? 'ko' : 'en';
        const collator = new Intl.Collator(sortLocale, {
            numeric: true,
            sensitivity: 'base',
        });
        const nameForSort = (sado: Sado) =>
            isKorean ? sado.name_kr : sado.name;

        const compareOptionalNumber = (a?: number, b?: number) => {
            const aMissing = a === undefined;
            const bMissing = b === undefined;
            if (aMissing && bMissing) return 0;
            if (aMissing) return 1;
            if (bMissing) return -1;
            return a - b;
        };

        const compareOptionalLabel = <T extends number>(
            a?: T,
            b?: T,
            labelPrefix?: 'race' | 'personality',
            labelMap?: Record<T, string>,
        ) => {
            const aMissing = a === undefined;
            const bMissing = b === undefined;
            if (aMissing && bMissing) return 0;
            if (aMissing) return 1;
            if (bMissing) return -1;
            if (!labelPrefix || !labelMap) return compareOptionalNumber(a, b);
            const aLabel = t(`${labelPrefix}.${labelMap[a as T]}`);
            const bLabel = t(`${labelPrefix}.${labelMap[b as T]}`);
            return collator.compare(aLabel, bLabel);
        };

        const sorted = [...result];
        sorted.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case SadoSortKey.Star:
                    cmp = compareOptionalNumber(a.initialStar, b.initialStar);
                    break;
                case SadoSortKey.Personality:
                    cmp = isKorean
                        ? compareOptionalNumber(a.personality, b.personality)
                        : compareOptionalLabel(
                              a.personality,
                              b.personality,
                              'personality',
                              PersonalityMap,
                          );
                    break;
                case SadoSortKey.Race:
                    cmp = isKorean
                        ? compareOptionalNumber(a.race, b.race)
                        : compareOptionalLabel(a.race, b.race, 'race', RaceMap);
                    break;
                case SadoSortKey.Name:
                default:
                    cmp = collator.compare(nameForSort(a), nameForSort(b));
                    break;
            }

            if (cmp === 0) {
                cmp = collator.compare(nameForSort(a), nameForSort(b));
            }

            return sortAsc ? cmp : -cmp;
        });

        return sorted;
    }, [sadoRoster, searchTerm, choseongMap, filters, sortKey, sortAsc, i18n.language, t]);

    return {
        isLoading,
        error,
        sadoRoster,
        filteredSados,
        selectedSado,
        setSelectedSado,
        selectedSkin,
        setSelectedSkin,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        resetFilters,
        sortKey,
        setSortKey,
        sortAsc,
        setSortAsc,
    };
}

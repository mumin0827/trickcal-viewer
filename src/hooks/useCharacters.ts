import { useState, useEffect, useMemo } from 'react';
import { getChoseong } from 'es-hangul';
import type { Character, Skin } from '../types';
import { RESOURCE_PATHS } from '../routers/paths';

export function useCharacters() {
    const [isLoading, setIsLoading] = useState(true);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // 데이터 로딩
    useEffect(() => {
        fetch(RESOURCE_PATHS.DATA.CHARACTERS)
            .then((res) => res.json())
            .then((data) => {
                setCharacters(data);
                setTimeout(() => setIsLoading(false), 800);
            })
            .catch((err) => {
                console.error('Failed to load characters:', err);
                setIsLoading(false);
            });
    }, []);

    // 캐릭터 변경 핸들러 (스킨 자동 선택 포함)
    const handleSetSelectedChar = (char: Character | null) => {
        setSelectedChar(char);
        if (char && char.skins.length > 0) {
            setSelectedSkin(char.skins[0]);
        } else {
            setSelectedSkin(null);
        }
    };

    // 초성 맵 생성 (최적화)
    const choseongMap = useMemo(() => {
        return new Map(
            characters.map(char => [
                char.name_kr,
                getChoseong(char.name_kr)
            ])
        );
    }, [characters]);

    // 검색 필터링 (Memoization 적용)
    const filteredCharacters = useMemo(() => {
        const query = searchTerm.trim();
        if (!query) return characters;

        const lowerQuery = query.toLowerCase();

        return characters.filter((char) => {
            const matchName = char.name.toLowerCase().includes(lowerQuery);
            const matchKr = char.name_kr.includes(query);
            const matchChoseong = choseongMap.get(char.name_kr)?.includes(query);
            
            return matchName || matchKr || matchChoseong;
        });
    }, [characters, searchTerm, choseongMap]);

    return {
        isLoading,
        characters,
        filteredCharacters,
        selectedChar,
        setSelectedChar: handleSetSelectedChar,
        selectedSkin,
        setSelectedSkin,
        searchTerm,
        setSearchTerm
    };
}

import { useState, useEffect, useMemo } from 'react';
import type { Character, Skin } from '../types';
import { matchHangul } from '../utils/hangul';
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

    // 검색 필터링 (Memoization 적용)
    const filteredCharacters = useMemo(() => {
        return characters.filter((char) => {
            const lowerQuery = searchTerm.toLowerCase();
            const matchName = char.name.toLowerCase().includes(lowerQuery);
            const matchKr = matchHangul(char.name_kr, searchTerm);
            return matchName || matchKr;
        });
    }, [characters, searchTerm]);

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

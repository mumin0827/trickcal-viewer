import React from 'react';
import type { Character } from '../../types';
import { RESOURCE_PATHS } from '../../routers/paths';

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    characters: Character[];
    selectedCharId: string | undefined;
    onSelect: (char: Character) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredCharacters: Character[];
}

const CharacterModal: React.FC<CharacterModalProps> = ({
    isOpen,
    onClose,
    selectedCharId,
    onSelect,
    searchTerm,
    setSearchTerm,
    filteredCharacters
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content character-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>사도 선택</h3>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="사도 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <div className="char-grid">
                    {filteredCharacters.map((char) => (
                        <button
                            key={char.id}
                            className={`char-grid-item ${selectedCharId === char.id ? "active" : ""}`}
                            onClick={() => onSelect(char)}
                        >
                            <div className="char-img-wrapper">
                                <img
                                    src={`${RESOURCE_PATHS.IMAGE.HEROS}/${char.id}.webp`}
                                    alt={char.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <span className="char-name">{char.name_kr}</span>
                        </button>
                    ))}
                </div>
                <button className="close-modal-btn" onClick={onClose}>
                    닫기
                </button>
            </div>
        </div>
    );
};

export default React.memo(CharacterModal);

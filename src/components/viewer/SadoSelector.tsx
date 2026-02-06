import React, { useCallback, useEffect, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { VirtuosoGrid } from 'react-virtuoso';

import {
  AttackMap,
  ClassMap,
  Personality,
  PersonalityMap,
  PositionMap,
  RaceMap,
  type Sado,
  type SadoFilterState,
  type SadoSortKey,
} from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';
import { Button } from '@/components/ui/button';

import SadoFilter from './SadoFilter';

interface SadoSelectorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedSadoId: string | undefined;
  onSelect: (sado: Sado) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredSados: Sado[];
  filters: SadoFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SadoFilterState>>;
  onResetFilters: () => void;
  sortKey: SadoSortKey;
  setSortKey: (key: SadoSortKey) => void;
  sortAsc: boolean;
  setSortAsc: (value: boolean | ((prev: boolean) => boolean)) => void;
}

interface SadoItemProps {
  sado: Sado;
  isSelected: boolean;
  onSelect: (sado: Sado) => void;
}

const personalityClasses = {
    [Personality.Cool]: "bg-[var(--personality-cool)]",
    [Personality.Gloomy]: "bg-[var(--personality-gloomy)]",
    [Personality.Jolly]: "bg-[var(--personality-jolly)]",
    [Personality.Mad]: "bg-[var(--personality-mad)]",
    [Personality.Naive]: "bg-[var(--personality-naive)]",
    [Personality.Resonance]: "", // 공명은 별도 처리
};

const SadoItem = React.memo(({ sado, isSelected, onSelect }: SadoItemProps) => {
    const { i18n } = useTranslation();

    const isResonance = sado.personality === Personality.Resonance;

    return (
        <button
            className={`
                group relative flex flex-col items-center rounded-lg transition-all duration-200 w-full overflow-hidden border-2
                ${isSelected
                    ? "border-tc-green shadow-md ring-2 ring-tc-green/30 ring-offset-1"
                    : "border-char-item-border hover:border-tc-green/60"
                }
            `}
            style={{
                backgroundColor: isSelected ? undefined : 'var(--char-item-bg)',
            }}
            onClick={() => onSelect(sado)}
        >
            {/* 이미지 컨테이너 */}
            <div className={`w-full aspect-square relative flex items-center justify-center overflow-hidden ${!isResonance && sado.personality !== undefined ? personalityClasses[sado.personality] : 'bg-char-img-bg'}`}>
                {/* 공명 배경 레이어 */}
                {isResonance && (
                    <div 
                        className="absolute inset-0 z-0 opacity-60"
                        style={{
                            backgroundImage: `url(${RESOURCE_PATHS.IMAGE.ICONS}/decoBGCircleResonance.png)`,
                            backgroundSize: '150%',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                <img
                    src={`${RESOURCE_PATHS.IMAGE.HEROS}/${sado.id}.webp`}
                    alt={sado.name}
                    className="w-full h-full object-contain z-10 relative"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />

                {/* 상단 오버레이: 종족 (좌측) */}
                <div className="absolute top-0.5 left-0.5 z-20">
                    {sado.race !== undefined && (
                        <img 
                            src={`${RESOURCE_PATHS.IMAGE.ALBUM}/Album_Icon_${RaceMap[sado.race]}.png`}
                            className="w-3 h-3 md:w-3.5 md:h-3.5"
                            alt={RaceMap[sado.race]}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    )}
                </div>
                {/* 하단 중앙 오버레이: 성격, 클래스, 공격타입, 위치 아이콘 */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none z-20">
                    <div className="flex gap-0.5 bg-black/40 rounded-full px-1.5 py-0.5">
                        {sado.personality !== undefined && (
                            <img 
                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/Common_UnitPersonality_${PersonalityMap[sado.personality]}.png`}
                                className="w-3.5 h-3.5"
                                alt={PersonalityMap[sado.personality]}
                            />
                        )}
                        {sado.unitClass !== undefined && (
                            <img 
                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/Common_UnitClass_000${sado.unitClass}.png`}
                                className="w-3.5 h-3.5"
                                alt={ClassMap[sado.unitClass]}
                            />
                        )}
                        {sado.attackType !== undefined && (
                            <img 
                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/Common_UnitAttack${AttackMap[sado.attackType]}.png`}
                                className="w-3.5 h-3.5"
                                alt={AttackMap[sado.attackType]}
                            />
                        )}
                        {sado.position !== undefined && (
                            <img 
                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/Common_Position${PositionMap[sado.position]}.png`}
                                className="w-3.5 h-3.5"
                                alt={PositionMap[sado.position]}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* 이름 및 등급(별) */}
            <div className={`
                w-full pb-1 px-0.5 text-center border-t transition-colors flex flex-col items-center
                ${isSelected
                    ? "bg-tc-green text-white border-tc-green"
                    : "bg-char-item-bg border-char-item-border text-text-main group-hover:bg-tc-panel"
                }
            `}>
                {/* 등급 표시 */}
                {sado.initialStar !== undefined && (
                    <div className="flex flex-row justify-center -mt-2.5 -mb-0.5 z-20 h-5">
                        {Array(sado.initialStar).fill(0).map((_, i) => (
                            <img
                                key={i}
                                src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroGrade_000${[0, 3, 3, 4][sado.initialStar!]}.png`}
                                className={`w-5.5 h-5.5 ${sado.initialStar! > 1 ? "-mx-0.5" : ""}`}
                                alt="star"
                            />
                        ))}
                    </div>
                )}
                <span className="block text-[0.65rem] md:text-[0.8rem] font-bold truncate leading-tight mt-0.5">
                    {i18n.language.startsWith('ko') ? sado.name_kr : sado.name}
                </span>
            </div>

            {/* 선택 시 체크 표시 오버레이 */}
            {isSelected && (
                <div className="absolute top-1 right-1 bg-tc-green text-white rounded-full p-0.5 shadow-sm animate-in zoom-in duration-200 z-10">
                    <Check className="w-3 h-3 stroke-[3px]" />
                </div>
            )}
        </button>
    );
});

const AnimatedElena = () => {
    return (
        <div className="w-20 h-20 mb-2 overflow-hidden">
            <div 
                className="w-full h-full animate-elena-sprite"
                style={{ 
                    backgroundImage: "url('/image/networkIcon/NetworkIcon_Elena_Sprite.png')",
                    backgroundSize: '400% 100%',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </div>
    );
};

const ListSpacer = () => <div className="h-2.5" />;

const SadoSelector: React.FC<SadoSelectorProps> = ({
    isOpen,
    setIsOpen,
    selectedSadoId,
    onSelect,
    searchTerm,
    setSearchTerm,
    filteredSados,
    filters,
    setFilters,
    onResetFilters,
    sortKey,
    setSortKey,
    sortAsc,
    setSortAsc,
}) => {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    // 사이드바가 열릴 때 입력창에 포커스
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = useCallback((sado: Sado) => {
        onSelect(sado);
        // 모바일: 선택 시 닫기
        if (window.innerWidth < 768) setIsOpen(false);
    }, [onSelect, setIsOpen]);

    return (
        <>
            {/* 사이드바 토글 버튼 (닫혀있을 때 표시) - 플로팅 */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed left-0 top-1/2 -translate-y-1/2 z-[40] bg-btn-bg border-[3px] border-l-0 border-tc-green rounded-r-2xl p-2 pl-4 shadow-lg hover:pl-6 transition-all group hidden md:flex"
                        title={t('selector.openLabel')}
                    >
                        <ChevronRight className="w-8 h-8 text-tc-green group-hover:scale-110 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* 오버레이 (배경 흐림) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 z-[4999]"
                    />
                )}
            </AnimatePresence>

            {/* 사이드바 패널 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] md:max-w-[420px] bg-tc-panel z-[5000] shadow-2xl border-r-[3px] md:border-r-[4px] border-tc-green flex flex-col"
                    >
                        {/* 헤더 */}
                        <div className="p-4 md:p-5 bg-header-bg border-b-[2px] md:border-b-[3px] border-tc-green/20 flex flex-col gap-3 md:gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg md:text-xl font-bold text-tc-green-dark">
                                    {t('selector.title')}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-text-sub hover:text-tc-green hover:bg-white/50 rounded-full h-8 w-8 md:h-10 md:w-10"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                </Button>
                            </div>

                            {/* 검색 입력 및 필터 */}
                            <div className="flex items-center gap-2">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tc-green w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3px]" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="w-full bg-input-bg text-text-main rounded-xl pl-8 pr-8 py-2 md:pl-9 md:pr-9 md:py-2.5 text-xs md:text-sm font-bold outline-none border-2 border-tc-green/30 focus:border-tc-green shadow-inner transition-all placeholder:text-text-disabled placeholder:font-normal"
                                        placeholder={t('selector.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-sub hover:text-tc-green p-1"
                                        >
                                            <X className="w-3 h-3 stroke-[3px]" />
                                        </button>
                                    )}
                                </div>
                                
                                <SadoFilter 
                                    filters={filters}
                                    setFilters={setFilters}
                                    onReset={onResetFilters}
                                    totalCount={filteredSados.length}
                                    sortKey={sortKey}
                                    setSortKey={setSortKey}
                                    sortAsc={sortAsc}
                                    setSortAsc={setSortAsc}
                                />
                            </div>
                        </div>

                        {/* 리스트 내용 - 그리드 레이아웃 */}
                        <div className="flex-1 overflow-hidden bg-tc-bg relative">
                            {filteredSados.length > 0 ? (
                                <VirtuosoGrid
                                    style={{ height: '100%', width: '100%' }}
                                    totalCount={filteredSados.length}
                                    className="custom-scrollbar z-10 relative"
                                    listClassName="grid grid-cols-3 gap-2 md:gap-3 px-3 md:px-4 content-start"
                                    components={{
                                        Header: ListSpacer,
                                        Footer: ListSpacer
                                    }}
                                    itemContent={(index) => {
                                        const sado = filteredSados[index];
                                        return (
                                            <SadoItem
                                                key={sado.id}
                                                sado={sado}
                                                isSelected={selectedSadoId === sado.id}
                                                onSelect={handleSelect}
                                            />
                                        );
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-text-sub gap-1 min-h-[250px] relative z-10">
                                    <AnimatedElena />
                                    <p className="text-sm font-bold text-text-sub">{t('selector.noResults')}</p>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="text-xs border-2 hover:border-tc-green hover:text-tc-green mt-2"
                                    >
                                        {t('selector.showAll')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 하단 통계 */}
                        <div className="p-3 bg-footer-bg backdrop-blur-sm border-t border-tc-green/10 text-center">
                            <span className="text-xs font-bold text-tc-green bg-tc-green/10 px-3 py-1 rounded-full">
                                {t('selector.totalCount', { count: filteredSados.length })}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(SadoSelector);

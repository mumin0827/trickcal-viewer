import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import type { Sado, Skin } from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';
import { Button } from '@/components/ui/button';
import ControlBar from './ControlBar';

interface ViewerControlsProps {
    mode: 'view' | 'studio' | 'appreciation';
    setMode: (mode: 'view' | 'studio' | 'appreciation') => void;
    viewMode: 'standing' | 'ingame';
    setViewMode: React.Dispatch<React.SetStateAction<'standing' | 'ingame'>>;
    selectedSado: Sado | null;
    selectedSkin: Skin | null;
    setSelectedSkin: (skin: Skin) => void;
    hasIngameMotion: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    showExportConfirm: boolean;
    
    // Spine 상태 및 제어
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerInstance: any;
    spineController: {
        handlePlayPause: () => void;
        handleAnimationChange: (anim: string) => void;
        handleSpineSkinChange: (skin: string) => void;
        handleScrubStart: () => void;
        handleScrubEnd: () => void;
        handleSeek: (time: number) => void;
        handleNextMotion: () => void;
        handlePrevMotion: () => void;
    } | null;
    isPlaying: boolean;
    animations: string[];
    currentAnim: string;
    spineSkins: string[];
    currentSpineSkin: string;
    duration: number;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
    mode,
    setMode,
    viewMode,
    setViewMode,
    selectedSado,
    selectedSkin,
    setSelectedSkin,
    hasIngameMotion,
    setIsSidebarOpen,
    showExportConfirm,
    playerInstance,
    spineController,
    isPlaying,
    animations,
    currentAnim,
    spineSkins,
    currentSpineSkin,
    duration,
    scale,
    setScale
}) => {
    const { t, i18n } = useTranslation();

    return (
        <AnimatePresence>
            {(mode !== 'appreciation' && !showExportConfirm) && (
                <motion.main 
                    className="fixed bottom-[50px] left-0 right-0 z-20 flex flex-col items-center justify-end w-full pb-0 md:pb-4 px-0 md:px-4 gap-0 md:gap-4 pointer-events-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-wrap gap-2 md:gap-3 items-center justify-center pointer-events-auto w-full max-w-[600px] mb-3 md:mb-0 px-2 md:px-0">
                        {/* 스튜디오 및 감상 모드 전환 버튼 */}
                        {(selectedSado && mode !== 'studio') && (
                            <>
                                <Button 
                                    className="hidden md:flex rounded-full border-[2px] md:border-[3px] bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4"
                                    onClick={() => setMode('studio')}
                                >
                                    {t('viewer.studio')}
                                </Button>
                                <Button 
                                    className="hidden md:flex rounded-full border-[2px] md:border-[3px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4"
                                    onClick={() => setMode('appreciation')}
                                >
                                    {t('viewer.appreciation')}
                                </Button>
                            </>
                        )}

                        {/* 뷰 모드 토글 (스탠딩/인게임) */}
                        {selectedSado && (
                            <Button
                                variant={viewMode === 'ingame' ? 'primary' : 'default'}
                                className="rounded-full border-[2px] md:border-[3px] h-8 text-xs px-3 md:h-10 md:text-sm md:px-4"
                                onClick={() => hasIngameMotion && setViewMode(prev => prev === 'standing' ? 'ingame' : 'standing')}
                                disabled={!hasIngameMotion}
                            >
                                {viewMode === 'ingame' ? t('viewer.ingame') : t('viewer.standing')}
                            </Button>
                        )}

                        {/* 캐릭터 선택 버튼 (사이드바 토글) */}
                        <Button
                            variant="secondary"
                            className={`rounded-full border-[2px] md:border-[3px] border-tc-green ${selectedSado ? 'pl-[4px] pr-3 md:pl-[6px] md:pr-5' : 'px-4 md:px-6'} h-9 text-xs md:h-[46px] md:text-sm`}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            {selectedSado && (
                                <img
                                    src={`${RESOURCE_PATHS.IMAGE.SKILLS}/Icon_GraduateSKill_${selectedSado.id}.webp`}
                                    alt=""
                                    className="w-[24px] h-[24px] md:w-[34px] md:h-[34px] rounded-full object-cover bg-char-img-bg shrink-0 mr-1.5 md:mr-2.5"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                            {selectedSado ? (i18n.language.startsWith('ko') ? selectedSado.name_kr : selectedSado.name) : t('viewer.characterSelect')}
                        </Button>
                    </div>

                    {/* 플레이어 조작 바 */}
                    <div className="w-full max-w-[800px] pointer-events-auto">
                        {selectedSado && selectedSkin && spineController && (
                            <ControlBar
                                playerInstance={playerInstance}
                                duration={duration}
                                isPlaying={isPlaying}
                                onPlayPause={spineController.handlePlayPause}
                                onSeek={spineController.handleSeek}
                                onScrubStart={spineController.handleScrubStart}
                                onScrubEnd={spineController.handleScrubEnd}
                                onNext={spineController.handleNextMotion}
                                onPrev={spineController.handlePrevMotion}
                                skins={selectedSado.skins}
                                selectedSkin={selectedSkin}
                                onSkinChange={setSelectedSkin}
                                spineSkins={spineSkins}
                                currentSpineSkin={currentSpineSkin}
                                onSpineSkinChange={spineController.handleSpineSkinChange}
                                scale={scale}
                                onScaleChange={setScale}
                                currentAnim={currentAnim}
                                animations={animations}
                                onAnimationChange={spineController.handleAnimationChange}
                            />
                        )}
                    </div>
                </motion.main>
            )}
        </AnimatePresence>
    );
};

export default ViewerControls;

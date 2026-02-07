import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import Loading from '@/components/common/Loading';
import WaveBackground from '@/components/common/WaveBackground';
import SadoSelector from '@/components/viewer/SadoSelector';
import SpineCanvas from '@/components/viewer/SpineCanvas';
import StudioPanel from '@/components/viewer/StudioPanel';
import ViewerControls from '@/components/viewer/ViewerControls';
import { Button } from '@/components/ui/button';
import { useRecorder } from '@/hooks/useRecorder';
import { useSadoRoster } from '@/hooks/useSadoRoster';
import { GIF_STEPS } from '@/lib/constants';
import { parseHexWithAlpha } from '@/lib/utils';
import { useHeaderStore } from '@/stores/useHeaderStore';

const ViewerPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        isLoading,
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
    } = useSadoRoster();

    const { setHeaderActions } = useHeaderStore();

    const [mode, setMode] = useState<'view' | 'studio' | 'appreciation'>('view');
    const [viewMode, setViewMode] = useState<'standing' | 'ingame'>('standing');
    const [scale, setScale] = useState(0.85);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [playerInstance, setPlayerInstance] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [animations, setAnimations] = useState<string[]>([]);
    const [currentAnim, setCurrentAnim] = useState<string>('');
    const [spineSkins, setSpineSkins] = useState<string[]>([]);
    const [currentSpineSkin, setCurrentSpineSkin] = useState<string>('Normal');
    const [duration, setDuration] = useState(0);

    const [spineController, setSpineController] = useState<{
        handlePlayPause: () => void;
        handleAnimationChange: (anim: string) => void;
        handleSpineSkinChange: (skin: string) => void;
        handleScrubStart: () => void;
        handleScrubEnd: () => void;
        handleSeek: (time: number) => void;
        handleNextMotion: () => void;
        handlePrevMotion: () => void;
    } | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [exportFormat, setExportFormat] = useState<'gif' | 'mp4' | 'zip' | 'png'>('gif');
    const [exportResolution, setExportResolution] = useState(1024);
    const [exportBackground, setExportBackground] = useState('#00000000');
    const [useExportFrame, setUseExportFrame] = useState(false);
    const [gifStepIndex, setGifStepIndex] = useState(7);
    const [zipFps, setZipFps] = useState(30);
    const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);

    const isInteractiveMode = mode === 'appreciation' || mode === 'studio';
    const hasIngameMotion = selectedSkin?.hasIngame !== false;
    const effectiveViewMode = hasIngameMotion ? viewMode : 'standing';

    // 사도나 스킨이 바뀔 때 위치랑 배율 초기화
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setScale(0.85);
            setPosition({ x: 0, y: 0 });
        }, 0);
        return () => window.clearTimeout(timer);
    }, [selectedSado?.id, selectedSkin?.file, effectiveViewMode, setScale, setPosition]);

    const [showLoading, setShowLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [showRecLoading, setShowRecLoading] = useState(false);
    const [isRecExiting, setIsRecExiting] = useState(false);

    const { color: backgroundBaseColor, alpha: backgroundAlpha } = parseHexWithAlpha(exportBackground);
    const effectiveBackgroundOpacity = exportFormat === 'mp4' ? 1 : backgroundAlpha;

    const exportFrameSize = stageSize
        ? Math.round(Math.min(stageSize.width, stageSize.height) * 0.7)
        : 0;

    const exportFrame = stageSize && exportFrameSize > 0
        ? (() => {
            const baseX = Math.round((stageSize.width - exportFrameSize) / 2);
            const baseY = Math.round((stageSize.height - exportFrameSize) / 2);
            const offsetY = -32;
            const clampedX = Math.max(0, Math.min(stageSize.width - exportFrameSize, baseX));
            const clampedY = Math.max(0, Math.min(stageSize.height - exportFrameSize, baseY + offsetY));
            return {
                x: clampedX,
                y: clampedY,
                size: exportFrameSize
            };
        })()
        : null;

    const backgroundLabel = `${backgroundBaseColor.toUpperCase()} (${Math.round(effectiveBackgroundOpacity * 100)}%)`;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setIsExiting(!isLoading);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [isLoading]);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => { setShowLoading(false); }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);


    const { isRecording, handleExtract } = useRecorder(
        selectedSado,
        selectedSkin,
        effectiveViewMode,
        currentAnim,
        duration,
        currentSpineSkin,
        useExportFrame,
        stageSize,
        { scale, position },
        exportFrame
    );

    useEffect(() => {
        setHeaderActions({
            onOpenExport: () => setMode('studio'),
            isRecording,
            hasSelectedSado: !!selectedSado
        });
    }, [isRecording, selectedSado, setHeaderActions]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (isRecording) {
                setShowRecLoading(true);
                setIsRecExiting(false);
            } else if (showRecLoading) {
                setIsRecExiting(true);
            }
        }, 0);
        return () => window.clearTimeout(timer);
    }, [isRecording, showRecLoading]);

    useEffect(() => {
        if (!isRecording && showRecLoading) {
            const timer = setTimeout(() => {
                setShowRecLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isRecording, showRecLoading]);

    const performExport = async () => {
        const fps = exportFormat === 'gif' ? GIF_STEPS[gifStepIndex].actual : zipFps;

        setShowExportConfirm(false);
        toast.info(t('viewer.exportStarted'));

        const isSuccess = await handleExtract(exportFormat, fps, exportResolution, exportBackground);

        if (isSuccess) {
            toast.success(t('viewer.exportSuccess'));
        } else {
            toast.error(t('viewer.exportFailed'));
        }
    };

    // 키보드 단축키 설정 - 수정
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Escape") {
                if (isSidebarOpen) setIsSidebarOpen(false);
                else if (mode === 'studio') {
                    if (showExportConfirm) {
                        setShowExportConfirm(false);
                    } else {
                        setMode('view');
                        setPosition({ x: 0, y: 0 });
                        setScale(0.85);
                    }
                } else if (mode === 'appreciation') {
                    setMode('view');
                    setPosition({ x: 0, y: 0 });
                    setScale(0.85);
                }
            }

            if (spineController) {
                const target = e.target as HTMLElement;
                const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

                if (e.code === "Space") {
                    if (!isTyping) {
                        e.preventDefault();
                        spineController.handlePlayPause();
                    }
                }
                if (e.code === "ArrowLeft" && !isTyping) spineController.handlePrevMotion();
                if (e.code === "ArrowRight" && !isTyping) spineController.handleNextMotion();
            }

            if (e.code === "Tab") {
                e.preventDefault();
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isSidebarOpen, mode, showExportConfirm, spineController]);

    return (
        <div className="w-full h-[calc(100vh-56px-50px)] md:h-[calc(100vh-64px-50px)] relative overflow-hidden app-container bg-[#f0f0f000]">
            <SpineCanvas
                selectedSado={selectedSado}
                selectedSkin={selectedSkin}
                viewMode={effectiveViewMode}
                isInteractiveMode={isInteractiveMode}
                backgroundColor={mode === 'studio' ? backgroundBaseColor : undefined}
                backgroundOpacity={mode === 'studio' ? effectiveBackgroundOpacity : 1}
                frameOverlay={
                    mode === 'studio' && useExportFrame && exportFrame ? (
                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute rounded-2xl border-2 border-white/70"
                                style={{
                                    left: exportFrame.x,
                                    top: exportFrame.y,
                                    width: exportFrame.size,
                                    height: exportFrame.size,
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.2)'
                                }}
                            />
                        </div>
                    ) : undefined
                }
                scale={scale}
                setScale={setScale}
                position={position}
                setPosition={setPosition}
                onStageBounds={setStageSize}
                onPlayerReady={setPlayerInstance}
                setAnimations={setAnimations}
                setCurrentAnim={setCurrentAnim}
                setSpineSkins={setSpineSkins}
                setCurrentSpineSkin={setCurrentSpineSkin}
                setDuration={setDuration}
                setIsPlaying={setIsPlaying}
                setSpineController={setSpineController}
            />

            {/* 사도 선택하라는 안내 */}
            <AnimatePresence>
                {!selectedSado && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-x-0 top-14 md:top-16 bottom-[50px] flex flex-col items-center justify-center gap-4 pointer-events-none z-30 px-6"
                    >
                        <div className="text-text-sub text-xl md:text-2xl font-bold tracking-tight text-center break-keep">
                            {t('viewer.selectCharacter')}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 물결 배경 */}
            <AnimatePresence>
                {!isInteractiveMode && (
                    <motion.div
                        key="wave-background"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-10"
                    >
                        <WaveBackground />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 감상 모드 종료 버튼 */}
            <AnimatePresence>
                {mode === 'appreciation' && (
                    <motion.div
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <Button
                            variant="secondary"
                            className="rounded-full shadow-lg border-[2px] border-white/50 bg-black/50 text-white hover:bg-black/70 px-6 backdrop-blur-md"
                            onClick={() => {
                                setMode('view');
                                setPosition({ x: 0, y: 0 });
                                setScale(0.85);
                            }}
                        >
                            {t('viewer.exitAppreciation')}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 스튜디오 패널 */}
            <AnimatePresence>
                {mode === 'studio' && (
                    <motion.div
                        className="absolute top-20 right-4 md:top-auto md:right-10 md:bottom-10 z-50 w-[92vw] max-w-[420px] pointer-events-auto"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <StudioPanel
                            exportFormat={exportFormat}
                            setExportFormat={setExportFormat}
                            exportResolution={exportResolution}
                            setExportResolution={setExportResolution}
                            gifStepIndex={gifStepIndex}
                            setGifStepIndex={setGifStepIndex}
                            zipFps={zipFps}
                            setZipFps={setZipFps}
                            exportBackground={exportBackground}
                            setExportBackground={setExportBackground}
                            useExportFrame={useExportFrame}
                            setUseExportFrame={setUseExportFrame}
                            onExport={() => setShowExportConfirm(true)}
                            onExit={() => {
                                setMode('view');
                                setPosition({ x: 0, y: 0 });
                                setScale(0.85);
                            }}
                            isRecording={isRecording}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 내보내기 확인 팝업 */}
            <AnimatePresence>
                {mode === 'studio' && showExportConfirm && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-[90vw] max-w-[360px] pointer-events-auto"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="bg-controls-bg-start/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-tc-line-soft flex flex-col gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-text-main">{t('studio.exportConfirmTitle')}</h3>
                                    <p className="text-sm text-text-sub mt-1">{t('studio.exportConfirmDesc')}</p>
                                </div>

                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-sub">{t('studio.format')}</span>
                                        <span className="font-semibold text-text-main">{exportFormat.toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-sub">{t('studio.resolution')}</span>
                                        <span className="font-semibold text-text-main">{exportResolution}px</span>
                                    </div>
                                    {exportFormat !== 'png' && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-text-sub">{t('studio.fps')}</span>
                                            <span className="font-semibold text-text-main">
                                                {exportFormat === 'gif' ? GIF_STEPS[gifStepIndex].display : zipFps}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-sub">{t('studio.background')}</span>
                                        <span className="font-semibold text-text-main text-right">{backgroundLabel}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-sub">{t('studio.exportFrame')}</span>
                                        <span className="font-semibold text-text-main">
                                            {useExportFrame ? t('studio.exportFrameOn') : t('studio.exportFrameOff')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2 mt-1 border-t border-tc-line-soft">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => setShowExportConfirm(false)}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        className="flex-[2] bg-tc-green hover:bg-tc-green-dark text-white"
                                        onClick={() => performExport()}
                                        disabled={isRecording}
                                    >
                                        {isRecording ? t('viewer.extracting') : t('studio.save')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ViewerControls
                mode={mode}
                setMode={setMode}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedSado={selectedSado}
                selectedSkin={selectedSkin}
                setSelectedSkin={setSelectedSkin}
                hasIngameMotion={hasIngameMotion}
                setIsSidebarOpen={setIsSidebarOpen}
                showExportConfirm={showExportConfirm}
                playerInstance={playerInstance}
                spineController={spineController}
                isPlaying={isPlaying}
                animations={animations}
                currentAnim={currentAnim}
                spineSkins={spineSkins}
                currentSpineSkin={currentSpineSkin}
                duration={duration}
                scale={scale}
                setScale={setScale}
            />

            <SadoSelector
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                selectedSadoId={selectedSado?.id}
                onSelect={(sado) => {
                    setSelectedSado(sado);
                }}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredSados={filteredSados}
                filters={filters}
                setFilters={setFilters}
                onResetFilters={resetFilters}
                sortKey={sortKey}
                setSortKey={setSortKey}
                sortAsc={sortAsc}
                setSortAsc={setSortAsc}
            />

            {showLoading && <Loading isExiting={isExiting} />}
            {showRecLoading && <Loading message={t('viewer.extracting')} isExiting={isRecExiting} />}
        </div>
    );
}

export default ViewerPage;
import React, { useRef, useEffect } from 'react';
import Loading from '../../components/common/Loading';
import CharacterModal from '../../components/viewer/CharacterModal';
import ExportModal from '../../components/viewer/ExportModal';
import ControlBar from '../../components/viewer/ControlBar';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import WaveBackground from '../../components/common/WaveBackground';
import { useCharacters } from '../../hooks/useCharacters';
import { useSpinePlayer } from '../../hooks/useSpinePlayer';
import { useRecorder } from '../../hooks/useRecorder';
import { RESOURCE_PATHS } from '../../routers/paths';
import '../../App.css';

const ViewerPage: React.FC = () => {
    const {
        isLoading,
        characters,
        filteredCharacters,
        selectedChar,
        setSelectedChar,
        selectedSkin,
        setSelectedSkin,
        searchTerm,
        setSearchTerm
    } = useCharacters();

    const [viewMode, setViewMode] = React.useState<'standing' | 'ingame'>('standing');
    const [isCharModalOpen, setIsCharModalOpen] = React.useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
    
    const [showLoading, setShowLoading] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);

    const [showRecLoading, setShowRecLoading] = React.useState(false);
    const [isRecExiting, setIsRecExiting] = React.useState(false);

    useEffect(() => {
        if (!isLoading) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShowLoading(false);
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const playerRef = useRef<HTMLDivElement>(null);
    const {
        isPlaying,
        animations,
        currentAnim,
        spineSkins,
        currentSpineSkin,
        currentTime,
        duration,
        handlePlayPause,
        handleAnimationChange,
        handleSpineSkinChange,
        handleScrubStart,
        handleScrubEnd,
        handleSeek,
        handleNextMotion,
        handlePrevMotion
    } = useSpinePlayer(selectedChar, selectedSkin, playerRef, viewMode);

    const { isRecording, handleExtract } = useRecorder(
        selectedChar,
        selectedSkin,
        viewMode,
        currentAnim,
        duration,
        currentSpineSkin
    );

    useEffect(() => {
        if (isRecording) {
            setShowRecLoading(true);
            setIsRecExiting(false);
        } else if (showRecLoading) {
            setIsRecExiting(true);
            const timer = setTimeout(() => {
                setShowRecLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isRecording, showRecLoading]);

    const openExportModal = () => {
        setIsExportModalOpen(true);
    };

    const confirmExport = (format: 'gif' | 'zip' | 'png', fps: number, resolution: number) => {
        setIsExportModalOpen(false);
        handleExtract(format, fps, resolution);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isSpace = e.code === "Space";
            const isLeft = e.code === "ArrowLeft";
            const isRight = e.code === "ArrowRight";
            const isTab = e.code === "Tab";
            const isEsc = e.code === "Escape";

            if (!isSpace && !isLeft && !isRight && !isTab && !isEsc) return;

            if (isEsc) {
                if (isCharModalOpen) {
                    setIsCharModalOpen(false);
                    e.preventDefault();
                } else if (isExportModalOpen) {
                    setIsExportModalOpen(false);
                    e.preventDefault();
                }
                return;
            }

            const target = e.target as HTMLElement | null;
            const tag = target?.tagName?.toUpperCase();
            const isInput = tag === "INPUT";
            const isRange = isInput && (target as HTMLInputElement).type === "range";
            const isTyping = target?.isContentEditable || (isInput && !isRange) || tag === "TEXTAREA" || tag === "SELECT";

            if (isTyping) return;

            if (isTab) {
                e.preventDefault();
                setIsCharModalOpen(true);
                return;
            }

            e.preventDefault();

            if (isSpace) {
                handlePlayPause();
            } else if (isLeft) {
                handlePrevMotion();
            } else if (isRight) {
                handleNextMotion();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handlePlayPause, handlePrevMotion, handleNextMotion, isCharModalOpen, isExportModalOpen]);

    return (
        <div className="app-container">
            <Header />

            <main className="viewer-container">
                {showRecLoading && <Loading message="추출 중..." isExiting={isRecExiting} />}

                <div className="stage-card">
                    <div className="top-controls">
                        <div className="record-controls">
                            {selectedChar && selectedSkin && (
                                <button
                                    className="record-btn"
                                    onClick={openExportModal}
                                    disabled={isRecording}
                                    title="내보내기 설정"
                                >
                                    {isRecording ? '⏳' : '내보내기'}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {selectedChar && (
                                <button
                                    className={`mode-toggle-btn ${viewMode === 'ingame' ? 'active' : ''}`}
                                    onClick={() => setViewMode(prev => prev === 'standing' ? 'ingame' : 'standing')}
                                    title={viewMode === 'ingame' ? "Switch to Standing Motion" : "Switch to In-Game Motion"}
                                >
                                    {viewMode === 'ingame' ? '인게임' : '스탠딩'}
                                </button>
                            )}
                            <button
                                className={`char-select-btn ${selectedChar ? 'has-char' : ''}`}
                                onClick={() => setIsCharModalOpen(true)}
                            >
                                {selectedChar && (
                                    <img
                                        src={`${RESOURCE_PATHS.IMAGE.SKILLS}/Icon_GraduateSKill_${selectedChar.id}.webp`}
                                        alt=""
                                        className="btn-char-icon"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                )}
                                {selectedChar ? selectedChar.name_kr : "사도 선택"}
                            </button>
                        </div>
                    </div>

                    <div className="player-wrapper">
                        {!selectedChar && <div className="placeholder-msg">사도를 선택하세요!</div>}
                        <div id="player-container" ref={playerRef}></div>
                    </div>
                </div>

                {selectedChar && selectedSkin && (
                    <ControlBar
                        currentTime={currentTime}
                        duration={duration}
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        onSeek={handleSeek}
                        onScrubStart={handleScrubStart}
                        onScrubEnd={handleScrubEnd}
                        onNext={handleNextMotion}
                        onPrev={handlePrevMotion}
                        animations={animations}
                        currentAnim={currentAnim}
                        onAnimChange={handleAnimationChange}
                        skins={selectedChar.skins}
                        selectedSkin={selectedSkin}
                        onSkinChange={setSelectedSkin}
                        spineSkins={spineSkins}
                        currentSpineSkin={currentSpineSkin}
                        onSpineSkinChange={handleSpineSkinChange}
                    />
                )}
            </main>

            <WaveBackground />

            <Footer />

            <CharacterModal
                isOpen={isCharModalOpen}
                onClose={() => setIsCharModalOpen(false)}
                characters={characters}
                selectedCharId={selectedChar?.id}
                onSelect={(char) => {
                    setSelectedChar(char);
                    setIsCharModalOpen(false);
                }}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredCharacters={filteredCharacters}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={confirmExport}
            />

            {showLoading && <Loading isExiting={isExiting} />}
        </div>
    );
}

export default ViewerPage;

import React, { useRef, useState, useEffect } from 'react';
import type { Skin } from '../../types';
import { RESOURCE_PATHS } from '../../routers/paths';

interface ControlBarProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onScrubStart: () => void;
    onScrubEnd: () => void;
    onNext: () => void;
    onPrev: () => void;
    
    animations: string[];
    currentAnim: string;
    onAnimChange: (anim: string) => void;

    skins: Skin[];
    selectedSkin: Skin | null;
    onSkinChange: (skin: Skin) => void;

    spineSkins: string[];
    currentSpineSkin: string;
    onSpineSkinChange: (skinName: string) => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
    currentTime,
    duration,
    isPlaying,
    onPlayPause,
    onSeek,
    onScrubStart,
    onScrubEnd,
    onNext,
    onPrev,
    animations,
    currentAnim,
    onAnimChange,
    skins,
    selectedSkin,
    onSkinChange,
    spineSkins,
    currentSpineSkin,
    onSpineSkinChange
}) => {
    const [openMenu, setOpenMenu] = useState<"motion" | "skin" | "spineSkin" | null>(null);
    const menuAreaRef = useRef<HTMLDivElement | null>(null);
    const scrollTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!menuAreaRef.current) return;
            if (!menuAreaRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenMenu(null);
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        el.classList.add("is-scrolling");
        if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = window.setTimeout(() => {
            el.classList.remove("is-scrolling");
        }, 650); 
    };

    const formatTime = (t: number) => {
        if (!isFinite(t) || t < 0) return "00:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="controls-card tc-controls-card">
            <div className="controls-content">
                <div className="timeline-top">
                    <span className="time-chip">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={currentTime}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="timeline-slider tc-slider"
                        style={{ "--p": `${percent}%` } as React.CSSProperties}
                        onPointerDown={(e) => {
                            if (e.button === 0) onScrubStart();
                        }}
                        onPointerUp={(e) => {
                            if (e.button === 0) onScrubEnd();
                        }}
                        onPointerCancel={(e) => {
                            if (e.button === 0) onScrubEnd();
                        }}
                        onTouchStart={onScrubStart}
                        onTouchEnd={onScrubEnd}
                    />
                    <span className="time-chip">{formatTime(duration)}</span>
                </div>

                <div className="timeline-bottom">
                    <div className="transport">
                        <button type="button" className="icon-btn transport-btn" onClick={onPrev}>
                            <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/Deck_Icon_Skip.png`} alt="Prev" className="btn-icon" style={{ transform: "scaleX(-1)" }} />
                        </button>
                        <button onClick={onPlayPause} className="icon-btn transport-btn play-main">
                            {isPlaying ? (
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/TutorialVideoGuideIcon_Stop2.png`} alt="Pause" className="btn-icon" />
                            ) : (
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/TutorialVideoGuideIcon_Play2.png`} alt="Play" className="btn-icon" />
                            )}
                        </button>
                        <button type="button" className="icon-btn transport-btn" onClick={onNext}>
                            <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/Deck_Icon_Skip.png`} alt="Next" className="btn-icon" />
                        </button>
                    </div>

                    <div className="selectors-inline tc-selectors" ref={menuAreaRef}>
                        <div className="selector-popover">
                            <button
                                type="button"
                                className={`mini-select-btn ${openMenu === "motion" ? "active" : ""}`}
                                onClick={() => setOpenMenu(openMenu === "motion" ? null : "motion")}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_DetailsBG.png`} alt="Motion" className="btn-icon" />
                            </button>
                            {openMenu === "motion" && (
                                <div className="dropdown-menu" role="listbox" onScroll={handleDropdownScroll}>
                                    {animations.map((anim) => (
                                        <button
                                            key={anim}
                                            className={`dropdown-item ${anim === currentAnim ? "active" : ""}`}
                                            onClick={() => {
                                                onAnimChange(anim);
                                                setOpenMenu(null);
                                            }}
                                        >
                                            {anim}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="selector-popover">
                            <button
                                type="button"
                                className={`mini-select-btn ${openMenu === "spineSkin" ? "active" : ""}`}
                                onClick={() => setOpenMenu(openMenu === "spineSkin" ? null : "spineSkin")}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_Weared.png`} alt="Personal Skin" className="btn-icon" />
                            </button>
                            {openMenu === "spineSkin" && (
                                <div className="dropdown-menu" role="listbox">
                                    {spineSkins.map((sName) => (
                                        <button
                                            key={sName}
                                            className={`dropdown-item ${sName === currentSpineSkin ? "active" : ""}`}
                                            onClick={() => {
                                                onSpineSkinChange(sName);
                                                setOpenMenu(null);
                                            }}
                                        >
                                            {sName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="selector-popover">
                            <button
                                type="button"
                                className={`mini-select-btn ${openMenu === "skin" ? "active" : ""}`}
                                onClick={() => setOpenMenu(openMenu === "skin" ? null : "skin")}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_WearedBG.png`} alt="Skin" className="btn-icon" />
                            </button>
                            {openMenu === "skin" && (
                                <div className="dropdown-menu" role="listbox">
                                    {skins.map((skin) => (
                                        <button
                                            key={skin.file}
                                            className={`dropdown-item ${skin.file === selectedSkin?.file ? "active" : ""}`}
                                            onClick={() => {
                                                onSkinChange(skin);
                                                setOpenMenu(null);
                                            }}
                                        >
                                            {skin.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlBar;

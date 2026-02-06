import React, { useRef, useEffect, useCallback } from 'react';
import { useSpinePlayer } from '@/hooks/useSpinePlayer';
import type { Sado, Skin } from '@/types';

interface SpineCanvasProps {
    selectedSado: Sado | null;
    selectedSkin: Skin | null;
    viewMode: 'standing' | 'ingame';
    isInteractiveMode: boolean;
    overlay?: React.ReactNode;
    frameOverlay?: React.ReactNode;
    backgroundColor?: string;
    backgroundOpacity?: number;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    position: { x: number; y: number };
    setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    onStageBounds?: (bounds: { width: number; height: number }) => void;
    onPlayerReady: (instance: unknown) => void;
    // Spine Player 상태 전달용
    setAnimations: (anims: string[]) => void;
    setCurrentAnim: (anim: string) => void;
    setSpineSkins: (skins: string[]) => void;
    setCurrentSpineSkin: (skin: string) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setSpineController: (controller: {
        handlePlayPause: () => void;
        handleAnimationChange: (anim: string) => void;
        handleSpineSkinChange: (skin: string) => void;
        handleScrubStart: () => void;
        handleScrubEnd: () => void;
        handleSeek: (time: number) => void;
        handleNextMotion: () => void;
        handlePrevMotion: () => void;
    } | null) => void;
}

const SpineCanvas: React.FC<SpineCanvasProps> = ({
    selectedSado,
    selectedSkin,
    viewMode,
    isInteractiveMode,
    overlay,
    frameOverlay,
    backgroundColor,
    backgroundOpacity = 1,
    scale,
    setScale,
    position,
    setPosition,
    onStageBounds,
    onPlayerReady,
    setAnimations,
    setCurrentAnim,
    setSpineSkins,
    setCurrentSpineSkin,
    setDuration,
    setIsPlaying,
    setSpineController
}) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    // Spine Player 훅 사용
    const {
        playerInstance,
        isLoaded,
        isPlaying: hookIsPlaying,
        animations: hookAnimations,
        currentAnim: hookCurrentAnim,
        spineSkins: hookSpineSkins,
        currentSpineSkin: hookCurrentSpineSkin,
        duration: hookDuration,
        handlePlayPause,
        handleAnimationChange,
        handleSpineSkinChange,
        handleScrubStart,
        handleScrubEnd,
        handleSeek,
        handleNextMotion,
        handlePrevMotion
    } = useSpinePlayer(selectedSado, selectedSkin, playerRef, viewMode);

    // 부모 컴포넌트로 실제 플레이어 인스턴스(current) 전달
    useEffect(() => {
        if (playerInstance.current) {
            onPlayerReady(playerInstance.current);
        }
    }, [playerInstance, onPlayerReady, hookAnimations]);

    useEffect(() => {
        setSpineController({
            handlePlayPause,
            handleAnimationChange,
            handleSpineSkinChange,
            handleScrubStart,
            handleScrubEnd,
            handleSeek,
            handleNextMotion,
            handlePrevMotion
        });
    }, [
        handlePlayPause, handleAnimationChange, handleSpineSkinChange, 
        handleScrubStart, handleScrubEnd, handleSeek, 
        handleNextMotion, handlePrevMotion, setSpineController
    ]);

    // 상태 동기화
    useEffect(() => setIsPlaying(hookIsPlaying), [hookIsPlaying, setIsPlaying]);
    useEffect(() => setAnimations(hookAnimations), [hookAnimations, setAnimations]);
    useEffect(() => setCurrentAnim(hookCurrentAnim), [hookCurrentAnim, setCurrentAnim]);
    useEffect(() => setSpineSkins(hookSpineSkins), [hookSpineSkins, setSpineSkins]);
    useEffect(() => setCurrentSpineSkin(hookCurrentSpineSkin), [hookCurrentSpineSkin, setCurrentSpineSkin]);
    useEffect(() => setDuration(hookDuration), [hookDuration, setDuration]);

    useEffect(() => {
        if (!onStageBounds) return;
        const node = containerRef.current;
        if (!node) return;

        const updateBounds = () => {
            onStageBounds({
                width: node.clientWidth,
                height: node.clientHeight
            });
        };

        updateBounds();

        const observer = new ResizeObserver(() => updateBounds());
        observer.observe(node);
        return () => observer.disconnect();
    }, [onStageBounds]);

    // 줌, 드래그 로직
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!isInteractiveMode) return;
        const delta = -e.deltaY * 0.001;
        setScale(prev => Math.min(Math.max(prev + delta, 0.2), 3.0));
    }, [isInteractiveMode, setScale]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isInteractiveMode) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }, [isInteractiveMode, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !dragStartRef.current) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    }, [isDragging, setPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        dragStartRef.current = null;
    }, []);

    useEffect(() => {
        if (isDragging) window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseUp]);

    return (
        <div 
            className={`fixed inset-x-0 top-14 md:top-16 bottom-[200px] md:inset-0 z-[5] flex items-center justify-center transition-cursor duration-200 ${isInteractiveMode && !isDragging ? 'cursor-move' : ''}`}
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {backgroundColor && backgroundOpacity > 0 && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundColor: backgroundColor || 'transparent',
                        opacity: backgroundOpacity
                    }}
                />
            )}
            <div
                className={`w-full h-full origin-center ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: 'transform 75ms ease-out, opacity 300ms ease-out'
                }}
            >
                <div className="relative w-full h-full">
                    <div
                        id="player-container"
                        ref={playerRef}
                        className="w-full h-full"
                    ></div>
                    {overlay && (
                        <div className="absolute inset-0 pointer-events-auto">
                            {overlay}
                        </div>
                    )}
                </div>
            </div>
            {frameOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                    {frameOverlay}
                </div>
            )}
        </div>
    );
};

export default SpineCanvas;

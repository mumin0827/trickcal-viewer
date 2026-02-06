import { useCallback, useEffect, useRef } from 'react';
import type { SpinePlayer } from '@/types';

interface UseSpineControlsProps {
    playerInstance: React.MutableRefObject<SpinePlayer | null>;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    animations: string[];
    currentAnim: string;
    setCurrentAnim: (anim: string) => void;
    setCurrentSpineSkin: (skin: string) => void;
    setDuration: (duration: number) => void;
}

export function useSpineControls({
    playerInstance,
    setIsPlaying,
    animations,
    currentAnim,
    setCurrentAnim,
    setCurrentSpineSkin,
    setDuration,
}: UseSpineControlsProps) {
    const localInstanceRef = useRef<SpinePlayer | null>(null);
    useEffect(() => {
        localInstanceRef.current = playerInstance.current;
    });
    const isScrubbingRef = useRef(false);
    const wasPlayingRef = useRef(false);

    // 재생/일시정지
    const handlePlayPause = useCallback(() => {
        const instance = localInstanceRef.current;
        if (instance) {
            instance.paused = !instance.paused;
            setIsPlaying(!instance.paused);
        }
    }, [setIsPlaying]);

    // 애니메이션 변경
    const handleAnimationChange = useCallback((animName: string) => {
        const instance = localInstanceRef.current;
        if (instance) {
            instance.setAnimation(animName, true);
            setCurrentAnim(animName);

            // 일시정지 상태일 때 즉시 포즈 업데이트
            if (instance.paused) {
                const skeleton = instance.skeleton;
                const state = instance.animationState;
                if (skeleton && state) {
                    state.apply(skeleton);
                    skeleton.updateWorldTransform();
                }
            }

            const track = instance.animationState.getCurrent(0);
            if (track?.animation?.duration != null) {
                setDuration(track.animation.duration);
            }
        }
    }, [setCurrentAnim, setDuration]);

    // 스킨 변경
    const handleSpineSkinChange = useCallback((skinName: string) => {
        const instance = localInstanceRef.current;
        if (instance) {
            const skeleton = instance.skeleton;
            skeleton.setSkinByName(skinName);
            skeleton.setSlotsToSetupPose();
            instance.animationState.apply(skeleton);
            skeleton.updateWorldTransform();
            setCurrentSpineSkin(skinName);
        }
    }, [setCurrentSpineSkin]);

    // 스크러빙 시작
    const handleScrubStart = useCallback(() => {
        isScrubbingRef.current = true;
        const instance = localInstanceRef.current;
        if (instance) {
            wasPlayingRef.current = !instance.paused;
            instance.paused = true;
            setIsPlaying(false);
        }
    }, [setIsPlaying]);

    // 스크러빙 종료
    const handleScrubEnd = useCallback(() => {
        isScrubbingRef.current = false;
        const instance = localInstanceRef.current;
        if (instance && wasPlayingRef.current) {
            instance.paused = false;
            setIsPlaying(true);
        }
    }, [setIsPlaying]);

    // Seek (특정 시간으로 이동)
    const handleSeek = useCallback((time: number) => {
        const instance = localInstanceRef.current;
        if (instance) {
            const track = instance.animationState.getCurrent(0);
            if (track) {
                let seekTime = time;
                if (track.animation && track.animation.duration > 0) {
                     if (seekTime >= track.animation.duration) {
                         seekTime = track.animation.duration - 0.001;
                     }
                }

                track.trackTime = seekTime;
                try {
                    if (instance.skeleton && instance.animationState) {
                        instance.animationState.apply(instance.skeleton);
                        instance.skeleton.updateWorldTransform();
                    }
                } catch {
                    // 무시
                }
            }
        }
    }, []);

    // 다음 모션
    const handleNextMotion = useCallback(() => {
        if (!animations.length || !currentAnim) return;
        const currentIndex = animations.indexOf(currentAnim);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % animations.length;
        handleAnimationChange(animations[nextIndex]);
    }, [animations, currentAnim, handleAnimationChange]);

    // 이전 모션
    const handlePrevMotion = useCallback(() => {
        if (!animations.length || !currentAnim) return;

        let time = 0;
        const instance = localInstanceRef.current;
        if (instance && instance.animationState) {
            const track = instance.animationState.getCurrent(0);
            if (track) {
                time = track.trackTime;
                if (track.loop && track.animation.duration > 0) {
                    time = time % track.animation.duration;
                }
            }
        }

        if (time > 0.5) {
            handleSeek(0);
            return;
        }
        const currentIndex = animations.indexOf(currentAnim);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + animations.length) % animations.length;
        handleAnimationChange(animations[prevIndex]);
    }, [animations, currentAnim, handleAnimationChange, handleSeek]);

    return {
        handlePlayPause,
        handleAnimationChange,
        handleSpineSkinChange,
        handleScrubStart,
        handleScrubEnd,
        handleSeek,
        handleNextMotion,
        handlePrevMotion
    };
}

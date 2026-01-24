import { useEffect, useRef, useState, useCallback } from 'react';
import type { Character, Skin } from '../types';
import { RESOURCE_PATHS } from '../routers/paths';

export function useSpinePlayer(
    selectedChar: Character | null,
    selectedSkin: Skin | null,
    playerRef: React.RefObject<HTMLDivElement | null>,
    viewMode: 'standing' | 'ingame' = 'standing'
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerInstance = useRef<any>(null);

    // Player State
    const [isPlaying, setIsPlaying] = useState(true);
    const [animations, setAnimations] = useState<string[]>([]);
    const [currentAnim, setCurrentAnim] = useState<string>('');
    const [spineSkins, setSpineSkins] = useState<string[]>([]);
    const [currentSpineSkin, setCurrentSpineSkin] = useState<string>('Normal');

    // Timeline State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const rafRef = useRef<number | null>(null);
    const isScrubbingRef = useRef(false);

    // Spine 초기화
    useEffect(() => {
        if (!selectedChar || !selectedSkin || !playerRef.current) return;

        const defaultAnim = viewMode === 'ingame' ? 'Idle' : 'Idle_1';

        // Cleanup previous instance
        if (playerInstance.current) {
            try {
                playerInstance.current.dispose();
            } catch (e) {
                console.warn("Failed to dispose spine player", e);
            }
            playerInstance.current = null;
        }
        
        if (playerRef.current) {
             playerRef.current.innerHTML = '';
        }
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnimations([]);
        setCurrentAnim('');
        setCurrentTime(0);
        setDuration(0);

        const basePath = viewMode === 'ingame'
            ? RESOURCE_PATHS.IMAGE.INGAME_SPINE_BASE
            : RESOURCE_PATHS.IMAGE.SPINE_BASE;

        const skelUrl = `${basePath}/skel/${selectedSkin.file}.skel`;
        const atlasUrl = `${basePath}/atlas/${selectedSkin.file}.atlas`;

        if (window.spine && window.spine.SpinePlayer) {
            try {
                playerInstance.current = new window.spine.SpinePlayer(playerRef.current, {
                    skelUrl: skelUrl,
                    atlasUrl: atlasUrl,
                    backgroundColor: "#00000000",
                    alpha: true,
                    interactive: false,
                    skin: "Normal",
                    animation: defaultAnim,
                    showControls: false,
                    preserveDrawingBuffer: false,

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    success: (player: any) => {
                        // console.log("Spine player loaded");

                        if (player.skeleton && player.skeleton.data) {
                            // 애니메이션 목록 추출
                            if (player.skeleton.data.animations) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const animNamesRaw = player.skeleton.data.animations.map((a: any) => a.name);
                                setAnimations(animNamesRaw);

                                const startAnim = animNamesRaw.includes(defaultAnim)
                                    ? defaultAnim
                                    : (animNamesRaw[0] ?? defaultAnim);

                                const current = player.animationState.getCurrent(0);
                                if (current && current.animation) {
                                    setCurrentAnim(current.animation.name);
                                    setDuration(current.animation.duration);
                                } else {
                                    setCurrentAnim(startAnim);
                                }
                            }

                            // 스킨 목록 추출
                            if (player.skeleton.data.skins) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const skinNames = player.skeleton.data.skins.map((s: any) => s.name);
                                setSpineSkins(skinNames);

                                const defaultSkin = skinNames.includes("Normal") ? "Normal" : (skinNames[0] || "");
                                setCurrentSpineSkin(defaultSkin);

                                if (defaultSkin && player.skeleton.skin?.name !== defaultSkin) {
                                    player.skeleton.setSkinByName(defaultSkin);
                                    player.skeleton.setSlotsToSetupPose();
                                    player.animationState.apply(player.skeleton);
                                }
                            }

                            setCurrentTime(0);
                        }
                    },

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error: (_player: any, reason: string) => {
                        console.error("Spine player error:", reason);
                        if (playerRef.current) {
                            playerRef.current.innerHTML = `<div style="color:red;">Error: ${reason}</div>`;
                        }
                    }
                });
            } catch (e) {
                console.error("Error creating SpinePlayer", e);
            }
        }

        // Cleanup function when component unmounts or dependencies change
        return () => {
            if (playerInstance.current) {
                try {
                    playerInstance.current.dispose();
                } catch { 
                    // Ignore dispose errors on unmount
                }
                playerInstance.current = null;
            }
        };
    }, [selectedChar, selectedSkin, playerRef, viewMode]);

    // Timeline Loop
    useEffect(() => {
        const updateTimeline = () => {
            if (isScrubbingRef.current) {
                rafRef.current = requestAnimationFrame(updateTimeline);
                return;
            }

            if (playerInstance.current && playerInstance.current.animationState) {
                const track = playerInstance.current.animationState.getCurrent(0);
                if (track && track.animation) {
                    if (track.animation.duration !== duration) {
                        setDuration(track.animation.duration);
                    }

                    let time = track.trackTime;
                    if (track.loop && track.animation.duration > 0) {
                        time = time % track.animation.duration;
                    } else if (time > track.animation.duration) {
                        time = track.animation.duration;
                    }

                    setCurrentTime(time);
                }
            }
            rafRef.current = requestAnimationFrame(updateTimeline);
        };

        rafRef.current = requestAnimationFrame(updateTimeline);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [duration]);

    // Actions
    const handlePlayPause = useCallback(() => {
        if (playerInstance.current) {
            playerInstance.current.paused = !playerInstance.current.paused;
            setIsPlaying(!playerInstance.current.paused);
        }
    }, []);

    const handleAnimationChange = useCallback((animName: string) => {
        if (playerInstance.current) {
            playerInstance.current.animationState.setAnimation(0, animName, true);
            setCurrentAnim(animName);
            setCurrentTime(0);

            const track = playerInstance.current.animationState.getCurrent(0);
            if (track?.animation?.duration != null) {
                setDuration(track.animation.duration);
            }
        }
    }, []);

    const handleSpineSkinChange = useCallback((skinName: string) => {
        if (playerInstance.current) {
            const skeleton = playerInstance.current.skeleton;
            skeleton.setSkinByName(skinName);
            skeleton.setSlotsToSetupPose();
            playerInstance.current.animationState.apply(skeleton);
            setCurrentSpineSkin(skinName);
        }
    }, []);

    const handleScrubStart = useCallback(() => {
        if (!playerInstance.current) return;
        isScrubbingRef.current = true;
        playerInstance.current.paused = true;
        setIsPlaying(false);
    }, []);

    const handleScrubEnd = useCallback(() => {
        if (!playerInstance.current) return;
        isScrubbingRef.current = false;
        playerInstance.current.paused = false;
        setIsPlaying(true);
    }, []);

    const handleSeek = useCallback((time: number) => {
        if (playerInstance.current) {
            const track = playerInstance.current.animationState.getCurrent(0);
            if (track) {
                track.trackTime = time;
                setCurrentTime(time);
                try {
                    if (playerInstance.current.skeleton && playerInstance.current.animationState) {
                        playerInstance.current.animationState.apply(playerInstance.current.skeleton);
                        playerInstance.current.skeleton.updateWorldTransform();
                    }
                } catch {
                    // Ignore
                }
            }
        }
    }, []);

    const handleNextMotion = useCallback(() => {
        if (!animations.length || !currentAnim) return;
        const currentIndex = animations.indexOf(currentAnim);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % animations.length;
        handleAnimationChange(animations[nextIndex]);
    }, [animations, currentAnim, handleAnimationChange]);

    const handlePrevMotion = useCallback(() => {
        if (!animations.length || !currentAnim) return;
        if (currentTime > 0.5) {
            handleSeek(0);
            return;
        }
        const currentIndex = animations.indexOf(currentAnim);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + animations.length) % animations.length;
        handleAnimationChange(animations[prevIndex]);
    }, [animations, currentAnim, currentTime, handleAnimationChange, handleSeek]);

    return {
        playerInstance,
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
    };
}

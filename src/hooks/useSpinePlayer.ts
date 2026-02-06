import { useCallback, useState, type RefObject } from 'react';

import type { Sado, Skin, SpinePlayer } from '@/types';
import { useSpineControls } from './spine/useSpineControls';
import { useSpineInstance } from './spine/useSpineInstance';

export function useSpinePlayer(
    selectedSado: Sado | null,
    selectedSkin: Skin | null,
    playerRef: RefObject<HTMLDivElement | null>,
    viewMode: 'standing' | 'ingame' = 'standing',
) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [animations, setAnimations] = useState<string[]>([]);
    const [currentAnim, setCurrentAnim] = useState('');
    const [spineSkins, setSpineSkins] = useState<string[]>([]);
    const [currentSpineSkin, setCurrentSpineSkin] = useState('Normal');

    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleSuccess = useCallback(
        (player: SpinePlayer) => {
            setTimeout(() => {
                setIsLoaded(true);
            }, 500);

            // 새 캐릭터 로드 시 기본 모션이 재생되므로 UI 상태도 재생 중으로 동기화
            player.paused = false;
            setIsPlaying(true);

            const defaultAnim = viewMode === 'ingame' ? 'Idle' : 'Idle_1';

            if (player.skeleton && player.skeleton.data) {
                if (player.skeleton.data.animations) {
                    const animNamesRaw = player.skeleton.data.animations.map((a) => a.name);
                    setAnimations(animNamesRaw);

                    const startAnim = animNamesRaw.includes(defaultAnim)
                        ? defaultAnim
                        : (animNamesRaw[0] ?? defaultAnim);

                    setCurrentAnim(startAnim);

                    setTimeout(() => {
                        if (player.animationState) {
                            const current = player.animationState.getCurrent(0);
                            if (current && current.animation) {
                                current.loop = true;
                                setDuration(current.animation.duration);
                            } else {
                                const animData = player.skeleton.data.findAnimation(startAnim);
                                if (animData) setDuration(animData.duration);
                            }
                        }
                    }, 50);
                }

                if (player.skeleton.data.skins) {
                    const skinNames = player.skeleton.data.skins.map((s) => s.name);
                    setSpineSkins(skinNames);

                    const defaultSkin = skinNames.includes('Normal') ? 'Normal' : (skinNames[0] || '');
                    setCurrentSpineSkin(defaultSkin);

                    if (defaultSkin && player.skeleton.skin?.name !== defaultSkin) {
                        player.skeleton.setSkinByName(defaultSkin);
                        player.skeleton.setSlotsToSetupPose();
                        player.animationState.apply(player.skeleton);
                    }
                }
            }
        },
        [viewMode],
    );

    const handleError = useCallback((error: string) => {
        console.error('Spine load error:', error);
        setIsLoaded(true);
    }, []);

    const { playerInstance } = useSpineInstance({
        playerRef,
        selectedSado,
        selectedSkin,
        viewMode,
        onSuccess: handleSuccess,
        onError: handleError,
    });

    const controls = useSpineControls({
        playerInstance,
        isPlaying,
        setIsPlaying,
        animations,
        currentAnim,
        setCurrentAnim,
        setCurrentSpineSkin,
        setDuration,
    });

    return {
        playerInstance,
        isLoaded,
        isPlaying,
        animations,
        currentAnim,
        spineSkins,
        currentSpineSkin,
        duration,
        ...controls,
    };
}

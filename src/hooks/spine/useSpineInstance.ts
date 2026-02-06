import { useEffect, useRef, type RefObject } from 'react';

import type { Sado, Skin, SpinePlayer } from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';

interface UseSpineInstanceProps {
    playerRef: RefObject<HTMLDivElement | null>;
    selectedSado: Sado | null;
    selectedSkin: Skin | null;
    viewMode: 'standing' | 'ingame';
    onSuccess?: (player: SpinePlayer) => void;
    onError?: (error: string) => void;
}

export function useSpineInstance({
    playerRef,
    selectedSado,
    selectedSkin,
    viewMode,
    onSuccess,
    onError,
}: UseSpineInstanceProps) {
    const playerInstance = useRef<SpinePlayer | null>(null);
    const isUnloadingRef = useRef(false);

    useEffect(() => {
        const handleBeforeUnload = () => {
            isUnloadingRef.current = true;
            if (playerRef.current) {
                const canvas = playerRef.current.querySelector('canvas');
                if (canvas) {
                    try {
                        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
                        const ext = gl?.getExtension('WEBGL_lose_context');
                        if (ext) ext.loseContext();
                    } catch {
                        // ignore
                    }
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [playerRef]);

    useEffect(() => {
        if (!selectedSado || !selectedSkin || !playerRef.current) return;

        let isCancelled = false;
        const defaultAnim = viewMode === 'ingame' ? 'Idle' : 'Idle_1';

        if (playerRef.current) {
            playerRef.current.innerHTML = '';
        }

        const basePath =
            viewMode === 'ingame'
                ? RESOURCE_PATHS.IMAGE.INGAME_SPINE_BASE
                : RESOURCE_PATHS.IMAGE.SPINE_BASE;

        const skelUrl = `${basePath}/skel/${selectedSkin.file}.skel`;
        const atlasUrl = `${basePath}/atlas/${selectedSkin.file}.atlas`;

        if (window.spine && window.spine.SpinePlayer) {
            try {
                playerInstance.current = new window.spine.SpinePlayer(playerRef.current, {
                    skelUrl,
                    atlasUrl,
                    backgroundColor: '#00000000',
                    alpha: true,
                    interactive: false,
                    skin: 'Normal',
                    animation: defaultAnim,
                    showControls: false,
                    showLoading: false,
                    preserveDrawingBuffer: false,
                    loop: true,
                    success: (player: SpinePlayer) => {
                        if (isCancelled) {
                            player.dispose();
                            return;
                        }
                        onSuccess?.(player);
                    },
                    error: (_player: SpinePlayer, reason: string) => {
                        if (isCancelled) return;
                        if (onError) onError(reason);
                        else if (playerRef.current) {
                            playerRef.current.innerHTML = `<div style="color:red;">오류: ${reason}</div>`;
                        }
                    },
                });
            } catch (error) {
                console.error('SpinePlayer 생성 중 오류 발생:', error);
            }
        } else {
            console.error('Spine 런타임이 로드되지 않았습니다.');
            if (playerRef.current) {
                playerRef.current.innerHTML =
                    '<div style="color:red;">Spine 런타임을 찾을 수 없습니다.</div>';
            }
        }

        return () => {
            isCancelled = true;
            if (playerInstance.current) {
                try {
                    if (!isUnloadingRef.current) {
                        playerInstance.current.dispose();
                    }
                } catch {
                    // ignore
                }
                playerInstance.current = null;
            }
        };
    }, [selectedSado, selectedSkin, playerRef, viewMode, onSuccess, onError]);

    return { playerInstance };
}

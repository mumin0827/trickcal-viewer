import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Character, Skin } from '../types';
import { RESOURCE_PATHS } from '../routers/paths';

export function useRecorder(
    selectedChar: Character | null,
    selectedSkin: Skin | null,
    viewMode: 'standing' | 'ingame',
    currentAnim: string,
    duration: number,
    currentSpineSkin: string
) {
    const [isRecording, setIsRecording] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const loadFfmpeg = async () => {
        if (ffmpegRef.current) return ffmpegRef.current;
        const ffmpeg = new FFmpeg();
        // Cloudflare Pages 25MB 제한 우회를 위해 CDN 사용
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        
        if (!window.crossOriginIsolated) {
             console.error("SharedArrayBuffer requires COOP/COEP headers.");
             alert("Error: Browser security isolation not enabled.");
             return null;
        }

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            ffmpegRef.current = ffmpeg;
            return ffmpeg;
        } catch(e) {
            console.error("Failed to load FFmpeg", e);
            alert("Failed to load video processor.");
            return null;
        }
    };

    const handleExtract = async (mode: 'gif' | 'zip' | 'png', fps: number = 30, resolution: number = 1024) => {
        if (!selectedChar || !selectedSkin || isRecording) return;
        
        if (mode === 'gif') {
            const ffmpeg = await loadFfmpeg();
            if (!ffmpeg) return;
        }

        setIsRecording(true);

        // 1. 타겟 해상도 결정: 사용자 입력 값 (기본 1024px)
        const targetDim = resolution;

        // 2. 섀도우 플레이어(백그라운드 캡처용)를 위한 숨겨진 컨테이너 생성
        const shadowContainer = document.createElement('div');
        shadowContainer.style.position = 'fixed';
        shadowContainer.style.top = '0';
        // 렌더링 보장을 위해 opacity 0 대신 화면 밖으로 이동 처리
        shadowContainer.style.left = '-9999px';
        shadowContainer.style.width = `${targetDim}px`;
        shadowContainer.style.height = `${targetDim}px`;
        shadowContainer.style.zIndex = '-9999';
        // 브라우저 레이아웃 엔진이 렌더링을 건너뛰지 않도록 visibility 유지
        shadowContainer.style.visibility = 'visible'; 
        document.body.appendChild(shadowContainer);

        const basePath = viewMode === 'ingame'
            ? RESOURCE_PATHS.IMAGE.INGAME_SPINE_BASE
            : RESOURCE_PATHS.IMAGE.SPINE_BASE;

        const skelUrl = `${basePath}/skel/${selectedSkin.file}.skel`;
        const atlasUrl = `${basePath}/atlas/${selectedSkin.file}.atlas`;

        let shadowPlayer: any = null;

        if (window.spine && window.spine.SpinePlayer) {
            try {
                new window.spine.SpinePlayer(shadowContainer, {
                    skelUrl: skelUrl,
                    atlasUrl: atlasUrl,
                    backgroundColor: "#00000000",
                    alpha: true,
                    interactive: false,
                    skin: currentSpineSkin || "Normal",
                    animation: currentAnim,
                    showControls: false,
                    showLoading: false,
                    preserveDrawingBuffer: true,
                    
                    success: (player: any) => {
                        shadowPlayer = player;
                        // 레이아웃 안정화 및 초기 프레임 렌더링을 위해 잠시 대기
                        setTimeout(() => {
                            startRecording(player);
                        }, 500);
                    },
                    error: (_p: any, reason: string) => {
                        console.error("Shadow Player Error:", reason);
                        cleanup();
                    }
                });
            } catch (e) {
                console.error("Error creating Shadow SpinePlayer", e);
                cleanup();
            }
        } else {
            console.error("Spine runtime not found");
            cleanup();
        }

        function cleanup() {
            if (shadowPlayer) {
                try { shadowPlayer.dispose(); } catch {}
            }
            if (document.body.contains(shadowContainer)) {
                document.body.removeChild(shadowContainer);
            }
            setIsRecording(false);
        }

        async function startRecording(player: any) {
             let animDuration = duration;
             const track = player.animationState.getCurrent(0);
             if (track && track.animation) {
                 animDuration = track.animation.duration;
             }
             if (animDuration <= 0) {
                 alert("Duration is 0, cannot extract.");
                 cleanup();
                 return;
             }
             
             if (currentSpineSkin && player.skeleton) {
                 player.skeleton.setSkinByName(currentSpineSkin);
                 player.skeleton.setSlotsToSetupPose();
                 player.animationState.apply(player.skeleton);
             }

             const canvas = shadowContainer.querySelector('canvas');
             if (!canvas) {
                 cleanup();
                 return;
             }

             // 기기 간 출력 일관성을 보장하기 위해 고정 크기 캔버스 생성
             const processingCanvas = document.createElement('canvas');
             processingCanvas.width = targetDim;
             processingCanvas.height = targetDim;
             const processingCtx = processingCanvas.getContext('2d', { willReadFrequently: true });

             if (!processingCtx) {
                 cleanup();
                 return;
             }

             const totalFrames = mode === 'png' ? 1 : Math.ceil(animDuration * fps);
             let frame = 0;
             const frameBlobs: Blob[] = [];
             const zip = mode === 'zip' ? new JSZip() : null;
             const fileNameBase = `${selectedChar?.name_kr || 'Character'}_${currentAnim}`;

             const processResults = async () => {
                if (mode === 'gif') {
                    const ffmpeg = ffmpegRef.current;
                    if (!ffmpeg) {
                        cleanup();
                        return;
                    }

                    try {
                        for (let i = 0; i < frameBlobs.length; i++) {
                            const fname = `frame_${String(i).padStart(3, '0')}.png`;
                            const data = await fetchFile(frameBlobs[i]);
                            await ffmpeg.writeFile(fname, data);
                        }

                        await ffmpeg.exec([
                            '-f', 'image2',
                            '-framerate', String(fps),
                            '-i', 'frame_%03d.png',
                            '-vf', 'palettegen',
                            'palette.png'
                        ]);

                        await ffmpeg.exec([
                            '-f', 'image2',
                            '-framerate', String(fps),
                            '-i', 'frame_%03d.png',
                            '-i', 'palette.png',
                            '-lavfi', 'paletteuse=dither=sierra2_4a:diff_mode=rectangle:alpha_threshold=64',
                            '-gifflags', '-offsetting',
                            '-loop', '0',
                            'output.gif'
                        ]);

                        const data = await ffmpeg.readFile('output.gif');
                        if (!data || data.length === 0) {
                            throw new Error("Generated GIF is empty");
                        }
                        const blob = new Blob([data as any], { type: 'image/gif' });
                        saveAs(blob, `${fileNameBase}.gif`);

                        for (let i = 0; i < frameBlobs.length; i++) {
                            const fname = `frame_${String(i).padStart(3, '0')}.png`;
                            await ffmpeg.deleteFile(fname);
                        }
                        await ffmpeg.deleteFile('palette.png');
                        await ffmpeg.deleteFile('output.gif');
                    } catch (e) {
                        console.error("FFmpeg error", e);
                        alert("Failed to generate GIF.");
                    }
                } else if (mode === 'zip') {
                     zip?.generateAsync({type: 'blob'}).then(content => {
                         saveAs(content, `${fileNameBase}.zip`);
                     });
                } else if (mode === 'png') {
                    if (frameBlobs.length > 0) {
                        saveAs(frameBlobs[0], `${fileNameBase}.png`);
                    }
                }
                cleanup();
            };
            
            player.paused = false;
            player.timeScale = 0;

            const captureLoop = () => {
                 if (frame >= totalFrames) {
                     processResults();
                     return;
                 }

                 const currentTrack = player.animationState.getCurrent(0);
                 if (currentTrack) {
                     currentTrack.trackTime = frame / fps;
                 }
                 
                 player.skeleton.updateWorldTransform();
                 
                 requestAnimationFrame(() => {
                     requestAnimationFrame(() => {
                         // 기기 픽셀 비율로 인해 크기가 달라진 플레이어 캔버스를 고정 크기 캔버스에 맞춰 그리기
                         processingCtx.clearRect(0, 0, targetDim, targetDim);
                         processingCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetDim, targetDim);
                         
                         processingCanvas.toBlob(blob => {
                             if (blob) {
                                 frameBlobs.push(blob);
                                 if (mode === 'zip') {
                                     zip?.file(`frame_${String(frame).padStart(3, '0')}.png`, blob, {
                                         compression: "DEFLATE",
                                         compressionOptions: { level: 6 }
                                     });
                                 }
                             }
                             frame++;
                             captureLoop();
                         });
                     });
                 });
            };

            captureLoop();
        }
    };

    return {
        isRecording,
        handleExtract
    };
}

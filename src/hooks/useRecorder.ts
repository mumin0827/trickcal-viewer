import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Sado, Skin } from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';
import { parseHexWithAlpha } from '@/lib/utils';

type StageBounds = { width: number; height: number };
type ViewTransform = { scale: number; position: { x: number; y: number } };
type ExportFrame = { x: number; y: number; size: number };

export function useRecorder(
    selectedSado: Sado | null,
    selectedSkin: Skin | null,
    viewMode: 'standing' | 'ingame',
    currentAnim: string,
    duration: number,
    currentSpineSkin: string,
    useExportFrame: boolean,
    stageBounds: StageBounds | null,
    viewTransform: ViewTransform,
    exportFrame: ExportFrame | null
) {
    const [isRecording, setIsRecording] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    // FFmpeg 인스턴스 로드
    const loadFfmpeg = async () => {
        if (ffmpegRef.current) return ffmpegRef.current;
        const ffmpeg = new FFmpeg();
        // Cloudflare Pages 25MB 제한 우회를 위해 CDN 사용
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        
        if (!window.crossOriginIsolated) {
             console.error("SharedArrayBuffer를 사용하려면 COOP/COEP 헤더가 필요합니다.");
             alert("오류: 브라우저 보안 격리가 활성화되지 않았습니다.");
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
            console.error("FFmpeg 로드 실패:", e);
            alert("비디오 프로세서를 로드하는 데 실패했습니다.");
            return null;
        }
    };

    // 추출 실행 (GIF, MP4, ZIP, PNG)
    const handleExtract = async (
        mode: 'gif' | 'mp4' | 'zip' | 'png',
        fps: number = 30,
        resolution: number = 1024,
        backgroundColor: string = '#000000'
    ): Promise<boolean> => {
        if (!selectedSado || !selectedSkin || isRecording) return false;
        
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<boolean>(async (resolve) => {
            let hasResolved = false;
            const finalize = (success: boolean) => {
                if (hasResolved) return;
                hasResolved = true;
                setIsRecording(false);
                resolve(success);
            };

            if (mode === 'gif' || mode === 'mp4') {
                const ffmpeg = await loadFfmpeg();
                if (!ffmpeg) {
                    finalize(false);
                    return;
                }
            }

            setIsRecording(true);

            // 1. 타겟 해상도 결정: 사용자 입력 값 (기본 1024px)
            const targetDim = resolution;
            const hasExportFrame = !!(useExportFrame && stageBounds && exportFrame);
            const stageWidth = hasExportFrame ? stageBounds!.width : targetDim;
            const stageHeight = hasExportFrame ? stageBounds!.height : targetDim;
            const { color: baseColor, alpha: baseAlpha } = parseHexWithAlpha(backgroundColor);
            const effectiveOpacity = mode === 'mp4' ? 1 : Math.max(0, Math.min(1, baseAlpha));

            // 2. 섀도우 플레이어(백그라운드 캡처용)를 위한 숨겨진 컨테이너 생성
            const shadowContainer = document.createElement('div');
            shadowContainer.style.position = 'fixed';
            shadowContainer.style.top = '0';
            // 렌더링 보장을 위해 화면 밖으로 이동 처리
            shadowContainer.style.left = '-9999px';
            shadowContainer.style.width = `${stageWidth}px`;
            shadowContainer.style.height = `${stageHeight}px`;
            shadowContainer.style.zIndex = '-9999';
            // 브라우저 레이아웃 엔진이 렌더링을 건너뛰지 않도록 visibility 유지
            shadowContainer.style.visibility = 'visible'; 
            document.body.appendChild(shadowContainer);

            const basePath = viewMode === 'ingame'
                ? RESOURCE_PATHS.IMAGE.INGAME_SPINE_BASE
                : RESOURCE_PATHS.IMAGE.SPINE_BASE;

            const skelUrl = `${basePath}/skel/${selectedSkin.file}.skel`;
            const atlasUrl = `${basePath}/atlas/${selectedSkin.file}.atlas`;

            let shadowPlayer: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

            // 정리 작업 함수
            const cleanup = (success: boolean) => {
                if (shadowPlayer) {
                    try { shadowPlayer.dispose(); } catch { /* ignore */ }
                }
                if (document.body.contains(shadowContainer)) {
                    document.body.removeChild(shadowContainer);
                }
                finalize(success);
            };

            if (window.spine && window.spine.SpinePlayer) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    new (window.spine.SpinePlayer as any)(shadowContainer, {
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

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        success: (player: any) => {
                            shadowPlayer = player;
                            // 레이아웃 안정화 및 초기 프레임 렌더링을 위해 잠시 대기
                            setTimeout(() => {
                                startRecording(player);
                            }, 500);
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        error: (_p: any, reason: string) => {
                            console.error("섀도우 플레이어 오류:", reason);
                            cleanup(false);
                        }
                    });
                } catch (e) {
                    console.error("섀도우 SpinePlayer 생성 중 오류 발생:", e);
                    cleanup(false);
                }
            } else {
                console.error("Spine 런타임을 찾을 수 없습니다.");
                cleanup(false);
            }

            // 캡처 및 레코딩 시작
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async function startRecording(player: any) {
                let animDuration = duration;
                const track = player.animationState.getCurrent(0);
                if (track && track.animation) {
                    animDuration = track.animation.duration;
                }
                if (animDuration <= 0) {
                    alert("재생 시간이 0입니다. 추출할 수 없습니다.");
                    cleanup(false);
                    return;
                }
                
                if (currentSpineSkin && player.skeleton) {
                    player.skeleton.setSkinByName(currentSpineSkin);
                    player.skeleton.setSlotsToSetupPose();
                    player.animationState.apply(player.skeleton);
                }

                const canvas = shadowContainer.querySelector('canvas');
                if (!canvas) {
                    cleanup(false);
                    return;
                }

                // 일관된 출력을 위해 고정 크기 캔버스 생성
                const processingCanvas = document.createElement('canvas');
                processingCanvas.width = targetDim;
                processingCanvas.height = targetDim;
                const processingCtx = processingCanvas.getContext('2d', { willReadFrequently: true });

                // 화면과 동일한 렌더링을 위해 스테이지 크기 뷰 캔버스 생성
                const viewCanvas = document.createElement('canvas');
                viewCanvas.width = stageWidth;
                viewCanvas.height = stageHeight;
                const viewCtx = viewCanvas.getContext('2d');

                if (!processingCtx || !viewCtx) {
                    cleanup(false);
                    return;
                }

                const totalFrames = mode === 'png' ? 1 : Math.ceil(animDuration * fps);
                let frame = 0;
                const frameBlobs: Blob[] = [];
                const zip = mode === 'zip' ? new JSZip() : null;
                const fileNameBase = `${selectedSado?.name_kr || 'Sado'}_${currentAnim}`;
                const stageCenterX = stageWidth / 2;
                const stageCenterY = stageHeight / 2;

                const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
                    if (effectiveOpacity <= 0) return;
                    ctx.save();
                    ctx.globalAlpha = effectiveOpacity;
                    ctx.fillStyle = baseColor;
                    ctx.fillRect(0, 0, width, height);

                    ctx.restore();
                };

                // 결과 처리 및 다운로드
                const processResults = async () => {
                    const writeFramesToFfmpeg = async (ffmpeg: FFmpeg) => {
                        for (let i = 0; i < frameBlobs.length; i++) {
                            const fname = `frame_${String(i).padStart(3, '0')}.png`;
                            const data = await fetchFile(frameBlobs[i]);
                            await ffmpeg.writeFile(fname, data);
                        }
                    };

                    if (mode === 'gif') {
                        const ffmpeg = ffmpegRef.current;
                        if (!ffmpeg) {
                            cleanup(false);
                            return;
                        }

                        try {
                            await writeFramesToFfmpeg(ffmpeg);

                            // 팔레트 생성
                            await ffmpeg.exec([
                                '-f', 'image2',
                                '-framerate', String(fps),
                                '-i', 'frame_%03d.png',
                                '-vf', 'palettegen',
                                'palette.png'
                            ]);

                            // GIF 생성 (투명도 유지 옵션 포함)
                            await ffmpeg.exec([
                                '-f', 'image2',
                                '-framerate', String(fps),
                                '-i', 'frame_%03d.png',
                                '-i', 'palette.png',
                                '-lavfi', 'paletteuse=dither=sierra2_4a:diff_mode=rectangle:alpha_threshold=64',
                                '-gifflags', '+transdiff+offsetting',
                                '-loop', '0',
                                'output.gif'
                            ]);

                            const data = await ffmpeg.readFile('output.gif');
                            if (!data || data.length === 0) {
                                throw new Error("생성된 GIF가 비어있습니다.");
                            }
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const blob = new Blob([data as any], { type: 'image/gif' });
                            saveAs(blob, `${fileNameBase}.gif`);

                            // 임시 파일 삭제
                            for (let i = 0; i < frameBlobs.length; i++) {
                                const fname = `frame_${String(i).padStart(3, '0')}.png`;
                                await ffmpeg.deleteFile(fname);
                            }
                            await ffmpeg.deleteFile('palette.png');
                            await ffmpeg.deleteFile('output.gif');
                            cleanup(true);
                            return;
                        } catch (e) {
                            console.error("FFmpeg 처리 중 오류 발생:", e);
                            alert("GIF 생성에 실패했습니다.");
                            cleanup(false);
                            return;
                        }
                    } else if (mode === 'mp4') {
                        const ffmpeg = ffmpegRef.current;
                        if (!ffmpeg) {
                            cleanup(false);
                            return;
                        }
                        if (frameBlobs.length === 0) {
                            cleanup(false);
                            return;
                        }

                        try {
                            await writeFramesToFfmpeg(ffmpeg);

                            const argsList = [
                                [
                                    '-framerate', String(fps),
                                    '-i', 'frame_%03d.png',
                                    '-c:v', 'libx264',
                                    '-preset', 'ultrafast',
                                    '-pix_fmt', 'yuv420p',
                                    '-movflags', 'faststart',
                                    'output.mp4'
                                ],
                                [
                                    '-framerate', String(fps),
                                    '-i', 'frame_%03d.png',
                                    '-c:v', 'mpeg4',
                                    '-q:v', '4',
                                    'output.mp4'
                                ]
                            ];

                            let encoded = false;
                            for (const args of argsList) {
                                try {
                                    await ffmpeg.exec(args);
                                    encoded = true;
                                    break;
                                } catch {
                                    // 다음 코덱 시도
                                }
                            }
                            if (!encoded) throw new Error('MP4 인코딩 실패');

                            const data = await ffmpeg.readFile('output.mp4');
                            if (!data || data.length === 0) {
                                throw new Error("생성된 MP4가 비어있습니다.");
                            }
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const blob = new Blob([data as any], { type: 'video/mp4' });
                            saveAs(blob, `${fileNameBase}.mp4`);

                            for (let i = 0; i < frameBlobs.length; i++) {
                                const fname = `frame_${String(i).padStart(3, '0')}.png`;
                                await ffmpeg.deleteFile(fname);
                            }
                            await ffmpeg.deleteFile('output.mp4');
                            cleanup(true);
                            return;
                        } catch (e) {
                            console.error("FFmpeg 처리 중 오류 발생:", e);
                            alert("MP4 생성에 실패했습니다.");
                            cleanup(false);
                            return;
                        }
                    } else if (mode === 'zip') {
                        const content = await zip?.generateAsync({type: 'blob'});
                        if (content) {
                            saveAs(content, `${fileNameBase}.zip`);
                            cleanup(true);
                            return;
                        }
                        cleanup(false);
                        return;
                    } else if (mode === 'png') {
                        if (frameBlobs.length > 0) {
                            saveAs(frameBlobs[0], `${fileNameBase}.png`);
                            cleanup(true);
                            return;
                        }
                        cleanup(false);
                        return;
                    }
                };
                
                player.paused = false;
                player.timeScale = 0;

                // 프레임 캡처 루프
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
                        // 화면과 동일한 스테이지 뷰 캔버스 구성
                        viewCtx.setTransform(1, 0, 0, 1, 0, 0);
                        viewCtx.clearRect(0, 0, stageWidth, stageHeight);
                        drawBackground(viewCtx, stageWidth, stageHeight);

                        if (hasExportFrame) {
                            viewCtx.save();
                            viewCtx.translate(stageCenterX, stageCenterY);
                            viewCtx.translate(viewTransform.position.x, viewTransform.position.y);
                            viewCtx.scale(viewTransform.scale, viewTransform.scale);
                            viewCtx.translate(-stageCenterX, -stageCenterY);
                            viewCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, stageWidth, stageHeight);
                            viewCtx.restore();
                        } else {
                            viewCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, stageWidth, stageHeight);
                        }

                        // 스테이지 뷰 캔버스를 타겟 해상도로 크롭/스케일
                        processingCtx.setTransform(1, 0, 0, 1, 0, 0);
                        processingCtx.clearRect(0, 0, targetDim, targetDim);

                        if (hasExportFrame && exportFrame) {
                            processingCtx.drawImage(
                                viewCanvas,
                                exportFrame.x,
                                exportFrame.y,
                                exportFrame.size,
                                exportFrame.size,
                                0,
                                0,
                                targetDim,
                                targetDim
                            );
                        } else {
                            processingCtx.drawImage(
                                viewCanvas,
                                0,
                                0,
                                stageWidth,
                                stageHeight,
                                0,
                                0,
                                targetDim,
                                targetDim
                            );
                        }
                        
                        processingCanvas.toBlob(blob => {
                            if (blob) {
                                if (mode === 'zip') {
                                    zip?.file(`frame_${String(frame).padStart(3, '0')}.png`, blob, {
                                        compression: "DEFLATE",
                                        compressionOptions: { level: 6 }
                                    });
                                } else {
                                    frameBlobs.push(blob);
                                }
                            }
                            frame++;
                            captureLoop();
                        });
                    });
                };

                captureLoop();
            }
        });
    };

    return {
        isRecording,
        handleExtract
    };
}

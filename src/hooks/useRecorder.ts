import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Character } from '../types';
import { RESOURCE_PATHS } from '../routers/paths';

export function useRecorder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerInstance: React.MutableRefObject<any>,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    selectedChar: Character | null,
    currentAnim: string,
    duration: number
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

    const handleExtract = async (mode: 'gif' | 'zip', fps: number = 30) => {
        if (!playerInstance.current || isRecording) return;
        const player = playerInstance.current;
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) return;

        setIsRecording(true);
        const wasPaused = player.paused;
        player.paused = true;

        let currentDuration = duration;
        const track = player.animationState.getCurrent(0);
        if (track && track.animation) {
             currentDuration = track.animation.duration;
        }
        
        if (currentDuration <= 0) {
            setIsRecording(false);
            player.paused = wasPaused;
            alert("Duration is 0, cannot extract.");
            return;
        }

        if (mode === 'gif') {
            const ffmpeg = await loadFfmpeg();
            if (!ffmpeg) {
                setIsRecording(false);
                player.paused = wasPaused;
                return;
            }
        }

        const totalFrames = Math.ceil(currentDuration * fps);
        let frame = 0;
        const frameBlobs: Blob[] = [];

        const targetDim = 1024;
        const zoom = 1.3;
        const baseScale = targetDim / Math.max(canvas.width, canvas.height);
        const scale = baseScale * zoom;
        
        const drawWidth = canvas.width * scale;
        const drawHeight = canvas.height * scale;
        
        const offsetX = (targetDim - drawWidth) / 2;
        const offsetY = (targetDim - drawHeight) / 2;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetDim;
        tempCanvas.height = targetDim;
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            setIsRecording(false);
            player.paused = wasPaused;
            return;
        }

        const zip = mode === 'zip' ? new JSZip() : null;
        const fileNameBase = `${selectedChar?.name_kr || 'Character'}_${currentAnim}`;

        const processResults = async () => {
            if (mode === 'gif') {
                const ffmpeg = ffmpegRef.current;
                if (!ffmpeg) return;

                console.log("Start FFmpeg processing...");
                
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
                    '-lavfi', 'paletteuse',
                    '-gifflags', '-offsetting',
                    '-loop', '0',
                    'output.gif'
                ]);

                const data = await ffmpeg.readFile('output.gif');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const blob = new Blob([data as any], { type: 'image/gif' });
                saveAs(blob, `${fileNameBase}.gif`);

                for (let i = 0; i < frameBlobs.length; i++) {
                    const fname = `frame_${String(i).padStart(3, '0')}.png`;
                    await ffmpeg.deleteFile(fname);
                }
                await ffmpeg.deleteFile('palette.png');
                await ffmpeg.deleteFile('output.gif');
            } else {
                 zip?.generateAsync({type: 'blob'}).then(content => {
                     saveAs(content, `${fileNameBase}.zip`);
                 });
            }

            setIsRecording(false);
            player.paused = wasPaused;
        };

        const nextFrame = () => {
            if (frame >= totalFrames) {
                processResults();
                return;
            }

            if (track) {
                track.trackTime = frame / fps; 
            }
            
            try {
                player.animationState.apply(player.skeleton);
                player.skeleton.updateWorldTransform();
            } catch(e) {
                console.error(e);
            }
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ctx.clearRect(0, 0, targetDim, targetDim);
                    ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

                    tempCanvas.toBlob(blob => {
                        if (blob) {
                            frameBlobs.push(blob);
                            if (mode === 'zip') {
                                zip?.file(`frame_${String(frame).padStart(3, '0')}.png`, blob);
                            }
                        }
                        frame++;
                        nextFrame();
                    });
                });
            });
        };
        
        nextFrame();
    };

    return {
        isRecording,
        handleExtract
    };
}

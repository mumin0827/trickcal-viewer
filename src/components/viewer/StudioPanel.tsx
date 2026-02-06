import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';
import { GIF_STEPS } from '@/lib/constants';

interface StudioPanelProps {
    exportFormat: 'gif' | 'mp4' | 'zip' | 'png';
    setExportFormat: (fmt: 'gif' | 'mp4' | 'zip' | 'png') => void;
    exportResolution: number;
    setExportResolution: (res: number) => void;
    gifStepIndex: number;
    setGifStepIndex: (idx: number) => void;
    zipFps: number;
    setZipFps: (fps: number) => void;
    exportBackground: string;
    setExportBackground: (color: string) => void;
    useExportFrame: boolean;
    setUseExportFrame: (value: boolean) => void;
    onExport: () => void;
    onExit: () => void;
    isRecording: boolean;
}

const StudioPanel: React.FC<StudioPanelProps> = ({
    exportFormat, setExportFormat,
    exportResolution, setExportResolution,
    gifStepIndex, setGifStepIndex,
    zipFps, setZipFps,
    exportBackground, setExportBackground,
    useExportFrame,
    setUseExportFrame,
    onExport,
    onExit,
    isRecording,
}) => {
    const { t } = useTranslation();
    const [isColorOpen, setIsColorOpen] = React.useState(false);

    const resolutionPresets = [
        { label: t('studio.resVeryLow'), value: 256, desc: '256px' },
        { label: t('studio.resLow'), value: 512, desc: '512px' },
        { label: t('studio.resMedium'), value: 1024, desc: '1024px' },
        { label: t('studio.resHigh'), value: 1536, desc: '1536px' }
    ];

    return (
        <div className="bg-controls-bg-start/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-tc-line-soft flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-tc-line-soft">
                <h3 className="font-bold text-lg text-text-main">{t('studio.settingsTitle')}</h3>
            </div>

            {/* 포맷 선택 */}
            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-main">{t('studio.format')}</span>
                <div className="flex gap-2">
                    {(['gif', 'mp4', 'zip', 'png'] as const).map((fmt) => (
                        <Button
                            key={fmt}
                            variant={exportFormat === fmt ? "primary" : "default"}
                            onClick={() => setExportFormat(fmt)}
                            size="sm"
                            className="flex-1 uppercase"
                        >
                            {fmt}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 해상도 선택 */}
            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-main">{t('studio.resolution')}</span>
                <div className="flex gap-2">
                    {resolutionPresets.map((preset) => (
                        <Button
                            key={preset.value}
                            variant={exportResolution === preset.value ? "primary" : "default"}
                            onClick={() => setExportResolution(preset.value)}
                            size="sm"
                            className="flex-1 text-sm"
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 캔버스 기준 */}
            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-main">{t('studio.exportFrame')}</span>
                <div className="flex gap-2">
                    <Button
                        variant={useExportFrame ? "primary" : "default"}
                        onClick={() => setUseExportFrame(true)}
                        size="sm"
                        className="flex-1"
                    >
                        {t('studio.exportFrameOn')}
                    </Button>
                    <Button
                        variant={!useExportFrame ? "primary" : "default"}
                        onClick={() => setUseExportFrame(false)}
                        size="sm"
                        className="flex-1"
                    >
                        {t('studio.exportFrameOff')}
                    </Button>
                </div>
            </div>

            {/* FPS 슬라이더 */}
            {exportFormat !== 'png' && (
                <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-3 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-text-main">{t('studio.fps')}</span>
                        <span className="text-sm font-bold text-tc-green">
                            {exportFormat === 'gif' ? GIF_STEPS[gifStepIndex].display : zipFps}
                        </span>
                    </div>
                    <Slider
                        value={[exportFormat === 'gif' ? gifStepIndex : zipFps]}
                        onValueChange={(vals) => exportFormat === 'gif' ? setGifStepIndex(vals[0]) : setZipFps(vals[0])}
                        min={exportFormat === 'gif' ? 0 : 1}
                        max={exportFormat === 'gif' ? GIF_STEPS.length - 1 : 60}
                        step={1}
                        className="py-2"
                    />
                </div>
            )}

            {/* 배경색 선택 */}
            <div className="rounded-2xl border border-tc-line-soft bg-white/70 dark:bg-black/20 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-text-main">{t('studio.background')}</span>
                    <div className="flex items-center gap-2">
                        <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="h-9 w-9 rounded-lg border border-tc-line-soft shadow-inner hover:scale-[1.02] transition-transform"
                                    style={{ backgroundColor: exportBackground }}
                                    aria-label={t('studio.background')}
                                />
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                sideOffset={8}
                                className="w-[220px] rounded-2xl border border-tc-line-soft bg-controls-bg-start/90 p-3 shadow-xl"
                            >
                                <HexAlphaColorPicker
                                    color={exportBackground}
                                    onChange={setExportBackground}
                                    style={{ width: '100%', height: 160 }}
                                />
                            </PopoverContent>
                        </Popover>
                        <HexColorInput
                            color={exportBackground}
                            onChange={setExportBackground}
                            prefixed
                            alpha
                            className="h-9 w-28 rounded-lg border border-tc-line-soft bg-input-bg px-3 text-xs font-mono text-text-main"
                            aria-label={t('studio.background')}
                        />
                    </div>
                </div>
                {exportFormat === 'mp4' && (
                    <div className="text-xs text-text-sub">
                        {t('studio.backgroundMp4Hint')}
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-tc-line-soft">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onExit}
                >
                    {t('viewer.exit')}
                </Button>
                <Button
                    className="flex-[2] bg-tc-green hover:bg-tc-green-dark text-white"
                    onClick={onExport}
                    disabled={isRecording}
                >
                    {isRecording ? t('viewer.extracting') : t('header.export')}
                </Button>
            </div>
        </div>
    );
};

export default React.memo(StudioPanel);

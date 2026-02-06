import React from 'react';
import type { Skin } from '@/types';
import { RESOURCE_PATHS } from '@/routers/paths';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface ControlBarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerInstance: any;
    duration: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onScrubStart: () => void;
    onScrubEnd: () => void;
    onNext: () => void;
    onPrev: () => void;
    
    skins: Skin[];
    selectedSkin: Skin | null;
    onSkinChange: (skin: Skin) => void;

    spineSkins: string[];
    currentSpineSkin: string;
    onSpineSkinChange: (skinName: string) => void;

    scale: number;
    onScaleChange: (scale: number) => void;
    
    currentAnim: string;
    animations: string[];
    onAnimationChange: (anim: string) => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
    playerInstance,
    duration,
    isPlaying,
    onPlayPause,
    onSeek,
    onScrubStart,
    onScrubEnd,
    onNext,
    onPrev,
    skins,
    selectedSkin,
    onSkinChange,
    spineSkins,
    currentSpineSkin,
    onSpineSkinChange,
    currentAnim,
    animations,
    onAnimationChange
}) => {
    const [currentTime, setCurrentTime] = React.useState(0);
    const rafRef = React.useRef<number | null>(null);
    const isScrubbing = React.useRef(false);

    // 재생 시간 업데이트 루프
    React.useEffect(() => {
        const updateTime = () => {
            // 사용자가 드래그 중(scrubbing)일 때는 루프를 돌리지만 상태 업데이트는 건너뜀
            if (isScrubbing.current) {
                rafRef.current = requestAnimationFrame(updateTime);
                return;
            }

            try {
                // Spine 플레이어 인스턴스가 존재하고 애니메이션 상태가 로드된 경우
                if (playerInstance && playerInstance.animationState) {
                    const track = playerInstance.animationState.getCurrent(0);
                    if (track && track.animation) {
                        let time = track.trackTime;
                        
                        // 루프 재생 시 현재 시간을 0 ~ duration 사이로 계산
                        if (track.loop && track.animation.duration > 0) {
                            time = time % track.animation.duration;
                        } else if (time > track.animation.duration) {
                            time = track.animation.duration;
                        }
                        
                        // 현재 시간 업데이트
                        setCurrentTime(time);
                    }
                }
            } catch {
                // 일시적인 참조 오류 무시
            }
            
            rafRef.current = requestAnimationFrame(updateTime);
        };

        // 루프 시작
        rafRef.current = requestAnimationFrame(updateTime);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playerInstance, isPlaying]); // playerInstance나 재생 상태가 변하면 루프 재확인
    
    // 시간 포맷팅 (MM:SS)
    const formatTime = (t: number) => {
        if (!isFinite(t) || t < 0) return "00:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const motionContentRef = React.useRef<HTMLDivElement>(null);

    // 드롭다운 오픈 시 현재 모션으로 스크롤 이동
    React.useEffect(() => {
        if (openDropdown === 'motion') {
            setTimeout(() => {
                if (motionContentRef.current) {
                    const activeItem = motionContentRef.current.querySelector('[data-active-motion="true"]');
                    if (activeItem) {
                        activeItem.scrollIntoView({ block: 'center', behavior: 'instant' });
                    }
                }
            }, 0);
        }
    }, [openDropdown]);

    return (
        <div className="flex flex-col gap-2 md:gap-3 w-full items-center bg-footer-bg md:bg-transparent md:backdrop-blur-none pb-4 pt-4 px-4 md:p-0 rounded-t-2xl md:rounded-none border-t border-header-border md:border-none shadow-2xl md:shadow-none">
            
            {/* 타임라인 조작 바 */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-[95%] max-w-[600px] px-0 md:px-3 py-0 md:py-2 rounded-none md:rounded-full bg-transparent md:bg-controls-bg-start/80 md:backdrop-blur-md shadow-none md:shadow-sm border-none md:border md:border-white/20">
                <span className="text-[10px] md:text-xs font-bold text-tc-green-dark tabular-nums w-[32px] md:w-[40px] text-right">
                    {formatTime(currentTime)}
                </span>
                
                <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 0}
                    step={0.01}
                    onValueChange={(vals) => {
                        setCurrentTime(vals[0]);
                        onSeek(vals[0]);
                    }}
                    onValueCommit={() => { 
                        isScrubbing.current = false; 
                        onScrubEnd(); 
                    }}
                    onPointerDown={() => { 
                        isScrubbing.current = true; 
                        onScrubStart(); 
                    }}
                    className="flex-1 cursor-pointer"
                />

                <span className="text-[10px] md:text-xs font-bold text-tc-green-dark tabular-nums w-[32px] md:w-[40px]">
                    {formatTime(duration)}
                </span>
            </div>

            {/* 컨트롤 버튼 레이아웃 */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-3 w-full max-w-[600px] relative px-0 md:px-2">
                
                {/* 왼쪽: 모션 선택 드롭다운 */}
                <div className="flex items-center gap-2 px-1 py-1 rounded-full bg-transparent md:bg-controls-bg-start/80 md:backdrop-blur-md shadow-none md:shadow-sm border-none md:border md:border-white/20 h-10 md:h-12 justify-self-start md:justify-self-end">
                    <DropdownMenu open={openDropdown === 'motion'} onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'motion' : null)}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 px-3 rounded-full hover:bg-tc-green/10 flex items-center gap-2"
                                onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_DetailsBG.png`} alt="Motion" className="w-5 h-5 object-contain opacity-80 invert dark:invert-0" />
                                <span className="text-xs md:text-sm font-medium text-text-main max-w-[80px] md:max-w-[100px] truncate block">
                                    {currentAnim}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            ref={motionContentRef}
                            side="top"
                            align="start"
                            className="max-h-[300px] overflow-y-auto"
                        >
                            {animations.map((anim) => (
                                <DropdownMenuItem
                                    key={anim}
                                    onClick={() => onAnimationChange(anim)}
                                    data-active-motion={anim === currentAnim}
                                    className={anim === currentAnim ? "bg-tc-green text-white focus:bg-tc-green focus:text-white" : ""}
                                >
                                    {anim}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* 중앙: 재생 제어 버튼 */}
                <div className="flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 rounded-full bg-transparent md:bg-controls-bg-start/90 md:backdrop-blur-md shadow-none md:shadow-md border-none md:border md:border-white/20 h-10 md:h-14 justify-self-center">
                    <Button variant="ghost" size="icon" onClick={onPrev} className="h-8 w-8 rounded-full hover:bg-tc-line-soft text-text-main">
                        <img
                            src={`${RESOURCE_PATHS.IMAGE.ICONS}/Deck_Icon_Skip.png`}
                            alt="Prev"
                            className="w-5 h-5 object-contain scale-x-[-1] opacity-70 invert dark:invert-0"
                        />
                    </Button>

                    <Button
                        variant="default"
                        size="icon"
                        onClick={onPlayPause}
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-tc-green hover:bg-tc-green-dark shadow-tc-btn text-white border-2 border-white/20"
                    >
                        <img
                            src={isPlaying
                                ? `${RESOURCE_PATHS.IMAGE.ICONS}/TutorialVideoGuideIcon_Stop2.png`
                                : `${RESOURCE_PATHS.IMAGE.ICONS}/TutorialVideoGuideIcon_Play2.png`
                            }
                            alt={isPlaying ? "Pause" : "Play"}
                            className="w-4 h-4 md:w-5 md:h-5 object-contain brightness-[100]"
                        />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8 rounded-full hover:bg-tc-line-soft text-text-main">
                         <img
                            src={`${RESOURCE_PATHS.IMAGE.ICONS}/Deck_Icon_Skip.png`}
                            alt="Next"
                            className="w-5 h-5 object-contain opacity-70 invert dark:invert-0"
                        />
                    </Button>
                </div>

                {/* 오른쪽: 스킨 선택 드롭다운 */}
                <div className="flex items-center gap-2 px-1 md:px-3 py-1 md:py-2 rounded-full bg-transparent md:bg-controls-bg-start/80 md:backdrop-blur-md shadow-none md:shadow-sm border-none md:border md:border-white/20 h-10 md:h-12 justify-self-end md:justify-self-start">
                    {/* Spine 내부 스킨 선택 */}
                    <DropdownMenu open={openDropdown === 'spineSkin'} onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'spineSkin' : null)}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-tc-green/10"
                                onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_Weared.png`} alt="Option" className="w-5 h-5 object-contain opacity-80 invert dark:invert-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end" className="max-h-[200px] overflow-y-auto">
                            {spineSkins.map((sName) => (
                                <DropdownMenuItem
                                    key={sName}
                                    onClick={() => onSpineSkinChange(sName)}
                                    className={sName === currentSpineSkin ? "bg-tc-green text-white focus:bg-tc-green focus:text-white" : ""}
                                >
                                    {sName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-[1px] h-4 bg-tc-line-soft mx-1"></div>

                    {/* 사도 스킨 선택 */}
                    <DropdownMenu open={openDropdown === 'charSkin'} onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'charSkin' : null)}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-tc-green/10"
                                onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                            >
                                <img src={`${RESOURCE_PATHS.IMAGE.ICONS}/HeroSkin_Icon_WearedBG.png`} alt="Skin" className="w-5 h-5 object-contain opacity-80 invert dark:invert-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end" className="max-h-[200px] overflow-y-auto">
                            {skins.map((skin) => (
                                <DropdownMenuItem
                                    key={skin.file}
                                    onClick={() => onSkinChange(skin)}
                                    className={skin.file === selectedSkin?.file ? "bg-tc-green text-white focus:bg-tc-green focus:text-white" : ""}
                                >
                                    {skin.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ControlBar);
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const WAVE_PATH_BACK = "M0 100 C 120 40, 360 40, 480 100 C 600 160, 840 160, 960 100 C 1080 40, 1320 40, 1440 100 C 1560 160, 1800 160, 1920 100 C 2040 40, 2280 40, 2400 100 C 2520 160, 2760 160, 2880 100 V 220 H 0 Z";
const WAVE_PATH_FRONT = "M0 140 C 160 90, 320 90, 480 140 C 640 190, 800 190, 960 140 C 1120 90, 1280 90, 1440 140 C 1600 190, 1760 190, 1920 140 C 2080 90, 2240 90, 2400 140 C 2560 190, 2720 190, 2880 140 V 220 H 0 Z";

const WaveBackground: React.FC = () => {
    return (
        <div className="absolute left-0 right-0 bottom-0 h-[290px] overflow-hidden pointer-events-none z-10 hidden md:block" aria-hidden="true">
            {/* 배경 물결 */}
            <motion.div 
                className="absolute left-0 bottom-0 w-[300%] h-full flex overflow-hidden translate-x-0 animate-[wave-move_45s_linear_infinite] opacity-90 z-10 will-change-transform"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
            >
                <svg className="w-1/2 h-full shrink-0 fill-[#4fb83d]" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d={WAVE_PATH_BACK} />
                </svg>
                <svg className="w-1/2 h-full shrink-0 fill-[#4fb83d]" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d={WAVE_PATH_BACK} />
                </svg>
            </motion.div>
            
            {/* 전면 물결 */}
            <motion.div 
                className="absolute left-0 bottom-0 w-[300%] h-full flex overflow-hidden translate-x-0 animate-[wave-move_25s_linear_infinite] opacity-100 z-10 will-change-transform"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.1 }}
            >
                <svg className="w-1/2 h-full shrink-0 fill-tc-green-2" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d={WAVE_PATH_FRONT} />
                </svg>
                <svg className="w-1/2 h-full shrink-0 fill-tc-green-2" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d={WAVE_PATH_FRONT} />
                </svg>
            </motion.div>
        </div>
    );
};

export default memo(WaveBackground);
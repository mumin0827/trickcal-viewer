import React from 'react';

const WaveBackground: React.FC = () => {
    return (
        <div className="wave-background" aria-hidden="true">
            <div className="wave-track wave-back">
                <svg className="wave-svg" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d="M0 100 C 120 40, 360 40, 480 100 C 600 160, 840 160, 960 100 C 1080 40, 1320 40, 1440 100 C 1560 160, 1800 160, 1920 100 C 2040 40, 2280 40, 2400 100 C 2520 160, 2760 160, 2880 100 V 220 H 0 Z" />
                </svg>
                <svg className="wave-svg" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d="M0 100 C 120 40, 360 40, 480 100 C 600 160, 840 160, 960 100 C 1080 40, 1320 40, 1440 100 C 1560 160, 1800 160, 1920 100 C 2040 40, 2280 40, 2400 100 C 2520 160, 2760 160, 2880 100 V 220 H 0 Z" />
                </svg>
            </div>
            <div className="wave-track wave-front">
                <svg className="wave-svg" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d="M0 140 C 160 90, 320 90, 480 140 C 640 190, 800 190, 960 140 C 1120 90, 1280 90, 1440 140 C 1600 190, 1760 190, 1920 140 C 2080 90, 2240 90, 2400 140 C 2560 190, 2720 190, 2880 140 V 220 H 0 Z" />
                </svg>
                <svg className="wave-svg" viewBox="0 0 2880 220" preserveAspectRatio="none">
                    <path d="M0 140 C 160 90, 320 90, 480 140 C 640 190, 800 190, 960 140 C 1120 90, 1280 90, 1440 140 C 1600 190, 1760 190, 1920 140 C 2080 90, 2240 90, 2400 140 C 2560 190, 2720 190, 2880 140 V 220 H 0 Z" />
                </svg>
            </div>
        </div>
    );
};

export default WaveBackground;

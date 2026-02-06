import React from 'react';
import { RESOURCE_PATHS } from '@/routers/paths';

interface LoadingProps {
    message?: string;
    isExiting?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message, isExiting }) => {
    const icons = [
        `${RESOURCE_PATHS.IMAGE.LOADING}/HeroDetail_Icon_BallPull.png`,
        `${RESOURCE_PATHS.IMAGE.LOADING}/HeroDetail_Icon_DutchRub.png`,
        `${RESOURCE_PATHS.IMAGE.LOADING}/HeroDetail_Icon_Petting.png`,
        `${RESOURCE_PATHS.IMAGE.LOADING}/HeroDetail_Icon_Tickling.png`,
    ];

    return (
        <div className={`absolute inset-0 flex justify-center items-center bg-tc-bg/60 backdrop-blur-[4px] z-[3500] transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'}`}>
            <div className="flex flex-col items-center gap-5">
                <div className="flex gap-3">
                    {icons.map((src, index) => (
                        <img
                            key={`loading_image_${index}`}
                            src={src}
                            alt="loading"
                            className="w-[40px] h-[40px] object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.1)] animate-jelly opacity-90"
                            style={{
                                animationDelay: `${index * 0.15}s`
                            }}
                        />
                    ))}
                </div>
                {message && (
                    <div className="text-text-main text-[1.1rem] font-bold">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Loading;

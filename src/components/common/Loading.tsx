import React from 'react';
import { RESOURCE_PATHS } from '../../routers/paths';

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
        <div className={`loading-container ${isExiting ? 'fade-out' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div className="loading-icons">
                    {icons.map((src, index) => (
                        <img
                            key={`loading_image_${index}`}
                            src={src}
                            alt="loading"
                            className="loading-icon animate-jelly"
                            style={{
                                animationDelay: `${index * 0.15}s`
                            }}
                        />
                    ))}
                </div>
                {message && (
                    <div className="loading-text">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Loading;

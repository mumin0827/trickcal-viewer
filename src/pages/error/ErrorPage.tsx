import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';
import WaveBackground from '@/components/common/WaveBackground';
import { Button } from '@/components/ui/button';

const AnimatedElena = () => {
    return (
        <div className="w-16 h-16 -mb-2 overflow-hidden -translate-y-2">
            <div
                className="w-full h-full animate-elena-sprite"
                style={{
                    backgroundImage: "url('/image/networkIcon/NetworkIcon_Elena_Sprite.png')",
                    backgroundSize: '400% 100%',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </div>
    );
};

const ErrorPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="relative min-h-screen flex flex-col bg-tc-bg text-text-main transition-colors duration-300">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-500">
                <div className="flex flex-col items-center p-7 md:p-10 bg-tc-panel/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-tc-green/30 max-w-md w-full">
                    <AnimatedElena />
                    <h1 className="text-3xl md:text-4xl font-black text-tc-green-dark mb-4 tracking-tighter opacity-50">
                        ERROR 404
                    </h1>

                    <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2">
                        {t('common.error404Title')}
                    </h2>

                    <p className="text-sm md:text-base text-text-sub mb-7 font-medium px-2">
                        {t('common.error404Message')}
                    </p>

                    <Button asChild
                            variant="secondary"
                            className="gap-2 rounded-full px-7 py-2.5 h-11 text-sm md:text-base shadow-tc-btn transition-all active:scale-95"
                    >
                        <Link to="/">
                            <Home className="w-4 h-4 md:w-5 md:h-5" />
                            {t('common.goHome')}
                        </Link>
                    </Button>
                </div>
            </main>

            {/* 물결 배경 레이어 */}
            <div className="absolute inset-0 bottom-[50px] z-0 pointer-events-none overflow-hidden">
                <WaveBackground />
            </div>
            <Footer />
        </div>
    );
};

export default ErrorPage;
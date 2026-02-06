import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './Header';
import Footer from './Footer';
import ErrorFallback from '@/components/common/ErrorFallback';

const MainLayout = () => {
    return (
        <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 pb-[50px]">
            <Header />
            <main className="flex-1 relative">
                <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onReset={() => {
                        window.location.reload();
                    }}
                >
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;

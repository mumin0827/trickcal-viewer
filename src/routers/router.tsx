import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Loading from '@/components/common/Loading';

const ViewerPage = lazy(() => import('@/pages/viewer/ViewerPage'));
const ErrorPage = lazy(() => import('@/pages/error/ErrorPage'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: (
            <Suspense fallback={<Loading />}>
                <ErrorPage />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <ViewerPage />
                    </Suspense>
                ),
            },
        ],
    },
    // 404 처리를 위한 Catch-all 라우트
    {
        path: '*',
        element: (
            <Suspense fallback={<Loading />}>
                <ErrorPage />
            </Suspense>
        ),
    }
]);

export default router;

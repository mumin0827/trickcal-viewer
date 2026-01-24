import { createBrowserRouter } from 'react-router-dom';
import ViewerPage from '../pages/viewer/ViewerPage';
import ErrorPage from '../pages/error/ErrorPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <ViewerPage />,
        errorElement: <ErrorPage />,
    },
    // Catch-all route for 404
    {
        path: '*',
        element: <ErrorPage />,
    }
]);

export default router;

import { RouterProvider } from 'react-router-dom';
import router from '@/routers/router';
import { AppProvider } from '@/providers/AppProvider';
import '@/locale/i18n';
import './App.css';

function App() {
    return (
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    );
}

export default App;

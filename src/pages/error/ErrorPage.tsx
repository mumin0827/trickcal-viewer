import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import WaveBackground from '../../components/common/WaveBackground';
import '../../App.css';

const ErrorPage: React.FC = () => {
    return (
        <div className="app-container">
            <Header />
            
            <main className="viewer-container" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '4rem', color: 'var(--tc-green-dark)', margin: '0' }}>ERROR 404</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>페이지를 찾을 수 없습니다.</p>
                <Link to="/" className="char-select-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                    HOME
                </Link>
            </main>

            <WaveBackground />
            <Footer />
        </div>
    );
};

export default ErrorPage;
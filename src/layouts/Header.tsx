import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <div className="header-content">
                <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src="/logo.png" alt="Logo" className="app-logo" />
                    <span className="app-title">트릭컬 사도 뷰어</span>
                </Link>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;

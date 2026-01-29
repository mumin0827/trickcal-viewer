import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';

interface HeaderProps {
    onOpenExport?: () => void;
    isRecording?: boolean;
    hasSelectedChar?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenExport, isRecording, hasSelectedChar }) => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="app-header">
            <div className="header-content">
                <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src="/logo.png" alt="Logo" className="app-logo" />
                    <span className="app-title hidden md:block">트릭컬 사도 뷰어</span>
                </Link>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                </div>

                <div className="md:hidden" ref={menuRef}>
                    <button
                        className="hamburger-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="mobile-menu-dropdown">
                            {onOpenExport && hasSelectedChar && (
                                <>
                                    <button
                                        className={`mobile-menu-item ${isRecording ? 'disabled' : ''}`}
                                        onClick={() => {
                                            if (!isRecording) {
                                                onOpenExport();
                                                setIsMenuOpen(false);
                                            }
                                        }}
                                        disabled={isRecording}
                                    >
                                        {isRecording ? (
                                            <span>⏳</span>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" x2="12" y1="3" y2="15"></line>
                                            </svg>
                                        )}
                                        <span style={{ fontSize: '0.8rem' }}>{isRecording ? '녹화 중...' : '내보내기'}</span>
                                    </button>
                                    <div className="menu-divider"></div>
                                </>
                            )}
                            <button
                                className="mobile-menu-item"
                                onClick={() => toggleTheme()}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                                    {theme === 'dark' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '100%', height: '100%' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '100%', height: '100%' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.8rem' }}>테마 변경</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

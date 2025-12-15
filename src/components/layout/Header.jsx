/**
 * Header Component
 * Main navigation header for the dashboard with refresh button and navigation
 * Mobile responsive with collapsible menu
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header({ onRefresh, refreshing = false }) {
    const location = useLocation();
    const isAnalytics = location.pathname === '/analytics';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-[#1a1a2e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#4f7cff] to-[#9b59f5] flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
                                {isAnalytics ? 'Extended Analytics' : 'Meta Ads Dashboard'}
                            </h1>
                            <p className="text-xs sm:text-sm text-[#b4b4c9] hidden sm:block">
                                {isAnalytics ? 'Demographics, Platforms & Audiences' : 'Campaign Performance Overview'}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        {/* Navigation */}
                        <nav className="flex gap-2">
                            <Link
                                to="/"
                                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base ${!isAnalytics
                                    ? 'bg-[#4f7cff] text-white'
                                    : 'bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white'
                                    }`}
                            >
                                Overview
                            </Link>
                            <Link
                                to="/analytics"
                                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base ${isAnalytics
                                    ? 'bg-[#4f7cff] text-white'
                                    : 'bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white'
                                    }`}
                            >
                                Analytics
                            </Link>
                        </nav>

                        {/* Refresh Button */}
                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            className={`px-3 xl:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 
                                ${refreshing
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#4f7cff] to-[#9b59f5] hover:shadow-lg hover:shadow-[#4f7cff]/25'
                                } text-white font-medium text-sm xl:text-base`}
                        >
                            <svg
                                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M23 4v6h-6M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                            </svg>
                            <span className="hidden xl:inline">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                            <span className="xl:hidden">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>

                        {/* Date Badge */}
                        <div className="px-3 xl:px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#b4b4c9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span className="text-xs xl:text-sm text-[#b4b4c9] hidden xl:inline">Last 5 Days</span>
                            <span className="text-xs xl:text-sm text-[#b4b4c9] xl:hidden">5 Days</span>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
                        <nav className="flex flex-col gap-2 mb-4">
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isAnalytics
                                    ? 'bg-[#4f7cff] text-white'
                                    : 'bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white'
                                    }`}
                            >
                                Overview
                            </Link>
                            <Link
                                to="/analytics"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isAnalytics
                                    ? 'bg-[#4f7cff] text-white'
                                    : 'bg-white/5 border border-white/10 text-[#b4b4c9] hover:text-white'
                                    }`}
                            >
                                Analytics
                            </Link>
                        </nav>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    onRefresh?.();
                                    setMobileMenuOpen(false);
                                }}
                                disabled={refreshing}
                                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 
                                    ${refreshing
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#4f7cff] to-[#9b59f5] hover:shadow-lg hover:shadow-[#4f7cff]/25'
                                    } text-white font-medium`}
                            >
                                <svg
                                    className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M23 4v6h-6M1 20v-6h6" />
                                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh Data'}
                            </button>

                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 text-[#b4b4c9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span className="text-sm text-[#b4b4c9]">Last 5 Days</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

Header.propTypes = {
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
};

import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroSection from './homepage/HeroSection'
import ChatInterface from './homepage/ChatInterface'
import ConversationSidebar from './homepage/ConversationSidebar'
import FeatureCards from './homepage/FeatureCards'
import { refreshSessionId, getActiveConversationId, setActiveConversationId as persistConversationId, getActiveAccountId } from '../services/session.js'
import { conversationAPI } from '../services/api.js'

function HomePage() {
  const navigate = useNavigate()
  const { conversationId: urlConversationId } = useParams()
  const { logout } = useAuth()
  const [activeConversationId, setActiveConversationId] = useState(
    () => urlConversationId || getActiveConversationId()
  );
  const [sidebarKey, setSidebarKey] = useState(0);
  const [chatKey, setChatKey] = useState(0); // force ChatInterface remount
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (urlConversationId) {
      setActiveConversationId(urlConversationId);
      persistConversationId(urlConversationId);
    }
  }, [urlConversationId]);

  useEffect(() => {
    if (urlConversationId && activeConversationId === urlConversationId) {
      conversationAPI.get(urlConversationId, getActiveAccountId())
        .catch(() => {
          navigate('/chat', { replace: true });
        });
    }
  }, [urlConversationId, activeConversationId, navigate]);

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversationId(conv.id);
    persistConversationId(conv.id);
    navigate(`/chat/${conv.id}`, { replace: true });
  }, [navigate]);

  const handleConversationCreated = useCallback((conv) => {
    setActiveConversationId(conv.id);
    persistConversationId(conv.id);
    setSidebarKey(k => k + 1);
    navigate(`/chat/${conv.id}`, { replace: true });
  }, [navigate]);

  const handleDeleteConversation = useCallback((deletedId) => {
    if (activeConversationId === deletedId) {
      refreshSessionId();
      setActiveConversationId(null);
      persistConversationId(null);
      setChatKey(k => k + 1);
      navigate('/chat', { replace: true });
    }
    setSidebarKey(k => k + 1);
  }, [activeConversationId, navigate]);

  const handleNewChat = useCallback(() => {
    refreshSessionId();
    setActiveConversationId(null);
    persistConversationId(null);
    setSidebarKey(k => k + 1);
    setChatKey(k => k + 1);
    navigate('/chat', { replace: true });
  }, [navigate]);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#ededae] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 rotate-180">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>
      </div>

      {/* Header Area */}
      {!isFullscreen && (
        <div className="absolute top-4 md:top-[38px] left-4 md:left-[46px] right-4 md:right-[46px] z-20 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <img 
            src="/Final logo-01 1.png" 
            alt="Ascend Analytics" 
            className="h-8 md:h-[46px] w-auto"
          />
          
          {/* Mobile Dashboard Button */}
          <Link 
            to="/dashboard"
            className="md:hidden bg-[#1e4a79] text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg transition-all"
          >
            Dashboard
          </Link>
        </div>

        {/* Desktop Dashboard Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/dashboard"
            className="bg-[#1e4a79] text-white px-6 py-2.5 rounded-full text-base font-semibold shadow-lg hover:bg-[#1e4a79]/90 transition-all flex items-center gap-2"
          >
            <span>Dashboard</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-300 hover:border-red-300"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-16 sm:pt-20 md:pt-20 pb-12 md:pb-20">
        {!isFullscreen && <HeroSection />}
        <div className="max-w-[1370px] mx-auto">
          {/* Chat + Sidebar Layout */}
          {isFullscreen && (
            <div className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm" onClick={() => setIsFullscreen(false)} />
          )}
          <div className={`flex bg-white overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[100] rounded-none p-4'
              : 'rounded-[24px] border border-gray-200 shadow-sm min-h-[500px] max-h-[80vh] mt-2 mb-8'
          }`}>
            {/* Mobile sidebar overlay backdrop */}
            {mobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}
            <ConversationSidebar
              refreshTrigger={sidebarKey}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              onDelete={handleDeleteConversation}
              onNewChat={handleNewChat}
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />
            <div className="flex-1 min-w-0">
              <ChatInterface
                key={chatKey}
                activeConversationId={activeConversationId}
                onConversationCreated={handleConversationCreated}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                onMenuClick={() => setMobileSidebarOpen(true)}
              />
            </div>
          </div>
          {!isFullscreen && <FeatureCards />}
        </div>
      </div>
    </div>
  )
}

export default HomePage


import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom'
import HeroSection from './homepage/HeroSection'
import ChatInterface from './homepage/ChatInterface'
import ConversationSidebar from './homepage/ConversationSidebar'
import FeatureCards from './homepage/FeatureCards'
import { refreshSessionId } from '../services/session.js'

function HomePage() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0); // force sidebar refresh

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversationId(conv.id);
  }, []);

  const handleConversationCreated = useCallback((conv) => {
    setActiveConversationId(conv.id);
    setSidebarKey(k => k + 1); // refresh sidebar list
  }, []);

  const handleDeleteConversation = useCallback((deletedId) => {
    if (activeConversationId === deletedId) {
      setActiveConversationId(null);
    }
    setSidebarKey(k => k + 1);
  }, [activeConversationId]);

  const handleNewChat = useCallback(() => {
    refreshSessionId();
    setActiveConversationId(null);
    setSidebarKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#ededae] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 rotate-180">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>
      </div>

      {/* Header Area */}
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
        <Link 
          to="/dashboard"
          className="hidden md:flex bg-[#1e4a79] text-white px-6 py-2.5 rounded-full text-base font-semibold shadow-lg hover:bg-[#1e4a79]/90 transition-all items-center gap-2"
        >
          <span>Dashboard</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-16 sm:pt-20 md:pt-20 pb-12 md:pb-20">
        <HeroSection />
        <div className="max-w-[1370px] mx-auto">
          {/* Chat + Sidebar Layout */}
          <div className="flex bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden min-h-[500px] max-h-[80vh] mt-2 mb-8">
            <ConversationSidebar
              key={sidebarKey}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              onDelete={handleDeleteConversation}
              onNewChat={handleNewChat}
            />
            <div className="flex-1 min-w-0">
              <ChatInterface
                activeConversationId={activeConversationId}
                onConversationCreated={handleConversationCreated}
              />
            </div>
          </div>
          <FeatureCards />
        </div>
      </div>
    </div>
  )
}

export default HomePage


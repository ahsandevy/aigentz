import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatInterface from './homepage/ChatInterface';
import ConversationSidebar from './homepage/ConversationSidebar';
import './Workspace.css';

function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { conversationId } = useParams();
  const activeConversationId = conversationId || null;
  const [createdConversation, setCreatedConversation] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectConversation = useCallback((conv) => {
    navigate(`/chat/${encodeURIComponent(conv.id)}`);
  }, [navigate]);

  const handleConversationCreated = useCallback((conv) => {
    setCreatedConversation({ id: conv.id, draftKey: chatKey });
    navigate(`/chat/${encodeURIComponent(conv.id)}`, { replace: true });
    setSidebarKey(k => k + 1);
  }, [navigate, chatKey]);

  const handleDeleteConversation = useCallback((deletedId) => {
    if (activeConversationId === deletedId) {
      navigate('/');
      setChatKey(k => k + 1);
    }
    setSidebarKey(k => k + 1);
  }, [activeConversationId, navigate]);

  const handleNewChat = useCallback(() => {
    navigate('/');
    setSidebarKey(k => k + 1);
    setChatKey(k => k + 1);
    setMobileSidebarOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="workspace-page">
      <div className="workspace-shell">
        {mobileSidebarOpen && (
          <button
            type="button"
            className="workspace-mobile-backdrop"
            aria-label="Close conversations"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <ConversationSidebar
          refreshTrigger={sidebarKey}
          activeConversationId={activeConversationId}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="workspace-main">
          <ChatInterface
            key={activeConversationId
              ? activeConversationId === createdConversation?.id ? `draft:${createdConversation.draftKey}` : activeConversationId
              : `draft:${chatKey}`}
            activeConversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
            onMenuClick={() => setMobileSidebarOpen(true)}
          />
        </div>
      </div>
    </main>
  );
}

export default HomePage;

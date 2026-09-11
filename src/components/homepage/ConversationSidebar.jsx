import { useState, useCallback, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Inbox,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { getActiveAccountId } from '../../services/session.js';
import { conversationAPI } from '../../services/api.js';
import { usePanelResize } from '../../hooks/usePanelResize.js';

/**
 * ConversationSidebar — Persistent chat history list.
 *
 * States:
 *   - Loading: skeleton placeholders
 *   - Empty: friendly "No conversations yet" message
 *   - Error: error message with retry button
 *   - Normal: scrollable conversation list
 *
 * Features:
 *   - "New Chat" button starts a fresh conversation
 *   - Click a conversation to open it
 *   - Inline rename (click pencil icon)
 *   - Delete with confirmation
 *   - Search/filter by title
 *   - Responsive: collapsible sidebar with toggle button
 */

function relativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export default function ConversationSidebar({
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  refreshTrigger = 0,
  mobileOpen = false,
  onMobileClose,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { width: panelWidth, dragProps } = usePanelResize(288, 200, 420);

  const inputRef = useRef(null);

  // ─── Fetch conversations ────────────────────────────────────────────
  const fetchConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await conversationAPI.list(getActiveAccountId(), 1, 50, search);
      setConversations(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Initial load
  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  // Silent refresh when triggered (e.g. new conversation created)
  useEffect(() => {
    fetchConversations(false); // no loading state — keep existing list visible
  }, [refreshTrigger]);

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleNewChat = () => {
    setSearch('');
    if (onNewChat) onNewChat();
  };

  const handleSelect = (conv) => {
    if (renamingId) return; // don't switch while renaming
    if (onSelect) onSelect(conv);
    if (onMobileClose) onMobileClose();
  };

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
    setDeleteConfirmId(null);
  };

  const handleConfirmRename = async (e, conv) => {
    e.stopPropagation();
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conv.title) {
      try {
        await conversationAPI.rename(conv.id, getActiveAccountId(), trimmed);
        setConversations(prev =>
          prev.map(c => (c.id === conv.id ? { ...c, title: trimmed } : c))
        );
      } catch (err) {
        console.error('Rename failed:', err);
      }
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDeleteClick = (e, conv) => {
    e.stopPropagation();
    setDeleteConfirmId(deleteConfirmId === conv.id ? null : conv.id);
    setRenamingId(null);
  };

  const handleConfirmDelete = async (e, conv) => {
    e.stopPropagation();
    setDeletingId(conv.id);
    try {
      await conversationAPI.delete(conv.id, getActiveAccountId());
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      if (onDelete) onDelete(conv.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch('');
    }
  };

  // ─── Sidebar width ──────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="hidden md:flex flex-shrink-0 border-r border-gray-200 bg-white flex-col items-center py-4 w-14 transition-all duration-300">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={handleNewChat}
          className="mt-4 p-2 rounded-lg bg-[#345C86] text-white hover:bg-[#2a4a6e] transition-colors"
          title="New Chat"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full
        fixed inset-y-0 left-0 z-50 md:relative md:inset-auto md:z-auto
        transition-all duration-200
        ${!mobileOpen ? 'hidden' : ''} md:flex
        ${mobileOpen ? 'shadow-2xl md:shadow-none' : ''}`}
      style={{ width: panelWidth }}
    >
      {/* Drag handle — right edge (desktop only) */}
      <div {...dragProps} className="hidden md:block" style={{ right: -2 }} />
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
            Conversations
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-[#345C86] text-white hover:bg-[#2a4a6e] transition-colors"
              title="New Chat"
            >
              <Plus size={14} />
            </button>
            {/* Close button on mobile */}
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title="Close sidebar"
            >
              <X size={14} />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-300 focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ─── List ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {/* Loading */}
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <p className="text-[13px] text-red-500">{error}</p>
            <button
              onClick={fetchConversations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && conversations.length === 0 && (
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Inbox size={20} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-500">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
            {!search && (
              <button
                onClick={handleNewChat}
                className="text-[12px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Start your first chat
              </button>
            )}
          </div>
        )}

        {/* Conversations */}
        {!loading && conversations.map((conv) => {
          const isActive = activeConversationId === conv.id;
          const isDeleting = deletingId === conv.id;

          return (
            <div key={conv.id} className="relative group">
              <button
                onClick={() => handleSelect(conv)}
                disabled={isDeleting}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-50 ${
                  isActive
                    ? 'bg-gray-50 border-l-[3px] border-l-[#345C86]'
                    : 'border-l-[3px] border-l-transparent hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    size={14}
                    className={`flex-shrink-0 mt-0.5 ${
                      isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Rename mode */}
                    {renamingId === conv.id ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename(e, conv);
                            if (e.key === 'Escape') handleCancelRename(e);
                          }}
                          className="flex-1 text-[13px] font-medium px-1.5 py-0.5 border border-gray-300 rounded outline-none focus:border-[#345C86] transition-colors"
                          maxLength={200}
                        />
                        <button
                          onClick={(e) => handleConfirmRename(e, conv)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={(e) => handleCancelRename(e)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-[13px] font-medium truncate ${
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {conv.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {relativeTime(conv.updated_at)}
                          {conv.message_count > 0 && (
                            <span className="ml-2">
                              {conv.message_count} msg{conv.message_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </button>

              {/* Hover actions (rename + delete) */}
              {renamingId !== conv.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleStartRename(e, conv)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, conv)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              )}

              {/* Delete confirmation modal popup */}
              {deleteConfirmId === conv.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirmId(null)}>
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                  {/* Modal card */}
                  <div
                    className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-3 mb-5">
                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Trash2 size={16} className="text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Delete conversation?</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          This will permanently remove <span className="font-medium text-gray-700">"{conv.title}"</span> and all its messages.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => handleConfirmDelete(e, conv)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-wait"
                      >
                        {isDeleting ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 size={13} className="animate-spin" />
                            Deleting…
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

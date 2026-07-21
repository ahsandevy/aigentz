import { useState, useEffect, useCallback, useRef } from 'react';
import { Inbox, RefreshCw, TrendingUp } from 'lucide-react';
import ChatRecommendationCard from './ChatRecommendationCard';
import { conversationAPI } from '../../services/api';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 5;

/**
 * RecommendationPanel — Side panel showing extracted recommendations from
 * the current conversation.
 *
 * Props:
 * - ``conversationId``: Current conversation UUID (null = no active conversation).
 * - ``accountId``: Ad account ID for API scoping.
 * - ``isStreaming``: Whether the agent is currently streaming a response.
 * - ``sseRecommendations``: Array of recommendations received via SSE (bonus).
 *
 * Polling: when ``isStreaming`` transitions from true to false, the panel
 * polls the API every 2s (max 5 attempts) until recommendations appear.
 * Extraction runs as a background task, so data may not be ready immediately
 * after [DONE].
 */
export default function RecommendationPanel({
  conversationId = null,
  accountId = null,
  isStreaming = false,
  extractionSkipped = false,
  sseRecommendations = null,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);  // popup state

  const fetchedForId = useRef(null);
  const prevStreaming = useRef(false);
  const pollTimer = useRef(null);
  const pollAttempts = useRef(0);
  // ponytail: track which recommendation IDs existed before the current stream.
  // The poll loop stops only when a NEW ID appears — old recs from previous
  // messages don't prematurely stop polling while new extraction is running.
  const recIdsBeforeStream = useRef(new Set());
  // Silent poll — skips loading state to avoid re-renders breaking the timer.
  const isPolling = useRef(false);

  const handleCardAction = useCallback((action, rec) => {
    if (action === 'open') {
      setSelectedRec(rec);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (!conversationId || !accountId) {
      setRecommendations([]);
      fetchedForId.current = null;
      return;
    }
    fetchedForId.current = conversationId;
    setLoading(true);
    setError(null);
    try {
      const data = await conversationAPI.getRecommendations(conversationId, accountId);
      if (fetchedForId.current === conversationId) {
        const items = Array.isArray(data) ? data : [];
        setRecommendations(items);
        return items;
      }
    } catch (err) {
      if (fetchedForId.current === conversationId) {
        setError(err.message || 'Failed to load recommendations');
      }
    } finally {
      if (fetchedForId.current === conversationId) {
        setLoading(false);
      }
    }
    return null;
  }, [conversationId, accountId]);

  // Fetch when conversation changes
  useEffect(() => {
    // Clean up any running poll
    if (pollTimer.current) { clearTimeout(pollTimer.current); pollTimer.current = null; }
    pollAttempts.current = 0;
    isPolling.current = false;
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Poll after streaming ends — extraction runs in background, data may
  // not be in the DB immediately.
  useEffect(() => {
    const wasStreaming = prevStreaming.current;
    prevStreaming.current = isStreaming;

    // Cleanup: cancel any running poll timer
    if (pollTimer.current) { clearTimeout(pollTimer.current); pollTimer.current = null; }

    if (wasStreaming && !isStreaming) {
      if (extractionSkipped) { isPolling.current = false; return; }
      recIdsBeforeStream.current = new Set(recommendations.map(r => r.id));
      pollAttempts.current = 0;
      isPolling.current = true;

      // ponytail: self-contained async poll — no state-driven loading indicators.
      // Calls the API directly to avoid fetchRecommendations' setLoading side-effects
      // which trigger re-renders that can kill the setTimeout chain.
      const run = async () => {
        if (!conversationId || pollAttempts.current >= POLL_MAX_ATTEMPTS) {
          isPolling.current = false;
          return;
        }
        pollAttempts.current += 1;
        try {
          const data = await conversationAPI.getRecommendations(conversationId, accountId);
          const items = Array.isArray(data) ? data : [];
          const hasNew = items.some(r => !recIdsBeforeStream.current.has(r.id));
          if (hasNew) {
            // New recs arrived — silently update state, stop polling.
            setRecommendations(items);
            isPolling.current = false;
          } else {
            // No new recs yet — schedule next attempt.
            pollTimer.current = setTimeout(run, POLL_INTERVAL_MS);
          }
        } catch {
          // API error during poll — retry until max attempts.
          pollTimer.current = setTimeout(run, POLL_INTERVAL_MS);
        }
      };
      pollTimer.current = setTimeout(run, POLL_INTERVAL_MS);
    }
  }, [isStreaming, conversationId, accountId, extractionSkipped, recommendations]);

  // Merge SSE recommendations — dedupe by id and prepend
  useEffect(() => {
    if (!sseRecommendations || !Array.isArray(sseRecommendations) || sseRecommendations.length === 0) {
      return;
    }
    setRecommendations(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const newRecs = sseRecommendations.filter(r => !existingIds.has(r.id));
      if (newRecs.length === 0) return prev;
      return [...newRecs, ...prev];
    });
    isPolling.current = false; // SSE delivered them, stop polling
  }, [sseRecommendations]);

  // ── Render ──

  const isIdle = !loading && recommendations.length === 0 && !isStreaming && !isPolling.current;

  // Empty state
  if (isIdle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Inbox size={20} className="text-gray-300" />
        </div>
        <p className="text-[13px] text-gray-500 font-medium mb-1">No recommendations yet</p>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[200px]">
          Recommendations from this conversation will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[12px] font-semibold text-gray-900 tracking-tight">
            Recommendations
          </h3>
          {recommendations.length > 0 && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {recommendations.length}
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 flex flex-col items-center text-center gap-2">
          <p className="text-[12px] text-red-500">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={11} />
            Retry
          </button>
        </div>
      )}

      {/* Populated list */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {recommendations.slice().reverse().map(rec => (
            <ChatRecommendationCard key={rec.id} recommendation={rec} compact onStatusChange={handleCardAction} />
          ))}
        </div>
      )}

      {/* ── Recommendation Detail Popup ── */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedRec(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-[420px] max-h-[80vh] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  {selectedRec.category}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                  selectedRec.confidence === 'high' ? 'bg-emerald-50 text-emerald-700' :
                  selectedRec.confidence === 'medium' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {selectedRec.confidence} confidence
                </span>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-3 leading-snug">
                {selectedRec.title}
              </h3>
              {selectedRec.description && (
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  {selectedRec.description}
                </p>
              )}
              {selectedRec.expected_impact && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 rounded-lg">
                  <TrendingUp size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-[12px] font-medium text-emerald-700">{selectedRec.expected_impact}</span>
                </div>
              )}
              {selectedRec.campaign_name && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4">
                  <span className="font-medium text-gray-400">Campaign:</span>
                  <span>{selectedRec.campaign_name}</span>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                className="flex-1 bg-[#345C86] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#2a4a6e] transition-colors"
                disabled={selectedRec.status === 'applied' || selectedRec.status === 'obsolete'}
              >
                {selectedRec.status === 'applied' ? 'Applied ✓' : 'Apply Now'}
              </button>
              <button className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

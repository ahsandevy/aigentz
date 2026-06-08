import { useState, useRef, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Database,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Terminal,
  Cpu,
  Sparkles
} from 'lucide-react';
import { getOrCreateSessionId, refreshSessionId } from '../../services/session.js';
import { conversationAPI } from '../../services/api.js';

// ═══════════════════════════════════════════════════════════════════════
//  MEMOISED SUB-COMPONENTS (defined OUTSIDE ChatInterface to preserve
//  React component identity across renders — prevents full unmount/remount
//  of all historical messages on every keystroke).
// ═══════════════════════════════════════════════════════════════════════

const DataTable = memo(function DataTable({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="my-6 border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <table className="min-w-full divide-y divide-gray-100 text-[13px]">
          <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px] whitespace-nowrap">
                  {h.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-4 py-3 text-gray-700 font-medium truncate max-w-[250px]" title={String(row[h])}>
                    {String(row[h] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <span className="text-[10px] text-gray-400 font-medium tracking-wide">
          {data.length} records returned
        </span>
      </div>
    </div>
  );
});

const SQLBlock = memo(function SQLBlock({ query }) {
  if (!query) return null;
  return (
    <div className="my-6 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
          <Database size={12} className="text-gray-400" />
          SQL Query
        </div>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-[12px] leading-relaxed text-gray-700 whitespace-pre">
        {query}
      </div>
    </div>
  );
});

const StepCard = memo(function StepCard({ step }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = step.status || 'complete';

  const getStatusIcon = () => {
    switch (status) {
      case 'running': return <Loader2 size={14} className="animate-spin text-blue-500" />;
      case 'complete': return <CheckCircle2 size={14} className="text-gray-400" />;
      case 'failed': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Terminal size={14} className="text-gray-300" />;
    }
  };

  return (
    <div className="mb-2 border border-gray-100 rounded-xl bg-white overflow-hidden transition-all hover:border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 outline-none"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-[13px] font-medium text-gray-700 tracking-tight">
            {step.tool || 'Processing'}
          </span>
          {status === 'running' && (
            <span className="ml-2 flex gap-1 items-center">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50">
          {step.args && (
            <div className="mb-4 mt-3">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 block">Input</label>
              <pre className="text-[11px] bg-gray-50 border border-gray-100 text-gray-600 p-3 rounded-lg overflow-x-auto font-mono">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          {step.output && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 block">Output</label>
              {typeof step.output === 'string' ? (
                <div className="text-[12px] text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-lg leading-relaxed">
                  {step.output}
                </div>
              ) : (
                <pre className="text-[11px] bg-gray-50 border border-gray-100 text-gray-600 p-3 rounded-lg overflow-x-auto font-mono">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const MessageBubble = memo(function MessageBubble({ msg, isStreaming = false }) {
  const isUser = msg.role === 'user';
  const [thinkingExpanded, setThinkingExpanded] = useState(true);

  if (isUser) {
    return (
      <div className="flex w-full mb-8 justify-end animate-in fade-in duration-300">
        <div className="max-w-2xl px-5 py-3.5 bg-gray-100 rounded-[20px] text-[15px] leading-relaxed text-gray-800 shadow-sm border border-gray-200">
          {msg.content}
        </div>
      </div>
    );
  }

  const hasThinking = msg.thinking && msg.thinking.trim().length > 0;
  const thinkingFinished = !isStreaming && hasThinking;

  return (
    <div className="flex w-full mb-10 justify-start animate-in fade-in duration-500">
      <div className="flex gap-4 w-full max-w-4xl">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm mt-1">
          <Sparkles size={14} className="text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="w-full">
            {/* ── Thinking (shown during streaming; collapsed after) ─── */}
            {hasThinking && (
              <div className="mb-4">
                {isStreaming ? (
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </span>
                    <span className="text-[13px] text-gray-400 italic font-light leading-relaxed">
                      {msg.thinking}
                    </span>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setThinkingExpanded(!thinkingExpanded)}
                      className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium tracking-wide uppercase"
                    >
                      {thinkingExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      {thinkingExpanded ? 'Hide reasoning' : 'Show reasoning'}
                    </button>
                    {thinkingExpanded && (
                      <div className="mt-2 pl-3 border-l-2 border-gray-100 text-[12px] text-gray-400 italic leading-relaxed">
                        {msg.thinking}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Thinking active but no text yet (initial phase) ─────── */}
            {isStreaming && !hasThinking && !msg.content && (!msg.steps || msg.steps.length === 0) && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </span>
                <span className="text-[13px] text-gray-400 italic font-light">Thinking…</span>
              </div>
            )}

            {msg.steps && msg.steps.length > 0 && (
              <div className="mb-6">
                <div className="space-y-2">
                  {msg.steps.map((step, idx) => (
                    <StepCard key={step.id || idx} step={step} />
                  ))}
                </div>
              </div>
            )}

            {msg.sql && <SQLBlock query={msg.sql} />}

            {msg.data && (
              <div className="animate-in fade-in duration-500 overflow-hidden mt-6 mb-6">
                <DataTable data={msg.data} />
              </div>
            )}

            {(msg.content || (msg.reasoning && !msg.sql && !msg.data && msg.steps?.length === 0)) && (
              <div className="text-[15px] text-gray-800 leading-relaxed font-normal prose prose-gray max-w-none prose-p:mb-4 prose-a:text-blue-600 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono">
                <ReactMarkdown>
                  {msg.content || msg.reasoning}
                </ReactMarkdown>
              </div>
            )}

            {msg.error && (
              <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div className="text-[14px] font-medium leading-relaxed">{msg.error}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════
//  STREAMING THROTTLE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

// Text-only updates flush at most once per this many ms.
const STREAM_THROTTLE_MS = 80;

// Structural events (tool calls, errors, etc.) flush immediately.
const STRUCTURAL_EVENTS = new Set([
  'tool_call', 'tool_output', 'sql', 'data', 'error',
]);

// ═══════════════════════════════════════════════════════════════════════
//  CHAT INTERFACE
// ═══════════════════════════════════════════════════════════════════════

export default function ChatInterface({
  activeConversationId = null,
  onConversationCreated = null,
}) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const scrollRef = useRef(null);
  const conversationIdRef = useRef(activeConversationId);
  const inputRef = useRef(null);

  // ── Streaming throttle refs ──
  // Instead of calling setStreamingMessage on every SSE event (which
  // triggers a full re-render cascade on every text token), we mutate
  // a ref and flush to React state at most once per STREAM_THROTTLE_MS.
  const streamingRef = useRef(null);       // { ...currentAiMsg }
  const throttleTimerRef = useRef(null);   // setTimeout ID
  const isThinkingRef = useRef(false);     // mirrors isThinking, read in throttle

  // Keep isThinkingRef in sync.
  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  // ── Initialization ─────────────────────────────────────────────────
  useEffect(() => {
    // Ensure a session exists in localStorage
    getOrCreateSessionId();
    fetchAccounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync conversationIdRef with prop ────────────────────────────────
  useEffect(() => {
    conversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // ── Load messages when activeConversationId changes ─────────────────
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    conversationAPI.get(activeConversationId)
      .then(data => {
        if (!cancelled) {
          const msgs = (data.messages || []).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            steps: m.tool_calls
              ? m.tool_calls.map((tc, i) => ({
                  id: `${m.id}-tc-${i}`,
                  tool: tc.name || tc.tool || 'Tool',
                  status: 'complete',
                  output: tc.output || tc.args || null,
                  args: tc.args || null,
                }))
              : [],
            sql: null,
            data: null,
            error: null,
          }));
          setMessages(msgs);
          setMessagesLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to load messages:', err);
          setMessagesLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activeConversationId]);

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/analytics/meta/accounts`
        : '/api/analytics/meta/accounts';
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  // ── Scrolling ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // ── Streaming flush ────────────────────────────────────────────────
  // Called from the SSE loop.  Text-only events are throttled;
  // structural events flush immediately.

  const flushStreamingState = useCallback((flushNow = false) => {
    // Clear any pending throttle timer.
    if (throttleTimerRef.current !== null) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }

    if (flushNow) {
      // Structural change — snapshot immediately.
      if (streamingRef.current) {
        setStreamingMessage({ ...streamingRef.current });
      }
    } else {
      // Text-only — throttle to STREAM_THROTTLE_MS.
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        if (streamingRef.current) {
          setStreamingMessage({ ...streamingRef.current });
        }
      }, STREAM_THROTTLE_MS);
    }
  }, []);

  // ── SSE stream handler ─────────────────────────────────────────────
  const handleSSEEvent = useCallback((parsed, currentAiMsg) => {
    const eventType = parsed.type;
    const isStructural = STRUCTURAL_EVENTS.has(eventType);

    switch (eventType) {
      case 'thinking':
        currentAiMsg.thinking += parsed.content || '';
        break;

      case 'text':
        if (parsed.is_reasoning) {
          currentAiMsg.reasoning += parsed.content || '';
        } else {
          currentAiMsg.content += parsed.content || '';
          if (isThinkingRef.current) {
            setIsThinking(false);
          }
        }
        break;

      case 'tool_call': {
        const stepId = parsed.id || `step-${Date.now()}`;
        const existingStep = currentAiMsg.steps.find(s => s.id === stepId);
        if (!existingStep) {
          currentAiMsg.steps.push({
            id: stepId,
            tool: parsed.tool,
            args: parsed.args,
            status: 'running',
            output: null,
          });
        }
        if (isThinkingRef.current) {
          setIsThinking(false);
        }
        break;
      }

      case 'tool_output': {
        const stepId = parsed.id;
        const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
          currentAiMsg.steps[stepIndex].status = 'complete';
          currentAiMsg.steps[stepIndex].output = parsed.content;
        }
        break;
      }

      case 'sql': {
        currentAiMsg.sql = parsed.content;
        const stepId = parsed.id || 'sql-gen';
        if (!currentAiMsg.steps.find(s => s.id === stepId)) {
          currentAiMsg.steps.push({
            id: stepId,
            tool: 'SQL Generation',
            status: 'complete',
            output: 'Query compiled successfully',
          });
        }
        break;
      }

      case 'data': {
        currentAiMsg.data = parsed.content;
        const stepId = parsed.id;
        const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
          currentAiMsg.steps[stepIndex].status = 'complete';
        }
        break;
      }

      case 'error': {
        currentAiMsg.error = parsed.error || parsed.content;
        const stepId = parsed.id;
        if (stepId) {
          const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            currentAiMsg.steps[stepIndex].status = 'failed';
          }
        }
        break;
      }

      default:
        if (parsed.error) currentAiMsg.error = parsed.error;
    }

    // Always update the ref (zero-cost mutation).
    streamingRef.current = currentAiMsg;

    // Flush: structural events immediately, text events throttled.
    flushStreamingState(isStructural);
  }, [flushStreamingState]);

  // ── performSearch ──────────────────────────────────────────────────
  const performSearch = useCallback(async (searchQuery) => {
    const trimmedQuery = (searchQuery || '').trim();
    if (!trimmedQuery) return;
    if (isThinkingRef.current) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmedQuery };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setIsThinking(true);

    // Ensure a conversation exists — create one if this is the first message
    // in this session or if no conversation is currently active.
    let convId = conversationIdRef.current;
    if (!convId) {
      try {
        const conv = await conversationAPI.create(trimmedQuery.slice(0, 100));
        convId = conv.id;
        conversationIdRef.current = convId;
        if (onConversationCreated) onConversationCreated(conv);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        // Continue without conversation tracking — the backend will still
        // persist via agent_service if DB is available.
      }
    }

    const aiMsgId = Date.now() + 1;
    const currentAiMsg = {
      id: aiMsgId,
      role: 'ai',
      thinking: '',
      reasoning: '',
      content: '',
      steps: [],
      sql: null,
      data: null,
      error: null,
    };

    // Seed both the ref and React state so the bubble appears immediately.
    streamingRef.current = currentAiMsg;
    setStreamingMessage({ ...currentAiMsg });

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agent/chat`
        : '/api/agent/chat';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmedQuery,
          session_id: getOrCreateSessionId(),
        }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const rawData = line.slice(6);
          if (rawData === '[DONE]') {
            // Flush any remaining throttled content before finalising.
            if (throttleTimerRef.current !== null) {
              clearTimeout(throttleTimerRef.current);
              throttleTimerRef.current = null;
            }
            break;
          }

          try {
            const parsed = JSON.parse(rawData);
            handleSSEEvent(parsed, currentAiMsg);
          } catch (e) {
            console.warn('SSE parse error:', e, rawData);
          }
        }
      }

      // Final flush & move to permanent messages.
      setStreamingMessage(null);
      setMessages(prev => [...prev, { ...currentAiMsg }]);
      setIsThinking(false);
      streamingRef.current = null;

    } catch (err) {
      currentAiMsg.error = err.message || 'Connection failed';
      setStreamingMessage(null);
      setMessages(prev => [...prev, { ...currentAiMsg, isError: true }]);
      setIsThinking(false);
      streamingRef.current = null;
    }
  }, [handleSSEEvent]);

  // ── Input handlers ─────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleAccountChange = useCallback((e) => {
    const accountId = e.target.value;
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setSelectedAccount(account);
      performSearch(`Activate context for "${account.name}".`);
    }
  }, [accounts, performSearch]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performSearch(query);
    }
  }, [query, performSearch]);

  // ── Cleanup throttle timer on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  // ════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full bg-[#FAFAFA] flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 h-full overflow-hidden">
      <div className="flex-1 w-full flex flex-col relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-100 bg-[#FAFAFA]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 shadow-sm">
              <Cpu size={16} className="text-gray-700" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">Analytics Assistant</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-[13px] font-medium text-gray-700 outline-none transition-all focus:border-gray-300 focus:shadow-sm cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                value={selectedAccount?.id || ''}
                onChange={handleAccountChange}
                disabled={isLoadingAccounts || isThinking}
              >
                <option value="" disabled>Select Ad Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                <ChevronDown size={14} />
              </div>
            </div>
            {isLoadingAccounts && (
              <div className="animate-spin text-gray-400 ml-1">
                <Loader2 size={14} />
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        >
          {messagesLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <p className="text-[14px] text-gray-400">Loading conversation...</p>
            </div>
          )}

          {!messagesLoading && messages.length === 0 && !streamingMessage && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
              <div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2 tracking-tight">How can I help?</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  Query data, run diagnostics, and fetch reports.
                </p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {streamingMessage && (
            <MessageBubble key={`streaming-${streamingMessage.id}`} msg={streamingMessage} isStreaming={true} />
          )}

          {/* Agent is still responding indicator — shown during streaming but after initial thinking */}
          {streamingMessage && !isThinking && (
            <div className="flex w-full mb-4 justify-start animate-in fade-in duration-300">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
                <span className="text-[12px] text-gray-400 italic font-light">
                  Agent is still responding…
                </span>
              </div>
            </div>
          )}

          {/* Thinking-only phase (streaming hasn't started producing content yet) — subtle indicator */}
          {isThinking && !streamingMessage && (
            <div className="flex w-full mb-8 justify-start animate-in fade-in duration-300">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
                <span className="text-[12px] text-gray-400 italic font-light">
                  Thinking…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-[24px] p-2 pl-6 shadow-sm transition-all focus-within:shadow-md focus-within:border-gray-300">
              <textarea
                ref={inputRef}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  streamingMessage ? "Agent is responding…" :
                  isThinking ? "Thinking…" :
                  "Ask a question..."
                }
                className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none max-h-32 min-h-[44px]"
                rows={1}
                disabled={isThinking || streamingMessage !== null}
              />

              <button
                onClick={handleSearch}
                disabled={!query.trim() || isThinking || streamingMessage !== null}
                className={`flex items-center justify-center w-10 h-10 mb-0.5 rounded-full transition-all duration-300 self-end ${
                  !query.trim() || isThinking || streamingMessage !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95'
                }`}
              >
                <Send size={16} className={(isThinking || streamingMessage) ? 'animate-pulse translate-x-0.5' : 'translate-x-0.5'} />
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-[11px] text-gray-400">AI can make mistakes. Verify important data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

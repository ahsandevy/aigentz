import { useState, useRef, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send, ChevronDown, ChevronUp, AlertCircle, Loader2,
  CheckCircle2, Terminal, Cpu, Sparkles, Database,
  Brain, Wrench, BarChart3, X,
} from 'lucide-react';
import { getActiveAccountId, setActiveAccountId } from '../../services/session.js';
import { conversationAPI } from '../../services/api.js';

/* ──────────────────────────────────────────────────────────────────────
   BLOCK RENDERERS — one per block type, rendered in order
   ─────────────────────────────────────────────────────────────────── */

const ThinkingBlock = memo(function ThinkingBlock({ text, isActive }) {
  const [expanded, setExpanded] = useState(isActive);
  if (!text) return null;

  if (isActive) {
    return (
      <div className="flex items-start gap-2.5 py-2">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center">
            <Brain size={11} className="text-violet-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest">Reasoning</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </span>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed italic">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-violet-600 transition-colors group"
      >
        <Brain size={10} className="group-hover:text-violet-500 transition-colors" />
        <span className="font-semibold uppercase tracking-wider">Reasoning</span>
        <ChevronDown size={10} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-2 pl-5 border-l-2 border-violet-100">
          <p className="text-[12px] text-gray-400 italic leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
});

const ToolBlock = memo(function ToolBlock({ block }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = block.status === 'running';
  const isComplete = block.status === 'complete';
  const isFailed = block.status === 'failed';

  return (
    <div className={`my-2 rounded-xl border overflow-hidden transition-all duration-200 ${
      isRunning ? 'border-blue-200 bg-blue-50/30 shadow-sm' :
      isComplete ? 'border-emerald-100 bg-emerald-50/20' :
      isFailed ? 'border-red-100 bg-white' :
      'border-gray-100 bg-white'
    }`}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {isRunning && <Loader2 size={13} className="animate-spin text-blue-500 flex-shrink-0" />}
          {isComplete && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />}
          {isFailed && <AlertCircle size={13} className="text-red-500 flex-shrink-0" />}
          {!isRunning && !isComplete && !isFailed && <Terminal size={13} className="text-gray-300 flex-shrink-0" />}
          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Wrench size={10} className="text-gray-500" />
          </div>
          <span className="text-[12px] font-semibold text-gray-800 truncate">{block.tool}</span>
          {isRunning && <span className="text-[10px] font-medium text-blue-500 flex-shrink-0 animate-pulse">running</span>}
          {isComplete && <span className="text-[10px] font-medium text-green-600 flex-shrink-0">done</span>}
          {isFailed && <span className="text-[10px] font-medium text-red-500 flex-shrink-0">failed</span>}
        </div>
        <ChevronDown size={12} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-gray-100 space-y-2.5">
          {block.args && (
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Arguments</label>
              <pre className="text-[11px] bg-gray-50 border border-gray-100 text-gray-600 p-2.5 rounded-lg font-mono leading-relaxed overflow-x-auto">
                {JSON.stringify(block.args, null, 2)}
              </pre>
            </div>
          )}
          {block.output && (
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Result</label>
              <div className="text-[12px] text-gray-700 bg-white border border-emerald-100 p-2.5 rounded-lg leading-relaxed">
                {String(block.output)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const DataBlock = memo(function DataBlock({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className="my-4 rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
        <BarChart3 size={12} className="text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Structured Data</span>
        <span className="text-[10px] text-gray-300 ml-auto">{data.length} rows</span>
      </div>
      <div className="overflow-x-auto max-h-[320px] scrollbar-thin scrollbar-thumb-gray-200">
        <table className="min-w-full text-[13px]">
          <thead><tr className="border-b border-gray-50">
            {headers.map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                {h.replace(/_/g, ' ')}
              </th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-4 py-2.5 text-gray-700 whitespace-nowrap font-medium">
                    {String(row[h] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const TextBlock = memo(function TextBlock({ text }) {
  if (!text) return null;
  return (
    <div className="text-[15px] text-gray-800 leading-relaxed prose prose-gray max-w-none prose-p:mb-3 prose-a:text-blue-600 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[13px] prose-table:text-[13px] prose-th:font-medium prose-th:text-[11px] prose-th:uppercase prose-th:tracking-wider prose-th:text-gray-500 prose-td:text-gray-700">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
});

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'thinking': return <ThinkingBlock text={block.text} isActive={!block.done} />;
    case 'tool': return <ToolBlock block={block} />;
    case 'text': return <TextBlock text={block.text} />;
    case 'data': return <DataBlock data={block.data} />;
    default: return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
   ─────────────────────────────────────────────────────────────────── */

const MessageBubble = memo(function MessageBubble({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex w-full mb-8 justify-end">
        <div className="max-w-2xl px-5 py-3.5 bg-gray-100 rounded-[20px] text-[15px] leading-relaxed text-gray-800 shadow-sm border border-gray-200">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full mb-10 justify-start">
      <div className="flex gap-4 w-full max-w-4xl">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm mt-1">
          <Sparkles size={14} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          {msg.blocks && msg.blocks.map((block, i) => (
            <BlockRenderer key={`${msg.id}-${i}`} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────────
   CHAT INTERFACE
   ─────────────────────────────────────────────────────────────────── */

// SSE buffer for events split across network packets
function sseLines(chunk, buffer) {
  buffer.current += chunk;
  const parts = buffer.current.split('\n\n');
  buffer.current = parts.pop();
  const events = [];
  for (const part of parts) {
    for (const line of part.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') { events.push('__DONE__'); continue; }
      try { events.push(JSON.parse(raw)); }
      catch { /* skip malformed */ }
    }
  }
  return events;
}

export default function ChatInterface({
  activeConversationId = null,
  onConversationCreated = null,
}) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(activeConversationId);

  // Session ID: used for SSE thread_id.
  // For new conversations: fresh UUID. For existing conversations: loaded from DB.
  const sessionIdRef = useRef(crypto.randomUUID?.() ?? ('session-' + Date.now()));
  const threadIdRef = useRef(null); // loaded from conversation detail

  // Prevent double-sends
  const busyRef = useRef(false);

  // Track whether WE created the current conversation (skip clear-on-select)
  const selfCreatedConvRef = useRef(false);

  /* ── Init ───────────────────────────────────────────────────────── */
  useEffect(() => { fetchAccounts(); }, []);

  useEffect(() => { conversationIdRef.current = activeConversationId; }, [activeConversationId]);

  /* ── Load messages when sidebar selects a conversation ──────────── */
  useEffect(() => {
    if (!activeConversationId) { setMessages([]); threadIdRef.current = null; return; }
    if (selfCreatedConvRef.current) { selfCreatedConvRef.current = false; return; }
    let cancelled = false;
    setMessagesLoading(true);
    conversationAPI.get(activeConversationId, getActiveAccountId())
      .then(data => {
        if (cancelled) return;
        // Store thread_id so SSE reuses LangGraph context
        if (data.thread_id) {
          threadIdRef.current = data.thread_id;
        }
        setMessages((data.messages || []).map(m => toBlocks(m)));
        setMessagesLoading(false);
      })
      .catch(err => { if (!cancelled) { console.error(err); setMessagesLoading(false); } });
    return () => { cancelled = true; };
  }, [activeConversationId]);

  function toBlocks(m) {
    const blocks = [];
    if (m.content) blocks.push({ type: 'text', text: m.content });
    if (m.tool_calls && Array.isArray(m.tool_calls)) {
      m.tool_calls.forEach(tc => blocks.push({
        type: 'tool', id: tc.id || ('t-' + Date.now()),
        tool: tc.name || tc.tool || 'Tool',
        args: tc.args || null, status: 'complete', output: tc.output || null,
      }));
    }
    // User messages render msg.content directly — preserve it
    return { id: m.id, role: m.role, content: m.content, blocks };
  }

  /* ── Fetch Meta accounts ────────────────────────────────────────── */
  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const url = (import.meta.env.VITE_API_BASE_URL || '') + '/api/analytics/meta/accounts'
        || '/api/analytics/meta/accounts';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.data || []);
        if (data.data?.length > 0) setActiveAccountId(data.data[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingAccounts(false); }
  }, []);

  /* ── Smart scroll: only auto-scroll if user is near bottom ──────── */
  const isNearBottom = useRef(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80; // px from bottom
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    if (isNearBottom.current && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [messages]);

  // Force scroll to bottom when opening a different conversation
  useEffect(() => {
    if (activeConversationId) {
      isNearBottom.current = true;
      if (scrollRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        });
      }
    }
  }, [activeConversationId]);

  /* ── performSearch ──────────────────────────────────────────────── */
  const performSearch = useCallback(async (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    // Ensure conversation exists
    let convId = conversationIdRef.current;
    if (!convId) {
      try {
        const conv = await conversationAPI.create(getActiveAccountId(), trimmed.slice(0, 100), sessionIdRef.current);
        convId = conv.id;
        conversationIdRef.current = convId;
        threadIdRef.current = conv.thread_id || sessionIdRef.current;
        selfCreatedConvRef.current = true;
        if (onConversationCreated) onConversationCreated(conv);
      } catch (e) { console.error('Failed to create conversation:', e); }
    }

    // ── STREAMING STATE: simple items array + currentText accumulator ──
    // items[] = finalized blocks (thinking, tools, finalized text segments)
    // currentText = live accumulating text (becomes a text block on next tool/data or at end)
    const streamId = 'stream-' + Date.now();
    const streamRef = {
      id: streamId,
      role: 'ai',
      thinking: '',
      thinkingDone: false,
      items: [],        // finalized blocks in order: thinking, text*, tool, text*, ...
      currentText: '',  // live text accumulator (NOT yet in items)
    };

    setMessages(prev => [...prev, streamRef]);

    function buildBlocks() {
      const b = [];
      if (streamRef.thinking) b.push({ type: 'thinking', text: streamRef.thinking, done: streamRef.thinkingDone });
      b.push(...streamRef.items);
      if (streamRef.currentText) b.push({ type: 'text', text: streamRef.currentText });
      return b;
    }

    function flushCurrentText() {
      if (streamRef.currentText.trim()) {
        streamRef.items.push({ type: 'text', text: streamRef.currentText });
        streamRef.currentText = '';
      }
    }

    const sseBuf = { current: '' };

    try {
      const apiUrl = (import.meta.env.VITE_API_BASE_URL || '') + '/api/agent/chat'
        || '/api/agent/chat';

      const res = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          session_id: threadIdRef.current || sessionIdRef.current,
        }),
      });
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const events = sseLines(text, sseBuf);

        for (const evt of events) {
          if (evt === '__DONE__') break;

          const etype = evt.type;

          if (etype === 'thinking') {
            streamRef.thinking += ' ' + (evt.content || '');
            continue;
          }

          if (etype === 'text') {
            streamRef.thinkingDone = true;
            streamRef.currentText += (evt.content || '');
            continue;
          }

          if (etype === 'tool_call') {
            streamRef.thinkingDone = true;
            flushCurrentText();
            streamRef.items.push({
              type: 'tool',
              id: evt.id || ('t-' + Math.random().toString(36).slice(2)),
              tool: evt.tool || evt.name || 'Tool',
              args: evt.args || null,
              status: 'running',
              output: null,
            });
            continue;
          }

          if (etype === 'tool_output') {
            const tIdx = streamRef.items.findLastIndex(b => b.type === 'tool' && b.id === evt.id);
            if (tIdx >= 0) {
              streamRef.items[tIdx] = { ...streamRef.items[tIdx], status: 'complete', output: evt.content };
            }
            continue;
          }

          if (etype === 'data') {
            flushCurrentText();
            if (Array.isArray(evt.content)) {
              streamRef.items.push({ type: 'data', data: evt.content });
            }
            continue;
          }

          if (etype === 'error' || evt.error) {
            streamRef.thinkingDone = true;
            flushCurrentText();
            continue;
          }
        }

        // One state update per chunk — build blocks from the single source of truth
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.id === streamId) {
            copy[copy.length - 1] = { ...streamRef, blocks: buildBlocks() };
          }
          return copy;
        });
      }

      // Final update
      flushCurrentText();
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.id === streamId) {
          copy[copy.length - 1] = { ...streamRef, blocks: buildBlocks() };
        }
        return copy;
      });

    } catch (err) {
      flushCurrentText();
      if (err.message && !err.message.includes('Server Error')) {
        streamRef.currentText += '> ⚠️ ' + (err.message || 'Connection failed');
      }
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.id === streamId) {
          copy[copy.length - 1] = { ...streamRef, blocks: buildBlocks() };
        }
        return copy;
      });
    } finally {
      busyRef.current = false;
    }
  }, [onConversationCreated]);

  /* ── Input handlers ─────────────────────────────────────────────── */
  const handleSearch  = useCallback(() => performSearch(query), [query, performSearch]);
  const handleAccountChange = useCallback((e) => {
    const acct = accounts.find(a => a.id === e.target.value);
    if (acct) { setSelectedAccount(acct); setActiveAccountId(acct.id); }
  }, [accounts]);
  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); performSearch(query); }
  }, [query, performSearch]);

  const isBusy = busyRef.current;

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full bg-[#FAFAFA] flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 h-full overflow-hidden">
      <div className="flex-1 w-full flex flex-col relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center py-4 px-4 md:px-6 border-b border-gray-100 bg-[#FAFAFA]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 shadow-sm">
              <Cpu size={16} className="text-gray-700" />
            </div>
            <h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">Analytics Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-[13px] font-medium text-gray-700 outline-none transition-all focus:border-gray-300 focus:shadow-sm cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                value={selectedAccount?.id || ''}
                onChange={handleAccountChange}
                disabled={isLoadingAccounts || isBusy}
              >
                <option value="" disabled>Select Ad Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                <ChevronDown size={14} />
              </div>
            </div>
            {isLoadingAccounts && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative">
          {/* Loading overlay — always visible during load, covers everything */}
          {messagesLoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#FAFAFA]/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-gray-400 animate-spin" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-gray-700">Opening conversation…</p>
                  <p className="text-[13px] text-gray-400 mt-0.5">Loading messages</p>
                </div>
                <div className="space-y-2 w-56">
                  <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-full" />
                  <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-3/4" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-1/2" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          {!messagesLoading && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
              <h3 className="text-2xl font-medium text-gray-900 tracking-tight">How can I help?</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Query data, run diagnostics, and fetch reports.
              </p>
            </div>
          )}

          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-[24px] p-2 pl-6 shadow-sm transition-all focus-within:shadow-md focus-within:border-gray-300">
              <textarea ref={inputRef} value={query}
                onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder={isBusy ? "Agent is responding…" : "Ask a question..."}
                className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none max-h-32 min-h-[44px]"
                rows={1} disabled={isBusy} />
              <button onClick={handleSearch}
                disabled={!query.trim() || isBusy}
                className={`flex items-center justify-center w-10 h-10 mb-0.5 rounded-full transition-all duration-300 self-end ${
                  !query.trim() || isBusy
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95'
                }`}>
                <Send size={16} className={isBusy ? 'animate-pulse translate-x-0.5' : 'translate-x-0.5'} />
              </button>
            </div>
            <p className="text-center mt-3 text-[11px] text-gray-400">AI can make mistakes. Verify important data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

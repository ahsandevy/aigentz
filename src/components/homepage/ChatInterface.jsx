import { useState, useRef, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, ChevronDown, ChevronRight, AlertCircle, Loader2,
  CheckCircle2, Terminal, Cpu, Sparkles,
  Brain, Wrench, BarChart3, Maximize2, Minimize2, Menu,
} from 'lucide-react';
import { getActiveAccountId, setActiveAccountId } from '../../services/session.js';
import { conversationAPI } from '../../services/api.js';
import RecommendationPanel from './RecommendationPanel';

/* ──────────────────────────────────────────────────────────────────────
   BLOCK RENDERERS
   ─────────────────────────────────────────────────────────────────── */

const ThinkingBlock = memo(function ThinkingBlock({ text, isActive }) {
  const [expanded, setExpanded] = useState(isActive);
  if (!text) return null;
  if (isActive) {
    return (
      <div className="flex items-start gap-2.5 py-1.5">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-md bg-amber-50 flex items-center justify-center">
            <Brain size={11} className="text-amber-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Reasoning</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </span>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed italic font-medium">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 py-1 text-[10px] text-slate-400 hover:text-amber-600 transition-colors group">
      <Brain size={10} className="group-hover:text-amber-500 transition-colors" />
      <span className="font-semibold uppercase tracking-wider">Reasoning</span>
      <ChevronRight size={10} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
    </button>
  );
});

const ToolBlock = memo(function ToolBlock({ block }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = block.status === 'running';
  const isComplete = block.status === 'complete';
  const isFailed = block.status === 'failed';
  return (
    <button onClick={() => setExpanded(!expanded)}
      className={`w-full text-left my-1.5 rounded-lg border overflow-hidden transition-all duration-150 ${
        isRunning ? 'border-blue-200 bg-blue-50/40' :
        isFailed   ? 'border-red-100 bg-red-50/30' :
                     'border-slate-200 bg-slate-50/60'
      }`}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        {isRunning  && <Loader2 size={12} className="animate-spin text-blue-500 flex-shrink-0" />}
        {isComplete && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />}
        {isFailed   && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
        {!isRunning && !isComplete && !isFailed && <Terminal size={12} className="text-slate-300 flex-shrink-0" />}
        <span className={`text-[11px] font-semibold truncate ${isRunning ? 'text-blue-700' : 'text-slate-700'}`}>
          {block.tool}
        </span>
        {isRunning  && <span className="text-[9px] font-medium text-blue-500 flex-shrink-0 animate-pulse ml-auto">running</span>}
        {isComplete && <span className="text-[9px] font-medium text-emerald-600 flex-shrink-0 ml-auto">done</span>}
        {isFailed   && <span className="text-[9px] font-medium text-red-500 flex-shrink-0 ml-auto">failed</span>}
        <ChevronDown size={10} className={`text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="px-3 pb-2.5 space-y-2 border-t border-slate-100 pt-2">
          {block.args && (
            <div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">Arguments</span>
              <pre className="text-[10px] bg-white border border-slate-100 text-slate-600 p-2 rounded font-mono leading-relaxed overflow-x-auto">
                {JSON.stringify(block.args, null, 2)}
              </pre>
            </div>
          )}
          {block.output && (
            <div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">Result</span>
              <pre className="text-[10px] text-slate-600 bg-white border border-slate-100 p-2 rounded font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {String(block.output)}
              </pre>
            </div>
          )}
        </div>
      )}
    </button>
  );
});

const DataBlock = memo(function DataBlock({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className="my-3 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50/80 border-b border-slate-100">
        <BarChart3 size={11} className="text-slate-400" />
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Data</span>
        <span className="text-[9px] text-slate-300 ml-auto">{data.length} rows</span>
      </div>
      <div className="overflow-x-auto max-h-[260px]">
        <table className="min-w-full text-[12px]">
          <thead><tr className="border-b border-slate-50">
            {headers.map(h => (
              <th key={h} className="px-3.5 py-2 text-left text-[9px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                {h.replace(/_/g, ' ')}
              </th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-3.5 py-2 text-slate-700 whitespace-nowrap font-medium tabular-nums">
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
  function fixTableFormatting(input) {
    if (!input || typeof input !== 'string') return input;
    const pipeSegments = input.match(/\|[^|\n]+\|/g);
    if (!pipeSegments || pipeSegments.length < 3) return input;
    if (/\|\s*\n/.test(input)) return input;
    return input.replace(/(\|\s+)(?=\|)/g, '$&\n');
  }
  return (
    <div className="text-[14px] text-slate-700 leading-relaxed max-w-none markdown-chat">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{fixTableFormatting(text)}</ReactMarkdown>
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
      <div className="flex w-full mb-6 justify-end">
        <div className="max-w-[70%] px-5 py-3 bg-[#345C86] text-white rounded-2xl rounded-br-md text-[14px] leading-relaxed shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full mb-8 justify-start">
      <div className="flex gap-3.5 w-full max-w-[90%]">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm mt-0.5">
          <Sparkles size={12} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0 border-l-2 border-amber-400/30 pl-4">
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

export default function ChatInterface({ activeConversationId = null, onConversationCreated = null, isFullscreen = false, onToggleFullscreen = null, onMenuClick = null }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(activeConversationId);
  const sessionIdRef = useRef(crypto.randomUUID?.() ?? ('session-' + Date.now()));
  const threadIdRef = useRef(null);
  const busyRef = useRef(false);
  const streamAbortControllerRef = useRef(null);
  const streamReaderRef = useRef(null);
  const streamingConversationIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [extractionSkipped, setExtractionSkipped] = useState(false);
  const [sseRecommendations, setSseRecommendations] = useState(null);
  const [commandInfo, setCommandInfo] = useState(null); // {name, args, sections} from /command SSE events
  const selfCreatedConvRef = useRef(false);

  /* ── Init ─────────────────────────────────────────────────────────── */
  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => { conversationIdRef.current = activeConversationId; }, [activeConversationId]);

  // A stream can outlive this component when the user navigates away. Abort the
  // HTTP request and release the reader so the browser and server can stop work.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      streamAbortControllerRef.current?.abort();
      void streamReaderRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      streamingConversationIdRef.current &&
      activeConversationId !== streamingConversationIdRef.current
    ) {
      streamAbortControllerRef.current?.abort();
      void streamReaderRef.current?.cancel();
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) { setMessages([]); threadIdRef.current = null; setSseRecommendations(null); return; }
    if (selfCreatedConvRef.current) { selfCreatedConvRef.current = false; return; }
    let cancelled = false;
    setMessagesLoading(true);
    setSseRecommendations(null);
    conversationAPI.get(activeConversationId, getActiveAccountId()).then(data => {
      if (cancelled) return;
      if (data.thread_id) threadIdRef.current = data.thread_id;
      setMessages((data.messages || []).map(m => toBlocks(m)));
      setMessagesLoading(false);
    }).catch(err => { if (!cancelled) { console.error(err); setMessagesLoading(false); } });
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
    return { id: m.id, role: m.role, content: m.content, blocks };
  }

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const url = (import.meta.env.VITE_API_BASE_URL || '') + '/api/analytics/meta/accounts' || '/api/analytics/meta/accounts';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.data || []);
        if (data.data?.length > 0) setActiveAccountId(data.data[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingAccounts(false); }
  }, []);

  const isNearBottom = useRef(true);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    if (isNearBottom.current && scrollRef.current) {
      if (scrollRef.current) requestAnimationFrame(() => { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
    }
  }, [messages]);

  useEffect(() => {
    if (activeConversationId) {
      isNearBottom.current = true;
      if (scrollRef.current) requestAnimationFrame(() => { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
    }
  }, [activeConversationId]);

  /* ── performSearch ────────────────────────────────────────────────── */
  const performSearch = useCallback(async (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;
    setIsStreaming(true);
    setExtractionSkipped(false);
    setCommandInfo(null);

    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    let convId = conversationIdRef.current;
    if (!convId) {
      try {
        const conv = await conversationAPI.create(getActiveAccountId(), trimmed.slice(0, 100), sessionIdRef.current);
        convId = conv.id;
        conversationIdRef.current = convId;
        threadIdRef.current = conv.thread_id || sessionIdRef.current;
        streamingConversationIdRef.current = convId;
        selfCreatedConvRef.current = true;
        if (onConversationCreated) onConversationCreated(conv);
      } catch (e) { console.error('Failed to create conversation:', e); }
    }
    streamingConversationIdRef.current = convId;

    const streamId = 'stream-' + Date.now();
    const streamRef = {
      id: streamId, role: 'ai', thinking: '', thinkingDone: false,
      items: [], currentText: '',
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
    const abortController = new AbortController();
    streamAbortControllerRef.current = abortController;
    let reader = null;
    let renderFrame = null;
    let renderQueued = false;
    const renderStream = () => {
      if (!isMountedRef.current) return;
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.id === streamId) copy[copy.length - 1] = { ...streamRef, blocks: buildBlocks() };
        return copy;
      });
    };
    const scheduleStreamRender = () => {
      if (renderQueued) return;
      renderQueued = true;
      renderFrame = requestAnimationFrame(() => {
        renderQueued = false;
        renderStream();
      });
    };
    try {
      const apiUrl = (import.meta.env.VITE_API_BASE_URL || '') + '/api/agent/chat' || '/api/agent/chat';
      const res = await fetch(apiUrl, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, session_id: threadIdRef.current || sessionIdRef.current }),
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      reader = res.body.getReader();
      streamReaderRef.current = reader;
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const evt of sseLines(decoder.decode(value, { stream: true }), sseBuf)) {
          if (evt === '__DONE__') break;
          const etype = evt.type;
          if (etype === 'thinking') { streamRef.thinking += ' ' + (evt.content || ''); continue; }
          if (etype === 'text') { streamRef.thinkingDone = true; streamRef.currentText += (evt.content || ''); continue; }
          if (etype === 'tool_call') {
            streamRef.thinkingDone = true; flushCurrentText();
            streamRef.items.push({ type: 'tool', id: evt.id || ('t-' + Math.random().toString(36).slice(2)), tool: evt.tool || evt.name || 'Tool', args: evt.args || null, status: 'running', output: null });
            continue;
          }
          if (etype === 'tool_output') {
            const tIdx = streamRef.items.findLastIndex(b => b.type === 'tool' && b.id === evt.id);
            if (tIdx >= 0) streamRef.items[tIdx] = { ...streamRef.items[tIdx], status: 'complete', output: evt.content };
            continue;
          }
          if (etype === 'data') { flushCurrentText(); if (Array.isArray(evt.content)) streamRef.items.push({ type: 'data', data: evt.content }); continue; }
          if (etype === 'recommendations') {
            streamRef.thinkingDone = true; flushCurrentText();
            if (evt.items && Array.isArray(evt.items)) setSseRecommendations(evt.items);
            continue;
          }
          if (etype === 'extraction_skipped') { setExtractionSkipped(true); continue; }
          if (etype === 'command_start') { setCommandInfo({ name: evt.command, args: evt.args, sections: null }); continue; }
          if (etype === 'command_complete') { setCommandInfo(prev => (prev ? { ...prev, sections: evt.sections || [] } : prev)); continue; }
          if (etype === 'error' || evt.error) { streamRef.thinkingDone = true; flushCurrentText(); continue; }
        }
        scheduleStreamRender();
      }
      flushCurrentText();
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      renderStream();
    } catch (err) {
      flushCurrentText();
      if (err.name !== 'AbortError' && err.message && !err.message.includes('Server Error')) {
        streamRef.currentText += '> ' + (err.message || 'Connection failed');
      }
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      renderStream();
    } finally {
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      if (streamReaderRef.current === reader) streamReaderRef.current = null;
      if (streamAbortControllerRef.current === abortController) streamAbortControllerRef.current = null;
      streamingConversationIdRef.current = null;
      busyRef.current = false;
      if (isMountedRef.current) setIsStreaming(false);
    }
  }, [onConversationCreated]);

  /* ── Input handlers ───────────────────────────────────────────────── */
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

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="w-full bg-slate-50 flex flex-col selection:bg-amber-100 selection:text-amber-900 h-full overflow-hidden" style={{ fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif" }}>

      <div className="flex-1 w-full flex flex-col relative overflow-hidden">

        {/* Header — slim */}
        <div className="flex justify-between items-center py-2.5 px-5 md:px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Conversations"
              >
                <Menu size={18} />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#345C86] shadow-sm">
              <Cpu size={13} className="text-white" />
            </div>
            <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Analytics Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <select
                className="appearance-none bg-slate-100 border-0 rounded-full px-3.5 py-1.5 pr-8 text-[12px] font-medium text-slate-600 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-slate-200 cursor-pointer disabled:opacity-50"
                value={selectedAccount?.id || ''}
                onChange={handleAccountChange}
                disabled={isLoadingAccounts || busyRef.current}
              >
                <option value="" disabled>Select account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Chat + Panel */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Chat column: messages + input stacked vertically */}
          <div className="flex-1 flex flex-col min-w-0">
            <div ref={scrollRef} onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 md:px-8 py-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent relative">

              {messagesLoading && (
                <div className={`z-30 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm ${
                  isFullscreen ? 'fixed inset-0' : 'absolute inset-0'
                }`}>
                  <Loader2 size={24} className="animate-spin text-slate-400 mb-3" />
                  <p className="text-[13px] font-medium text-slate-500">Opening conversation…</p>
                </div>
              )}

              {!messagesLoading && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#345C86] flex items-center justify-center shadow-md">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight">How can I help?</h3>
                  <p className="text-slate-500 text-[14px] leading-relaxed">
                    Query your campaigns, run diagnostics, and get AI-powered recommendations.
                  </p>
                </div>
              )}

              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

              {/* Streaming indicator — spinner alongside agent response */}
              {isStreaming && (
                <div className="flex w-full mb-8 justify-start">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm opacity-0" />
                    <div className="border-l-2 border-amber-400/30 pl-4 py-1 space-y-1.5">
                      {commandInfo?.name && !commandInfo.sections && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1 text-[11px] font-semibold">
                          <Sparkles size={11} className="animate-pulse" />
                          Running /{commandInfo.name}
                          {commandInfo.args ? <span className="font-normal text-amber-600 truncate max-w-[40ch]">— {String(commandInfo.args)}</span> : null}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input — under chat area only */}
            <div className="px-5 md:px-8 py-3.5 bg-gradient-to-t from-slate-50 via-white to-white border-t border-slate-100">
              <div className="max-w-3xl mx-auto">
                <div className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-3xl py-1.5 pl-5 pr-1.5 shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-200">
                  <textarea ref={inputRef} value={query}
                    onChange={handleInputChange} onKeyDown={handleKeyDown}
                    placeholder={busyRef.current ? "Agent is responding…" : "Ask anything about your ad account…"}
                    className="flex-1 bg-transparent border-none outline-none py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 resize-none max-h-32 min-h-[40px]"
                    rows={1} disabled={busyRef.current} />
                  <button onClick={handleSearch}
                    disabled={!query.trim() || busyRef.current}
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 self-end flex-shrink-0 ${
                      !query.trim() || busyRef.current
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#345C86] text-white hover:bg-[#2a4a6e] active:scale-95 shadow-sm'
                    }`}>
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-center mt-2 text-[10px] text-slate-400">AI can make mistakes. Verify important data.</p>
              </div>
            </div>
          </div>

          {activeConversationId && (
            <div className={`w-auto flex-shrink-0 border-l border-slate-200 bg-white ${isFullscreen ? 'block' : 'hidden xl:block'}`}>
              <RecommendationPanel
                conversationId={activeConversationId}
                accountId={accounts.length > 0 ? accounts[0]?.id : null}
                isStreaming={isStreaming}
                extractionSkipped={extractionSkipped}
                sseRecommendations={sseRecommendations}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Search,
  Mic
} from 'lucide-react';

/**
 * Premium Data Table Component
 * Handles large datasets with horizontal scrolling and sticky headers.
 */
const DataTable = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="my-6 border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden group">
      <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-[13px]">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-[10px] whitespace-nowrap italic">
                  {h.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-4 py-2.5 text-slate-700 font-medium truncate max-w-[250px]" title={String(row[h])}>
                    {String(row[h] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {data.length} Rows Retrieved
        </span>
      </div>
    </div>
  );
};

/**
 * Formatted SQL Block
 */
const SQLBlock = ({ query }) => {
  if (!query) return null;
  return (
    <div className="my-4 bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-xl group">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
          <Code2 size={12} className="text-blue-400" />
          Analytics SQL Generator
        </div>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-emerald-400/90 whitespace-pre">
        {query}
      </div>
    </div>
  );
};

/**
 * Step Card Component
 * Visualizes a single tool execution step in the reasoning chain.
 */
const StepCard = ({ step, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = step.status || 'complete'; // pending, running, complete, failed

  const getStatusIcon = () => {
    switch (status) {
      case 'running': return <Loader2 size={14} className="animate-spin text-blue-500" />;
      case 'complete': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'failed': return <AlertCircle size={14} className="text-rose-500" />;
      default: return <PlayCircle size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className={`mb-3 border rounded-xl transition-all duration-300 ${isExpanded ? 'bg-white shadow-md border-slate-200' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
      }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 outline-none"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-[11px] font-bold text-[#062a74] uppercase tracking-wider text-left">
            {step.tool || 'Analyzing context...'}
          </span>
          {status === 'running' && (
            <span className="ml-2 flex gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </span>
          )}
        </div>
        <div className="text-slate-400 group-hover:text-[#062a74] transition-colors flex-shrink-0">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 overflow-hidden">
          {step.args && (
            <div className="mb-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Parameters</label>
              <pre className="text-[12px] bg-slate-900 text-slate-300 p-2 rounded-lg overflow-x-auto shadow-inner">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          {step.output && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Result Output</label>
              {typeof step.output === 'string' ? (
                <div className="text-[12px] text-slate-600 bg-white border border-slate-100 p-2 rounded-lg italic">
                  {step.output}
                </div>
              ) : (
                <pre className="text-[12px] bg-slate-50 border border-slate-100 p-2 rounded-lg overflow-x-auto text-slate-600">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main Chat Interface
 */
function ChatInterface() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);

  const scrollRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Initialize Session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }, []);

  // Auto Scroll
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isThinking) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmedQuery };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsThinking(true);

    // Initial state for AI message
    const aiMsgId = Date.now() + 1;
    let currentAiMsg = {
      id: aiMsgId,
      role: 'ai',
      thinking: '',
      reasoning: '',
      content: '',
      steps: [], // Live execution trace
      sql: null,
      data: null,
      error: null
    };

    setStreamingMessage(currentAiMsg);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agent/chat`
        : '/api/agent/chat';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmedQuery,
          session_id: sessionIdRef.current
        })
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
          if (rawData === '[DONE]') break;

          try {
            const data = JSON.parse(rawData);

            // Handle Type System from Backend Audit
            switch (data.type) {
              case 'thinking':
                currentAiMsg.thinking += data.content;
                break;

              case 'text':
                if (data.is_reasoning) {
                  currentAiMsg.reasoning += data.content;
                } else {
                  currentAiMsg.content += data.content;
                  setIsThinking(false);
                }
                break;

              case 'tool_call':
                // Push a new step to the trace
                currentAiMsg.steps.push({
                  id: Date.now(),
                  tool: data.tool,
                  args: data.args,
                  status: 'running',
                  output: null
                });
                setIsThinking(false);
                break;

              case 'tool_output':
                // Update the last tool call status and output
                if (currentAiMsg.steps.length > 0) {
                  const lastStep = currentAiMsg.steps[currentAiMsg.steps.length - 1];
                  lastStep.status = 'complete';
                  lastStep.output = data.content;
                }
                break;

              case 'sql':
                currentAiMsg.sql = data.content;
                // Add implicit step if not already tracked
                if (!currentAiMsg.steps.find(s => s.tool === 'SQL Generation')) {
                  currentAiMsg.steps.push({
                    id: 'sql-gen',
                    tool: 'SQL Generation',
                    status: 'complete',
                    output: 'Query compiled successfully'
                  });
                }
                break;

              case 'data':
                currentAiMsg.data = data.content;
                // If it's the result of the last step, finalize it
                if (currentAiMsg.steps.length > 0) {
                  const lastStep = currentAiMsg.steps[currentAiMsg.steps.length - 1];
                  lastStep.status = 'complete';
                }
                break;

              case 'error':
                currentAiMsg.error = data.error || data.content;
                if (currentAiMsg.steps.length > 0) {
                  currentAiMsg.steps[currentAiMsg.steps.length - 1].status = 'failed';
                }
                break;

              default:
                // Special case for direct error object
                if (data.error) currentAiMsg.error = data.error;
            }

            // High-fidelity update
            setStreamingMessage({ ...currentAiMsg });

          } catch (e) {
            console.warn('Parsing error:', e, rawData);
          }
        }
      }

      // Finalize message transfer
      setMessages(prev => [...prev, { ...currentAiMsg }]);
      setStreamingMessage(null);
      setIsThinking(false);

    } catch (err) {
      currentAiMsg.error = err.message;
      setMessages(prev => [...prev, { ...currentAiMsg, isError: true }]);
      setStreamingMessage(null);
      setIsThinking(false);
    }
  };

  const MessageBubble = ({ msg, isStreaming = false }) => {
    const isUser = msg.role === 'user';

    return (
      <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
        <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${isUser ? 'bg-[#062a74] text-white' : 'bg-[#fff] border border-slate-200'
            }`}>
            {isUser ? <User size={18} /> : <img src="/ai 2.png" alt="AI" className="w-5 h-5 object-contain" />}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4 overflow-hidden">
            <div className={`px-5 py-4 rounded-2xl shadow-sm text-[15.5px] leading-relaxed relative ${isUser
              ? 'bg-[#062a74] text-white rounded-tr-sm'
              : 'bg-white border border-slate-100 text-[#062a74] rounded-tl-sm'
              }`}>
              {isUser ? (
                msg.content
              ) : (
                <div className="prose prose-sm max-w-none text-inherit">
                  {/* Progressive Execution Trace */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div className="my-6">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#062a74]/40 mb-3 ml-1 italic">
                        Execution Trace
                      </div>
                      {msg.steps.map((step, idx) => (
                        <StepCard key={step.id || idx} step={step} isLast={idx === msg.steps.length - 1} />
                      ))}
                    </div>
                  )}

                  {/* SQL Block */}
                  {msg.sql && <SQLBlock query={msg.sql} />}

                  {/* Data Result Table */}
                  {msg.data && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-200 overflow-hidden">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#062a74]/60 mb-2 ml-1">
                        <BarChart3 size={12} className="text-blue-600" />
                        Retrieved Analytics
                      </div>
                      <DataTable data={msg.data} />
                    </div>
                  )}

                  {/* Main Answer / Simple Response */}
                  {(msg.content || (msg.reasoning && !msg.sql && !msg.data && msg.steps?.length === 0)) && (
                    <div className={`${msg.content ? 'mt-8 pt-6 border-t border-slate-100' : ''}`}>
                      {msg.content && (
                        <div className="text-[12px] font-black uppercase tracking-widest text-[#062a74] mb-4 flex items-center gap-3">
                          <div className="h-0.5 w-6 bg-blue-600 rounded-full"></div>
                          Agent Synthesis
                        </div>
                      )}
                      <div className="text-[#062a74] leading-relaxed font-medium break-words">
                        <ReactMarkdown
                          components={{
                            h4: ({ node, ...props }) => <h4 className="text-[13px] font-bold mt-6 mb-2 uppercase text-blue-900/70" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-2 list-none flex items-start gap-2" {...props}>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mt-2 flex-shrink-0"></div>
                              <span>{props.children}</span>
                            </li>,
                            strong: ({ node, ...props }) => <strong className="font-bold text-blue-900" {...props} />
                          }}
                        >
                          {msg.content || msg.reasoning}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Error Notification */}
                  {msg.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                      <AlertCircle size={18} />
                      <div className="text-[13px] font-semibold">{msg.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-10 mb-12 flex flex-col h-[650px] min-h-[600px]">

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bot size={20} className="text-[#062a74]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#062a74]">Marketing Analyst Subagent</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">V1.0.0 • Connected to analytics.db</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            Active Session
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#e2e8f0] flex-1 flex flex-col overflow-hidden relative group/chat">

        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 bg-slate-50/20 scrollbar-thin scrollbar-thumb-slate-200"
        >
          {messages.length === 0 && !streamingMessage && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shadow-inner group-hover/chat:scale-110 transition-transform duration-500">
                <Bot size={40} className="text-[#062a74]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#062a74] mb-3 tracking-tight">Performance Deep-Dive</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">
                  I'm your Meta Ads diagnostic engine. I can scan account health,
                  detect creative fatigue, and generate custom SQL insights.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full">
                {[
                  "Why did my ROAS drop last week?",
                  "Scan all campaigns for creative fatigue",
                  "Compare TOFU vs BOFU efficiency drivers"
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold text-[#062a74] hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center justify-between group/prompt"
                  >
                    {prompt}
                    <PlayCircle size={16} className="text-slate-300 group-hover/prompt:text-blue-500 group-hover/prompt:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {streamingMessage && <MessageBubble msg={streamingMessage} isStreaming={true} />}
        </div>

        {/* Interactive Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 relative">
          <div className="max-w-[1000px] mx-auto">
            <div className="relative flex items-center gap-4 bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-[20px] p-2 pl-6 shadow-sm focus-within:shadow-md focus-within:border-blue-300 focus-within:bg-white transition-all group/input">
              <Search size={18} className="text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask for an account diagnosis..."
                className="flex-1 bg-transparent border-none outline-none py-3 text-[16px] font-medium text-[#062a74] placeholder:text-slate-400"
                disabled={isThinking}
              />

              <div className="flex items-center gap-2">
                <button className="hidden md:flex w-10 h-10 items-center justify-center text-slate-400 hover:text-[#062a74] transition-colors rounded-xl">
                  <Mic size={18} />
                </button>
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isThinking}
                  className={`flex items-center justify-center w-[52px] h-[52px] rounded-xl transition-all duration-500 ${!query.trim() || isThinking
                    ? 'bg-slate-200 text-slate-400 grayscale'
                    : 'bg-[#062a74] text-white shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95'
                    }`}
                >
                  <Send size={20} className={isThinking ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Meta */}
      <div className="mt-6 flex justify-center gap-8 items-center opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#062a74]">
          <Database size={12} /> Analytics SQL Optimized
        </div>
        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#062a74]">
          <BarChart3 size={12} /> Predictive Models Ready
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;


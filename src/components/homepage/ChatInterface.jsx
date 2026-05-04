import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  User,
  Database,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BarChart3,
  Terminal,
  Cpu,
  CornerDownRight,
  Sparkles
} from 'lucide-react';

/**
 * Minimal Data Table Component
 */
const DataTable = ({ data }) => {
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
};

/**
 * Minimal SQL Block
 */
const SQLBlock = ({ query }) => {
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
};

/**
 * Minimal Step Card Component
 */
const StepCard = ({ step }) => {
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
};

export default function ChatInterface() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);

  const scrollRef = useRef(null);
  const sessionIdRef = useRef(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID ? crypto.randomUUID() : 'session-' + Date.now();
    }
  }, []);

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

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setIsThinking(true);

    const aiMsgId = Date.now() + 1;
    let currentAiMsg = {
      id: aiMsgId,
      role: 'ai',
      thinking: '',
      reasoning: '',
      content: '',
      steps: [],
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

              case 'tool_call': {
                const stepId = data.id || `step-${Date.now()}`;
                const existingStep = currentAiMsg.steps.find(s => s.id === stepId);
                if (!existingStep) {
                  currentAiMsg.steps.push({
                    id: stepId,
                    tool: data.tool,
                    args: data.args,
                    status: 'running',
                    output: null
                  });
                }
                setIsThinking(false);
                break;
              }

              case 'tool_output': {
                const stepId = data.id;
                const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
                if (stepIndex !== -1) {
                  currentAiMsg.steps[stepIndex].status = 'complete';
                  currentAiMsg.steps[stepIndex].output = data.content;
                }
                break;
              }

              case 'sql': {
                currentAiMsg.sql = data.content;
                const stepId = data.id || 'sql-gen';
                if (!currentAiMsg.steps.find(s => s.id === stepId)) {
                  currentAiMsg.steps.push({
                    id: stepId,
                    tool: 'SQL Generation',
                    status: 'complete',
                    output: 'Query compiled successfully'
                  });
                }
                break;
              }

              case 'data': {
                currentAiMsg.data = data.content;
                const stepId = data.id;
                const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
                if (stepIndex !== -1) {
                  currentAiMsg.steps[stepIndex].status = 'complete';
                }
                break;
              }

              case 'error': {
                currentAiMsg.error = data.error || data.content;
                const stepId = data.id;
                if (stepId) {
                  const stepIndex = currentAiMsg.steps.findIndex(s => s.id === stepId);
                  if (stepIndex !== -1) {
                    currentAiMsg.steps[stepIndex].status = 'failed';
                  }
                }
                break;
              }
              default:
                if (data.error) currentAiMsg.error = data.error;
            }

            setStreamingMessage({ ...currentAiMsg });

          } catch (e) {
            console.warn('Parsing error:', e, rawData);
          }
        }
      }

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

  const MessageBubble = ({ msg }) => {
    const isUser = msg.role === 'user';

    if (isUser) {
      return (
        <div className="flex w-full mb-8 justify-end animate-in fade-in duration-300">
          <div className="max-w-2xl px-5 py-3.5 bg-gray-100 rounded-[20px] text-[15px] leading-relaxed text-gray-800 shadow-sm border border-gray-200">
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex w-full mb-10 justify-start animate-in fade-in duration-500">
        <div className="flex gap-4 w-full max-w-4xl">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm mt-1">
            <Sparkles size={14} className="text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="w-full">
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#FAFAFA] flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 h-[500px] border border-gray-200 rounded-[24px] shadow-sm mt-2 mb-8 overflow-hidden">
      <div className="flex-1 w-full flex flex-col h-full relative">

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
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          >
            {messages.length === 0 && !streamingMessage && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">

                <div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-2 tracking-tight">How can I help?</h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed">
                    Query data, run diagnostics, and fetch reports.
                  </p>
                </div>
              </div>
            )}

            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {streamingMessage && <MessageBubble msg={streamingMessage} />}

            {isThinking && (
              <div className="flex w-full mb-8 justify-start animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 shadow-sm mt-1">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/*  */}
          <div className="p-4 md:p-6 bg-white border-t border-gray-100">
            <div className="max-w-3xl mx-auto relative">
              <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-[24px] p-2 pl-6 shadow-sm transition-all focus-within:shadow-md focus-within:border-gray-300">
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none max-h-32 min-h-[44px]"
                  rows={1}
                  disabled={isThinking}
                />

                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isThinking}
                  className={`flex items-center justify-center w-10 h-10 mb-0.5 rounded-full transition-all duration-300 self-end ${!query.trim() || isThinking
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95'
                    }`}
                >
                  <Send size={16} className={isThinking ? 'animate-pulse translate-x-0.5' : 'translate-x-0.5'} />
                </button>
              </div>
              <div className="text-center mt-3">
                <p className="text-[11px] text-gray-400">AI can make mistakes. Verify important data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

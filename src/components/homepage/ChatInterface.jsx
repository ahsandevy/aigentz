import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const DataTable = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto my-4 border border-gray-100 rounded-xl shadow-sm bg-white/50">
      <table className="min-w-full divide-y divide-gray-200 text-[13px]">
        <thead>
          <tr className="bg-slate-50/50">
            {headers.map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
              {headers.map(h => (
                <td key={h} className="px-4 py-2.5 text-slate-600 font-medium">{String(row[h] ?? '-')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DataInsightSection = ({ data }) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return <DataTable data={data} />;
  }

  const { summary, top_performers, bottom_performers } = data;
  const hasSummary = summary && Object.values(summary).some(v => v !== null && v !== undefined);
  const hasPerformers = (top_performers && top_performers.length > 0) || (bottom_performers && bottom_performers.length > 0);

  if (!hasSummary && !hasPerformers) return null;

  return (
    <div className="space-y-6 my-8">
      {hasSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(summary).map(([key, value]) => {
            if (value === null || value === undefined) return null;
            const label = key.replace(/_/g, ' ');
            const formattedValue = typeof value === 'number' 
              ? value > 1000 ? value.toLocaleString() : value.toFixed(2)
              : value;
            
            return (
              <div key={key} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">{label}</div>
                <div className="text-xl font-bold text-[#062a74] tracking-tight">{formattedValue}</div>
              </div>
            );
          })}
        </div>
      )}

      {top_performers && top_performers.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-emerald-600 mb-4 tracking-widest uppercase">Top Performers</div>
          <DataTable data={top_performers} />
        </div>
      )}

      {bottom_performers && bottom_performers.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-rose-600 mb-4 tracking-widest uppercase">Underperforming</div>
          <DataTable data={bottom_performers} />
        </div>
      )}
    </div>
  );
};

const ReasoningSection = ({ content }) => {
  if (!content) return null;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 outline-none ${
          isOpen 
          ? 'bg-[#062a74] text-white shadow-[0_8px_20px_rgba(6,42,116,0.25)]' 
          : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-[#062a74] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] active:scale-95'
        }`}
      >
        <div className="relative h-2 w-2 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full opacity-40 ${isOpen ? 'bg-amber-400 animate-ping' : ''}`}></div>
          <div className={`relative h-1.5 w-1.5 rounded-full transition-colors duration-500 ${isOpen ? 'bg-amber-400' : 'bg-slate-300 group-hover:bg-blue-400'}`}></div>
        </div>
        
        {isOpen ? 'Close Logic' : 'View Logic'}
        
        <svg 
          width="10" height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform duration-500 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-3 p-4 text-[13px] text-slate-500 bg-slate-50/50 rounded-xl border border-slate-100 leading-relaxed italic">
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              strong: ({ node, ...props }) => {
                const isTool = String(props.children).includes('Using Tool:');
                if (isTool) {
                  return (
                    <span className="block text-[#062a74] font-bold uppercase text-[10px] mb-2 tracking-wider">
                      • {props.children}
                    </span>
                  );
                }
                return <strong className="font-bold text-slate-700" {...props} />;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const REASONING_TAG = '[REASONING]';
const INSIGHTS_TAG = '[INSIGHTS]';

const stripInternalMetadata = (text) => {
  if (!text) return '';

  let cleaned = text;
  // Strip common technical argument patterns
  cleaned = cleaned.replace(/days\s*\d+|top_n\s*\d+/gi, '');
  cleaned = cleaned.replace(/["']?natural_language_query["']?:?\s*/gi, '');
  cleaned = cleaned.replace(/["']?original_user_query["']?:?\s*/gi, '');
  cleaned = cleaned.replace(/,\s*,/g, ','); // Clean up double commas
  cleaned = cleaned.replace(/^[\s,]+|[\s,]+$/g, ''); // Clean up leading/trailing punctuation
  
  return cleaned.trim();
};

const extractReasoningFromContent = (content) => {
  if (!content) return '';

  const reasoningIndex = content.indexOf(REASONING_TAG);
  if (reasoningIndex === -1) return '';

  const start = reasoningIndex + REASONING_TAG.length;
  const insightsIndex = content.indexOf(INSIGHTS_TAG, start);
  const end = insightsIndex !== -1 ? insightsIndex : content.length;

  return content.slice(start, end).trim();
};

const cleanInsightsContent = (content) => {
  if (!content) return '';

  const cleaned = content
    .replaceAll(REASONING_TAG, '')
    .replaceAll(INSIGHTS_TAG, '')
    .trim();

  return stripInternalMetadata(cleaned);
};

function ChatInterface() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)

  const hasStarted = messages.length > 0
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSearch = async () => {
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsThinking(true)

    // Prepare placeholder for AI response
    setMessages(prev => [...prev, { role: 'ai', content: '', reasoning: '', thinking: '', sql: null, data: null }])

    try {
      // Use a per-page-load session ID instead of persistent localStorage
      if (!window._agentSessionId) {
        window._agentSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      const sessionId = window._agentSessionId;

      const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const agentApiUrl = VITE_API_BASE_URL
        ? `${VITE_API_BASE_URL}/api/agent/chat`
        : import.meta.env.PROD
          ? 'http://localhost:8000/api/agent/chat'
          : '/api/agent/chat';

      const response = await fetch(agentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          session_id: sessionId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''
      let aiReasoning = ''
      let aiThinking = ''
      let hasReceivedToolOutput = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') continue

            try {
              const data = JSON.parse(dataStr)

              if (data.error) throw new Error(data.error)

              if (data.type === 'thinking') {
                aiThinking += data.content
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastIdx = newMessages.length - 1
                  if (lastIdx >= 0 && newMessages[lastIdx].role === 'ai') {
                    newMessages[lastIdx] = { ...newMessages[lastIdx], thinking: aiThinking }
                  }
                  return newMessages
                })
              } else if (data.type === 'sql') {
                setIsThinking(false)
                hasReceivedToolOutput = true
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastIdx = newMessages.length - 1
                  if (lastIdx >= 0 && newMessages[lastIdx].role === 'ai') {
                    newMessages[lastIdx] = { ...newMessages[lastIdx], sql: data.content }
                  }
                  return newMessages
                })
              } else if (data.type === 'data') {
                setIsThinking(false)
                hasReceivedToolOutput = true
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastIdx = newMessages.length - 1
                  if (lastIdx >= 0 && newMessages[lastIdx].role === 'ai') {
                    newMessages[lastIdx] = { ...newMessages[lastIdx], data: data.content }
                  }
                  return newMessages
                })
              } else if (data.type === 'tool_call') {
                const toolName = data.tool || data.content?.name || data.name;
                if (toolName) {
                  aiReasoning += `\n\n**Using Tool:** \`${toolName}\`\n\n`;
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const lastIdx = newMessages.length - 1
                    if (lastIdx >= 0 && newMessages[lastIdx].role === 'ai') {
                      newMessages[lastIdx] = { ...newMessages[lastIdx], reasoning: aiReasoning }
                    }
                    return newMessages
                  })
                }
              } else if (data.type === 'text') {
                setIsThinking(false)
                let text = data.content

                let reasoningChunk = ''
                let insightsChunk = ''

                const hasReasoningTag = text.includes(REASONING_TAG)
                const hasInsightsTag = text.includes(INSIGHTS_TAG)

                if (hasReasoningTag || hasInsightsTag) {
                  const reasoningIndex = hasReasoningTag ? text.indexOf(REASONING_TAG) : -1
                  const insightsIndex = hasInsightsTag ? text.indexOf(INSIGHTS_TAG) : -1

                  if (reasoningIndex !== -1) {
                    const start = reasoningIndex + REASONING_TAG.length
                    const end = insightsIndex !== -1 && insightsIndex > reasoningIndex ? insightsIndex : text.length
                    reasoningChunk = text.slice(start, end).trim()
                  }

                  if (insightsIndex !== -1) {
                    const start = insightsIndex + INSIGHTS_TAG.length
                    const end = text.length
                    insightsChunk = text.slice(start, end).trim()
                  }

                  if (insightsChunk) {
                    hasReceivedToolOutput = true
                  } else if (reasoningChunk) {
                    hasReceivedToolOutput = false
                  }
                } else {
                  // Fallback: use explicit backend flag if present, else use tool state
                  if (data.is_reasoning === true) {
                    reasoningChunk = text
                  } else if (data.is_reasoning === false) {
                    insightsChunk = text
                  } else {
                    if (!hasReceivedToolOutput) {
                      reasoningChunk = text
                    } else {
                      insightsChunk = text
                    }
                  }
                }

                aiReasoning += reasoningChunk
                aiContent += insightsChunk

                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastIdx = newMessages.length - 1
                  if (lastIdx >= 0 && newMessages[lastIdx].role === 'ai') {
                    newMessages[lastIdx] = {
                      ...newMessages[lastIdx],
                      content: aiContent,
                      reasoning: aiReasoning
                    }
                  }
                  return newMessages
                })
              }
            } catch (e) {
              console.error('Error parsing SSE data', e)
            }
          }
        }
      }
    } catch (error) {
      let errorMessage = 'Sorry, I encountered an error.'
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { role: 'ai', content: errorMessage, isError: true }
        return newMessages
      })
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`w-full max-w-[1370px] mx-auto px-4 md:px-8 mb-12 md:mb-16 transition-all duration-500 ease-in-out`}>
      <div className={`bg-white rounded-[17px] shadow-[2.008px_0.724px_10.042px_0px_rgba(0,0,0,0.1)] border border-[#d1d5db] overflow-hidden flex flex-col ${hasStarted ? 'h-[600px]' : 'h-auto'}`}>

        {hasStarted && (
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30 scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#062a74] text-white' : 'bg-[#f0f0bc]'}`}>
                    {msg.role === 'user' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    ) : (
                      <img src="/ai 2.png" alt="AI" className="w-5 h-5 object-contain" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-5 py-4 rounded-2xl text-[15.5px] leading-relaxed transition-all duration-300 ${msg.role === 'user'
                    ? 'bg-[#062a74] text-white rounded-tr-sm shadow-md'
                    : `bg-white border border-slate-100 text-[#062a74] rounded-tl-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] prose prose-sm max-w-none ${msg.isError ? 'text-red-500 border-red-200 bg-red-50' : ''}`
                    }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <>
                        <ReasoningSection content={stripInternalMetadata(msg.reasoning) || msg.thinking || extractReasoningFromContent(msg.content)} />

                        {msg.sql && (
                          <div className="mb-4 bg-slate-900 rounded-xl p-4 text-[13px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner">
                            <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 flex items-center gap-2">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                              </svg>
                              Generated SQL Query
                            </div>
                            {msg.sql}
                          </div>
                        )}

                        {msg.data && (
                          <div className="mb-4">
                            <div className="text-[10px] text-[#94a3b8] mb-2 uppercase tracking-widest font-bold flex items-center gap-2">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                              </svg>
                              Query Results
                            </div>
                            <DataInsightSection data={msg.data} />
                          </div>
                        )}

                        {msg.content && (
                          <div className="insights-section mt-10">
                            <div className="text-[11px] text-[#062a74] uppercase tracking-widest font-bold mb-6 flex items-center gap-3 border-b border-slate-100 pb-2">
                              AI Insights
                            </div>
                            
                            <div className="text-[15px] text-[#062a74]/90 leading-relaxed font-medium">
                              <ReactMarkdown 
                                components={{
                                  p: ({node, ...props}) => {
                                    const text = String(props.children);
                                    const isHeader = /^(Severity Level|Root Causes|Prioritized Recommendations|Executive Summary|Key Highlights)/i.test(text);
                                    if (isHeader) {
                                      return (
                                        <h4 className="text-[12px] font-bold text-[#062a74] mt-8 mb-4 uppercase tracking-wider">
                                          {text}
                                        </h4>
                                      );
                                    }
                                    return <p className="mb-4 last:mb-0" {...props} />;
                                  },
                                  strong: ({node, ...props}) => <strong className="font-bold text-[#062a74]" {...props} />,
                                  li: ({node, ...props}) => (
                                    <li className="mb-3 flex items-start gap-3">
                                      <div className="mt-2 w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></div>
                                      <span className="flex-1">{props.children}</span>
                                    </li>
                                  ),
                                  ul: ({node, ...props}) => <ul className="mb-6" {...props} />,
                                  ol: ({node, ...props}) => <ol className="mb-6 list-decimal ml-4" {...props} />,
                                }}
                              >
                                {cleanInsightsContent(msg.content)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator (Only show if isThinking is true AND we haven't started receiving tokens yet) */}
            {isThinking && messages.length > 0 && messages[messages.length - 1].content === '' && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%] w-full">
                  <div className="w-8 h-8 rounded-full bg-[#f0f0bc] flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  {messages[messages.length - 1].thinking ? (
                    <div className="bg-white border-2 border-amber-200/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center h-auto min-h-12 w-full animate-pulse transition-all">
                      <div className="text-[14px] text-amber-700/70 italic antialiased prose prose-sm max-w-none break-words w-full">
                        <ReactMarkdown>{messages[messages.length - 1].thinking + '...'}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
                      <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className={`bg-white border-t border-[#d1d5db] px-4 md:px-6 py-4 md:py-5 relative z-10 ${hasStarted ? '' : 'border-t-0'}`}>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex-shrink-0 text-[#062a74] hover:opacity-70 transition-opacity cursor-pointer">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasStarted ? "Reply..." : "Ask me about your performance..."}
              className="flex-1 bg-transparent border-none outline-none text-[#062a74] text-[15px] md:text-[18px] font-medium placeholder:text-[#062a74] placeholder:opacity-40"
              disabled={isThinking}
              autoFocus
            />

            <button
              onClick={handleSearch}
              disabled={!query.trim() || isThinking}
              className={`flex items-center justify-center w-[44px] h-[44px] rounded-xl transition-all duration-300 ${
                (!query.trim() || isThinking) 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#062a74] text-white shadow-[0_4px_12px_rgba(6,42,116,0.3)] hover:shadow-[0_6px_16px_rgba(6,42,116,0.4)] hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>

        {!hasStarted && (
          <div className="px-4 md:px-6 py-4 md:py-6 border-t border-[#d1d5db] bg-gray-50/50">
            <p className="text-[#062a74] text-[16px] md:text-[18px] font-semibold mb-3 md:mb-4">
              Try Asking...
            </p>
            <div className="space-y-2 md:space-y-3">
              <p
                onClick={() => setQuery("Why did ROAS dip in Q3?")}
                className="text-[#4b5563] text-[14px] md:text-[18px] font-normal cursor-pointer hover:text-[#062a74] hover:bg-white/50 p-1 rounded transition-colors"
              >
                Why did ROAS dip in Q3?
              </p>
              <p
                onClick={() => setQuery("Show me wasted spend by audience segment")}
                className="text-[#4b5563] text-[14px] md:text-[18px] font-normal cursor-pointer hover:text-[#062a74] hover:bg-white/50 p-1 rounded transition-colors"
              >
                Show me wasted spend by audience segment
              </p>
              <p
                onClick={() => setQuery("What happens if I shift 15% from Awareness to Retargeting")}
                className="text-[#4b5563] text-[14px] md:text-[18px] font-normal cursor-pointer hover:text-[#062a74] hover:bg-white/50 p-1 rounded transition-colors"
              >
                What happens if I shift 15% from Awareness to Retargeting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface

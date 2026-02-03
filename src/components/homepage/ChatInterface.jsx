import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const DataTable = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-[13px]">
        <thead>
          <tr className="bg-slate-50/80 backdrop-blur-sm">
            {headers.map(h => (
              <th key={h} className="px-5 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-[11px] border-b border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
              {headers.map(h => (
                <td key={h} className="px-5 py-3 text-slate-700 font-medium group-hover:text-[#062a74] transition-colors">{String(row[h])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReasoningSection = ({ content }) => {
  if (!content) return null;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 bg-amber-50/50 border border-amber-100 rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-[13px] font-semibold text-amber-700 hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7-7-7" />
            <path d="M5 19l7-7-7-7" />
          </svg>
          Reasoning & Strategy
        </div>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-[14px] text-amber-800/80 prose prose-sm max-w-none border-t border-amber-100 antialiased italic">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
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
    setMessages(prev => [...prev, { role: 'ai', content: '', reasoning: '', sql: null, data: null }])

    try {
      const STORAGE_KEY = 'agent_session_id';
      let sessionId = localStorage.getItem(STORAGE_KEY);
      if (!sessionId) {
        sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        localStorage.setItem(STORAGE_KEY, sessionId);
      }

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

              if (data.type === 'sql') {
                setIsThinking(false)
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
              } else if (data.type === 'text') {
                setIsThinking(false)
                let text = data.content

                // 1. Detect explicit markers from instructions
                if (text.includes('[REASONING]')) {
                  hasReceivedToolOutput = false; // Reset if we see explicit reasoning again
                  text = text.replace('[REASONING]', '').trim();
                }
                if (text.includes('[INSIGHTS]')) {
                  hasReceivedToolOutput = true;
                  text = text.replace('[INSIGHTS]', '').trim();
                }

                // 2. Use marker state or backend flag to decide placement
                if (!hasReceivedToolOutput && data.is_reasoning !== false) {
                  aiReasoning += text
                } else {
                  aiContent += text
                }

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
                  <div className={`px-4 py-3 rounded-2xl text-[15px] md:text-[16px] leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-[#062a74] text-white rounded-tr-sm'
                    : `bg-white border border-gray-200 text-[#062a74] rounded-tl-sm prose prose-sm max-w-none ${msg.isError ? 'text-red-500 border-red-200' : ''}`
                    }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <>
                        <ReasoningSection content={msg.reasoning} />

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
                            <DataTable data={msg.data} />
                          </div>
                        )}

                        {msg.content && (
                          <div className="insights-section mt-5 pt-5 border-t border-gray-100">
                            <div className="text-[10px] text-[#062a74] mb-3 uppercase tracking-[0.15em] font-black flex items-center gap-2 opacity-70">
                              <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full"></div>
                              AI Analysis & Insights
                            </div>
                            <div className="text-[15px] text-[#062a74] leading-relaxed">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
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
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[#f0f0bc] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img src="/ai 2.png" alt="AI" className="w-5 h-5 object-contain" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
                    <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#062a74] rounded-full animate-bounce"></div>
                  </div>
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
              className={`w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex-shrink-0 text-[#062a74] transition-all cursor-pointer ${(!query.trim() || isThinking) ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

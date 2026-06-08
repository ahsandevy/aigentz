import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Wrench,
  BarChart3,
  Brain,
  ArrowRight,
  Play,
  RefreshCw,
  Cpu,
} from 'lucide-react';

/**
 * Chat Demo v2 — Block-based content model.
 *
 * Every event (thinking, tool_call, tool_output, text, data, error)
 * appends to an ordered `blocks[]` array. Rendering just maps over
 * blocks in sequence — tools appear exactly where they were called,
 * interleaved naturally with text.
 */

// ─── Dummy timeline (interleaved order) ─────────────────────────────────
const DUMMY_TIMELINE = [
  // ── Thinking phase ────────────────────────────────────────────────
  { delay: 400,  btype: 'thinking', text: 'The user wants to analyze campaign performance.' },
  { delay: 500,  btype: 'thinking', text: 'I need to fetch active campaigns, check recent metrics, and identify underperformers for budget reallocation.' },
  { delay: 400,  btype: 'thinking', text: 'I should also look at ad set level data and creative performance.' },
  { delay: 300,  btype: 'thinking_done' },

  // ── First text → tool → text sequence ─────────────────────────────
  { delay: 200,  btype: 'text', text: "Let me pull up your active campaigns first.\n\n" },
  { delay: 100,  btype: 'tool_start', id: 't1', tool: 'get_campaigns', args: { days: 30, status: 'ACTIVE' } },
  { delay: 1000, btype: 'tool_end', id: 't1', output: '4 active campaigns: Prospecting US, Retargeting US, Brand Awareness, Lookalike EU' },
  { delay: 100,  btype: 'text', text: "Here's what I found — **4 active campaigns** with a combined daily spend of **$450**:\n\n" },

  // ── Inline markdown table ─────────────────────────────────────────
  { delay: 50,   btype: 'text', text:
    "| Campaign | Status | Budget |\n" +
    "|----------|--------|--------|\n" +
    "| Prospecting US | ✅ Active | $150/day |\n" +
    "| Retargeting US | ✅ Active | $80/day |\n" +
    "| Brand Awareness | ✅ Active | $100/day |\n" +
    "| Lookalike EU | ✅ Active | $120/day |\n\n"
  },

  // ── Another tool called mid-response ──────────────────────────────
  { delay: 150,  btype: 'text', text: "Now let me check the performance metrics for your top campaign.\n\n" },
  { delay: 100,  btype: 'tool_start', id: 't2', tool: 'get_campaign_insights', args: { campaign_id: '1234567890', metrics: ['roas', 'cpa', 'ctr', 'conversions'] } },
  { delay: 1200, btype: 'tool_end', id: 't2', output: 'ROAS: 3.2x · CPA: $14.50 · CTR: 1.8% · Conversions: 247 this week' },
  { delay: 100,  btype: 'text', text: "**Prospecting US** is performing well with a **3.2x ROAS** and **$14.50 CPA**. However, there's an opportunity:\n\n" },

  // ── Third tool call ───────────────────────────────────────────────
  { delay: 100,  btype: 'tool_start', id: 't3', tool: 'rank_entities_by_performance', args: { entity_type: 'adset', campaign_id: '1234567890', metric: 'roas', limit: 5 } },
  { delay: 1500, btype: 'tool_end', id: 't3', output: 'Top adset (Broad Interest): 4.1x ROAS. Bottom adset (Interest Stack): 1.2x ROAS. Spread: 2.9x.' },
  { delay: 100,  btype: 'text', text: "The ad set breakdown reveals a clear gap. The top ad set within Prospecting US delivers **4.1x ROAS** while the bottom one sits at **1.2x**:\n\n" },

  // ── Data table block ──────────────────────────────────────────────
  { delay: 50,   btype: 'data_table', data: [
    { 'Ad Set': 'Broad Interest', 'ROAS': '4.1x', 'Daily Spend': '$75', 'CPA': '$11.20', 'Status': '⭐ Top' },
    { 'Ad Set': 'Lookalike 3%',   'ROAS': '3.2x', 'Daily Spend': '$45', 'CPA': '$14.50', 'Status': 'Good' },
    { 'Ad Set': 'Custom Audience', 'ROAS': '2.1x', 'Daily Spend': '$30', 'CPA': '$22.00', 'Status': 'Average' },
    { 'Ad Set': 'Interest Stack',  'ROAS': '1.2x', 'Daily Spend': '$30', 'CPA': '$28.00', 'Status': '⚠️ Low' },
  ]},

  // ── Final recommendation ──────────────────────────────────────────
  { delay: 100,  btype: 'text', text: "\n\n**💡 Recommendation:** Reallocate **$20/day** from Interest Stack to Broad Interest. Based on current performance ratios, this could improve overall campaign ROAS by an estimated **15–18%** while maintaining the same total budget.\n\nWould you like me to generate a detailed budget reallocation plan?" },

  { delay: 100,  btype: 'done' },
];

// ═══════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS (one per block type, rendered in order)
// ═══════════════════════════════════════════════════════════════════════

function ThinkingBlock({ text, isActive }) {
  const [expanded, setExpanded] = useState(isActive);

  if (isActive) {
    return (
      <div className="flex items-start gap-2.5 py-2">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center">
            <Brain size={11} className="text-violet-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-widest">Reasoning</span>
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

  if (!text) return null;

  return (
    <div className="py-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-violet-500 transition-colors group"
      >
        <Brain size={10} className="group-hover:text-violet-400 transition-colors" />
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
}

function ToolBlock({ block }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = block.status === 'running';
  const isComplete = block.status === 'complete';

  return (
    <div className={`my-2 rounded-xl border overflow-hidden transition-all duration-200 ${
      isRunning ? 'border-blue-200 bg-blue-50/30 shadow-sm' :
      isComplete ? 'border-emerald-100 bg-emerald-50/20' :
      'border-gray-100 bg-white'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isRunning ? (
            <Loader2 size={13} className="animate-spin text-blue-500 flex-shrink-0" />
          ) : isComplete ? (
            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
          )}
          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Wrench size={10} className="text-gray-500" />
          </div>
          <span className="text-[12px] font-semibold text-gray-800 truncate">{block.tool}</span>
          {isRunning && (
            <span className="text-[10px] font-medium text-blue-500 flex-shrink-0 animate-pulse">running</span>
          )}
          {isComplete && (
            <span className="text-[10px] font-medium text-emerald-500 flex-shrink-0">done</span>
          )}
        </div>
        <ChevronDown size={12} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-gray-100 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
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
}

function DataBlock({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  // Render inline data table (not markdown — dedicated structured block)
  return (
    <div className="my-4 rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
        <BarChart3 size={12} className="text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Structured Data</span>
        <span className="text-[10px] text-gray-300 ml-auto">{data.length} rows</span>
      </div>
      <div className="overflow-x-auto max-h-[320px] scrollbar-thin scrollbar-thumb-gray-200">
        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-50">
              {headers.map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                    <CellContent value={row[h]} header={h} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellContent({ value, header }) {
  const s = String(value ?? '-');
  if (header === 'Status' || header === 'status') {
    const isGood = s.includes('Top') || s.includes('Good') || s.includes('Active');
    const isWarn = s.includes('Low') || s.includes('⚠️');
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        isGood ? 'bg-emerald-50 text-emerald-600' :
        isWarn ? 'bg-amber-50 text-amber-600' :
        'bg-gray-50 text-gray-500'
      }`}>
        {isWarn && <AlertCircle size={10} />}
        {s}
      </span>
    );
  }
  return s;
}

function TextBlock({ text }) {
  if (!text) return null;
  return (
    <div
      className="text-[15px] text-gray-800 leading-relaxed prose-p:mb-0 prose-ul:my-1 prose-ol:my-1"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  );
}

function ErrorBlock({ error }) {
  return (
    <div className="my-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-600">
      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
      <p className="text-[13px] font-medium leading-relaxed">{error}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MARKDOWN RENDERER (supports bold, italic, code, tables, lists, links)
// ═══════════════════════════════════════════════════════════════════════

function renderMarkdown(text) {
  let html = text;

  // Tables: matches markdown pipe tables
  html = html.replace(
    /\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)+)/g,
    (_, headerLine, bodyBlock) => {
      const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
      const rows = bodyBlock.trim().split('\n').filter(Boolean).map(row =>
        row.split('|').map(c => c.trim()).filter(Boolean)
      );
      let tbl = '<div class="my-4 rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">';
      tbl += '<table class="min-w-full text-[13px]"><thead><tr class="border-b border-gray-50">';
      headers.forEach(h => {
        tbl += `<th class="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/30">${h}</th>`;
      });
      tbl += '</tr></thead><tbody class="divide-y divide-gray-50">';
      rows.forEach((row, i) => {
        tbl += `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'} hover:bg-gray-50/60 transition-colors">`;
        row.forEach(cell => {
          tbl += `<td class="px-4 py-2.5 text-gray-700">${cell}</td>`;
        });
        tbl += '</tr>';
      });
      tbl += '</tbody></table></div>';
      return tbl;
    }
  );

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="text-gray-600">$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[13px] font-mono tracking-tight">$1</code>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline decoration-blue-200 hover:decoration-blue-400 transition-colors">$1</a>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-100" />');
  // Blockquotes
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote class="border-l-3 border-gray-200 pl-4 my-2 text-gray-500 italic">$1</blockquote>');
  // Line breaks → paragraphs
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    if (p.includes('<table') || p.includes('<div') || p.includes('<hr') || p.includes('<blockquote')) return p;
    if (p.trim() === '') return '';
    return p.replace(/\n/g, '<br/>');
  }).join('\n');

  return html;
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function ChatDemo() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const containerRef = useRef(null);

  // Collect thinking text across separate thinking events for the
  // collapsible ThinkingBlock (which renders as one unit).
  const thinkingText = useRef('');
  const thinkingActive = useRef(false);

  // ── Play the demo ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    thinkingText.current = '';
    thinkingActive.current = false;

    setMessages([{
      id: 'user-1',
      role: 'user',
      content: 'Analyze my campaign performance and suggest budget optimizations',
    }]);

    setStreaming({
      id: 'stream',
      role: 'ai',
      blocks: [],
    });

    let cancel = false;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function run() {
      await sleep(500);

      for (const event of DUMMY_TIMELINE) {
        if (cancel) return;
        await sleep(event.delay);

        setStreaming(prev => {
          if (!prev) return prev;
          const blocks = [...prev.blocks];

          switch (event.btype) {
            case 'thinking':
              thinkingText.current += ' ' + event.text;
              thinkingActive.current = true;
              // Update the thinking block in-place (coalesce multiple thinking events)
              const lastThinkIdx = blocks.findLastIndex(b => b.type === 'thinking');
              if (lastThinkIdx >= 0) {
                blocks[lastThinkIdx] = { ...blocks[lastThinkIdx], text: thinkingText.current.trim() };
              } else {
                blocks.push({ type: 'thinking', text: thinkingText.current.trim() });
              }
              break;

            case 'thinking_done':
              thinkingActive.current = false;
              // Mark the thinking block as done
              const thinkIdx = blocks.findLastIndex(b => b.type === 'thinking');
              if (thinkIdx >= 0) {
                blocks[thinkIdx] = { ...blocks[thinkIdx], done: true };
              }
              break;

            case 'text':
              blocks.push({ type: 'text', text: event.text });
              break;

            case 'tool_start':
              blocks.push({
                type: 'tool',
                id: event.id,
                tool: event.tool,
                args: event.args,
                status: 'running',
                output: null,
              });
              break;

            case 'tool_end': {
              const toolIdx = blocks.findLastIndex(b => b.type === 'tool' && b.id === event.id);
              if (toolIdx >= 0) {
                blocks[toolIdx] = { ...blocks[toolIdx], status: 'complete', output: event.output };
              }
              break;
            }

            case 'data_table':
              blocks.push({ type: 'data', data: event.data });
              break;

            case 'error':
              blocks.push({ type: 'error', error: event.error || 'Unknown error' });
              break;

            case 'done':
              // handled after loop
              break;
          }

          return { ...prev, blocks };
        });
      }

      if (!cancel) {
        // Finalize: move streaming to permanent messages
        setStreaming(prev => {
          if (prev) {
            setMessages(msgs => [...msgs, { ...prev }]);
          }
          return null;
        });
        setIsPlaying(false);
      }
    }

    run();
    return () => { cancel = true; };
  }, [isPlaying, playCount]);

  // ── Scroll to bottom ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }
  }, [messages, streaming]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-500 mb-4 shadow-sm">
            <Cpu size={12} />
            Agent Chat — Block-Based Rendering
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-2">
            How the agent response should flow
          </h1>
          <p className="text-[13px] text-gray-500 max-w-sm mx-auto leading-relaxed">
            Thinking, tool calls, text, and data all appear <em>in order</em> —
            not grouped by type. Tools show up right where they were called.
          </p>
        </div>

        {/* ── Chat card ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-[#fafafa]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <p className="text-[13px] font-semibold text-gray-900">Analytics Assistant</p>
            </div>
            <button
              onClick={() => { setPlayCount(c => c + 1); setIsPlaying(true); }}
              disabled={isPlaying}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                isPlaying
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97]'
              }`}
            >
              {isPlaying ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              {isPlaying ? 'Playing…' : 'Replay'}
            </button>
          </div>

          {/* Messages */}
          <div
            ref={containerRef}
            className="px-5 py-5 space-y-5 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          >
            {/* ── User messages ──────────────────────────────────── */}
            {messages.filter(m => m.role === 'user').map(msg => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 bg-gray-100 rounded-2xl rounded-br-md text-[14px] leading-relaxed text-gray-800">
                  {msg.content}
                </div>
              </div>
            ))}

            {/* ── Completed AI messages ────────────────────────────── */}
            {messages.filter(m => m.role === 'ai').map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {msg.blocks && msg.blocks.map((block, i) => (
                    <BlockRenderer key={`${msg.id}-${i}`} block={block} />
                  ))}
                </div>
              </div>
            ))}

            {/* ── Streaming AI message ─────────────────────────────── */}
            {streaming && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {streaming.blocks && streaming.blocks.map((block, i) => (
                    <BlockRenderer key={`stream-${i}`} block={block} />
                  ))}

                  {/* Active indicator while agent is still producing */}
                  {streaming.blocks && streaming.blocks.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse" />
                      <span className="text-[11px] text-gray-400 italic">
                        Agent is responding…
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Empty state + CTA */}
          {messages.length === 0 && !streaming && !isPlaying && (
            <div className="px-5 py-16 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Play size={20} className="text-gray-400 ml-0.5" />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-800 mb-1">Chat Experience Demo</h3>
              <p className="text-[13px] text-gray-500 max-w-xs leading-relaxed mb-5">
                Watch how thinking, tools, text, and data flow naturally in a block-based response.
              </p>
              <button
                onClick={() => { setPlayCount(c => c + 1); setIsPlaying(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[14px] font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm"
              >
                <Play size={14} className="ml-0.5" />
                Play Demo
              </button>
            </div>
          )}
        </div>

        {/* ── Legend ────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <LegendItem color="violet" label="Thinking" desc="Visible, collapsible, never erased" />
          <LegendItem color="blue" label="Tool Calls" desc="Appear where called in the flow" />
          <LegendItem color="gray" label="Text" desc="Streams continuously, no stutter" />
          <LegendItem color="emerald" label="Data" desc="Tables render inline with structure" />
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'thinking':
      return <ThinkingBlock text={block.text} isActive={!block.done} />;
    case 'tool':
      return <ToolBlock block={block} />;
    case 'text':
      return <TextBlock text={block.text} />;
    case 'data':
      return <DataBlock data={block.data} />;
    case 'error':
      return <ErrorBlock error={block.error} />;
    default:
      return null;
  }
}

function LegendItem({ color, label, desc }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };
  return (
    <div className="flex items-start gap-2.5 bg-white border border-gray-200 rounded-xl p-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[color].split(' ')[0]}`} />
      <div>
        <p className="text-[12px] font-semibold text-gray-800">{label}</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

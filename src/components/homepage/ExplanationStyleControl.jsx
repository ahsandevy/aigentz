import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, MessageSquareText, RotateCcw } from 'lucide-react';

const styles = [
  { value: 'simple', label: 'Simple', description: 'Plain language. Key terms explained. Detail when needed.' },
  { value: 'balanced', label: 'Balanced', description: 'Clear explanations with useful marketing detail.' },
  { value: 'technical', label: 'Technical', description: 'Precise metrics and detailed marketing analysis.' },
];
const labelFor = (style) => styles.find((option) => option.value === style)?.label || 'Technical';

export default function ExplanationStyleControl({ preferences, disabled = false }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const busy = disabled || preferences.loading || preferences.saving || preferences.unavailable;
  const visible = open && !disabled && !preferences.loading && !preferences.unavailable;

  useEffect(() => {
    if (!visible) return;
    rootRef.current?.querySelector('input:checked')?.focus();
    rootRef.current?.querySelector('[role="dialog"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [visible]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button ref={triggerRef} type="button" aria-label="Explanation style" aria-haspopup="dialog"
        aria-expanded={visible} aria-controls={visible ? id : undefined} disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345C86]/40 disabled:opacity-50 ${visible ? 'bg-[#345C86]/10 text-[#345C86]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
        <MessageSquareText size={14} aria-hidden="true" />
        <span className="hidden sm:inline font-normal text-slate-400">Reply style</span>
        <span>{labelFor(preferences.style)}</span>
        <ChevronDown size={12} aria-hidden="true" className={`transition-transform ${visible ? 'rotate-180' : ''}`} />
      </button>
      {visible && (
        <div id={id} role="dialog" aria-labelledby={`${id}-title`}
          onBlur={(event) => { if (event.relatedTarget && !rootRef.current?.contains(event.relatedTarget)) setOpen(false); }}
          className="absolute bottom-full left-0 z-40 mb-3 max-h-[min(65vh,380px)] w-[min(320px,calc(100vw-72px))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.20)]">
          <div className="px-3 pb-3 pt-2">
            <h3 id={`${id}-title`} className="text-[13px] font-semibold text-slate-900">How should I explain things?</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Changes the wording of new replies.</p>
          </div>
          <div role="radiogroup" aria-label="Reply style" className="space-y-1">
            {styles.map((style) => {
              const selected = preferences.style === style.value;
              return (
                <label key={style.value} className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#345C86]/40 ${selected ? 'bg-[#345C86]/[0.07]' : 'hover:bg-slate-50'} ${busy ? 'pointer-events-none opacity-60' : ''}`}>
                  <input type="radio" name={`${id}-style`} value={style.value} checked={selected} disabled={busy}
                    onChange={() => preferences.changeStyle(style.value)} className="sr-only" />
                  <span className="flex-1">
                    <span className={`block text-[12px] font-semibold ${selected ? 'text-[#345C86]' : 'text-slate-800'}`}>{style.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">{style.description}</span>
                  </span>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[#345C86] text-white' : 'border border-slate-200'}`}>
                    {selected && <Check size={10} aria-hidden="true" />}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mx-1 mt-2 border-t border-slate-100 px-2 pb-1 pt-3">
            <div role="status" className="mb-2 text-[10px] text-slate-400">
              {preferences.saving ? 'Saving…' : `Your default: ${labelFor(preferences.savedStyle)} · ${preferences.override === null ? 'In use' : 'This chat has its own style'}`}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <button type="button" disabled={busy || preferences.style === preferences.savedStyle} onClick={preferences.saveDefault}
                className="rounded-md py-1.5 text-[11px] font-medium text-[#345C86] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345C86]/40 disabled:text-slate-400 disabled:no-underline">
                Make default for new chats
              </button>
              <button type="button" disabled={busy || preferences.override === null} onClick={preferences.useDefault}
                className="inline-flex items-center gap-1 rounded-md px-1 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345C86]/40 disabled:opacity-40">
                <RotateCcw size={11} aria-hidden="true" /> Use default
              </button>
            </div>
          </div>
        </div>
      )}
      {preferences.error && <p role="alert" className="mt-1 max-w-sm text-[11px] text-amber-700">{preferences.error}</p>}
    </div>
  );
}

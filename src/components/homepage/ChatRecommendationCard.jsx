import { memo } from 'react';
import { TrendingUp, Target, Palette, Users, DollarSign, Clock, Zap } from 'lucide-react';

const CATEGORY_ICONS = {
  budget: DollarSign, placement: Target, creative: Palette,
  audience: Users, bidding: TrendingUp, dayparting: Clock, general: Zap,
};

const CONFIDENCE_COLORS = {
  high: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-50 text-slate-500',
};

const STATUS_STYLES = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  applied: { label: 'Applied ✓', className: 'bg-emerald-50 text-emerald-700' },
  ignored: { label: 'Ignored', className: 'bg-slate-50 text-slate-500' },
  obsolete: { label: 'Obsolete', className: 'bg-slate-50 text-slate-400' },
};

export default memo(function RecommendationCard({ recommendation, compact = false, onStatusChange = null }) {
  const { title, description, category, expected_impact, confidence, status } = recommendation;
  const Icon = CATEGORY_ICONS[category] || Zap;
  const confidenceStyle = CONFIDENCE_COLORS[confidence] || CONFIDENCE_COLORS.medium;
  const statusInfo = STATUS_STYLES[status] || STATUS_STYLES.new;
  const isActionable = status !== 'applied' && status !== 'obsolete';

  if (compact) {
    return (
      <div onClick={() => onStatusChange?.('open', recommendation)}
        className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer group">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-slate-200 transition-colors">
            <Icon size={11} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-900 leading-snug truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{category}</span>
              {expected_impact && (
                <span className="text-[10px] text-slate-500 font-medium">↑{expected_impact}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
              <button disabled={!isActionable}
                className="flex-1 bg-[#345C86] text-white text-[10px] font-semibold py-1.5 rounded-md hover:bg-[#2a4a6e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Apply Now
              </button>
              <button className="flex-1 border border-slate-200 text-slate-600 text-[10px] font-semibold py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-slate-500" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${confidenceStyle}`}>{confidence}</span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-[14px] font-semibold text-slate-900 mb-1.5">{title}</h4>
        {description && <p className="text-[12px] text-slate-500 leading-relaxed mb-3">{description}</p>}
        {expected_impact && (
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={11} className="text-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-700">{expected_impact}</span>
          </div>
        )}
        <button disabled={!isActionable}
          className="w-full bg-[#345C86] text-white text-[12px] font-semibold py-2.5 rounded-lg hover:bg-[#2a4a6e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {status === 'applied' ? 'Applied ✓' : status === 'obsolete' ? 'No Longer Relevant' : 'Apply this Recommendation'}
        </button>
      </div>
    </div>
  );
});

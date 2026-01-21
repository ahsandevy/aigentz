function RecommendationCard({
  priority,
  category,
  confidence,
  risk,
  title,
  revenueLift,
  revenueRange,
  scope,
  insights,
  metrics,
  owner,
  nextCheck
}) {
  return (
    <div className="rounded-lg border-l-[6px] border-[#ef4444] p-6 shadow-sm relative bg-gradient-to-br from-[#f8faff] to-[#f0f4fa]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-[#ef4444] text-white text-[10px] uppercase font-bold rounded-full">{priority}</span>
            <span className="px-3 py-1 bg-white border border-[#e5e7eb] text-[#4b5563] text-[10px] font-medium rounded-full">{category}</span>
            <span className="px-3 py-1 bg-[#dbeafe] text-[#1e4a79] text-[10px] font-medium rounded-full">{confidence}</span>
            <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] text-[10px] font-medium rounded-full">{risk}</span>
          </div>
          <h3 className="text-[#1e4a79] font-bold text-lg leading-tight w-full">{title}</h3>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <p className="text-[#78a3cd] font-bold text-xl">{revenueLift}</p>
          <p className="text-xs text-[#9ca3af] mt-1">{revenueRange}</p>
        </div>
      </div>

      {/* Scope Section */}
      <div className="mb-5">
        <p className="text-[#1e4a79] font-bold text-[10px] uppercase mb-2 text-left">SCOPE</p>
        <div className="space-y-2">
          {scope.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-[3px] h-3.5 bg-[#eab308] shrink-0 mt-0.5" />
              <span className="text-xs text-[#4b5563]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="mb-6">
        <p className="text-[#1e4a79] font-bold text-[10px] uppercase mb-2 text-left">CURATED INSIGHTS</p>
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-[3px] h-3.5 bg-[#eab308] shrink-0 mt-0.5" />
              <span className="text-xs text-[#4b5563]">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-white rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shadow-sm border border-gray-100">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-xs text-[#6b7280] mb-1">{metric.label}</span>
            <span className={`text-sm font-bold ${metric.highlight ? 'text-[#a3a355]' : 'text-[#1f2937]'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6b7280]">
          <span>Owner: {owner}</span>
          <span>Next check: {nextCheck}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#EDF0A8] hover:opacity-90 text-[#374151] px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button className="bg-white hover:bg-gray-50 text-[#374151] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-gray-200 transition-all whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulate
          </button>
          <button className="bg-white hover:bg-gray-50 text-[#374151] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-gray-200 transition-all whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            More Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard



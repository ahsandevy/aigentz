function MetricCard({ title, value, change, changeType, subtitle, target }) {
  return (
    <div className="bg-white rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
      <p className="text-sm text-[#374151] mb-2">{title}</p>
      <p className="text-3xl font-bold text-[#1e4a79] mb-2">{value}</p>
      {change && (
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${changeType === 'positive' ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={changeType === 'positive'
                ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              }
            />
          </svg>
          <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            {change}
          </span>
          {change.includes('%') && <span className="text-xs text-[#6b7280]">WoW</span>}
        </div>
      )}
      {subtitle && <p className="text-xs text-[#6b7280]">{subtitle}</p>}
      {target && <p className="text-xs text-[#6b7280]">Target: {target}</p>}
    </div>
  )
}

export default MetricCard


function EfficiencyDrivers() {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">Efficiency Drivers</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Funnel Mix */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Funnel Mix</h3>
          <div className="space-y-4">
            {[
              { label: 'TOFU', roas: '2.4x', spend: '1348K', width: '53%' },
              { label: 'MOFU', roas: '9.9x', spend: '660K', width: '67%' },
              { label: 'BOFU', roas: '5.3x', spend: '840K', width: '85%' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-[15px] font-bold text-[#111827]">{item.label}</span>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#78a3cd] block">{item.roas}</span>
                    <span className="text-[10px] text-[#374151]">{item.spend}</span>
                  </div>
                </div>
                <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                  <div className="bg-[#78a3cd] h-[9px] rounded-full" style={{ width: item.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New vs Returning */}
        <div className="bg-[#fafafa] rounded-lg border border-[#e5e7eb] p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">New vs Returning</h3>
          <div className="space-y-4">
            {[
              { label: 'New Customers', percentage: '63.00%', width: '63%', color: '#78a3cd' },
              { label: 'Returning', percentage: '37.00%', width: '37%', color: '#c8c8a1' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-[15px] font-bold text-[#111827]">{item.label}</span>
                  <span className="text-[12px] font-bold text-[#78a3cd]">{item.percentage}</span>
                </div>
                <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                  <div className="h-[9px] rounded-full" style={{ width: item.width, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creative Fatigue */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Creative Fatigue (Top 5)</h3>
          <div className="space-y-3">
            {[
              { name: 'Video 15s', score: 73, color: '#dc2628' },
              { name: 'Carousel ATC', score: 61, color: '#ea580c' },
              { name: 'Video 30s', score: 56, color: '#ea580c' },
              { name: 'Image Discount', score: 49, color: '#c8c8a1' },
              { name: 'Carousel Bestsellers', score: 45, color: '#c8c8a1' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#6b7280]">{item.name}</span>
                <span className="px-2 py-1 rounded-[4px] text-[12px] font-bold text-white" style={{ backgroundColor: item.color }}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Performance */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Placement Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'Instagram Reels', roas: '9.9x' },
              { name: 'Facebook Reels', roas: '5.8x' },
              { name: 'Instagram Stories', roas: '4.1x' },
              { name: 'Instagram Feed', roas: '3.2x' },
              { name: 'Facebook Feed', roas: '2.8x' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#6b7280]">{item.name}</span>
                <span className={`text-[12px] font-bold ${idx === 0 ? 'text-[#78a3cd]' : 'text-[#6b7280]'}`}>{item.roas}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EfficiencyDrivers


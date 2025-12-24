function WeeklyAISummary() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">Weekly AI Summary</h2>
      </div>

      <div className="rounded-lg border-l-[5px] border-[#1e4a79] border-t-[0.5px] border-r-[0.5px] border-b-[0.5px] border-[#1e4a79] p-8 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]" style={{ backgroundImage: 'linear-gradient(159.11026453997087deg, rgba(245, 248, 253, 1) 31.672%, rgba(255, 255, 255, 1) 101.75%)' }}>
        <p className="text-[20px] font-bold text-[#374151] mb-4">
          This week's decisions improved efficiency by reallocation spend from low-performing prospecting to high-converting mid and lower funnel audiences.
        </p>
        <div className="space-y-2 text-[20px] text-[#374151] mb-6">
          <p><strong>Approved Actions:</strong> <span className="font-normal">4</span></p>
          <p><strong>Budget Shift:</strong> <span className="font-normal">+380K PKR toward higher ROAS inventory</span></p>
          <p><strong>Primary Risk Managed:</strong> <span className="font-normal">Creative fatigue and audience overlap</span></p>
        </div>
        <button className="flex items-center gap-2 bg-[#EDF0A8] text-[#1e4a79] px-6 py-3 rounded-[18px] font-semibold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Weekly Summary
        </button>
      </div>
    </section>
  )
}

export default WeeklyAISummary


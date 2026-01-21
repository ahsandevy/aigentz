function AIExecutiveBrief() {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">AI Executive Brief</h2>
      </div>

      <div className="bg-[#fafafa] rounded-lg border border-[#bfdbfe] p-8 shadow-[0px_0.871px_1.742px_0px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* What Changed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">What Changed</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#16a34a]">
                <span>ROAS improved 9.8% WoW driven by Summer Sale campaign</span>
              </li>
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#16a34a]">
                <span>CTR declined 2.1% due to creative fatigue in TOF audiences</span>
              </li>
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#16a34a]">
                <span>Conversion volume up 15.4% from increased checkout optimization</span>
              </li>
            </ul>
          </div>

          {/* What to Fix */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">What to Fix</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#ea580c]">
                <span>Refresh 2 fatigued creatives showing frequency &gt;4.5 (Ad Set: Lookalike 1-2%)</span>
              </li>
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#ea580c]">
                <span>Reduce overlap between "Interest: Fashion" and "Lookalike 1%" audiences (wasting ~PKR 45K/week)</span>
              </li>
            </ul>
          </div>

          {/* Where to Scale */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">Where to Scale</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#2563eb]">
                <span>Summer Sale campaign: ROAS 4.2x at 60% budget utilization - Recommend +30% budget</span>
              </li>
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#2563eb]">
                <span>Retargeting ad set delivering PKR 285 CPA (35% below target) - Allocate +PKR 50K</span>
              </li>
            </ul>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">Risks</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#dc2626]">
                <span>Account approaching 80% of monthly spend limit (PKR 1M / PKR 1.25M)</span>
              </li>
              <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#dc2626]">
                <span>iOS 14.5+ attribution gaps may underreport conversions by 10-15%</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Growth Opportunity Summary */}
        <div className="border-t border-[#bfdbfe] pt-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-semibold text-[#1e4a79]">Growth Opportunity Summary</h3>
          </div>
          <ul className="space-y-2 text-sm text-[#374151]">
            <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#eecc20]">
              <span>Reels campaign (Eid Collection) delivering exceptional 9.93: ROAS- Recommend aggressive scaling</span>
            </li>
            <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#eecc20]">
              <span>TOFU Broad showing hig creatiive Fatigue (score 72)) and 34% audience overlap with Lookalike</span>
            </li>
            <li className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#eecc20]">
              <span>Peak conversion window (19:00-23:00) underutilized - dayparting opportunity worth +124K PKR</span>
            </li>
          </ul>
        </div>

        <button className="bg-[#fafafa] border border-[#EDF0A8] text-[#1e4a79] px-6 py-3 rounded-[30px] font-semibold shadow-[2px_2px_4px_0px_#cfcfcf] hover:opacity-90 transition-opacity flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Board-Ready Summary
        </button>
      </div>
    </section>
  )
}

export default AIExecutiveBrief



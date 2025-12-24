import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('Campaigns')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
      {/* Header Section */}
      <header className="bg-white border-b border-[#bfdbfe]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1e4a79] rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
      <div>
                <h1 className="text-2xl font-bold text-[#1e4a79]">
                  Marketing Opportunity Detection Engine
                </h1>
                <p className="text-sm text-[#374151]">
                  AI-powered insights and optimization recommendations for your Meta advertising Campaigns
        </p>
      </div>
            </div>

            {/* Date Selector and Sync */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none bg-[#eceec7] border border-[#eceec7] rounded-[38px] px-4 py-2 pr-8 text-sm text-[#374151] shadow-[2px_2px_5.9px_0px_rgba(0,0,0,0.1)] focus:outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button className="flex items-center gap-2 bg-[#eceec7] text-[#374151] px-4 py-2 rounded-[38px] text-sm font-medium shadow-[2px_2px_5.9px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Meta Data
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            {/* Spend */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">$ Spend</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">PKR 1,024,500</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium text-[#16a34a]">+12.3%</span>
                <span className="text-xs text-[#6b7280]">WoW</span>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">$ Revenue</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">PKR 14,239,000</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium text-[#16a34a]">+18%</span>
                <span className="text-xs text-[#6b7280]">WoW</span>
              </div>
            </div>

            {/* ROAS */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">ROAS</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">5.00 x</p>
              <p className="text-xs text-[#6b7280]">Target: 4.5x</p>
            </div>

            {/* Cost per Action */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">Cost per Action</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">PKR 2000</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-sm font-medium text-[#dc2626]">-8%</span>
                <span className="text-xs text-[#6b7280]">WoW</span>
              </div>
            </div>

            {/* Click Through Rate */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">Click Through Rate</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">2.34%</p>
              <p className="text-xs text-[#6b7280]">Click Rate</p>
            </div>

            {/* Purchases */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">Purchases</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">1,247</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium text-[#16a34a]">+12%</span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">Average Order Value</p>
              <p className="text-3xl font-bold text-[#1e4a79]">PKR 11,000</p>
            </div>

            {/* New Customers */}
            <div className="bg-[#fafafa] rounded-lg border-t-4 border-[#1e4a79] border-r-0 border-b-0 border-l-0 p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-[#374151] mb-2">New Customers</p>
              <p className="text-3xl font-bold text-[#1e4a79] mb-2">63.00%</p>
              <p className="text-xs text-[#6b7280]">Share</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* AI Executive Brief */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#1e4a79]">AI Executive Brief</h2>
          </div>

          <div className="bg-[#fafafa] rounded-lg border border-[#bfdbfe] p-8 shadow-[0px_0.871px_1.742px_0px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-2 gap-8 mb-8">
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

            <button className="bg-[#fafafa] border border-[#eceec7] text-[#1e4a79] px-6 py-3 rounded-[30px] font-semibold shadow-[2px_2px_4px_0px_#cfcfcf] hover:opacity-90 transition-opacity flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Board-Ready Summary
            </button>
          </div>
        </section>

        {/* Performance Explorer */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-2xl font-bold text-[#1e4a79]">Performance Explorer</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-[rgba(250,250,250,0.55)] border border-[#c8c8a1] rounded-[30px] text-sm text-[#374151] shadow-[2px_2px_4px_0px_#cfcfcf] focus:outline-none"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#fafafa] border border-[#c8c8a1] rounded-t-[30px] border-b-0 p-4 shadow-[2px_2px_4px_0px_#cfcfcf]">
            <div className="flex gap-4">
              {['Campaigns', 'Ad Sets', 'Ads', 'Audiences'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-[30px] font-bold transition-colors ${
                    activeTab === tab
                      ? 'bg-[#eceec7] text-[#374151]'
                      : 'text-[#374151] hover:opacity-80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#ebf1f8] rounded-b-lg border border-[#c8c8a1] border-t-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#ebf1f8]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Funnel</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Spend</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">AI Detection Signal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Threshold Assessment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#ebf1f8]">
                  <tr className="border-b border-[#e5e7eb]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">SS_PK_Sales_Reels_Eid Collection</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-white border border-[#6b7280] text-[#374151] text-xs rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Mid-Funnel Engagement to Purchase (Reels)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">1348K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">3233K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: 9.93x<br />CPA: 1K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: &gt; 4.0x target<br />CPA: −60% vs limit</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-[#c8f687] text-[#15803d] text-xs rounded-[10px] font-medium shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Scale Aggressively</span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#e5e7eb]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">SS_PK_Sales_Retargeting_ATC14_VC30</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-white border border-[#6b7280] text-[#374151] text-xs rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Lower-Funnel Cart & High-Intent Retargeting</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">840K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">4451K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: 5.30x<br />CPA: 2K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: meets BOFU target<br />CPA: within range</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-[#fee97e] text-[#a26f05] text-xs rounded-[10px] font-medium shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Scale with Guard</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">SS_PK_Sales_Prospecting_Broad_Q4</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-white border border-[#6b7280] text-[#374151] text-xs rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Prospecting Broad Acquisition (Cold Traffic)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">660K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">6554K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: 2.40x<br />CPA: 4K PKR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] leading-tight">ROAS: below 3.0x prospecting target<br />CPA: +35% over cap</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-[#ffa7a7] text-[#aa2929] text-xs rounded-[10px] font-medium shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)]">Fix Before Scaling</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#1e4a79]">AI Recommendations</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Recommendation Card 1 */}
            <div className="rounded-lg border-l-[5px] border-[#dc2626] p-6 shadow-[inset_6px_4px_9.1px_0px_rgba(0,0,0,0.09)]" style={{ backgroundImage: 'linear-gradient(131.0656081065831deg, rgba(245, 249, 255, 1) 31.672%, rgba(235, 241, 249, 1) 101.75%)' }}>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-2 py-1 bg-[#dc2626] text-white text-[8px] rounded-[8px] font-bold">High</span>
                <span className="px-2 py-1 bg-[rgba(255,255,255,0.5)] border border-[#6b7280] text-[#374151] text-[8px] rounded-[8px] font-semibold">Budget</span>
                <span className="px-2 py-1 bg-[#d3e2ff] text-[#374151] text-[8px] rounded-[8px]">87% Confidence</span>
                <span className="px-2 py-1 bg-[#90d8ab] text-[#11863c] text-[8px] rounded-[8px] font-bold">Low Risk</span>
              </div>
              <h3 className="font-bold text-[#1e4a79] mb-2 text-sm">Reallocate 15% budget from underperforming TOFU to high-performing BOFU retargeting</h3>
              <div className="mb-4 text-right">
                <p className="text-[15px] font-bold text-[#78a3cd]">+328,000 PKR Revenue Lift</p>
                <p className="text-[9px] text-[#374151]">+245,000 to + 410,000 PKR</p>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#1e4a79] mb-1">SCOPE</p>
                  <ul className="text-[10px] text-[#374151] space-y-1">
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]"><span className="font-semibold">Campaign:</span> SS_PK_Sales_Prospecting_Broad_Q4</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]"><span className="font-semibold">Ad Set:</span> AS_TOFU_Broad_PK_18-44_Auto</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1e4a79] mb-1">CURATED INSIGHTS</p>
                  <ul className="text-[10px] text-[#374151] space-y-1">
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">Low ROAS of 2.4 vs account average of 5.0</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">High CPA of 4,310 PKR vs account average of 2,283 PKR</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">BOFU retargeting campaign showing 5.3 ROAS with capacity for more budget</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-[#c8c8a1] pt-4">
                <div className="bg-white rounded p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">Revenue Lift</span>
                    <span className="text-[9px] font-bold text-[#bcbc69]">+328,000 PKR revenue lift</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">CPA Change</span>
                    <span className="text-[9px] font-bold text-[#4b5563]">-520 PKR average CPA</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">ROAS</span>
                    <span className="text-[9px] font-bold text-[#4b5563]">+0.8 points</span>
                  </div>
                  <div className="border-t border-[#c8c8a1] pt-2 mt-2 flex items-center justify-between text-[9px] text-[#374151]">
                    <span>Owner: Performance Team</span>
                    <span>Next check: 48 hours</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#eceec7] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">Approve</button>
                  <button className="flex-1 bg-[#fbfcfe] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">Simulate</button>
                  <button className="flex-1 bg-[#fbfcfe] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">More Details</button>
                </div>
              </div>
            </div>

            {/* Recommendation Card 2 */}
            <div className="rounded-lg border-l-[5px] border-[#dc2626] p-6 shadow-[inset_6px_4px_9.1px_0px_rgba(0,0,0,0.09)]" style={{ backgroundImage: 'linear-gradient(131.0656081065831deg, rgba(245, 249, 255, 1) 31.672%, rgba(235, 241, 249, 1) 101.75%)' }}>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-2 py-1 bg-[#dc2626] text-white text-[8px] rounded-[8px] font-bold">High</span>
                <span className="px-2 py-1 bg-[rgba(255,255,255,0.5)] border border-[#6b7280] text-[#374151] text-[8px] rounded-[8px] font-semibold">Creative</span>
                <span className="px-2 py-1 bg-[#d3e2ff] text-[#374151] text-[8px] rounded-[8px]">88% Confidence</span>
                <span className="px-2 py-1 bg-[#90d8ab] text-[#11863c] text-[8px] rounded-[8px] font-bold">Low Risk</span>
              </div>
              <h3 className="font-bold text-[#1e4a79] mb-2 text-sm">Scale winning creative across other campaigns and create variations</h3>
              <div className="mb-4 text-right">
                <p className="text-[15px] font-bold text-[#78a3cd]">+412,000 PKR Revenue Lift</p>
                <p className="text-[9px] text-[#374151]">+318,000 to + 506,000 PKR</p>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#1e4a79] mb-1">SCOPE</p>
                  <ul className="text-[10px] text-[#374151] space-y-1">
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]"><span className="font-semibold">Campaign:</span> SS_PK_Sales_Reels_EidCollection</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]"><span className="font-semibold">Ad Set:</span> AS_MOFU_Reels_Eid_Broad_25-45</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]"><span className="font-semibold">Ad Set:</span> AD_Reels_Eid_Bestsellers_V3</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1e4a79] mb-1">CURATED INSIGHTS</p>
                  <ul className="text-[10px] text-[#374151] space-y-1">
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">Exceptional performace: 9.93 ROAS, nearly 2x account average</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">Low fatigue score of 28 - creative still fresh</li>
                    <li className="pl-4 border-l-[1.742px] border-[#c8c8a1]">Viral coefficient high - organic shares detected</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-[#c8c8a1] pt-4">
                <div className="bg-white rounded p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">Revenue Lift</span>
                    <span className="text-[9px] font-bold text-[#bcbc69]">+410,000 PKR revenue lift</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">CPA Change</span>
                    <span className="text-[9px] font-bold text-[#4b5563]">-892 PKR</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-[#374151]">ROAS</span>
                    <span className="text-[9px] font-bold text-[#4b5563]">+1.8 points</span>
                  </div>
                  <div className="border-t border-[#c8c8a1] pt-2 mt-2 flex items-center justify-between text-[9px] text-[#374151]">
                    <span>Owner: Performance Team</span>
                    <span>Next check: 3 days</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#eceec7] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">Approve</button>
                  <button className="flex-1 bg-[#fbfcfe] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">Simulate</button>
                  <button className="flex-1 bg-[#fbfcfe] text-[#374151] px-4 py-2 rounded-[20px] text-[9px] font-medium shadow-[1.06px_1.06px_3.126px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">More Details</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Efficiency Drivers */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#1e4a79]">Efficiency Drivers</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Funnel Mix */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-semibold text-[#374151] mb-4">Funnel Mix</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">TOFU</span>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#78a3cd] block">2.4x</span>
                      <span className="text-[10px] text-[#374151]">1348K</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#78a3cd] h-[9px] rounded-full" style={{ width: '53%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">MOFU</span>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#78a3cd] block">9.9x</span>
                      <span className="text-[10px] text-[#374151]">660K</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#78a3cd] h-[9px] rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">BOFU</span>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#78a3cd] block">5.3x</span>
                      <span className="text-[10px] text-[#374151]">840K</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#78a3cd] h-[9px] rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* New vs Returning */}
            <div className="bg-[#fafafa] rounded-lg border border-[#e5e7eb] p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-semibold text-[#374151] mb-4">New vs Returning</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">New Customers</span>
                    <span className="text-[12px] font-bold text-[#78a3cd]">63.00%</span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#78a3cd] h-[9px] rounded-full" style={{ width: '63%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">Returning</span>
                    <span className="text-[12px] font-bold text-[#78a3cd]">37.00%</span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#c8c8a1] h-[9px] rounded-full" style={{ width: '37%' }}></div>
                  </div>
                </div>
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

        {/* Change Control */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#1e4a79]">Change Control</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Audit Log */}
            <div className="bg-[rgba(255,255,255,0.9)] rounded-lg border border-[#e5e7eb] p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-bold text-[#1e4a79] mb-4">Audit Log</h3>
              <div className="space-y-4">
                {[
                  { text: 'Scaled Reels Mid-Funnel (+20%) Above threshold efficiency (ROAS 9.9x). Guardrail: pause if CPA > 1.5K.', bold: 'Scaled Reels Mid-Funnel (+20%)' },
                  { text: 'Reduce Broad Prospecting (−20%) Below target ROAS with creative fatigue and overlap risk.', bold: 'Reduce Broad Prospecting (−20%)' },
                  { text: 'Creative Refresh Launched New hook and thumbnail to counter CTR decline.', bold: 'Creative Refresh Launched' },
                  { text: 'Audience Overlap Resolved Excluded 1% Lookalike from Broad to reduce auction pressure.', bold: 'Audience Overlap Resolved' },
                ].map((log, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-[1.5px] bg-[#6b7280] rounded"></div>
                    <p className="text-[15px] text-[#374151] flex-1 leading-[14px]">
                      <span className="font-bold">{log.bold}</span> {log.text.replace(log.bold, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CMO Decision Notes */}
            <div className="bg-[rgba(255,255,255,0.9)] rounded-lg border border-[#e5e7eb] p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-bold text-[#1e4a79] mb-4">CMO Decision Notes</h3>
              <textarea
                placeholder="Add notes about decision, observations or strategic direction...."
                className="w-full h-32 p-4 bg-[rgba(235,241,248,0.33)] border border-[rgba(235,241,248,0.33)] rounded-[3px] resize-none focus:outline-none text-[10px] text-black"
              />
              <button className="mt-4 flex items-center gap-2 bg-[#eceec7] text-[#1e4a79] px-6 py-2 rounded-[18px] text-sm font-semibold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Notes
              </button>
            </div>
          </div>
        </section>

        {/* Weekly AI Summary */}
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
            <button className="flex items-center gap-2 bg-[#eceec7] text-[#1e4a79] px-6 py-3 rounded-[18px] font-semibold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Weekly Summary
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

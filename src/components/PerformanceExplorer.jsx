import { useState } from 'react'

function PerformanceExplorer() {
  const [activeTab, setActiveTab] = useState('Campaigns')

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1e4a79]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e4a79]">Performance Explorer</h2>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-[rgba(250,250,250,0.55)] border border-[#c8c8a1] rounded-[30px] text-sm text-[#374151] shadow-[2px_2px_4px_0px_#cfcfcf] focus:outline-none w-full md:w-64 focus:ring-1 focus:ring-[#1e4a79] focus:border-[#1e4a79] transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#fafafa] border border-[#c8c8a1] rounded-t-[30px] border-b-0 p-4 shadow-[2px_2px_4px_0px_#cfcfcf] overflow-x-auto">
        <div className="flex justify-start md:justify-center gap-4 md:gap-16 min-w-max">
          {['Campaigns', 'Ad Sets', 'Ads', 'Audiences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-2 rounded-[30px] font-bold transition-all duration-200 whitespace-nowrap ${activeTab === tab
                ? 'bg-[#EDF0A8] text-[#374151] shadow-md transform scale-105'
                : 'text-[#374151] hover:text-[#1e4a79] hover:bg-[#ebf1f8]'
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
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden lg:table-cell">Funnel</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden sm:table-cell">Spend</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden sm:table-cell">Revenue</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider">AI Detection</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden md:table-cell">Assessment</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#ebf1f8]">
              <tr className="border-b border-[#e5e7eb]">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#374151]">SS_PK_Sales_Reels_Eid Collection</td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="flex flex-col items-center gap-1">
                    <span className="px-3 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-full shadow-sm">Mid-Funnel</span>
                    <span className="text-xs text-gray-500">Engagement to Purchase (Reels)</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">1348K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">3233K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> 9.93x</div>
                    <div><span className="font-bold">CPA:</span> 1K PKR</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] hidden md:table-cell">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> &gt; 4.0x target</div>
                    <div><span className="font-bold">CPA:</span> −60% vs limit</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="px-4 py-1.5 bg-[#c8f687] text-[#15803d] text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition-opacity">
                    Scale Aggressively
                  </button>
                </td>
              </tr>
              <tr className="border-b border-[#e5e7eb]">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#374151]">SS_PK_Sales_Retargeting_ATC14_VC30</td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="flex flex-col items-center gap-1">
                    <span className="px-3 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-full shadow-sm">Lower-Funnel</span>
                    <span className="text-xs text-gray-500">Cart & High-Intent Retargeting</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">840K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">4451K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> 5.30x</div>
                    <div><span className="font-bold">CPA:</span> 2K PKR</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] hidden md:table-cell">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> meets BOFU target</div>
                    <div><span className="font-bold">CPA:</span> within range</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="px-4 py-1.5 bg-[#fee97e] text-[#a26f05] text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition-opacity">
                    Scale with Guard
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#374151]">SS_PK_Sales_Prospecting_Broad_Q4</td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="flex flex-col items-center gap-1">
                    <span className="px-3 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-full shadow-sm">Prospecting</span>
                    <span className="text-xs text-gray-500">Broad Acquisition (Cold Traffic)</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">660K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell">6554K PKR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> 2.40x</div>
                    <div><span className="font-bold">CPA:</span> 4K PKR</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] hidden md:table-cell">
                  <div className="flex flex-col items-center">
                    <div><span className="font-bold">ROAS:</span> below 3.0x prospecting target</div>
                    <div><span className="font-bold">CPA:</span> +35% over cap</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="px-4 py-1.5 bg-[#ffa7a7] text-[#aa2929] text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition-opacity">
                    Fix Before Scaling
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default PerformanceExplorer


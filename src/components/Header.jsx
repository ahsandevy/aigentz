import MetricsGrid from './MetricsGrid'

function Header() {
  return (
    <header className="bg-[#f4f8fe] pb-6">
      <div className="w-[85%] mx-auto px-8 pt-6">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-[#0066CC]" viewBox="0 0 40 40" fill="none">
              <path d="M20 0L35 30H28L20 14L12 30H5L20 0Z" fill="currentColor" />
              <path d="M20 14L28 30H12L20 14Z" fill="white" />
              <path d="M0 40H10L20 20L30 40H40L20 0L0 40Z" fill="currentColor" fillOpacity="0.2" />
            </svg>
            <div className="flex flex-col leading-none">
              <span className="text-[#1e4a79] font-bold text-lg tracking-wide">ASCEND</span>
              <span className="text-[#1e4a79] text-[10px] tracking-[0.2em] uppercase">Analytics</span>
            </div>
          </div>

          {/* Client Status */}
          <div className="flex items-center gap-2 text-sm text-[#4b5563]">
            <span className="font-medium text-[#1e4a79]">Servis Shoes</span>
            <span>·</span>
            <span>Live Analysis</span>
            <span className="w-2 h-2 bg-[#84cc16] rounded-full"></span>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex items-center justify-between mb-8">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="p-2">
              <svg className="w-12 h-12 text-[#6b7280] opacity-50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h4v8H3v-8zm6-5h4v13H9V8zm6-5h4v18h-4V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1e4a79] mb-1">
                Marketing Opportunity Detection Engine
              </h1>
              <p className="text-[#64748b]">
                AI-powered insights and optimization recommendations for your Meta advertising Campaigns
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-[#EDF0A8] border-none rounded-full px-6 py-2.5 pr-10 text-sm font-medium text-[#374151] shadow-sm focus:outline-none cursor-pointer">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="flex items-center gap-2 bg-[#EDF0A8] text-[#374151] px-6 py-2.5 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Meta Data
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <MetricsGrid />
      </div>
    </header>
  )
}

export default Header


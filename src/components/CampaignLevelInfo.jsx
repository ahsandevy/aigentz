import { useEffect, useMemo, useState } from 'react'
import { useCampaignLevelInfo } from '../hooks/useCampaignLevelInfo'

const formatNumber = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatCurrency = (value, currency = 'AED') => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value)
}

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value}%`
}

function CampaignLevelInfo() {
  const { data, isLoading, error } = useCampaignLevelInfo()
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)

  useEffect(() => {
    if (!data?.items?.length) return
    const firstId = data.items[0]?.campaign?.campaign_id || data.items[0]?.campaign?.campaign_name || 'campaign-0'
    if (selectedCampaignId === null) {
      setSelectedCampaignId(firstId)
    }
  }, [data, selectedCampaignId])

  const selectedData = useMemo(() => {
    if (!data?.items?.length) return null
    return (
      data.items.find((item, idx) => {
        const id = item?.campaign?.campaign_id || item?.campaign?.campaign_name || `campaign-${idx}`
        return id === selectedCampaignId
      }) || data.items[0]
    )
  }, [data, selectedCampaignId])

  const kpiCards = useMemo(() => {
    if (!selectedData?.kpis) return []
    const k = selectedData.kpis
    return [
      { label: 'Spend', value: formatCurrency(k.spend) },
      { label: 'ROAS', value: k.purchase_roas !== undefined ? `${k.purchase_roas}x` : 'N/A' },
      { label: 'Purchases', value: formatNumber(k.purchases) },
      { label: 'Cost / Purchase', value: formatCurrency(k.cost_per_purchase) },
      { label: 'CTR', value: formatPercent(k.ctr) },
      { label: 'CVR', value: formatPercent(k.cvr) },
      { label: 'Impressions', value: formatNumber(k.impressions) },
      { label: 'Reach', value: formatNumber(k.reach) }
    ]
  }, [selectedData])

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#1e4a79]">Campaign-Level Intelligence</h2>
        </div>
        <div className="rounded-lg border border-[#e2e8f0] p-8 bg-white">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e4a79]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="rounded-lg border border-red-200 p-6 bg-red-50">
          <h2 className="text-xl font-bold text-red-800 mb-2">Campaign-Level Intelligence</h2>
          <p className="text-sm text-red-600">Failed to load campaign-level info.</p>
        </div>
      </section>
    )
  }

  if (!data?.items?.length) {
    return (
      <section className="mb-8">
        <div className="rounded-lg border border-[#e2e8f0] p-6 bg-white">
          <h2 className="text-xl font-bold text-[#1e4a79] mb-2">Campaign-Level Intelligence</h2>
          <p className="text-sm text-[#6b7280]">No campaign-level information available.</p>
        </div>
      </section>
    )
  }

  if (!selectedData) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#1e4a79]">Campaign-Level Intelligence</h2>
        <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-full">
          {data.total} campaign{data.total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-[#1e4a79] mb-3">Campaigns</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.items.map((item, idx) => {
            const id = item?.campaign?.campaign_id || item?.campaign?.campaign_name || `campaign-${idx}`
            const isActive = id === (selectedData?.campaign?.campaign_id || selectedData?.campaign?.campaign_name || `campaign-${idx}`)
            return (
              <button
                key={id}
                onClick={() => setSelectedCampaignId(id)}
                className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${isActive ? 'border-[#1e4a79] bg-[#eff6ff]' : 'border-[#e5e7eb] bg-white hover:bg-[#f8fafc]'}`}
              >
                <div className="text-sm font-semibold text-[#1e4a79]">{item?.campaign?.campaign_name || `Campaign ${idx + 1}`}</div>
                <div className="text-xs text-[#64748b] mt-1">
                  Objective: {item?.campaign?.objective || 'N/A'} • Status: {item?.campaign?.status || 'N/A'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm mb-4">
        <h3 className="text-lg font-bold text-[#1e4a79]">{selectedData.campaign?.campaign_name || 'Campaign Overview'}</h3>
        <div className="mt-2 text-sm text-[#4b5563] flex flex-wrap gap-3">
          <span>Objective: {selectedData.campaign?.objective || 'N/A'}</span>
          <span>Status: {selectedData.campaign?.status || 'N/A'}</span>
          <span>Window: {selectedData.lookback?.date_start || 'N/A'} to {selectedData.lookback?.date_stop || 'N/A'}</span>
          <span>Days: {selectedData.lookback?.requested_days ?? 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm">
            <div className="text-xs text-[#6b7280]">{kpi.label}</div>
            <div className="text-xl font-bold text-[#1e4a79] mt-1">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h4 className="font-semibold text-[#1e4a79] mb-2">Performance Summary</h4>
          <p className="text-sm text-[#374151]">{selectedData.summary?.performance_overview || 'No summary available.'}</p>
          {Array.isArray(selectedData.summary?.patterns) && selectedData.summary.patterns.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-[#374151]">
              {selectedData.summary.patterns.map((item, idx) => <li key={idx}>- {item}</li>)}
            </ul>
          )}
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h4 className="font-semibold text-[#1e4a79] mb-2">Why This Is Happening</h4>
          {Array.isArray(selectedData.summary?.why_this_is_happening) && selectedData.summary.why_this_is_happening.length > 0 ? (
            <ul className="space-y-2 text-sm text-[#374151]">
              {selectedData.summary.why_this_is_happening.map((item, idx) => <li key={idx}>- {item}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-[#6b7280]">No explanation available.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm mb-6">
        <h4 className="font-semibold text-[#1e4a79] mb-3">Trend Snapshot</h4>
        <div className="text-sm text-[#374151] mb-2">
          Daily points: {Array.isArray(selectedData.trend?.daily) ? selectedData.trend.daily.length : 0}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>ROAS change: {selectedData.trend?.changes?.purchase_roas_pct ?? 'N/A'}%</div>
          <div>CPP change: {selectedData.trend?.changes?.cost_per_purchase_pct ?? 'N/A'}%</div>
          <div>CTR change: {selectedData.trend?.changes?.ctr_pct ?? 'N/A'}%</div>
          <div>Spend change: {selectedData.trend?.changes?.spend_pct ?? 'N/A'}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h4 className="font-semibold text-[#1e4a79] mb-3">Top Ad Sets</h4>
          {selectedData.adsets.length > 0 ? selectedData.adsets.slice(0, 5).map((item) => (
            <div key={item.adset_id} className="py-2 border-b border-gray-100 last:border-b-0 text-sm">
              <div className="font-medium text-[#374151]">{item.adset_name}</div>
              <div className="text-[#6b7280]">ROAS: {item.purchase_roas ?? 'N/A'}x • Spend: {formatCurrency(item.spend)}</div>
            </div>
          )) : <p className="text-sm text-[#6b7280]">No ad set data available.</p>}
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h4 className="font-semibold text-[#1e4a79] mb-3">Top Ads</h4>
          {selectedData.ads.length > 0 ? selectedData.ads.slice(0, 5).map((item) => (
            <div key={item.ad_id} className="py-2 border-b border-gray-100 last:border-b-0 text-sm">
              <div className="font-medium text-[#374151]">{item.ad_name}</div>
              <div className="text-[#6b7280]">ROAS: {item.purchase_roas ?? 'N/A'}x • Spend: {formatCurrency(item.spend)}</div>
            </div>
          )) : <p className="text-sm text-[#6b7280]">No ad data available.</p>}
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm mb-4">
        <h4 className="font-semibold text-[#1e4a79] mb-3">Recommendations</h4>
        {selectedData.recommendations.length > 0 ? (
          <div className="space-y-3">
            {selectedData.recommendations.map((rec, idx) => (
              <div key={`${rec.title}-${idx}`} className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-sm font-bold text-[#1e4a79]">{rec.title || 'Recommendation'}</div>
                <div className="text-xs text-[#64748b] mt-1">Priority: {rec.priority || 'N/A'}</div>
                <div className="text-sm text-[#374151] mt-2">{rec.reason || 'No reason provided.'}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">No recommendations currently available.</p>
        )}
      </div>

      {selectedData.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Warnings</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {selectedData.warnings.map((item, idx) => <li key={idx}>- {String(item)}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}

export default CampaignLevelInfo


import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import { analyticsAPI } from '../services/api'

const STATIC_METRICS = {
  spend: { value: 45000, change_percentage: 12.5 },
  revenue: { value: 180000, change_percentage: 15.3 },
  roas: { value: 4.0, target: 3.5, change_percentage: 2.5 },
  cpa: { value: 45, change_percentage: -8.2 },
  ctr: { value: 1.8, change_percentage: 5.4 },
  purchases: { value: 450, change_percentage: 10.1 },
  aov: { value: 400, change_percentage: 4.8 },
  reach_efficiency: { value: 35 }
}

function MetricsGrid({ days = 30, selectedCampaign = 'total', selectedAccount = 'total' }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        let data
        try {
          data = await analyticsAPI.getHeaderMetricsBySelection(days, selectedCampaign, selectedAccount)
        } catch (selectionError) {
          console.warn('Filtered header metrics unavailable; using default header metrics.', selectionError)
          data = await analyticsAPI.getHeaderMetrics(days)
        }
        setMetrics(data)
        setUsingFallback(false)
      } catch (err) {
        console.error("Failed to fetch metrics, using static data", err)
        setMetrics(STATIC_METRICS)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [days, selectedCampaign, selectedAccount])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (!metrics) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'N/A'
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val)
  }
  const formatNumber = (val) => {
    if (val === null || val === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US').format(val)
  }
  const formatPercent = (val) => {
    if (val === null || val === undefined) return 'N/A%'
    return `${val}%`
  }

  const getChangeType = (metric) => {
    if (!metric) return 'positive'
    if (metric.change_percentage !== undefined && metric.change_percentage !== null) {
      return metric.change_percentage >= 0 ? 'positive' : 'negative'
    }
    return 'positive'
  }

  const periodLabel = days === 1 ? 'DoD' : days === 7 ? 'WoW' : days === 30 ? 'MoM' : 'QoQ'

  const getChangeLabel = (val) => {
    if (val === null || val === undefined) return null
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val}%`
  }

  return (
    <div>
      {/* {usingFallback && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Unable to connect to live data. Showing demonstration metrics.
        </div>
      )} */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.spend && (
          <MetricCard
            title="$ Spend"
            value={formatCurrency(metrics.spend?.value)}
            change={getChangeLabel(metrics.spend?.change_percentage)}
            changeType={getChangeType(metrics.spend)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.revenue && (
          <MetricCard
            title="$ Revenue"
            value={formatCurrency(metrics.revenue?.value)}
            change={getChangeLabel(metrics.revenue?.change_percentage)}
            changeType={getChangeType(metrics.revenue)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.roas && (
          <MetricCard
            title="ROAS"
            value={`${metrics.roas?.value ?? 0} x`}
            target={metrics.roas?.target ? `${metrics.roas.target}x` : null}
            change={getChangeLabel(metrics.roas?.change_percentage)}
            changeType={getChangeType(metrics.roas)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.cpa && (
          <MetricCard
            title="Cost per Action"
            value={formatCurrency(metrics.cpa?.value)}
            change={getChangeLabel(metrics.cpa?.change_percentage)}
            changeType={getChangeType(metrics.cpa)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.ctr && (
          <MetricCard
            title="Click Through Rate"
            value={formatPercent(metrics.ctr?.value)}
            subtitle="Click Rate"
            change={getChangeLabel(metrics.ctr?.change_percentage)}
            changeType={getChangeType(metrics.ctr)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.purchases && (
          <MetricCard
            title="Purchases"
            value={formatNumber(metrics.purchases?.value)}
            change={getChangeLabel(metrics.purchases?.change_percentage)}
            changeType={getChangeType(metrics.purchases)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.aov && (
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(metrics.aov?.value)}
            change={getChangeLabel(metrics.aov?.change_percentage)}
            changeType={getChangeType(metrics.aov)}
            periodLabel={periodLabel}
          />
        )}
        {metrics.reach_efficiency && (
          <MetricCard
            title="Reach Efficiency"
            value={formatPercent(metrics.reach_efficiency?.value)}
            subtitle={metrics.reach_efficiency?.subtitle || "% of impressions reaching unique people"}
            change={metrics.reach_efficiency?.change_percentage !== undefined ? getChangeLabel(metrics.reach_efficiency.change_percentage) : null}
            changeType={metrics.reach_efficiency?.change_percentage !== undefined ? getChangeType(metrics.reach_efficiency) : null}
            periodLabel={periodLabel}
          />
        )}
      </div>
    </div>
  )
}

export default MetricsGrid



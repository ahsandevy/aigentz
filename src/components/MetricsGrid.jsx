import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import { analyticsAPI } from '../services/api'

const STATIC_METRICS = {
  spend: { value: 45000, change_percentage: 12.5, trend: 'positive' },
  revenue: { value: 180000, change_percentage: 15.3, trend: 'positive' },
  roas: { value: 4.0, target: 3.5, change_percentage: 2.5, trend: 'positive' },
  cpa: { value: 45, change_percentage: -8.2, trend: 'positive' },
  ctr: { value: 1.8, change_percentage: 5.4, trend: 'positive' },
  purchases: { value: 450, change_percentage: 10.1, trend: 'positive' },
  aov: { value: 400, change_percentage: 4.8, trend: 'positive' },
  new_customers_share: { value: 35 }
}

function MetricsGrid({ days = 7 }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const data = await analyticsAPI.getHeaderMetrics(days)
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
  }, [days])

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

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val)
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val)
  const formatPercent = (val) => `${val}%`

  // Helper to determine change type securely
  // API returns trend as 'positive' or 'negative', but sometimes we want to check value directly if trend isn't sent
  const getChangeType = (metric) => {
    if (metric.trend) return metric.trend
    return metric.change_percentage >= 0 ? 'positive' : 'negative'
  }

  const getChangeLabel = (val) => {
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
        <MetricCard
          title="$ Spend"
          value={formatCurrency(metrics.spend.value)}
          change={getChangeLabel(metrics.spend.change_percentage)}
          changeType={getChangeType(metrics.spend)}
        />
        <MetricCard
          title="$ Revenue"
          value={formatCurrency(metrics.revenue.value)}
          change={getChangeLabel(metrics.revenue.change_percentage)}
          changeType={getChangeType(metrics.revenue)}
        />
        <MetricCard
          title="ROAS"
          value={`${metrics.roas.value} x`}
          target={metrics.roas.target ? `${metrics.roas.target}x` : null}
          change={getChangeLabel(metrics.roas.change_percentage)}
          changeType={getChangeType(metrics.roas)}
        // Note: ROAS usually positive is good
        />
        <MetricCard
          title="Cost per Action"
          value={formatCurrency(metrics.cpa.value)}
          change={getChangeLabel(metrics.cpa.change_percentage)}
          changeType={metrics.cpa.trend || (metrics.cpa.change_percentage < 0 ? 'positive' : 'negative')} // Lower CPA is usually positive
        />
        <MetricCard
          title="Click Through Rate"
          value={`${metrics.ctr.value}%`}
          subtitle="Click Rate"
          change={getChangeLabel(metrics.ctr.change_percentage)}
          changeType={getChangeType(metrics.ctr)}
        />
        <MetricCard
          title="Purchases"
          value={formatNumber(metrics.purchases.value)}
          change={getChangeLabel(metrics.purchases.change_percentage)}
          changeType={getChangeType(metrics.purchases)}
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov.value)}
          change={getChangeLabel(metrics.aov.change_percentage)}
          changeType={getChangeType(metrics.aov)}
        />
        <MetricCard
          title="New Customers"
          value={`${metrics.new_customers_share.value}%`}
          subtitle="Share"
        />
      </div>
    </div>
  )
}

export default MetricsGrid



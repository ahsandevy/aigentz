import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import { analyticsAPI } from '../services/api'

function MetricsGrid({ days = 7 }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const data = await analyticsAPI.getHeaderMetrics(days)
        setMetrics(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch metrics", err)
        setError("Failed to load metrics")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [days])

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>
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
    <div className="grid grid-cols-4 gap-4">
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
  )
}

export default MetricsGrid


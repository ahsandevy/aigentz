import MetricCard from './MetricCard'

function MetricsGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="$ Spend"
        value="PKR 1,024,500"
        change="+12.3%"
        changeType="positive"
      />
      <MetricCard
        title="$ Revenue"
        value="PKR 14,239,000"
        change="+18%"
        changeType="positive"
      />
      <MetricCard
        title="ROAS"
        value="5.00 x"
        target="4.5x"
      />
      <MetricCard
        title="Cost per Action"
        value="PKR 2000"
        change="-8%"
        changeType="negative"
      />
      <MetricCard
        title="Click Through Rate"
        value="2.34%"
        subtitle="Click Rate"
      />
      <MetricCard
        title="Purchases"
        value="1,247"
        change="+12%"
        changeType="positive"
      />
      <MetricCard
        title="Average Order Value"
        value="PKR 11,000"
      />
      <MetricCard
        title="New Customers"
        value="63.00%"
        subtitle="Share"
      />
    </div>
  )
}

export default MetricsGrid


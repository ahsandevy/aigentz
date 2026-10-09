import { audienceContext, campaignStageSpend, funnelStageLabel, stageSpendBasisLabel } from '../utils/funnelClassification'

export default function FunnelContext({ item, showStage = false }) {
  const context = audienceContext(item)
  const distribution = campaignStageSpend(item)
  return (
    <div className="text-[10px] text-gray-500 whitespace-normal space-y-1 max-w-[320px]">
      {showStage && <p className="font-semibold">{funnelStageLabel(context.audienceStage)}</p>}
      <p>Objective: {context.objective} · Optimization: {context.optimization}</p>
      <p>Optimization event: {context.event}</p>
      <p>Expansion: {context.expansion} · Customer relationship: {context.customerRelationship}</p>
      <p>Lifecycle: {context.lifecycle}</p>
      <p>{context.reason}</p>
      <p>Configured audience relationship; delivered audience composition is unobserved.</p>
      {distribution.length > 0 && (
        <div>
          <p className="font-semibold">Ad-set stage spend</p>
          <p>{stageSpendBasisLabel(item)}</p>
          {distribution.map(({ stage, spend, percentage }) => (
            <p key={stage}>{stage}: {spend.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({percentage === null ? 'percentage unavailable' : `${percentage.toFixed(1)}%`})</p>
          ))}
        </div>
      )}
    </div>
  )
}

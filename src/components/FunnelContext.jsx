import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { audienceContext, campaignStageSpend, funnelStageLabel, stageSpendBasisLabel } from '../utils/funnelClassification'

export default function FunnelContext({ item }) {
  const [isOpen, setIsOpen] = useState(false)
  const detailsId = useId()
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const closeRef = useRef(null)
  const context = audienceContext(item)
  const distribution = campaignStageSpend(item)

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    dialog.showModal()
    closeRef.current?.focus()
    const trigger = triggerRef.current
    return () => {
      dialog.close()
      trigger?.focus()
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? detailsId : undefined}
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(true)
        }}
        className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-500 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {funnelStageLabel(context.audienceStage)}
      </button>
      {isOpen && createPortal(
        <dialog
          ref={dialogRef}
          id={detailsId}
          aria-modal="true"
          aria-labelledby={`${detailsId}-title`}
          onCancel={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsOpen(false)
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === 'Escape') {
              event.preventDefault()
              setIsOpen(false)
            }
          }}
          onClick={(event) => {
            event.stopPropagation()
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
          className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-0 text-left text-sm text-gray-600 shadow-xl backdrop:bg-gray-900/40"
        >
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id={`${detailsId}-title`} className="font-semibold text-gray-900">{funnelStageLabel(context.audienceStage)}</h2>
              <button ref={closeRef} type="button" onClick={() => setIsOpen(false)} aria-label="Close funnel details" className="cursor-pointer rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500">Close</button>
            </div>
            <div className="space-y-2">
              <p>Objective: {context.objective} · Optimization: {context.optimization}</p>
              <p>Optimization event: {context.event}</p>
              <p>Expansion: {context.expansion} · Customer relationship: {context.customerRelationship}</p>
              {['retention', 'reactivation'].includes(context.lifecycle) && (
                <p>Lifecycle strategy: {context.lifecycle}</p>
              )}
              <p>{context.reason}</p>
              <p className="text-xs text-gray-500">Configured audience relationship; delivered audience composition is unobserved.</p>
              {distribution.length > 0 && (
                <div className="space-y-1 border-t border-gray-100 pt-3">
                  <p className="font-semibold text-gray-900">Ad-set stage spend</p>
                  <p className="text-xs text-gray-500">{stageSpendBasisLabel(item)}</p>
                  {distribution.map(({ stage, spend, percentage }) => (
                    <p key={stage}>{stage}: {spend.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({percentage === null ? 'percentage unavailable' : `${percentage.toFixed(1)}%`})</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </dialog>, document.body,
      )}
    </>
  )
}

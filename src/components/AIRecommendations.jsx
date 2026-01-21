import RecommendationCard from './RecommendationCard'

function AIRecommendations() {
  const recommendations = [
    {
      priority: 'High',
      category: 'Budget',
      confidence: '87% Confidence',
      risk: 'Low Risk',
      title: 'Reallocate 15% budget from underperforming TOFU to high-performing BOFU retargeting',
      revenueLift: '+328,000 PKR Revenue Lift',
      revenueRange: '+245,000 to + 410,000 PKR',
      scope: [
        'Campaign: SS_PK_Sales_Prospecting_Broad_Q4',
        'Ad Set: AS_TOFU_Broad_PK_18-44_Auto'
      ],
      insights: [
        'Low ROAS of 2.4 vs account average of 5.0',
        'High CPA of 4,310 PKR vs account average of 2,283 PKR',
        'BOFU retargeting campaign showing 5.3 ROAS with capacity for more budget'
      ],
      metrics: [
        { label: 'Revenue Lift', value: '+328,000 PKR revenue lift', highlight: true },
        { label: 'CPA Change', value: '-520 PKR average CPA', highlight: false },
        { label: 'ROAS', value: '+0.8 points', highlight: false }
      ],
      owner: 'Performance Team',
      nextCheck: '48 hours'
    },
    {
      priority: 'High',
      category: 'Creative',
      confidence: '88% Confidence',
      risk: 'Low Risk',
      title: 'Scale winning creative across other campaigns and create variations',
      revenueLift: '+412,000 PKR Revenue Lift',
      revenueRange: '+318,000 to + 506,000 PKR',
      scope: [
        'Campaign: SS_PK_Sales_Reels_EidCollection',
        'Ad Set: AS_MOFU_Reels_Eid_Broad_25-45',
        'Ad Set: AD_Reels_Eid_Bestsellers_V3'
      ],
      insights: [
        'Exceptional performace: 9.93 ROAS, nearly 2x account average',
        'Low fatigue score of 28 - creative still fresh',
        'Viral coefficient high - organic shares detected'
      ],
      metrics: [
        { label: 'Revenue Lift', value: '+410,000 PKR revenue lift', highlight: true },
        { label: 'CPA Change', value: '-892 PKR', highlight: false },
        { label: 'ROAS', value: '+1.8 points', highlight: false }
      ],
      owner: 'Performance Team',
      nextCheck: '3 days'
    }
  ]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">AI Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} {...rec} />
        ))}
      </div>
    </section>
  )
}

export default AIRecommendations



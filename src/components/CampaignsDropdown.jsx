function getCampaignLabel(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return (
    item?.campaign?.name ||
    item?.attributes?.name ||
    item?.campaign_name ||
    item?.name ||
    item?.title ||
    item?.campaign_id ||
    item?.id ||
    `Campaign ${index + 1}`
  )
}

function getCampaignValue(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return item?.campaign?.id || item?.campaign_id || item?.id || getCampaignLabel(item, index)
}

function CampaignsDropdown({ value = 'total', onChange, className = '', campaigns = [], loading = false }) {
  return (
    <div className={`bg-white rounded-lg border border-[#e5e7eb] p-4 shadow-sm ${className}`}>
      <label htmlFor="campaigns-dropdown" className="block text-sm font-semibold text-[#1e4a79] mb-2">
        Campaigns
      </label>
      <select
        id="campaigns-dropdown"
        className="w-full bg-[#f8fafc] border border-[#d1d5db] rounded-md px-3 py-2 text-sm text-[#374151] focus:outline-none"
        disabled={loading && campaigns.length === 0}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="total">
          {loading && campaigns.length === 0 ? 'Loading campaigns...' : 'Total'}
        </option>
        {campaigns.map((item, index) => (
          <option key={`${getCampaignValue(item, index)}-${index}`} value={getCampaignValue(item, index)}>
            {getCampaignLabel(item, index)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CampaignsDropdown

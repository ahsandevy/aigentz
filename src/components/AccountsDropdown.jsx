function getAccountLabel(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return (
    item?.account?.name ||
    item?.attributes?.name ||
    item?.account_name ||
    item?.name ||
    item?.client_name ||
    item?.account_id ||
    item?.id ||
    `Account ${index + 1}`
  )
}

function getAccountValue(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return item?.account?.id || item?.account_id || item?.id || getAccountLabel(item, index)
}

function AccountsDropdown({ value = 'total', onChange, className = '', accounts = [], loading = false }) {
  const defaultAccountLabel = loading && accounts.length === 0
    ? 'Loading accounts...'
    : 'Servis Shoes AED Account'

  return (
    <div className={`bg-white rounded-lg border border-[#e5e7eb] p-4 shadow-sm ${className}`}>
      <label htmlFor="accounts-dropdown" className="block text-sm font-semibold text-[#1e4a79] mb-2">
        Accounts
      </label>
      <select
        id="accounts-dropdown"
        className="w-full bg-[#f8fafc] border border-[#d1d5db] rounded-md px-3 py-2 text-sm text-[#374151] focus:outline-none"
        disabled={loading && accounts.length === 0}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="total">
          {defaultAccountLabel}
        </option>
        {accounts.map((item, index) => (
          <option key={`${getAccountValue(item, index)}-${index}`} value={getAccountValue(item, index)}>
            {getAccountLabel(item, index)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AccountsDropdown

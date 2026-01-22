function FeatureCards() {
  const features = [
    {
      title: "Never Miss an opportunity",
      description: "The AI continuously scans campaigns fro growth moves, working 24/7 while you focus on strategy.",
      icon: (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16.5" cy="16.5" r="15" stroke="#1e4a79" strokeWidth="2" fill="none"/>
          <circle cx="16.5" cy="16.5" r="2" fill="#1e4a79"/>
          <path d="M16.5 6V16.5L22 22" stroke="#1e4a79" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "No expertise Needed",
      description: "Plain-English insights, plain-English actions. Ask questions naturally, get answers instantly.",
      icon: (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 2L20.09 12.26L31 13.18L22.5 20.14L25.18 31L16.5 24.77L7.82 31L10.5 20.14L2 13.18L12.91 12.26L16.5 2Z" fill="#1e4a79" opacity="0.8"/>
          <path d="M16.5 8L18.82 14.18L25 15.09L20 19.18L21.82 25.36L16.5 21.55L11.18 25.36L13 19.18L8 15.09L14.18 14.18L16.5 8Z" fill="#EDF0A8"/>
        </svg>
      )
    },
    {
      title: "From Question to Action",
      description: "Simply ask the AI reasons with context, and executes safely - in minutes, not weeks.",
      icon: (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 2L12.5 18H16.5L13.5 31L20.5 15H16.5L19.5 2Z" fill="#1e4a79" opacity="0.8"/>
          <path d="M18 4L12 17H15L13 28L19 15H16L18 4Z" fill="#EDF0A8"/>
        </svg>
      )
    },
    {
      title: "Full Control",
      description: "Always with audit trails, guardrails, and rollback options. Your rues, always.",
      icon: (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 2L6 8V16.5C6 23.5 11 29 16.5 31C22 29 27 23.5 27 16.5V8L16.5 2Z" fill="#1e4a79" opacity="0.8" stroke="#1e4a79" strokeWidth="1.5"/>
          <path d="M16.5 6L9 10.5V16.5C9 21.5 12.5 25.5 16.5 27C20.5 25.5 24 21.5 24 16.5V10.5L16.5 6Z" fill="#EDF0A8"/>
          <circle cx="16.5" cy="16.5" r="3" fill="#1e4a79"/>
        </svg>
      )
    }
  ]

  return (
    <div className="w-full max-w-[1370px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-[11px] p-5 md:p-6 shadow-[inset_0.724px_0.724px_3.06px_0px_rgba(205,204,204,0.68)] border border-gray-100/50"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              {/* Icon Container */}
              <div className="bg-[#f0f0bc] rounded-[6px] w-[52px] h-[52px] flex items-center justify-center flex-shrink-0 shadow-sm">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-[#1e4a79] text-[18px] font-extrabold mb-2 capitalize leading-tight">
                  {feature.title}
                </h3>
                <p className="text-[#374151] text-[15px] md:text-[16px] leading-relaxed opacity-90">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeatureCards


function HeroSection() {
  return (
    <div className="w-full max-w-[1269px] mx-auto px-4 md:px-8 mb-2">
      {/* Badge */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/36 backdrop-blur-sm border border-[#f3f4f6] rounded-full px-4 md:px-5 py-1.5 md:py-2 shadow-sm flex items-center gap-2 md:gap-2.5">
          <div className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex items-center justify-center flex-shrink-0">
            <img 
              src="/ai 2.png" 
              alt="AI Intelligence" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[#062a74] text-[12px] md:text-[15px] font-bold capitalize whitespace-nowrap">
            Always-on Marketing intelligence
          </span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-4 px-2">
        <h1 className="text-[#1e4a79] text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-[1.1] md:leading-[1.05] mb-2">
          Marketing Expertise, on Demand.
        </h1>
        <h1 className="text-[#1e4a79] text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-[1.1] md:leading-[1.05] mb-4">
          Always available. Always Executing.
        </h1>
      </div>

      {/* Subheading */}
      <div className="text-center max-w-[700px] mx-auto px-4">
        <p className="text-[#374151] text-[14px] md:text-[16px] font-medium leading-[1.5] mb-1">
          An AI-powered growth strategist that detects wasted spend, reallocated budgets,
        </p>
        <p className="text-[#374151] text-[14px] md:text-[16px] font-medium leading-[1.5]">
          refreshes creatives, and optimizes performance - no expertise required
        </p>
      </div>
    </div>
  )
}

export default HeroSection


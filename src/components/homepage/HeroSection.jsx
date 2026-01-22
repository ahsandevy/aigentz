function HeroSection() {
  return (
    <div className="w-full max-w-[1269px] mx-auto px-4 md:px-8 mb-16">
      {/* Badge */}
      <div className="flex justify-center mb-8 md:mb-12">
        <div className="bg-white/36 backdrop-blur-sm border border-[#f3f4f6] rounded-full px-4 md:px-6 py-2 md:py-3 shadow-[1.481px_1.481px_2.932px_0px_rgba(0,0,0,0.25)] flex items-center gap-2 md:gap-3">
          <div className="w-[28px] h-[28px] md:w-[38px] md:h-[38px] flex items-center justify-center flex-shrink-0">
            <img 
              src="/ai 2.png" 
              alt="AI Intelligence" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[#062a74] text-[16px] md:text-[22px] font-bold capitalize whitespace-nowrap">
            Always-on Marketing intelligence
          </span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-6 px-2">
        <h1 className="text-[#1e4a79] text-[32px] sm:text-[45px] md:text-[65px] font-bold leading-[1.1] md:leading-[1.02] mb-4">
          Marketing Expertise, on Demand.
        </h1>
        <h1 className="text-[#1e4a79] text-[32px] sm:text-[45px] md:text-[65px] font-bold leading-[1.1] md:leading-[1.02] mb-6">
          Always available. Always Executing.
        </h1>
      </div>

      {/* Subheading */}
      <div className="text-center max-w-[900px] mx-auto px-4">
        <p className="text-[#374151] text-[15px] sm:text-[16px] md:text-[22px] font-medium leading-[1.5] md:leading-[1.4] mb-2">
          An AI-powered growth strategist that detects wasted spend, reallocated budgets,
        </p>
        <p className="text-[#374151] text-[15px] sm:text-[16px] md:text-[22px] font-medium leading-[1.5] md:leading-[1.4]">
          refreshes creatives, and optimizes performance - no expertise required
        </p>
      </div>
    </div>
  )
}

export default HeroSection


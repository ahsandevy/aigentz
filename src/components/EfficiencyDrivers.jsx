import React, { useState, useEffect, useRef } from 'react';
import { analyticsAPI } from '../services/api';

// Pie Chart Component
function PieChart({ data, size = 200 }) {
  // Theme-aligned colors matching the app's color scheme
  const colors = ['#1e4a79', '#78a3cd', '#16a34a'];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm text-gray-400">No data</span>
      </div>
    );
  }

  let currentAngle = -90; // Start from top
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  const segments = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const angle = (item.count / total) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      path: pathData,
      color: colors[index % colors.length],
      label: item.label,
      count: item.count,
      percentage: percentage.toFixed(1),
      conversion_rate: item.conversion_rate
    };
  });

  const handleMouseMove = (e, index, svgRef) => {
    if (svgRef && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      });
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const svgRef = useRef(null);

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative" onMouseLeave={handleMouseLeave}>
        <svg ref={svgRef} width={size} height={size} className="mb-4">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="transition-all cursor-pointer"
              style={{
                opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.5,
                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center'
              }}
              onMouseMove={(e) => handleMouseMove(e, index, svgRef)}
            />
          ))}
        </svg>
        {hoveredIndex !== null && (
          <div
            className="absolute bg-[#1e4a79] text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 50}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-bold">{segments[hoveredIndex].label}</div>
            <div className="text-xs font-normal opacity-90">
              {segments[hoveredIndex].count.toLocaleString()}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2 w-full">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-xs font-semibold text-[#374151]">{segment.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#111827]">
                {segment.count.toLocaleString()}
              </span>
              {segment.conversion_rate && (
                <span className="text-[10px] text-[#6b7280] block">
                  CR: {segment.conversion_rate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EfficiencyDrivers({ days = 7 }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    funnelMix: [],
    conversionFunnel: [],
    qualityRankings: [],
    placementPerformanceLabel: null,
    placementPerformanceValueLabel: null,
    placementPerformance: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await analyticsAPI.getEfficiencyDrivers(days);
        setData(result);
      } catch (error) {
        console.error('Error fetching efficiency drivers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  const formatPlacementValue = (value, metricKey = 'spend') => {
    if (value === null || value === undefined) return '-';

    if (metricKey === 'spend') {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M AED`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K AED`;
      return `${value.toLocaleString()} AED`;
    }

    // Fallback: just format as generic number
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e4a79]"></div>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">Efficiency Drivers</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Funnel Mix */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Funnel Mix</h3>
          <div className="space-y-4">
            {data.funnelMix && data.funnelMix.length > 0 ? (
              data.funnelMix.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#111827]">{item.label}</span>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#78a3cd] block">{item.roas}</span>
                      <span className="text-[10px] text-[#374151]">{item.spend}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-[9px]">
                    <div className="bg-[#78a3cd] h-[9px] rounded-full transition-all duration-500" style={{ width: item.width }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-gray-400">No data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-[#fafafa] rounded-lg border border-[#e5e7eb] p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Conversion Funnel</h3>
          {data.conversionFunnel && data.conversionFunnel.length > 0 ? (
            <PieChart data={data.conversionFunnel} size={180} />
          ) : (
            <div className="flex items-center justify-center h-48">
              <span className="text-sm text-gray-400">No data available</span>
            </div>
          )}
        </div>

        {/* Quality Rankings */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-4">Quality Rankings</h3>
          <div className="space-y-3">
            {data.qualityRankings && data.qualityRankings.length > 0 ? (
              data.qualityRankings.map((item, idx) => {
                const getQualityColor = (ranking) => {
                  switch (ranking) {
                    case 'ABOVE_AVERAGE':
                      return '#16a34a'; // Green
                    case 'AVERAGE':
                      return '#f59e0b'; // Amber/Yellow
                    case 'BELOW_AVERAGE':
                      return '#dc2626'; // Red
                    default:
                      return '#6b7280'; // Gray
                  }
                };
                
                const formatQualityRanking = (ranking) => {
                  return ranking
                    .split('_')
                    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(' ');
                };
                
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#6b7280] truncate max-w-[150px]" title={item.name}>{item.name}</span>
                    <span 
                      className="px-2 py-1 rounded-[4px] text-[12px] font-bold text-white min-w-[100px] text-center" 
                      style={{ backgroundColor: getQualityColor(item.quality_ranking) }}
                    >
                      {formatQualityRanking(item.quality_ranking)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-gray-400">No data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Placement Performance */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[4px_4px_11.5px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#374151] mb-3">
            {data.placementPerformanceLabel || 'Top 5 placements by spend'}
          </h3>
          <div className="space-y-3">
            {data.placementPerformance && data.placementPerformance.length > 0 ? (
              data.placementPerformance.map((item, idx) => {
                const metricKey = data.placementPerformanceValueLabel || 'spend';
                const rawValue = item[metricKey] ?? item.spend;
                const displayValue = formatPlacementValue(rawValue, metricKey);

                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span
                      className="text-[12px] font-bold text-[#6b7280] truncate max-w-[150px]"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-[12px] font-bold ${idx === 0 ? 'text-[#78a3cd]' : 'text-[#6b7280]'}`}
                    >
                      {displayValue}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-gray-400">No data available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EfficiencyDrivers;

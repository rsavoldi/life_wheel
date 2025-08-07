'use client';

import type { LifeArea } from '@/types';
import type { Dispatch, SetStateAction } from 'react';

interface WheelChartProps {
  areas: LifeArea[];
  setAreas: Dispatch<SetStateAction<LifeArea[]>>;
}

export function WheelChart({ areas, setAreas }: WheelChartProps) {
  const SVG_SIZE = 600;
  const centerX = SVG_SIZE / 2;
  const centerY = SVG_SIZE / 2;
  const maxRadius = SVG_SIZE / 2 - 60; // Space for labels
  const numLevels = 10;
  const numSlices = areas.length;
  if (numSlices === 0) return null;

  const handleSliceClick = (areaId: string, level: number) => {
    setAreas((prevAreas) =>
      prevAreas.map((area) =>
        area.id === areaId ? { ...area, score: level } : area
      )
    );
  };
  
  const getPathForSlice = (index: number, score: number): string => {
    const radius = (score / numLevels) * maxRadius;
    if (radius <= 0) return '';
    
    const sliceAngle = (2 * Math.PI) / numSlices;
    const startAngle = index * sliceAngle - Math.PI / 2;
    const endAngle = (index + 1) * sliceAngle - Math.PI / 2;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    return [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');
  };
  
  return (
    <div className="w-full max-w-lg aspect-square">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
            <defs>
                {areas.map((area) => (
                    <radialGradient id={`grad-${area.id}`} key={area.id}>
                        <stop offset="20%" stopColor={area.color} stopOpacity="0.7" />
                        <stop offset="95%" stopColor={area.color} stopOpacity="0.4" />
                    </radialGradient>
                ))}
            </defs>
            {/* Background Grid & Clickable Areas */}
            <g opacity="0.5">
                {Array.from({ length: numLevels }).map((_, i) => {
                  const level = numLevels - i;
                  const radius = (level / numLevels) * maxRadius;
                  return (
                    <circle
                        key={`level-circle-${i}`}
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="0.5"
                        strokeDasharray="2 4"
                    />
                )})}
                {areas.map((area, index) => {
                    const angle = (index / numSlices) * 2 * Math.PI - Math.PI / 2;
                    const lineX = centerX + maxRadius * Math.cos(angle);
                    const lineY = centerY + maxRadius * Math.sin(angle);
                    return (
                        <g key={`slice-grid-${area.id}`}>
                          <line
                              key={`divider-${index}`}
                              x1={centerX}
                              y1={centerY}
                              x2={lineX}
                              y2={lineY}
                              stroke="hsl(var(--muted-foreground))"
                              strokeWidth="0.5"
                          />
                          {/* Clickable regions */}
                          {Array.from({ length: numLevels }).map((_, i) => {
                                const level = i + 1;
                                const path = getPathForSlice(index, level);
                                const innerPath = getPathForSlice(index, level-1);

                                const clipPathId = `clip-${area.id}-${level}`;
                                return (
                                  <g key={`clickable-${area.id}-${level}`}>
                                    <clipPath id={clipPathId}>
                                      <path d={path} />
                                      {level > 1 && <path d={innerPath} fill="white" style={{transform: 'scale(1.01)', transformOrigin: 'center center'}} />}
                                    </clipPath>
                                    <path
                                      d={path}
                                      fill="transparent"
                                      className="cursor-pointer"
                                      onClick={() => handleSliceClick(area.id, level)}
                                      // clipPath={`url(#${clipPathId})`}
                                    />
                                  </g>
                                )
                            })}
                        </g>
                    );
                })}
            </g>
            
            {/* Scored Slices */}
            <g pointerEvents="none">
                {areas.map((area, index) => (
                    <path
                        key={`slice-path-${area.id}`}
                        d={getPathForSlice(index, area.score)}
                        fill={`url(#grad-${area.id})`}
                        stroke={area.color}
                        strokeWidth="1.5"
                        style={{transition: 'd 0.3s ease-in-out'}}
                    />
                ))}
            </g>

            {/* Labels */}
            <g pointerEvents="none">
                {areas.map((area, index) => {
                    const sliceAngle = (2 * Math.PI) / numSlices;
                    const midAngle = (index + 0.5) * sliceAngle - Math.PI / 2;
                    const labelRadius = maxRadius + 30;
                    const labelX = centerX + labelRadius * Math.cos(midAngle);
                    const labelY = centerY + labelRadius * Math.sin(midAngle);

                    return (
                        <text
                            key={`label-${area.id}`}
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-xs md:text-sm font-medium"
                        >
                            {area.name}
                        </text>
                    );
                })}
            </g>
        </svg>
    </div>
  );
}
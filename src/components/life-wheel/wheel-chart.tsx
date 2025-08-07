'use client';

import type { LifeArea } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

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
  const [rotation, setRotation] = useState(0);

  if (numSlices === 0) return null;

  const handleScoreChange = (areaId: string, direction: 'increase' | 'decrease') => {
    setAreas((prevAreas) =>
      prevAreas.map((area) => {
        if (area.id === areaId) {
          let newScore = area.score;
          if (direction === 'increase') {
            newScore = Math.min(10, area.score + 1);
          } else {
            newScore = Math.max(0, area.score - 1);
          }
          return { ...area, score: newScore };
        }
        return area;
      })
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
    <div className="w-full max-w-lg aspect-square relative">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full" id="life-wheel-svg">
            <defs>
                {areas.map((area) => (
                    <radialGradient id={`grad-${area.id}`} key={area.id}>
                        <stop offset="20%" stopColor={area.color} stopOpacity="0.7" />
                        <stop offset="95%" stopColor={area.color} stopOpacity="0.4" />
                    </radialGradient>
                ))}
            </defs>
            <g transform={`rotate(${rotation}, ${centerX}, ${centerY})`} style={{ transition: 'transform 0.5s ease-out' }}>
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
                          data-strokecolor="muted-foreground"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth="0.5"
                          strokeDasharray="2 4"
                      />
                  )})}
                  {areas.map((_, index) => {
                      const angle = (index / numSlices) * 2 * Math.PI - Math.PI / 2;
                      const lineX = centerX + maxRadius * Math.cos(angle);
                      const lineY = centerY + maxRadius * Math.sin(angle);
                      return (
                          <line
                              key={`divider-${index}`}
                              x1={centerX}
                              y1={centerY}
                              x2={lineX}
                              y2={lineY}
                              data-strokecolor="muted-foreground"
                              stroke="hsl(var(--muted-foreground))"
                              strokeWidth="0.5"
                          />
                      );
                  })}
              </g>
              
              {/* Clickable areas */}
              {areas.map((area, index) => (
                <g key={`clickable-slice-${area.id}`}>
                  {/* Increase score area */}
                  <path
                    d={getPathForSlice(index, 10)}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleScoreChange(area.id, 'increase')}
                  />
                   {/* Decrease score area */}
                  <path
                    d={getPathForSlice(index, area.score)}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from bubbling to the increase area
                      handleScoreChange(area.id, 'decrease');
                    }}
                  />
                </g>
              ))}

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

               {/* Score Numbers */}
               <g pointerEvents="none">
                {areas.map((area, index) => {
                  if (area.score === 0) return null;
                  const sliceAngle = (2 * Math.PI) / numSlices;
                  const midAngle = (index + 0.5) * sliceAngle - Math.PI / 2;
                  const numberRadius = ((area.score / numLevels) * maxRadius) * 0.6 + 20;
                  const numberX = centerX + numberRadius * Math.cos(midAngle);
                  const numberY = centerY + numberRadius * Math.sin(midAngle);
                  
                  return (
                    <text
                      key={`score-number-${area.id}`}
                      x={numberX}
                      y={numberY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      data-fillcolor="foreground"
                      className="fill-foreground text-sm font-bold opacity-30"
                      transform={`rotate(${-rotation}, ${numberX}, ${numberY})`}
                    >
                      {area.score}
                    </text>
                  );
                })}
              </g>

              {/* Labels */}
              <g pointerEvents="none">
                  {areas.map((area, index) => {
                      const sliceAngle = (2 * Math.PI) / numSlices;
                      const midAngle = (index + 0.5) * sliceAngle - Math.PI / 2;
                      const labelRadius = maxRadius + 30;
                      const labelX = centerX + labelRadius * Math.cos(midAngle);
                      const labelY = centerY + labelRadius * Math.sin(midAngle);
                      
                      const textRotation = (midAngle * 180) / Math.PI + 90;
                      
                      return (
                          <text
                              key={`label-${area.id}`}
                              x={labelX}
                              y={labelY}
                              transform={`rotate(${textRotation}, ${labelX}, ${labelY})`}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              data-fillcolor="foreground"
                              className="fill-foreground text-xs md:text-sm font-medium"
                          >
                              {area.name}
                          </text>
                      );
                  })}
              </g>
            </g>
        </svg>
        <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            onClick={() => setRotation(r => r + (360 / numSlices))}
        >
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Rotate Wheel</span>
        </Button>
    </div>
  );
}

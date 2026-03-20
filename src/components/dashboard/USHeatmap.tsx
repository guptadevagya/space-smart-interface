import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { US_PROVIDERS, getProvidersByType, getProviderById, ProviderType } from '@/lib/providerProfiles';
import { USProviderView } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface USHeatmapProps {
  providerView: USProviderView;
  selectedProviderId: string | null;
}

// Simplified US state paths (centered on 0,0 with viewBox 0 0 960 600)
const STATE_PATHS: Record<string, { d: string; label: string; cx: number; cy: number }> = {
  AL: { d: 'M628,396 L628,438 L623,468 L618,468 L614,450 L604,450 L604,396Z', label: 'Alabama', cx: 616, cy: 432 },
  AK: { d: 'M161,485 L183,485 L183,510 L161,510Z', label: 'Alaska', cx: 172, cy: 497 },
  AZ: { d: 'M205,390 L258,390 L258,450 L230,468 L205,460Z', label: 'Arizona', cx: 232, cy: 425 },
  AR: { d: 'M555,395 L600,395 L600,435 L555,435Z', label: 'Arkansas', cx: 577, cy: 415 },
  CA: { d: 'M120,280 L155,280 L170,320 L180,370 L165,430 L135,430 L110,370 L105,310Z', label: 'California', cx: 140, cy: 355 },
  CO: { d: 'M270,290 L340,290 L340,340 L270,340Z', label: 'Colorado', cx: 305, cy: 315 },
  CT: { d: 'M828,210 L845,210 L845,225 L828,225Z', label: 'Connecticut', cx: 836, cy: 217 },
  DE: { d: 'M808,280 L818,280 L818,300 L808,300Z', label: 'Delaware', cx: 813, cy: 290 },
  FL: { d: 'M640,455 L680,440 L710,470 L700,510 L670,530 L650,510 L640,480Z', label: 'Florida', cx: 675, cy: 485 },
  GA: { d: 'M640,395 L680,395 L680,450 L640,455Z', label: 'Georgia', cx: 660, cy: 425 },
  HI: { d: 'M260,490 L285,490 L285,510 L260,510Z', label: 'Hawaii', cx: 272, cy: 500 },
  ID: { d: 'M195,165 L225,165 L230,240 L200,260 L190,220Z', label: 'Idaho', cx: 210, cy: 210 },
  IL: { d: 'M590,260 L615,260 L618,340 L598,350 L585,310Z', label: 'Illinois', cx: 600, cy: 305 },
  IN: { d: 'M620,265 L645,265 L645,340 L620,340Z', label: 'Indiana', cx: 632, cy: 302 },
  IA: { d: 'M520,240 L580,240 L580,285 L520,285Z', label: 'Iowa', cx: 550, cy: 262 },
  KS: { d: 'M410,320 L500,320 L500,360 L410,360Z', label: 'Kansas', cx: 455, cy: 340 },
  KY: { d: 'M625,340 L700,330 L700,360 L625,370Z', label: 'Kentucky', cx: 662, cy: 350 },
  LA: { d: 'M555,440 L600,440 L600,485 L570,490 L555,470Z', label: 'Louisiana', cx: 575, cy: 462 },
  ME: { d: 'M860,120 L880,120 L885,170 L860,170Z', label: 'Maine', cx: 872, cy: 145 },
  MD: { d: 'M760,280 L805,270 L805,295 L760,300Z', label: 'Maryland', cx: 782, cy: 285 },
  MA: { d: 'M835,195 L862,195 L862,208 L835,208Z', label: 'Massachusetts', cx: 848, cy: 201 },
  MI: { d: 'M615,180 L660,180 L665,255 L625,260 L615,220Z', label: 'Michigan', cx: 640, cy: 220 },
  MN: { d: 'M490,140 L545,140 L545,230 L490,230Z', label: 'Minnesota', cx: 517, cy: 185 },
  MS: { d: 'M580,400 L604,400 L608,468 L580,468Z', label: 'Mississippi', cx: 594, cy: 434 },
  MO: { d: 'M520,310 L580,310 L585,380 L540,380 L520,350Z', label: 'Missouri', cx: 550, cy: 345 },
  MT: { d: 'M240,120 L340,120 L340,180 L240,180Z', label: 'Montana', cx: 290, cy: 150 },
  NE: { d: 'M380,265 L480,265 L480,310 L400,310 L380,290Z', label: 'Nebraska', cx: 430, cy: 287 },
  NV: { d: 'M170,250 L210,250 L215,350 L180,380 L160,340Z', label: 'Nevada', cx: 185, cy: 310 },
  NH: { d: 'M850,155 L862,155 L862,195 L850,195Z', label: 'New Hampshire', cx: 856, cy: 175 },
  NJ: { d: 'M810,245 L825,245 L825,285 L810,285Z', label: 'New Jersey', cx: 817, cy: 265 },
  NM: { d: 'M260,370 L330,370 L330,445 L260,445Z', label: 'New Mexico', cx: 295, cy: 407 },
  NY: { d: 'M770,175 L835,175 L845,210 L810,240 L770,230Z', label: 'New York', cx: 805, cy: 205 },
  NC: { d: 'M660,350 L760,340 L770,370 L680,380 L660,370Z', label: 'North Carolina', cx: 715, cy: 360 },
  ND: { d: 'M400,130 L480,130 L480,180 L400,180Z', label: 'North Dakota', cx: 440, cy: 155 },
  OH: { d: 'M650,260 L700,255 L705,320 L655,330 L650,290Z', label: 'Ohio', cx: 677, cy: 290 },
  OK: { d: 'M395,365 L500,365 L500,405 L420,410 L395,390Z', label: 'Oklahoma', cx: 450, cy: 385 },
  OR: { d: 'M115,145 L190,145 L195,210 L130,220 L115,190Z', label: 'Oregon', cx: 150, cy: 180 },
  PA: { d: 'M720,235 L800,230 L805,270 L730,275Z', label: 'Pennsylvania', cx: 762, cy: 252 },
  RI: { d: 'M848,212 L858,212 L858,222 L848,222Z', label: 'Rhode Island', cx: 853, cy: 217 },
  SC: { d: 'M680,380 L720,370 L730,400 L690,410Z', label: 'South Carolina', cx: 705, cy: 390 },
  SD: { d: 'M400,185 L480,185 L480,240 L400,240Z', label: 'South Dakota', cx: 440, cy: 212 },
  TN: { d: 'M590,360 L700,350 L700,380 L600,390Z', label: 'Tennessee', cx: 645, cy: 370 },
  TX: { d: 'M340,390 L420,415 L445,490 L400,520 L350,500 L310,460 L310,420Z', label: 'Texas', cx: 380, cy: 455 },
  UT: { d: 'M225,250 L270,250 L270,340 L225,340Z', label: 'Utah', cx: 247, cy: 295 },
  VT: { d: 'M840,155 L850,155 L850,195 L840,195Z', label: 'Vermont', cx: 845, cy: 175 },
  VA: { d: 'M700,310 L770,300 L785,340 L720,355 L700,340Z', label: 'Virginia', cx: 740, cy: 325 },
  WA: { d: 'M130,90 L200,90 L200,150 L130,150Z', label: 'Washington', cx: 165, cy: 120 },
  WV: { d: 'M710,290 L740,280 L745,325 L720,340 L710,315Z', label: 'West Virginia', cx: 727, cy: 310 },
  WI: { d: 'M545,160 L600,160 L605,240 L545,240Z', label: 'Wisconsin', cx: 572, cy: 200 },
  WY: { d: 'M260,185 L335,185 L335,245 L260,245Z', label: 'Wyoming', cx: 297, cy: 215 },
  DC: { d: 'M785,295 L795,295 L795,305 L785,305Z', label: 'D.C.', cx: 790, cy: 300 },
};

const USHeatmap: React.FC<USHeatmapProps> = ({ providerView, selectedProviderId }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Build state → provider count and provider list
  const { stateData, maxCount } = useMemo(() => {
    let providers = US_PROVIDERS;
    if (selectedProviderId) {
      const p = getProviderById(selectedProviderId);
      providers = p ? [p] : [];
    } else if (providerView !== 'all') {
      providers = getProvidersByType(providerView as ProviderType);
    }

    const stateMap: Record<string, { count: number; names: string[] }> = {};
    providers.forEach((p) => {
      p.states.forEach((s) => {
        if (!stateMap[s]) stateMap[s] = { count: 0, names: [] };
        stateMap[s].count++;
        stateMap[s].names.push(p.name);
      });
    });

    let max = 0;
    Object.values(stateMap).forEach((v) => { if (v.count > max) max = v.count; });
    return { stateData: stateMap, maxCount: max };
  }, [providerView, selectedProviderId]);

  const getStateFill = (stateCode: string): string => {
    const data = stateData[stateCode];
    if (!data || data.count === 0) return 'hsl(var(--muted))';
    const intensity = maxCount > 0 ? data.count / maxCount : 0;
    // Scale from light to saturated primary
    const lightness = 85 - intensity * 45; // 85% to 40%
    return `hsl(222, 47%, ${lightness}%)`;
  };

  const label = selectedProviderId
    ? getProviderById(selectedProviderId)?.name || 'Provider'
    : providerView === 'all'
      ? 'All U.S. Providers'
      : `${providerView.toUpperCase()} Systems`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Provider Geographic Presence</CardTitle>
        <CardDescription className="text-xs">
          {label} — States colored by number of systems present
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <svg viewBox="80 70 830 470" className="w-full h-auto" role="img" aria-label="US Provider Heatmap">
            {Object.entries(STATE_PATHS).map(([code, state]) => {
              const data = stateData[code];
              return (
                <Tooltip key={code}>
                  <TooltipTrigger asChild>
                    <path
                      d={state.d}
                      fill={getStateFill(code)}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      className="cursor-pointer transition-all duration-200 hover:opacity-80"
                      onMouseEnter={() => setHoveredState(code)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <p className="font-bold text-xs">{state.label} ({code})</p>
                    {data ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">
                          {data.count} system{data.count !== 1 ? 's' : ''}
                        </p>
                        {data.names.slice(0, 6).map((n, i) => (
                          <p key={i} className="text-[10px]">• {n}</p>
                        ))}
                        {data.names.length > 6 && (
                          <p className="text-[10px] text-muted-foreground">
                            +{data.names.length - 6} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-1">No tracked providers</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {/* State labels */}
            {Object.entries(STATE_PATHS).map(([code, state]) => (
              <text
                key={`label-${code}`}
                x={state.cx}
                y={state.cy}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none"
                fill="hsl(var(--foreground))"
                fontSize={8}
                fontWeight={600}
                opacity={0.7}
              >
                {code}
              </text>
            ))}
          </svg>
        </TooltipProvider>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--muted))' }} />
            <span className="text-[10px] text-muted-foreground">No providers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(222, 47%, 75%)' }} />
            <span className="text-[10px] text-muted-foreground">Few</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(222, 47%, 50%)' }} />
            <span className="text-[10px] text-muted-foreground">Many</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default USHeatmap;

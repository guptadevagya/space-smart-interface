import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { US_PROVIDERS, getProvidersByType, getProviderById, ProviderType } from '@/lib/providerProfiles';
import { getStateMarketByAbbr } from '@/lib/stateMarketData';
import { USProviderView } from '@/lib/types';
import { USAMap, USAStateAbbreviation } from '@mirawision/usa-map-react';

interface USHeatmapProps {
  providerView: USProviderView;
  selectedProviderId: string | null;
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

const USHeatmap: React.FC<USHeatmapProps> = ({ providerView, selectedProviderId }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Build state → provider data
  const { stateData, maxCount } = useMemo(() => {
    let providers = US_PROVIDERS;
    if (selectedProviderId) {
      const p = getProviderById(selectedProviderId);
      providers = p ? [p] : [];
    } else if (providerView !== 'all') {
      providers = getProvidersByType(providerView as ProviderType);
    }

    const stateMap: Record<string, { count: number; names: string[]; totalBirths: number }> = {};
    providers.forEach((p) => {
      p.states.forEach((s) => {
        if (!stateMap[s]) stateMap[s] = { count: 0, names: [], totalBirths: 0 };
        stateMap[s].count++;
        stateMap[s].names.push(p.name);
        stateMap[s].totalBirths += p.annualBirths;
      });
    });

    let max = 0;
    Object.values(stateMap).forEach((v) => { if (v.count > max) max = v.count; });
    return { stateData: stateMap, maxCount: max };
  }, [providerView, selectedProviderId]);

  const getStateFill = useCallback((stateCode: string): string => {
    const data = stateData[stateCode];
    if (!data || data.count === 0) return 'hsl(215, 15%, 90%)';
    const intensity = maxCount > 0 ? data.count / maxCount : 0;
    const lightness = 82 - intensity * 42;
    const saturation = 20 + intensity * 30;
    return `hsl(222, ${saturation}%, ${lightness}%)`;
  }, [stateData, maxCount]);

  // Build customStates for USAMap with per-state tooltip
  const customStates = useMemo(() => {
    const allCodes = Object.keys(STATE_NAMES) as USAStateAbbreviation[];
    const result: Partial<Record<USAStateAbbreviation, {
      fill: string;
      stroke: string;
      onHover: (state: USAStateAbbreviation) => void;
      onLeave: () => void;
      tooltip: { enabled: boolean; render: (state: USAStateAbbreviation) => React.ReactNode };
      label: { enabled: boolean };
    }>> = {};

    allCodes.forEach((code) => {
      const data = stateData[code];
      result[code] = {
        fill: getStateFill(code),
        stroke: data && data.count > 0 ? 'hsl(222, 30%, 55%)' : 'hsl(215, 15%, 75%)',
        onHover: (state) => setHoveredState(state),
        onLeave: () => setHoveredState(null),
        tooltip: { enabled: false, render: () => null },
        label: { enabled: true },
      };
    });
    return result;
  }, [getStateFill, stateData]);

  const hoveredData = hoveredState ? stateData[hoveredState] : null;

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
      <CardContent className="relative">
        <div className="w-full">
          <USAMap
            customStates={customStates}
            defaultState={{
              fill: 'hsl(215, 15%, 90%)',
              stroke: 'hsl(215, 15%, 75%)',
              label: { enabled: true },
            }}
            mapSettings={{ width: '100%', height: 'fit-content' }}
          />
        </div>

        {/* Custom hover tooltip (positioned top-right) */}
        {hoveredState && (() => {
          const market = getStateMarketByAbbr(hoveredState);
          return (
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg shadow-lg p-3 max-w-[240px] pointer-events-none z-10">
              <p className="font-bold text-xs">{STATE_NAMES[hoveredState] || hoveredState}</p>
              {market && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {market.totalBirths.toLocaleString()} births/yr
                </p>
              )}
              {hoveredData ? (
                <div className="mt-1.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {hoveredData.count} tracked system{hoveredData.count !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-0.5">
                    {hoveredData.names.slice(0, 6).map((n, i) => (
                      <p key={i} className="text-[10px] text-foreground">• {n}</p>
                    ))}
                    {hoveredData.names.length > 6 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{hoveredData.names.length - 6} more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1">No tracked providers</p>
              )}
              {market && (
                <div className="mt-1.5 pt-1.5 border-t border-border space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    Largest: <span className="text-foreground font-medium">{market.largestSystem}</span> ({market.systemType.toUpperCase()})
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Controls ~{(market.estPctControlled * 100).toFixed(0)}% · Top 3: {(market.top3PctCombined * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(215, 15%, 90%)' }} />
            <span className="text-[10px] text-muted-foreground">No providers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(222, 35%, 71%)' }} />
            <span className="text-[10px] text-muted-foreground">Few</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(222, 50%, 40%)' }} />
            <span className="text-[10px] text-muted-foreground">Many</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default USHeatmap;

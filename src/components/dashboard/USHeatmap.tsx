import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { US_PROVIDERS, getProvidersByType, getProviderById, ProviderType } from '@/lib/providerProfiles';
import { getStateMarketByAbbr } from '@/lib/stateMarketData';
import { USProviderView } from '@/lib/types';
import { USAMap, USAStateAbbreviation } from '@mirawision/usa-map-react';
import { X } from 'lucide-react';

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
  const [selectedState, setSelectedState] = useState<string | null>(null);

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
    if (!data || data.count === 0) return 'hsl(220, 14%, 96%)';
    const intensity = maxCount > 0 ? data.count / maxCount : 0;
    // Soft pastel blue scale
    const lightness = 88 - intensity * 30;
    const saturation = 50 + intensity * 15;
    return `hsl(210, ${saturation}%, ${lightness}%)`;
  }, [stateData, maxCount]);

  const handleStateClick = useCallback((stateCode: string) => {
    setSelectedState((prev) => (prev === stateCode ? null : stateCode));
  }, []);

  // Build customStates for USAMap
  const customStates = useMemo(() => {
    const allCodes = Object.keys(STATE_NAMES) as USAStateAbbreviation[];
    const result: Partial<Record<USAStateAbbreviation, {
      fill: string;
      stroke: string;
      strokeWidth: number;
      onHover: (state: USAStateAbbreviation) => void;
      onLeave: () => void;
      onClick: (state: USAStateAbbreviation) => void;
      tooltip: { enabled: boolean; render: (state: USAStateAbbreviation) => React.ReactNode };
      label: { enabled: boolean; render: (state: USAStateAbbreviation) => React.ReactNode };
    }>> = {};

    allCodes.forEach((code) => {
      const data = stateData[code];
      const isSelected = selectedState === code;
      const hasData = data && data.count > 0;
      result[code] = {
        fill: isSelected ? 'hsl(210, 55%, 65%)' : getStateFill(code),
        stroke: isSelected
          ? 'hsl(210, 60%, 40%)'
          : hasData
            ? 'hsl(210, 25%, 78%)'
            : 'hsl(220, 14%, 88%)',
        strokeWidth: isSelected ? 2 : 1,
        onHover: (state) => setHoveredState(state),
        onLeave: () => setHoveredState(null),
        onClick: (state) => handleStateClick(state),
        tooltip: { enabled: false, render: () => null },
        label: {
          enabled: true,
          render: (state: USAStateAbbreviation) => (
            <text
              fontSize="10"
              fill="hsl(220, 20%, 35%)"
              fontWeight="500"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ textShadow: 'none', filter: 'none' }}
              pointerEvents="none"
            >
              {state}
            </text>
          ),
        },
      };
    });
    return result;
  }, [getStateFill, stateData, selectedState, handleStateClick]);

  // Determine which state info to show: selected takes priority, then hovered
  const activeState = selectedState || hoveredState;
  const activeData = activeState ? stateData[activeState] : null;

  const label = selectedProviderId
    ? getProviderById(selectedProviderId)?.name || 'Provider'
    : providerView === 'all'
      ? 'All U.S. Providers'
      : `${providerView.toUpperCase()} Systems`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Provider Geographic Presence</CardTitle>
        <CardDescription className="text-xs">
          {label} — Click a state for details
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="w-full">
          <USAMap
            customStates={customStates}
            defaultState={{
              fill: 'hsl(220, 14%, 96%)',
              stroke: 'hsl(220, 14%, 88%)',
              label: { enabled: true },
            }}
            mapSettings={{ width: '100%', height: 'fit-content' }}
          />
        </div>

        {/* State info panel (persistent for selected, transient for hover) */}
        {activeState && (() => {
          const market = getStateMarketByAbbr(activeState);
          return (
            <div className="absolute top-4 right-4 bg-card border border-border rounded-xl shadow-lg p-4 max-w-[260px] z-10">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">
                  {STATE_NAMES[activeState] || activeState}
                </p>
                {selectedState && (
                  <button
                    onClick={() => setSelectedState(null)}
                    className="p-0.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {market && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {market.totalBirths.toLocaleString()} births/yr
                </p>
              )}
              {activeData ? (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">
                    {activeData.count} tracked system{activeData.count !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-0.5">
                    {activeData.names.slice(0, 6).map((n, i) => (
                      <p key={i} className="text-xs text-foreground">• {n}</p>
                    ))}
                    {activeData.names.length > 6 && (
                      <p className="text-xs text-muted-foreground">
                        +{activeData.names.length - 6} more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">No tracked providers</p>
              )}
              {market && (
                <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Largest: <span className="text-foreground font-medium">{market.largestSystem}</span> ({market.systemType.toUpperCase()})
                  </p>
                  <p className="text-xs text-muted-foreground">
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
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(220, 14%, 96%)' }} />
            <span className="text-xs text-muted-foreground">No providers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(210, 55%, 82%)' }} />
            <span className="text-xs text-muted-foreground">Few</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(210, 65%, 58%)' }} />
            <span className="text-xs text-muted-foreground">Many</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default USHeatmap;

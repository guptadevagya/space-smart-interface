import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationInputs } from '@/lib/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencesPanelProps {
  inputs: SimulationInputs;
  onReferenceChange: (key: string, value: string) => void;
  onBibUpdate: (index: number, value: string) => void;
  onBibRemove: (index: number) => void;
  onBibAdd: () => void;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

const ReferencesPanel: React.FC<ReferencesPanelProps> = ({
  inputs,
  onReferenceChange,
  onBibUpdate,
  onBibRemove,
  onBibAdd,
  formatCurrency,
  formatNumber,
}) => {
  const [assumptionsOpen, setAssumptionsOpen] = React.useState(false);
  const [refsOpen, setRefsOpen] = React.useState(false);

  const parameterRows = [
    { key: 'annualBirths', label: 'Annual Births', format: formatNumber },
    {
      key: 'fgrPrevalence',
      label: 'FGR Prevalence',
      format: (v: number) => (v * 100).toFixed(1) + '%',
    },
    {
      key: 'currentDetectionRate',
      label: 'Current Detection Rate',
      format: (v: number) => (v * 100).toFixed(0) + '%',
    },
    {
      key: 'oxailisDetectionRate',
      label: 'OxNNet Detection Rate',
      format: (v: number) => (v * 100).toFixed(0) + '%',
    },
    { key: 'cSectionCost', label: 'C-Section Cost', format: formatCurrency },
    { key: 'nicuDailyCost', label: 'NICU Daily Cost', format: formatCurrency },
    {
      key: 'malpracticeClaimCost',
      label: 'Litigation Cost',
      format: formatCurrency,
    },
    {
      key: 'hypoxicEventRate',
      label: 'Hypoxic Event Rate',
      format: (v: number) => (v * 100).toFixed(2) + '%',
    },
  ];

  const assumptionsContent = (
    <div className="divide-y divide-border">
      {parameterRows.map((row) => (
        <div key={row.key} className="px-5 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{row.label}</p>
            <p className="text-xs font-mono text-muted-foreground">
              {row.format(inputs[row.key as keyof SimulationInputs] as number)}
            </p>
          </div>
          <p className="flex-1 text-xs text-muted-foreground">
            {inputs.inputReferences[row.key] || ''}
          </p>
        </div>
      ))}
    </div>
  );

  const bibliographyContent = (
    <div className="divide-y divide-border">
      {inputs.bibliography.map((entry, i) => (
        <div key={i} className="px-5 py-2.5 flex items-start gap-3">
          <span className="text-[10px] font-bold text-muted-foreground mt-1 shrink-0">
            [{i + 1}]
          </span>
          <p className="flex-1 text-xs text-muted-foreground">{entry}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Interactive version (hidden in print) */}
      <div className="print:hidden">
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Assumptions Register
                  </CardTitle>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      assumptionsOpen && 'rotate-180',
                    )}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {parameterRows.map((row) => (
                    <div
                      key={row.key}
                      className="px-5 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {row.label}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {row.format(
                            inputs[row.key as keyof SimulationInputs] as number,
                          )}
                        </p>
                      </div>
                      <input
                        type="text"
                        className="flex-1 text-xs bg-transparent border-0 border-b border-transparent group-hover:border-border focus:border-primary focus:ring-0 text-muted-foreground px-0 py-1 transition-all outline-none"
                        value={inputs.inputReferences[row.key] || ''}
                        onChange={(e) =>
                          onReferenceChange(row.key, e.target.value)
                        }
                        placeholder="Enter source..."
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={refsOpen} onOpenChange={setRefsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">
                    References ({inputs.bibliography.length})
                  </CardTitle>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      refsOpen && 'rotate-180',
                    )}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inputs.bibliography.map((entry, i) => (
                    <div
                      key={i}
                      className="px-5 py-2.5 flex items-start gap-3 hover:bg-muted/20 transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground mt-1 shrink-0">
                        [{i + 1}]
                      </span>
                      <input
                        type="text"
                        className="flex-1 text-xs bg-transparent border-0 text-muted-foreground focus:text-foreground focus:ring-0 px-0 py-0.5 outline-none"
                        value={entry}
                        onChange={(e) => onBibUpdate(i, e.target.value)}
                      />
                      <button
                        onClick={() => onBibRemove(i)}
                        className="text-destructive/50 hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <button
                    onClick={onBibAdd}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    + Add Reference
                  </button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Print-only version (always expanded, no interactive elements) */}
      <div className="hidden print:block space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Assumptions Register
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{assumptionsContent}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              References ({inputs.bibliography.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{bibliographyContent}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferencesPanel;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SimulationInputs } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  BookOpen,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  ClipboardList,
} from 'lucide-react';
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

// Extract URL from text
const extractUrl = (text: string): string | null => {
  const match = text.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
};

const ReferencesPanel: React.FC<ReferencesPanelProps> = ({
  inputs,
  onReferenceChange,
  onBibUpdate,
  onBibRemove,
  onBibAdd,
  formatCurrency,
  formatNumber,
}) => {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [refsOpen, setRefsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const isUS = inputs.region === 'US';

  const baseRows = [
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
      label: isUS ? 'CP Verdict (Median)' : 'Litigation Cost',
      format: formatCurrency,
    },
    {
      key: 'hypoxicEventRate',
      label: 'Hypoxic Event Rate',
      format: (v: number) => (v * 100).toFixed(2) + '%',
    },
  ];

  const usExtraRows = [
    { key: 'scanReimbursement', label: 'Scan Reimbursement', format: formatCurrency },
    { key: 'fetalDeathPayout', label: 'Fetal Death Payout', format: formatCurrency },
    {
      key: 'litigationSuccessRate',
      label: 'Litigation Success Rate',
      format: (v: number) => (v * 100).toFixed(0) + '%',
    },
    {
      key: 'combinedTestRate',
      label: 'Screening Uptake',
      format: (v: number) => (v * 100).toFixed(1) + '%',
    },
    {
      key: 'emergencyCSectionRateUndiagnosed',
      label: 'Emergency C-Section Rate',
      format: (v: number) => (v * 100).toFixed(0) + '%',
    },
  ];

  const parameterRows = isUS ? [...baseRows, ...usExtraRows] : baseRows;

  const filledRefsCount = parameterRows.filter((r) => inputs.inputReferences[r.key]?.trim()).length;

  const filteredBibliography = inputs.bibliography
    .map((entry, i) => ({ entry, index: i }))
    .filter(({ entry }) => !search || entry.toLowerCase().includes(search.toLowerCase()));

  // Print content (unchanged logic)
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
          <span className="text-xs font-bold text-muted-foreground mt-1 shrink-0">[{i + 1}]</span>
          <p className="flex-1 text-xs text-muted-foreground">{entry}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Interactive version */}
      <div className="print:hidden space-y-4">
        {/* Assumptions Register */}
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold">Assumptions Register</CardTitle>
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                      {filledRefsCount}/{parameterRows.length} sourced
                    </Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      assumptionsOpen && 'rotate-180',
                    )}
                  />
                </div>
                {!assumptionsOpen && (
                  <p className="text-xs text-muted-foreground mt-1">
                    View and edit source citations for each model parameter
                  </p>
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                {/* Table header */}
                <div className="px-5 py-2 bg-muted/30 border-b border-border grid grid-cols-[1fr_1fr] gap-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Parameter
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source / Citation
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {parameterRows.map((row) => {
                    const ref = inputs.inputReferences[row.key] || '';
                    const url = extractUrl(ref);
                    return (
                      <div
                        key={row.key}
                        className="px-5 py-3 grid grid-cols-[1fr_1fr] gap-4 hover:bg-muted/20 transition-colors group items-start"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{row.label}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">
                            {row.format(inputs[row.key as keyof SimulationInputs] as number)}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            className="flex-1 text-sm bg-transparent border-0 border-b border-transparent group-hover:border-border focus:border-primary focus:ring-0 text-muted-foreground focus:text-foreground px-0 py-1 transition-all outline-none"
                            value={ref}
                            onChange={(e) => onReferenceChange(row.key, e.target.value)}
                            placeholder="Enter source..."
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors mt-1.5 shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Bibliography */}
        <Collapsible open={refsOpen} onOpenChange={setRefsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold">Bibliography</CardTitle>
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                      {inputs.bibliography.length} sources
                    </Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      refsOpen && 'rotate-180',
                    )}
                  />
                </div>
                {!refsOpen && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage the evidence base supporting this model
                  </p>
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {/* Search + Add */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search references..."
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-9 text-xs" onClick={onBibAdd}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
                  </Button>
                </div>

                {/* Reference List */}
                <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {filteredBibliography.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {search ? 'No references match your search' : 'No references added yet'}
                      </p>
                    </div>
                  ) : (
                    filteredBibliography.map(({ entry, index }) => {
                      const url = extractUrl(entry);
                      return (
                        <div
                          key={index}
                          className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors group"
                        >
                          <span className="text-xs font-bold text-primary mt-2 shrink-0 w-7 text-right">
                            [{index + 1}]
                          </span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              className="w-full text-sm bg-transparent border-0 text-foreground/80 focus:text-foreground focus:ring-0 px-0 py-0.5 outline-none"
                              value={entry}
                              onChange={(e) => onBibUpdate(index, e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors p-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => onBibRemove(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Print-only version */}
      <div className="hidden print:block space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Assumptions Register
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{assumptionsContent}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bibliography ({inputs.bibliography.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{bibliographyContent}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferencesPanel;

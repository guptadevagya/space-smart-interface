import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { SimulationInputs, SimulationResults } from '@/lib/types';

interface FormulaExplorerProps {
  inputs: SimulationInputs;
  results: SimulationResults;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

interface FormulaVariable {
  name: string;
  value: number;
  format: 'number' | 'percent' | 'currency' | 'fixed';
}

interface FormulaDefinition {
  title: string;
  formula: string;
  variables: FormulaVariable[];
  result: number;
  resultFormat: 'number' | 'currency';
  resultUnit?: string;
  condition?: (inputs: SimulationInputs) => boolean;
}

const FormulaCard: React.FC<{
  def: FormulaDefinition;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}> = ({ def, formatCurrency, formatNumber }) => {
  const [open, setOpen] = useState(false);

  const formatVar = (v: FormulaVariable) => {
    if (v.format === 'percent') return `${(v.value * 100).toFixed(1)}%`;
    if (v.format === 'currency') return formatCurrency(v.value);
    if (v.format === 'fixed') return formatNumber(v.value);
    return formatNumber(v.value);
  };

  const formattedResult = def.resultFormat === 'currency'
    ? formatCurrency(def.result)
    : formatNumber(def.result);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium text-foreground">{def.title}</span>
            </div>
            <span className="text-sm font-semibold text-primary font-mono">
              = {formattedResult}{def.resultUnit ? ` ${def.resultUnit}` : ''}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-3">
            {/* Formula */}
            <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-muted-foreground">
              {def.formula}
            </div>

            {/* Substitution */}
            <div className="font-mono text-xs text-foreground/80 px-1">
              {def.variables.map((v, i) => (
                <React.Fragment key={v.name}>
                  {i > 0 && <span className="text-muted-foreground"> · </span>}
                  <span>{formatVar(v)}</span>
                </React.Fragment>
              ))}
              <span className="text-primary font-semibold ml-2">
                = {formattedResult}{def.resultUnit ? ` ${def.resultUnit}` : ''}
              </span>
            </div>

            {/* Input chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {def.variables.map(v => (
                <Badge key={v.name} variant="outline" className="text-xs font-normal gap-1">
                  {v.name}
                  <span className="text-muted-foreground">{formatVar(v)}</span>
                  {v.format === 'fixed' && (
                    <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground ml-0.5">Fixed</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const FormulaExplorer: React.FC<FormulaExplorerProps> = ({ inputs, results, formatCurrency, formatNumber }) => {
  const [open, setOpen] = useState(false);
  const isUK = inputs.region === 'UK' || inputs.region === 'Global';

  const { demographics: d, clinicalOutcomes: c, financials: f } = results;

  // Intermediate values needed for UK formulas
  const totalFGR = inputs.annualBirths * inputs.fgrPrevalence;
  const detectedCurrent = totalFGR * inputs.currentDetectionRate;
  const detectedOxailis = totalFGR * inputs.oxailisDetectionRate;
  const highRiskCurrent = detectedCurrent / (1 - inputs.currentFalsePositiveRate);
  const highRiskOxailis = detectedOxailis / (1 - inputs.oxailisFalsePositiveRate);
  const midwifeToConsultantDiff = inputs.consultantAppointmentCost - inputs.midwifeAppointmentCost;
  const costPerHighRisk = (3 * inputs.growthScanCost) + (2 * inputs.consultantAppointmentCost) + midwifeToConsultantDiff;

  const demographicFormulas: FormulaDefinition[] = [
    {
      title: 'Total FGR Cases',
      formula: 'Annual Births × FGR Prevalence',
      variables: [
        { name: 'Annual Births', value: inputs.annualBirths, format: 'number' },
        { name: 'FGR Prevalence', value: inputs.fgrPrevalence, format: 'percent' },
      ],
      result: d.totalFGR,
      resultFormat: 'number',
      resultUnit: 'cases',
    },
    {
      title: 'Undiagnosed (Current)',
      formula: 'Total FGR × (1 − Current Detection Rate)',
      variables: [
        { name: 'Total FGR', value: d.totalFGR, format: 'number' },
        { name: 'Current Detection', value: inputs.currentDetectionRate, format: 'percent' },
      ],
      result: d.undiagnosedCurrent,
      resultFormat: 'number',
      resultUnit: 'cases',
    },
    {
      title: 'Undiagnosed (OxNNet)',
      formula: 'Total FGR × (1 − OxNNet Detection Rate)',
      variables: [
        { name: 'Total FGR', value: d.totalFGR, format: 'number' },
        { name: 'OxNNet Detection', value: inputs.oxailisDetectionRate, format: 'percent' },
      ],
      result: d.undiagnosedOxailis,
      resultFormat: 'number',
      resultUnit: 'cases',
    },
    {
      title: 'Avoided Undiagnosed Cases',
      formula: 'Undiagnosed (Current) − Undiagnosed (OxNNet)',
      variables: [
        { name: 'Undiagnosed Current', value: d.undiagnosedCurrent, format: 'number' },
        { name: 'Undiagnosed OxNNet', value: d.undiagnosedOxailis, format: 'number' },
      ],
      result: d.avoidedUndiagnosed,
      resultFormat: 'number',
      resultUnit: 'cases',
    },
  ];

  const clinicalFormulas: FormulaDefinition[] = [
    {
      title: 'Avoided C-Sections',
      formula: isUK
        ? 'Avoided Undiagnosed × 15% (Fixed)'
        : 'Avoided Undiagnosed × Emergency C-Section Rate',
      variables: isUK
        ? [
            { name: 'Avoided Undiagnosed', value: d.avoidedUndiagnosed, format: 'number' },
            { name: 'C-Section Rate', value: 0.15, format: 'fixed' },
          ]
        : [
            { name: 'Avoided Undiagnosed', value: d.avoidedUndiagnosed, format: 'number' },
            { name: 'C-Section Rate', value: inputs.emergencyCSectionRateUndiagnosed, format: 'percent' },
          ],
      result: c.avoidedCSections,
      resultFormat: 'number',
    },
    {
      title: 'Avoided Hypoxic Events',
      formula: isUK
        ? 'Avoided Undiagnosed × 0.4% (Fixed)'
        : 'Avoided Undiagnosed × Hypoxic Event Rate',
      variables: isUK
        ? [
            { name: 'Avoided Undiagnosed', value: d.avoidedUndiagnosed, format: 'number' },
            { name: 'Hypoxic Rate', value: 0.004, format: 'fixed' },
          ]
        : [
            { name: 'Avoided Undiagnosed', value: d.avoidedUndiagnosed, format: 'number' },
            { name: 'Hypoxic Rate', value: inputs.hypoxicEventRate, format: 'percent' },
          ],
      result: c.avoidedHypoxicEvents,
      resultFormat: 'number',
    },
    {
      title: 'Avoided NICU Days',
      formula: 'Avoided Hypoxic Events × 7 days',
      variables: [
        { name: 'Hypoxic Events', value: c.avoidedHypoxicEvents, format: 'number' },
        { name: 'Days per Event', value: 7, format: 'fixed' },
      ],
      result: c.avoidedNICUDays,
      resultFormat: 'number',
      resultUnit: 'days',
    },
    {
      title: 'Avoided CP Cases',
      formula: 'Avoided Hypoxic Events × CP Risk',
      variables: [
        { name: 'Hypoxic Events', value: c.avoidedHypoxicEvents, format: 'number' },
        { name: 'CP Risk', value: inputs.cerebralPalsyRisk, format: 'percent' },
      ],
      result: c.avoidedCPCases,
      resultFormat: 'number',
    },
    {
      title: 'Avoided Stillbirths',
      formula: 'Avoided Undiagnosed × 1.68%',
      variables: [
        { name: 'Avoided Undiagnosed', value: d.avoidedUndiagnosed, format: 'number' },
        { name: 'Stillbirth Rate', value: 0.0168, format: 'fixed' },
      ],
      result: c.avoidedStillbirths,
      resultFormat: 'number',
    },
  ];

  if (isUK && c.avoidedNeonatalDeaths !== undefined) {
    clinicalFormulas.push({
      title: 'Avoided Neonatal Deaths',
      formula: 'Avoided Hypoxic Events × 9% (Fixed)',
      variables: [
        { name: 'Hypoxic Events', value: c.avoidedHypoxicEvents, format: 'number' },
        { name: 'NND Rate', value: 0.09, format: 'fixed' },
      ],
      result: c.avoidedNeonatalDeaths,
      resultFormat: 'number',
    });
  }

  const avoidedStillbirths = c.avoidedStillbirths;
  const avoidedCPCases = c.avoidedCPCases;
  const avoidedNND = c.avoidedNeonatalDeaths ?? 0;

  const financialFormulas: FormulaDefinition[] = [
    {
      title: 'C-Section Savings',
      formula: 'Avoided C-Sections × C-Section Cost',
      variables: [
        { name: 'Avoided C-Sections', value: c.avoidedCSections, format: 'number' },
        { name: 'C-Section Cost', value: inputs.cSectionCost, format: 'currency' },
      ],
      result: f.cSectionSavings,
      resultFormat: 'currency',
    },
    {
      title: 'NICU Savings',
      formula: 'Avoided NICU Days × Daily NICU Cost',
      variables: [
        { name: 'NICU Days', value: c.avoidedNICUDays, format: 'number' },
        { name: 'Daily Cost', value: inputs.nicuDailyCost, format: 'currency' },
      ],
      result: c.avoidedNICUDays * inputs.nicuDailyCost,
      resultFormat: 'currency',
    },
  ];

  if (isUK) {
    financialFormulas.push({
      title: 'Mum Extra Stay Savings',
      formula: 'Avoided Hypoxic Events × £2,537 (Fixed)',
      variables: [
        { name: 'Hypoxic Events', value: c.avoidedHypoxicEvents, format: 'number' },
        { name: 'Extra Stay Cost', value: 2537, format: 'fixed' },
      ],
      result: c.avoidedHypoxicEvents * 2537,
      resultFormat: 'currency',
    });
  }

  if (isUK) {
    financialFormulas.push({
      title: 'Litigation Savings',
      formula: '(CP Cases × CP Litigation) + (Stillbirths × Stillbirth Cost) + (NND × NND Cost)',
      variables: [
        { name: 'CP Cases', value: avoidedCPCases, format: 'number' },
        { name: 'CP Litigation', value: inputs.malpracticeClaimCost, format: 'currency' },
        { name: 'Stillbirths', value: avoidedStillbirths, format: 'number' },
        { name: 'Stillbirth Cost', value: inputs.stillbirthLitigationCost, format: 'currency' },
        { name: 'NND Cases', value: avoidedNND, format: 'number' },
        { name: 'NND Cost', value: inputs.neonatalDeathLitigationCost, format: 'currency' },
      ],
      result: f.litigationSavings,
      resultFormat: 'currency',
    });
  } else {
    financialFormulas.push({
      title: 'Litigation Savings',
      formula: '(CP Cases + Stillbirths) × Malpractice Claim Cost',
      variables: [
        { name: 'CP Cases', value: avoidedCPCases, format: 'number' },
        { name: 'Stillbirths', value: avoidedStillbirths, format: 'number' },
        { name: 'Claim Cost', value: inputs.malpracticeClaimCost, format: 'currency' },
      ],
      result: f.litigationSavings,
      resultFormat: 'currency',
    });
  }

  if (isUK && f.growthScanCosts !== undefined) {
    financialFormulas.push({
      title: 'Screening Cost Increase',
      formula: '(High Risk OxNNet − High Risk Current) × Cost per High-Risk Patient',
      variables: [
        { name: 'HR OxNNet', value: highRiskOxailis, format: 'number' },
        { name: 'HR Current', value: highRiskCurrent, format: 'number' },
        { name: 'Cost/Patient', value: costPerHighRisk, format: 'currency' },
      ],
      result: f.growthScanCosts,
      resultFormat: 'currency',
    });

    financialFormulas.push({
      title: 'Net Benefit',
      formula: 'Total Clinical Savings − Screening Cost Increase',
      variables: [
        { name: 'Clinical Savings', value: f.totalSavings, format: 'currency' },
        { name: 'Screening Costs', value: f.growthScanCosts, format: 'currency' },
      ],
      result: f.netBenefit ?? 0,
      resultFormat: 'currency',
    });
  }

  if (!isUK) {
    financialFormulas.push({
      title: 'Revenue Generated',
      formula: 'High Risk Cohort × 3 scans × Scan Reimbursement',
      variables: [
        { name: 'Detected OxNNet', value: detectedOxailis, format: 'number' },
        { name: 'FP Rate', value: inputs.oxailisFalsePositiveRate, format: 'percent' },
        { name: 'Reimbursement', value: inputs.scanReimbursement, format: 'currency' },
      ],
      result: f.revenueGenerated,
      resultFormat: 'currency',
    });
  }

  const groups = [
    { title: 'Demographics', formulas: demographicFormulas },
    { title: 'Clinical Outcomes', formulas: clinicalFormulas },
    { title: 'Financial Impact', formulas: financialFormulas },
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Model Formulas
          </h2>
          {open ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          {!open && <span className="text-xs text-muted-foreground/60 ml-2">Click to expand</span>}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 space-y-6">
          {groups.map(group => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.formulas.map(def => (
                  <FormulaCard
                    key={def.title}
                    def={def}
                    formatCurrency={formatCurrency}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FormulaExplorer;

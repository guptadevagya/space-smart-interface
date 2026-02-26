import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimulationResults, SimulationInputs } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultsTableProps {
  results: SimulationResults;
  inputs: SimulationInputs;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, inputs, formatCurrency, formatNumber }) => {
  const isUS = inputs.region === 'US';

  // Compute intermediate values for populated cells
  const totalFGR = inputs.annualBirths * inputs.fgrPrevalence;
  const detectedOxailis = totalFGR * inputs.oxailisDetectionRate;
  const detectedCurrent = totalFGR * inputs.currentDetectionRate;
  const highRiskOxailis = detectedOxailis / (1 - inputs.oxailisFalsePositiveRate);
  const highRiskCurrent = detectedCurrent / (1 - inputs.currentFalsePositiveRate);
  const additionalHighRisk = highRiskOxailis - highRiskCurrent;
  const midwifeToConsultantDiff = inputs.consultantAppointmentCost - inputs.midwifeAppointmentCost;
  const costPerHighRisk = (3 * inputs.growthScanCost) + (2 * inputs.consultantAppointmentCost) + midwifeToConsultantDiff;
  const totalScansOxailis = highRiskOxailis * 3;

  const rows = [
    {
      label: 'Emergency C-Sections Avoided',
      units: formatNumber(results.clinicalOutcomes.avoidedCSections),
      unitCost: formatCurrency(inputs.cSectionCost),
      impact: formatCurrency(results.financials.cSectionSavings),
      type: 'saving' as const,
    },
    {
      label: 'NICU Days Saved',
      units: formatNumber(results.clinicalOutcomes.avoidedNICUDays),
      unitCost: formatCurrency(inputs.nicuDailyCost),
      impact: formatCurrency(results.financials.nicuSavings),
      type: 'saving' as const,
    },
    {
      label: 'Major Morbidity Avoided (CP + Stillbirth)',
      units: formatNumber(results.clinicalOutcomes.avoidedCPCases + results.clinicalOutcomes.avoidedStillbirths),
      unitCost: formatCurrency(inputs.malpracticeClaimCost),
      impact: formatCurrency(results.financials.litigationSavings),
      type: 'saving' as const,
    },
    ...(isUS
      ? [{
          label: 'Indicated Scan Revenue',
          units: `${formatNumber(totalScansOxailis)} scans`,
          unitCost: formatCurrency(inputs.scanReimbursement),
          impact: formatCurrency(results.financials.revenueGenerated),
          type: 'revenue' as const,
        }]
      : [{
          label: 'Additional Screening Costs',
          units: `${formatNumber(additionalHighRisk)} patients`,
          unitCost: `${formatCurrency(costPerHighRisk)}/pt`,
          impact: `−${formatCurrency(results.financials.growthScanCosts || 0)}`,
          type: 'cost' as const,
        }]),
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Detailed Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-bold uppercase tracking-wider">Outcome Measure</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Unit Reduction</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Unit Cost</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Financial Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.label}
                className={cn(
                  row.type === 'cost' && 'bg-destructive/5',
                  row.type === 'revenue' && 'bg-blue-50/50 dark:bg-blue-950/20'
                )}
              >
                <TableCell className="font-medium text-sm">{row.label}</TableCell>
                <TableCell className={cn(
                  "text-right font-mono text-sm",
                  row.type === 'cost' ? 'text-destructive' : 'text-emerald-600'
                )}>
                  {row.type === 'saving' ? `−${row.units}` : row.units}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">{row.unitCost}</TableCell>
                <TableCell className={cn(
                  "text-right font-bold text-sm",
                  row.type === 'cost' ? 'text-destructive' : 'text-foreground'
                )}>
                  {row.impact}
                </TableCell>
              </TableRow>
            ))}
            {/* Total row */}
            <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
              <TableCell className="font-bold text-xs uppercase tracking-wider">Net Annual Benefit</TableCell>
              <TableCell colSpan={2} />
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(results.financials.totalEconomicImpact)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SimulationResults, SimulationInputs } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultsTableProps {
  results: SimulationResults;
  inputs: SimulationInputs;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  inputs,
  formatCurrency,
  formatNumber,
}) => {
  const isUS = inputs.region === 'US';

  // Compute intermediate values
  const totalFGR = inputs.annualBirths * inputs.fgrPrevalence;
  const detectedOxailis = totalFGR * inputs.oxailisDetectionRate;
  const detectedCurrent = totalFGR * inputs.currentDetectionRate;
  const highRiskOxailis =
    detectedOxailis / (1 - inputs.oxailisFalsePositiveRate);
  const highRiskCurrent =
    detectedCurrent / (1 - inputs.currentFalsePositiveRate);
  const additionalHighRisk = highRiskOxailis - highRiskCurrent;
  const midwifeToConsultantDiff =
    inputs.consultantAppointmentCost - inputs.midwifeAppointmentCost;
  const costPerHighRisk =
    3 * inputs.growthScanCost +
    2 * inputs.consultantAppointmentCost +
    midwifeToConsultantDiff;
  const totalScansOxailis = highRiskOxailis * 3;

  // UK-specific intermediates
  const avoidedHypoxic = results.clinicalOutcomes.avoidedHypoxicEvents;
  const avoidedNND = results.clinicalOutcomes.avoidedNeonatalDeaths || 0;
  const avoidedStillbirths = results.clinicalOutcomes.avoidedStillbirths;
  const avoidedCP = results.clinicalOutcomes.avoidedCPCases;

  // Individual UK cost items (matching Excel line items)
  const cSectionSavings =
    results.clinicalOutcomes.avoidedCSections * inputs.cSectionCost;
  const mumStaySavings = avoidedHypoxic * 2537.333333;
  const nicuSavings =
    results.clinicalOutcomes.avoidedNICUDays * inputs.nicuDailyCost;
  const stillbirthSavings =
    avoidedStillbirths * inputs.stillbirthLitigationCost;
  const cpLitigationSavings = avoidedCP * inputs.malpracticeClaimCost;
  const nndLitigationSavings = avoidedNND * inputs.neonatalDeathLitigationCost;
  const nndTrustCost = avoidedNND * inputs.stillbirthLitigationCost;
  const nndTotalSaving = nndLitigationSavings + nndTrustCost;

  // Screening costs
  const extraHighRiskPathwayCost = additionalHighRisk * costPerHighRisk;
  const oxailisScreeningCost =
    inputs.annualBirths * inputs.combinedTestRate * inputs.oxailisScanCost;

  type RowType = {
    label: string;
    units: string;
    unitCost: string;
    impact: string;
    type: 'saving' | 'cost' | 'revenue';
    reference?: string;
  };

  // US intermediates for split litigation
  const usCpLitigationSavings = results.financials.cpLitigationSavings ?? 0;
  const usFetalDeathSavings = results.financials.fetalDeathSavings ?? 0;

  const rows: RowType[] = isUS
    ? [
        {
          label: 'Emergency C-Sections Avoided',
          units: formatNumber(results.clinicalOutcomes.avoidedCSections),
          unitCost: formatCurrency(inputs.cSectionCost),
          impact: formatCurrency(results.financials.cSectionSavings),
          type: 'saving',
          reference: 'Peterson-KFF',
        },
        {
          label: 'NICU Days Saved',
          units: formatNumber(results.clinicalOutcomes.avoidedNICUDays),
          unitCost: formatCurrency(inputs.nicuDailyCost),
          impact: formatCurrency(results.financials.nicuSavings),
          type: 'saving',
          reference: 'HCCI',
        },
        {
          label: 'CP Litigation Avoided',
          units: formatNumber(results.clinicalOutcomes.avoidedCPCases) + ' cases',
          unitCost: `${formatCurrency(inputs.malpracticeClaimCost)} × ${(inputs.litigationSuccessRate * 100).toFixed(0)}%`,
          impact: formatCurrency(usCpLitigationSavings),
          type: 'saving',
          reference: 'Jena et al.',
        },
        {
          label: 'Fetal Death Litigation Avoided',
          units: formatNumber(results.clinicalOutcomes.avoidedStillbirths),
          unitCost: formatCurrency(inputs.fetalDeathPayout),
          impact: formatCurrency(usFetalDeathSavings),
          type: 'saving',
          reference: 'Gold et al.',
        },
        {
          label: 'Indicated Scan Revenue',
          units: `${formatNumber(totalScansOxailis)} scans`,
          unitCost: formatCurrency(inputs.scanReimbursement),
          impact: formatCurrency(results.financials.revenueGenerated),
          type: 'revenue',
          reference: 'CPT Code',
        },
      ]
    : [
        // 7 UK cost items matching Excel exactly
        {
          label: 'Total cost of emergency C-sections avoided',
          units: formatNumber(results.clinicalOutcomes.avoidedCSections),
          unitCost: formatCurrency(inputs.cSectionCost),
          impact: formatCurrency(cSectionSavings),
          type: 'saving',
          reference: 'Ref 4 & 5',
        },
        {
          label: "Cost for Mums' extra stay in hospital avoided",
          units: formatNumber(avoidedHypoxic) + ' events',
          unitCost: '£2,537/event',
          impact: formatCurrency(mumStaySavings),
          type: 'saving',
          reference: 'Ref 17',
        },
        {
          label: 'Total cost of Neonatal ICU avoided',
          units:
            formatNumber(results.clinicalOutcomes.avoidedNICUDays) + ' days',
          unitCost: formatCurrency(inputs.nicuDailyCost) + '/day',
          impact: formatCurrency(nicuSavings),
          type: 'saving',
          reference: 'Ref 6',
        },
        {
          label: 'Cost avoidance of stillbirths',
          units: formatNumber(avoidedStillbirths),
          unitCost: formatCurrency(inputs.stillbirthLitigationCost),
          impact: formatCurrency(stillbirthSavings),
          type: 'saving',
          reference: 'Ref 7, 8 & 9',
        },
        {
          label: 'Estimated litigation cost savings from avoiding CP',
          units: formatNumber(avoidedCP) + ' cases',
          unitCost: formatCurrency(inputs.malpracticeClaimCost),
          impact: formatCurrency(cpLitigationSavings),
          type: 'saving',
          reference: 'Ref 11, 12 & 17',
        },
        {
          label: 'Estimated litigation cost savings from avoiding NND',
          units: formatNumber(avoidedNND) + ' deaths',
          unitCost: formatCurrency(inputs.neonatalDeathLitigationCost),
          impact: formatCurrency(nndLitigationSavings),
          type: 'saving',
          reference: 'Ref 9',
        },
        {
          label: 'Total cost saving to NHS (NND)',
          units: '',
          unitCost: '',
          impact: formatCurrency(nndTotalSaving),
          type: 'saving',
          reference: 'Ref 9',
        },
        // Cost rows
        {
          label: 'Total extra cost of the new high-risk pathway',
          units: `${formatNumber(additionalHighRisk)} patients`,
          unitCost: `${formatCurrency(costPerHighRisk)}/pt`,
          impact: `−${formatCurrency(extraHighRiskPathwayCost)}`,
          type: 'cost',
          reference: 'Ref 4',
        },
        {
          label: 'Total extra cost for Oxailis screening',
          units: `${formatNumber(inputs.annualBirths * inputs.combinedTestRate)} screened`,
          unitCost: `${formatCurrency(inputs.oxailisScanCost)}/pt`,
          impact: `−${formatCurrency(oxailisScreeningCost)}`,
          type: 'cost',
          reference: 'Ref OxPLUS Study',
        },
      ];

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-bold uppercase tracking-wider">
                Outcome Measure
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                Units
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                Unit Cost
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                Financial Impact
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                Ref
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.label}
                className={cn(
                  row.type === 'cost' && 'bg-destructive/5',
                  row.type === 'revenue' && 'bg-blue-50/50 dark:bg-blue-950/20',
                )}
              >
                <TableCell className="text-sm">
                  {row.label}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono text-sm',
                    row.type === 'cost'
                      ? 'text-destructive'
                      : 'text-emerald-600',
                  )}
                >
                  {row.type === 'saving' && row.units
                    ? `${row.units}`
                    : row.units}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {row.unitCost}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-bold text-sm',
                    row.type === 'cost'
                      ? 'text-destructive'
                      : 'text-foreground',
                  )}
                >
                  {row.impact}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {row.reference}
                </TableCell>
              </TableRow>
            ))}
            {/* Gross savings total (UK) */}
            {!isUS && (
              <TableRow className="bg-muted/80 border-t-2 border-border">
                <TableCell className="font-bold text-xs uppercase tracking-wider">
                  Cost saving to NHS of various adverse outcomes
                </TableCell>
                <TableCell colSpan={2} />
                <TableCell className="text-right font-bold text-lg text-foreground">
                  {formatCurrency(results.financials.totalSavings)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}
            {/* Net total */}
            <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
              <TableCell className="font-bold text-xs uppercase tracking-wider">
                {isUS ? 'Net Annual Benefit' : 'Total saving by the NHS'}
              </TableCell>
              <TableCell colSpan={2} />
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(results.financials.totalEconomicImpact)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;

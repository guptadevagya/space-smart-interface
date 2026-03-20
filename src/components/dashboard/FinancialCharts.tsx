import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SimulationResults, Region } from '@/lib/types';

interface FinancialChartsProps {
  results: SimulationResults;
  region: Region;
  providerLabel?: string;
}

const CHART_COLORS = {
  savings: 'hsl(152, 69%, 31%)', // emerald
  cost: 'hsl(0, 84%, 60%)', // red
  primary: 'hsl(222, 47%, 11%)', // slate 900
  secondary: 'hsl(217, 91%, 60%)', // blue
  accent: 'hsl(262, 83%, 58%)', // violet
  muted: 'hsl(215, 16%, 47%)', // muted
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({
  results,
  region,
  providerLabel,
}) => {
  const isUS = region === 'US';
  const locale = isUS ? 'en-US' : 'en-GB';
  const currency = isUS ? 'USD' : 'GBP';

  const fmtCompact = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  const fmtFull = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const fmtNum = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

  // Financial breakdown data
  // For US, split litigation into CP and Fetal Death; for UK keep as CNST
  const breakdownData = isUS
    ? [
        {
          name: 'C-Section',
          value: results.financials.cSectionSavings,
          color: CHART_COLORS.primary,
        },
        {
          name: 'NICU',
          value: results.financials.nicuSavings,
          color: CHART_COLORS.secondary,
        },
        {
          name: 'CP Litigation',
          value: results.financials.cpLitigationSavings ?? 0,
          color: CHART_COLORS.savings,
        },
        {
          name: 'Fetal Death',
          value: results.financials.fetalDeathSavings ?? 0,
          color: CHART_COLORS.accent,
        },
      ]
    : [
        {
          name: 'C-Section',
          value: results.financials.cSectionSavings,
          color: CHART_COLORS.primary,
        },
        {
          name: 'NICU',
          value: results.financials.nicuSavings,
          color: CHART_COLORS.secondary,
        },
        {
          name: 'CNST',
          value: results.financials.litigationSavings,
          color: CHART_COLORS.savings,
        },
      ];

  // Cost vs benefit comparison
  const comparisonData = isUS
    ? [
        {
          name: 'Revenue',
          Benefit: results.financials.revenueGenerated,
          Cost: 0,
        },
        {
          name: 'Cost Savings',
          Benefit: results.financials.totalSavings,
          Cost: 0,
        },
        {
          name: 'Deployment Cost',
          Benefit: 0,
          Cost: results.financials.deploymentCosts || 0,
        },
      ]
    : [
        {
          name: 'Clinical Savings',
          Benefit: results.financials.totalSavings,
          Cost: 0,
        },
        {
          name: 'Screening Costs',
          Benefit: 0,
          Cost: results.financials.growthScanCosts || 0,
        },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost vs Benefit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            {isUS ? 'Revenue vs. Cost Savings' : 'Savings vs. Screening Costs'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isUS
              ? 'Scan revenue and avoided clinical costs'
              : 'Clinical savings offset by additional screening'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={fmtCompact}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => fmtFull(value)}
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                />
                <Bar
                  dataKey="Benefit"
                  fill={CHART_COLORS.savings}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                />
                <Bar
                  dataKey="Cost"
                  fill={CHART_COLORS.cost}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Savings breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Savings Breakdown</CardTitle>
          <CardDescription className="text-xs">
            By clinical category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={breakdownData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tickFormatter={fmtCompact}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => fmtFull(value)}
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                />
                <Bar
                  dataKey="value"
                  name="Savings"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                >
                  {breakdownData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;

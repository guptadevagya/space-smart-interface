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

  // Financial breakdown data — filter out zero values
  const breakdownData = (isUS
    ? [
        {
          name: 'C-section',
          value: results.financials.cSectionSavings,
          color: CHART_COLORS.primary,
        },
        {
          name: 'NICU',
          value: results.financials.nicuSavings,
          color: CHART_COLORS.secondary,
        },
        {
          name: 'CP litigation',
          value: results.financials.cpLitigationSavings ?? 0,
          color: CHART_COLORS.savings,
        },
        {
          name: 'Fetal death',
          value: results.financials.fetalDeathSavings ?? 0,
          color: CHART_COLORS.accent,
        },
      ]
    : [
        {
          name: 'C-section',
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
      ]
  ).filter((d) => d.value > 0);

  // Cost vs benefit comparison — filter out zero values
  const comparisonData = (isUS
    ? [
        {
          name: 'Revenue',
          value: results.financials.revenueGenerated,
          type: 'benefit' as const,
        },
        {
          name: 'Cost savings',
          value: results.financials.totalSavings,
          type: 'benefit' as const,
        },
        {
          name: 'Deployment cost',
          value: results.financials.deploymentCosts || 0,
          type: 'cost' as const,
        },
      ]
    : [
        {
          name: 'Clinical savings',
          value: results.financials.totalSavings,
          type: 'benefit' as const,
        },
        {
          name: 'Screening costs',
          value: results.financials.growthScanCosts || 0,
          type: 'cost' as const,
        },
      ]
  ).filter((d) => d.value > 0);

  // Build a color map for comparison chart X-axis ticks
  const comparisonColorMap = Object.fromEntries(
    comparisonData.map((d) => [
      d.name,
      d.type === 'cost' ? CHART_COLORS.cost : CHART_COLORS.savings,
    ]),
  );

  const renderColoredTick = (colorMap: Record<string, string>) =>
    ({ x, y, payload }: any) => (
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        fontSize={11}
        fill={colorMap[payload.value] || 'hsl(var(--muted-foreground))'}
        fontWeight={500}
      >
        {payload.value}
      </text>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost vs Benefit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            {isUS ? 'Revenue & Savings vs. Deployment Cost' : 'Savings vs. Screening Costs'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isUS
              ? 'Revenue and avoided costs offset by deployment expenses'
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
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                >
                  {comparisonData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.type === 'cost' ? CHART_COLORS.cost : CHART_COLORS.savings}
                    />
                  ))}
                </Bar>
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

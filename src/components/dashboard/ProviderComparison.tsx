import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SimulationResults } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Shield,
  Heart,
  Activity,
} from 'lucide-react';

interface ProviderComparisonProps {
  providerResults: SimulationResults;
  nationalResults: SimulationResults;
  providerLabel: string;
  providerBirths: number;
  nationalBirths: number;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

interface MetricCardProps {
  title: string;
  providerValue: string;
  nationalValue: string;
  sharePercent: string;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  providerValue,
  nationalValue,
  sharePercent,
  icon,
  accent,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <Card className={`border-l-4 ${accent} h-full`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="p-1 bg-muted rounded-md">{icon}</div>
        </div>
        <p className="text-lg font-bold text-foreground leading-none">
          {providerValue}
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-[10px] text-muted-foreground">
            U.S. total: {nationalValue}
          </span>
          <span className="text-[10px] font-semibold text-primary tabular-nums">
            {sharePercent} of national
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProviderComparison: React.FC<ProviderComparisonProps> = ({
  providerResults,
  nationalResults,
  providerLabel,
  providerBirths,
  nationalBirths,
  formatCurrency,
  formatNumber,
}) => {
  const pct = (provider: number, national: number) =>
    national > 0 ? `${((provider / national) * 100).toFixed(1)}%` : '—';

  const iconClass = 'h-3 w-3 text-muted-foreground';

  const metrics: MetricCardProps[] = [
    {
      title: 'Net Economic Benefit',
      providerValue: formatCurrency(
        providerResults.financials.totalEconomicImpact,
      ),
      nationalValue: formatCurrency(
        nationalResults.financials.totalEconomicImpact,
      ),
      sharePercent: pct(
        providerResults.financials.totalEconomicImpact,
        nationalResults.financials.totalEconomicImpact,
      ),
      icon: <TrendingUp className={iconClass} />,
      accent: 'border-l-emerald-500',
      delay: 0,
    },
    {
      title: 'Revenue Opportunity',
      providerValue: formatCurrency(
        providerResults.financials.revenueGenerated,
      ),
      nationalValue: formatCurrency(
        nationalResults.financials.revenueGenerated,
      ),
      sharePercent: pct(
        providerResults.financials.revenueGenerated,
        nationalResults.financials.revenueGenerated,
      ),
      icon: <DollarSign className={iconClass} />,
      accent: 'border-l-blue-500',
      delay: 0.04,
    },
    {
      title: 'Litigation Avoidance',
      providerValue: formatCurrency(
        providerResults.financials.litigationSavings,
      ),
      nationalValue: formatCurrency(
        nationalResults.financials.litigationSavings,
      ),
      sharePercent: pct(
        providerResults.financials.litigationSavings,
        nationalResults.financials.litigationSavings,
      ),
      icon: <Shield className={iconClass} />,
      accent: 'border-l-indigo-500',
      delay: 0.08,
    },
    {
      title: 'Cases Identified',
      providerValue: formatNumber(
        providerResults.demographics.avoidedUndiagnosed,
      ),
      nationalValue: formatNumber(
        nationalResults.demographics.avoidedUndiagnosed,
      ),
      sharePercent: pct(
        providerResults.demographics.avoidedUndiagnosed,
        nationalResults.demographics.avoidedUndiagnosed,
      ),
      icon: <Heart className={iconClass} />,
      accent: 'border-l-amber-500',
      delay: 0.12,
    },
    {
      title: 'Lives Impacted',
      providerValue: formatNumber(
        providerResults.clinicalOutcomes.avoidedStillbirths +
          (providerResults.clinicalOutcomes.avoidedNeonatalDeaths || 0),
      ),
      nationalValue: formatNumber(
        nationalResults.clinicalOutcomes.avoidedStillbirths +
          (nationalResults.clinicalOutcomes.avoidedNeonatalDeaths || 0),
      ),
      sharePercent: pct(
        providerResults.clinicalOutcomes.avoidedStillbirths,
        nationalResults.clinicalOutcomes.avoidedStillbirths,
      ),
      icon: <Activity className={iconClass} />,
      accent: 'border-l-rose-500',
      delay: 0.16,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {metrics.map((m) => (
        <MetricCard key={m.title} {...m} />
      ))}
    </div>
  );
};

export default ProviderComparison;

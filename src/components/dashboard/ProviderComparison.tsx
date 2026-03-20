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
  icon: React.ReactNode;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  providerValue,
  icon,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="p-1.5 bg-muted/50 rounded-lg">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-semibold text-foreground leading-none">
          {providerValue}
        </p>
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
  const iconClass = 'h-3.5 w-3.5 text-muted-foreground';

  const metrics: MetricCardProps[] = [
    {
      title: 'Net Economic Benefit',
      providerValue: formatCurrency(providerResults.financials.totalEconomicImpact),
      icon: <TrendingUp className={iconClass} />,
      delay: 0,
    },
    {
      title: 'Revenue Opportunity',
      providerValue: formatCurrency(providerResults.financials.revenueGenerated),
      icon: <DollarSign className={iconClass} />,
      delay: 0.04,
    },
    {
      title: 'Litigation Avoidance',
      providerValue: formatCurrency(providerResults.financials.litigationSavings),
      icon: <Shield className={iconClass} />,
      delay: 0.08,
    },
    {
      title: 'Cases Identified',
      providerValue: formatNumber(Math.round(providerResults.demographics.avoidedUndiagnosed)),
      icon: <Heart className={iconClass} />,
      delay: 0.12,
    },
    {
      title: 'Lives Impacted',
      providerValue: formatNumber(
        Math.round(
          providerResults.clinicalOutcomes.avoidedStillbirths +
            (providerResults.clinicalOutcomes.avoidedNeonatalDeaths || 0)
        ),
      ),
      icon: <Activity className={iconClass} />,
      delay: 0.16,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.title} {...m} />
      ))}
    </div>
  );
};

export default ProviderComparison;

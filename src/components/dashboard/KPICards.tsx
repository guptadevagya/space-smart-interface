import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Heart,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { SimulationResults, Region } from '@/lib/types';

interface KPICardsProps {
  results: SimulationResults;
  region: Region;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

const iconMap = {
  benefit: TrendingUp,
  savings: DollarSign,
  litigation: Shield,
  clinical: Heart,
  cost: AlertTriangle,
  lives: TrendingDown,
};

interface KPIItemProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof iconMap;
  accent: string;
  delay: number;
}

const KPIItem: React.FC<KPIItemProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent,
  delay,
}) => {
  const Icon = iconMap[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        className={cn(
          'h-full border-l-4 hover:shadow-md transition-shadow',
          accent,
        )}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              {title}
            </p>
            <div className="p-1.5 bg-muted rounded-lg shrink-0">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none truncate">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-tight">
              {subtitle}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const KPICards: React.FC<KPICardsProps> = ({
  results,
  region,
  formatCurrency,
  formatNumber,
}) => {
  const isUS = region === 'US';

  const cards: KPIItemProps[] = [
    {
      title: 'Net Economic Benefit',
      value: formatCurrency(results.financials.totalEconomicImpact),
      subtitle: isUS
        ? 'Revenue + cost avoidance'
        : 'Clinical savings − screening costs',
      icon: 'benefit',
      accent: 'border-l-emerald-500',
      delay: 0,
    },
    isUS
      ? {
          title: 'Revenue Opportunity',
          value: formatCurrency(results.financials.revenueGenerated),
          subtitle: 'From targeted high-risk scanning',
          icon: 'savings',
          accent: 'border-l-blue-500',
          delay: 0.05,
        }
      : {
          title: 'Clinical Savings',
          value: formatCurrency(results.financials.totalSavings),
          subtitle: 'Avoided adverse outcome costs',
          icon: 'savings',
          accent: 'border-l-blue-500',
          delay: 0.05,
        },
    {
      title: 'Litigation Avoidance',
      value: formatCurrency(results.financials.litigationSavings),
      subtitle: isUS ? 'Reduced malpractice exposure' : 'Reduced CNST claims',
      icon: 'litigation',
      accent: 'border-l-indigo-500',
      delay: 0.1,
    },
    {
      title: 'Cases Identified',
      value: formatNumber(Math.round(results.demographics.avoidedUndiagnosed)),
      subtitle: 'Additional FGR detections per year',
      icon: 'clinical',
      accent: 'border-l-amber-500',
      delay: 0.15,
    },
    ...(region !== 'US' && results.financials.growthScanCosts
      ? [
          {
            title: 'Cost of New Screening',
            value: formatCurrency(results.financials.growthScanCosts),
            subtitle: 'Extra high-risk pathway + Oxailis screening',
            icon: 'cost' as keyof typeof iconMap,
            accent: 'border-l-destructive',
            delay: 0.2,
          },
        ]
      : []),
    {
      title: 'Lives Impacted',
      value: formatNumber(
        results.clinicalOutcomes.avoidedStillbirths +
          (results.clinicalOutcomes.avoidedNeonatalDeaths || 0),
      ),
      subtitle: 'Avoided stillbirths & neonatal deaths',
      icon: 'lives',
      accent: 'border-l-rose-500',
      delay: 0.25,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <KPIItem key={card.title} {...card} />
      ))}
    </div>
  );
};

export default KPICards;

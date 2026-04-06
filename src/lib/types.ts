export type Region = 'US' | 'UK' | 'Global';
export type USProviderView = 'all' | 'idn' | 'ipp';

export interface SimulationInputs {
  region: Region;
  annualBirths: number;

  // US Market
  scanReimbursement: number;
  cSectionCost: number;
  nicuDailyCost: number;
  malpracticeClaimCost: number;

  // UK Specifics
  growthScanCost: number;
  consultantAppointmentCost: number;
  midwifeAppointmentCost: number;
  neonatalDeathLitigationCost: number;
  stillbirthLitigationCost: number;

  // Clinical Assumptions
  fgrPrevalence: number;
  currentDetectionRate: number;
  oxailisDetectionRate: number;
  currentFalsePositiveRate: number;
  oxailisFalsePositiveRate: number;

  // Risk Ratios
  emergencyCSectionRateUndiagnosed: number;
  hypoxicEventRate: number;
  cerebralPalsyRisk: number;

  // Screening
  oxailisScanCost: number;
  combinedTestRate: number;

  // US Litigation (new)
  fetalDeathPayout: number;
  litigationSuccessRate: number;

  // US Deployment Costs
  implementationCost: number;
  perScanScreeningCost: number;

  // Documentation
  bibliography: string[];
  inputReferences: Record<string, string>;
}

export interface SimulationResults {
  demographics: {
    totalFGR: number;
    undiagnosedCurrent: number;
    undiagnosedOxailis: number;
    avoidedUndiagnosed: number;
  };
  financials: {
    revenueGenerated: number;
    cSectionSavings: number;
    nicuSavings: number;
    litigationSavings: number;
    cpLitigationSavings?: number;
    fetalDeathSavings?: number;
    totalSavings: number;
    totalEconomicImpact: number;
    growthScanCosts?: number;
    deploymentCosts?: number;
    netBenefit?: number;
  };
  clinicalOutcomes: {
    avoidedCSections: number;
    avoidedNICUDays: number;
    avoidedHypoxicEvents: number;
    avoidedCPCases: number;
    avoidedStillbirths: number;
    avoidedNeonatalDeaths?: number;
  };
}

export interface FormulaDefinition {
  id: string;
  name: string;
  formula: string;
  group: 'demographics' | 'clinical' | 'financial';
  format: 'number' | 'currency';
  unit?: string;
  isCustom?: boolean;
  region?: Region | 'all';
}

export interface CustomVariable {
  id: string;
  name: string;
  value: number;
  format: 'number' | 'percent' | 'currency';
}

export interface CustomParameter {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: 'number' | 'percent' | 'currency';
  group: string;
  reference: string;
}

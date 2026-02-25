export type Region = 'US' | 'UK' | 'Global';

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
    totalSavings: number;
    totalEconomicImpact: number;
    growthScanCosts?: number;
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

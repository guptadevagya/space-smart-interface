import { FormulaDefinition, Region, SimulationInputs, SimulationResults } from './types';

export function getDefaultFormulas(region: Region): FormulaDefinition[] {
  const isUK = region === 'UK' || region === 'Global';

  const demographics: FormulaDefinition[] = [
    { id: 'totalFGR', name: 'Total FGR Cases', formula: 'annualBirths * fgrPrevalence', group: 'demographics', format: 'number', unit: 'cases' },
    { id: 'detectedCurrent', name: 'Detected (Current)', formula: 'totalFGR * currentDetectionRate', group: 'demographics', format: 'number', unit: 'cases' },
    { id: 'undiagnosedCurrent', name: 'Undiagnosed (Current)', formula: 'totalFGR - detectedCurrent', group: 'demographics', format: 'number', unit: 'cases' },
    { id: 'detectedOxailis', name: 'Detected (OxNNet)', formula: 'totalFGR * oxailisDetectionRate', group: 'demographics', format: 'number', unit: 'cases' },
    { id: 'undiagnosedOxailis', name: 'Undiagnosed (OxNNet)', formula: 'totalFGR - detectedOxailis', group: 'demographics', format: 'number', unit: 'cases' },
    { id: 'avoidedUndiagnosed', name: 'Avoided Undiagnosed', formula: 'undiagnosedCurrent - undiagnosedOxailis', group: 'demographics', format: 'number', unit: 'cases' },
  ];

  const clinical: FormulaDefinition[] = [
    {
      id: 'avoidedCSections', name: 'Avoided C-Sections',
      formula: isUK ? 'avoidedUndiagnosed * 0.15' : 'avoidedUndiagnosed * emergencyCSectionRateUndiagnosed',
      group: 'clinical', format: 'number',
    },
    {
      id: 'avoidedHypoxicEvents', name: 'Avoided Hypoxic Events',
      formula: isUK ? 'avoidedUndiagnosed * 0.004' : 'avoidedUndiagnosed * hypoxicEventRate',
      group: 'clinical', format: 'number',
    },
    { id: 'avoidedNICUDays', name: 'Avoided NICU Days', formula: 'avoidedHypoxicEvents * 7', group: 'clinical', format: 'number', unit: 'days' },
    { id: 'avoidedCPCases', name: 'Avoided CP Cases', formula: 'avoidedHypoxicEvents * cerebralPalsyRisk', group: 'clinical', format: 'number' },
    { id: 'avoidedStillbirths', name: 'Avoided Stillbirths', formula: 'avoidedUndiagnosed * 0.0168', group: 'clinical', format: 'number' },
  ];

  if (isUK) {
    clinical.push({
      id: 'avoidedNND', name: 'Avoided Neonatal Deaths',
      formula: 'avoidedHypoxicEvents * 0.09', group: 'clinical', format: 'number',
    });
  }

  const financial: FormulaDefinition[] = [
    { id: 'cSectionSavings', name: 'C-Section Savings', formula: 'avoidedCSections * cSectionCost', group: 'financial', format: 'currency' },
    { id: 'nicuSavings', name: 'NICU Savings', formula: 'avoidedNICUDays * nicuDailyCost', group: 'financial', format: 'currency' },
  ];

  if (isUK) {
    financial.push(
      { id: 'mumExtraStaySavings', name: 'Mum Extra Stay Savings', formula: 'avoidedHypoxicEvents * 2537.333333', group: 'financial', format: 'currency' },
      { id: 'stillbirthSavings', name: 'Stillbirth Cost Avoidance', formula: 'avoidedStillbirths * stillbirthLitigationCost', group: 'financial', format: 'currency' },
      { id: 'cpSavings', name: 'CP Litigation Savings', formula: 'avoidedCPCases * malpracticeClaimCost', group: 'financial', format: 'currency' },
      { id: 'nndSavings', name: 'NND Litigation Savings', formula: 'avoidedNND * neonatalDeathLitigationCost', group: 'financial', format: 'currency' },
      { id: 'nndTrustCost', name: 'NND Trust Cost Savings', formula: 'avoidedNND * stillbirthLitigationCost', group: 'financial', format: 'currency' },
      { id: 'nndTotalCostSaving', name: 'NND Total Cost Saving to NHS', formula: 'nndSavings + nndTrustCost', group: 'financial', format: 'currency' },
      { id: 'totalClinicalSavings', name: 'Total Saving to NHS', formula: 'cSectionSavings + nicuSavings + mumExtraStaySavings + stillbirthSavings + cpSavings + nndSavings + nndTotalCostSaving', group: 'financial', format: 'currency' },
      {
        id: 'highRiskCurrent', name: 'High Risk Cohort (Current)',
        formula: 'detectedCurrent / (1 - currentFalsePositiveRate)', group: 'financial', format: 'number',
      },
      {
        id: 'highRiskOxailis', name: 'High Risk Cohort (OxNNet)',
        formula: 'detectedOxailis / (1 - oxailisFalsePositiveRate)', group: 'financial', format: 'number',
      },
      {
        id: 'costPerHighRisk', name: 'Cost per High-Risk Patient',
        formula: '(3 * growthScanCost) + (2 * consultantAppointmentCost) + (consultantAppointmentCost - midwifeAppointmentCost)',
        group: 'financial', format: 'currency',
      },
      { id: 'screeningCostIncrease', name: 'Screening Cost Increase', formula: '(highRiskOxailis - highRiskCurrent) * costPerHighRisk', group: 'financial', format: 'currency' },
      { id: 'netBenefit', name: 'Net Benefit', formula: 'totalClinicalSavings - screeningCostIncrease', group: 'financial', format: 'currency' },
    );
  } else {
    financial.push(
      { id: 'litigationSavings', name: 'Litigation Savings', formula: '(avoidedCPCases + avoidedStillbirths) * malpracticeClaimCost', group: 'financial', format: 'currency' },
      { id: 'totalSavings', name: 'Total Savings', formula: 'cSectionSavings + nicuSavings + litigationSavings', group: 'financial', format: 'currency' },
      {
        id: 'highRiskCohortOxailis', name: 'High Risk Cohort (OxNNet)',
        formula: 'detectedOxailis / (1 - oxailisFalsePositiveRate)', group: 'financial', format: 'number',
      },
      { id: 'totalScansOxailis', name: 'Total Scans (OxNNet)', formula: 'highRiskCohortOxailis * 3', group: 'financial', format: 'number' },
      { id: 'revenueGenerated', name: 'Revenue Generated', formula: 'totalScansOxailis * scanReimbursement', group: 'financial', format: 'currency' },
      { id: 'totalEconomicImpact', name: 'Total Economic Impact', formula: 'revenueGenerated + totalSavings', group: 'financial', format: 'currency' },
    );
  }

  return [...demographics, ...clinical, ...financial];
}

export function getInputVariableMap(inputs: SimulationInputs): Record<string, number> {
  return {
    annualBirths: inputs.annualBirths,
    fgrPrevalence: inputs.fgrPrevalence,
    currentDetectionRate: inputs.currentDetectionRate,
    oxailisDetectionRate: inputs.oxailisDetectionRate,
    currentFalsePositiveRate: inputs.currentFalsePositiveRate,
    oxailisFalsePositiveRate: inputs.oxailisFalsePositiveRate,
    emergencyCSectionRateUndiagnosed: inputs.emergencyCSectionRateUndiagnosed,
    hypoxicEventRate: inputs.hypoxicEventRate,
    cerebralPalsyRisk: inputs.cerebralPalsyRisk,
    scanReimbursement: inputs.scanReimbursement,
    cSectionCost: inputs.cSectionCost,
    nicuDailyCost: inputs.nicuDailyCost,
    malpracticeClaimCost: inputs.malpracticeClaimCost,
    growthScanCost: inputs.growthScanCost,
    consultantAppointmentCost: inputs.consultantAppointmentCost,
    midwifeAppointmentCost: inputs.midwifeAppointmentCost,
    neonatalDeathLitigationCost: inputs.neonatalDeathLitigationCost,
    stillbirthLitigationCost: inputs.stillbirthLitigationCost,
    oxailisScanCost: inputs.oxailisScanCost,
    combinedTestRate: inputs.combinedTestRate,
  };
}

export const INPUT_VARIABLE_LABELS: Record<string, string> = {
  annualBirths: 'Annual Births',
  fgrPrevalence: 'FGR Prevalence',
  currentDetectionRate: 'Current Detection Rate',
  oxailisDetectionRate: 'OxNNet Detection Rate',
  currentFalsePositiveRate: 'Current False Positive Rate',
  oxailisFalsePositiveRate: 'OxNNet False Positive Rate',
  emergencyCSectionRateUndiagnosed: 'Emergency C-Section Rate',
  hypoxicEventRate: 'Hypoxic Event Rate',
  cerebralPalsyRisk: 'Cerebral Palsy Risk',
  scanReimbursement: 'Scan Reimbursement',
  cSectionCost: 'C-Section Cost',
  nicuDailyCost: 'NICU Daily Cost',
  malpracticeClaimCost: 'Malpractice Claim Cost',
  growthScanCost: 'Growth Scan Cost',
  consultantAppointmentCost: 'Consultant Appt Cost',
  midwifeAppointmentCost: 'Midwife Appt Cost',
  neonatalDeathLitigationCost: 'NND Litigation Cost',
  stillbirthLitigationCost: 'Stillbirth Litigation Cost',
};

export function formulaResultsToSimulation(
  values: Record<string, number>,
  region: Region
): SimulationResults {
  const isUK = region === 'UK' || region === 'Global';

  return {
    demographics: {
      totalFGR: values.totalFGR ?? 0,
      undiagnosedCurrent: values.undiagnosedCurrent ?? 0,
      undiagnosedOxailis: values.undiagnosedOxailis ?? 0,
      avoidedUndiagnosed: values.avoidedUndiagnosed ?? 0,
    },
    clinicalOutcomes: {
      avoidedCSections: values.avoidedCSections ?? 0,
      avoidedNICUDays: values.avoidedNICUDays ?? 0,
      avoidedHypoxicEvents: values.avoidedHypoxicEvents ?? 0,
      avoidedCPCases: values.avoidedCPCases ?? 0,
      avoidedStillbirths: values.avoidedStillbirths ?? 0,
      ...(isUK ? { avoidedNeonatalDeaths: values.avoidedNND ?? 0 } : {}),
    },
    financials: isUK
      ? {
          revenueGenerated: 0,
          cSectionSavings: values.cSectionSavings ?? 0,
          nicuSavings: (values.nicuSavings ?? 0) + (values.mumExtraStaySavings ?? 0),
          litigationSavings: (values.cpSavings ?? 0) + (values.nndSavings ?? 0) + (values.nndTotalCostSaving ?? 0) + (values.stillbirthSavings ?? 0),
          totalSavings: values.totalClinicalSavings ?? 0,
          totalEconomicImpact: values.netBenefit ?? 0,
          growthScanCosts: values.screeningCostIncrease ?? 0,
          netBenefit: values.netBenefit ?? 0,
        }
      : {
          revenueGenerated: values.revenueGenerated ?? 0,
          cSectionSavings: values.cSectionSavings ?? 0,
          nicuSavings: values.nicuSavings ?? 0,
          litigationSavings: values.litigationSavings ?? 0,
          totalSavings: values.totalSavings ?? 0,
          totalEconomicImpact: values.totalEconomicImpact ?? 0,
        },
  };
}

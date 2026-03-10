import { SimulationInputs, SimulationResults } from './types';

const calculateUSImpact = (inputs: SimulationInputs): SimulationResults => {
  const totalFGR = inputs.annualBirths * inputs.fgrPrevalence;
  const detectedCurrent = totalFGR * inputs.currentDetectionRate;
  const undiagnosedCurrent = totalFGR - detectedCurrent;
  const detectedOxailis = totalFGR * inputs.oxailisDetectionRate;
  const undiagnosedOxailis = totalFGR - detectedOxailis;
  const avoidedUndiagnosed = undiagnosedCurrent - undiagnosedOxailis;

  const avoidedCSections = avoidedUndiagnosed * inputs.emergencyCSectionRateUndiagnosed;
  const avoidedHypoxicEvents = avoidedUndiagnosed * inputs.hypoxicEventRate;
  const avoidedNICUDays = avoidedHypoxicEvents * 7;
  const avoidedCPCases = avoidedHypoxicEvents * inputs.cerebralPalsyRisk;
  const avoidedStillbirths = avoidedUndiagnosed * 0.0168;

  const highRiskCohortOxailis = detectedOxailis / (1 - inputs.oxailisFalsePositiveRate);
  const totalScansOxailis = highRiskCohortOxailis * 3;
  const revenueGenerated = totalScansOxailis * inputs.scanReimbursement;

  const cSectionSavings = avoidedCSections * inputs.cSectionCost;
  const nicuSavings = avoidedNICUDays * inputs.nicuDailyCost;
  const litigationSavings = (avoidedCPCases + avoidedStillbirths) * inputs.malpracticeClaimCost;
  const totalSavings = cSectionSavings + nicuSavings + litigationSavings;

  return {
    demographics: { totalFGR, undiagnosedCurrent, undiagnosedOxailis, avoidedUndiagnosed },
    clinicalOutcomes: { avoidedCSections, avoidedNICUDays, avoidedHypoxicEvents, avoidedCPCases, avoidedStillbirths },
    financials: { revenueGenerated, cSectionSavings, nicuSavings, litigationSavings, totalSavings, totalEconomicImpact: revenueGenerated + totalSavings }
  };
};

const calculateUKImpact = (inputs: SimulationInputs): SimulationResults => {
  const totalFGR = inputs.annualBirths * inputs.fgrPrevalence;
  const detectedCurrent = totalFGR * inputs.currentDetectionRate;
  const undiagnosedCurrent = totalFGR - detectedCurrent;
  const detectedOxailis = totalFGR * inputs.oxailisDetectionRate;
  const undiagnosedOxailis = totalFGR - detectedOxailis;
  const avoidedUndiagnosed = undiagnosedCurrent - undiagnosedOxailis;

  // Screening costs
  const highRiskCurrent = detectedCurrent / (1 - inputs.currentFalsePositiveRate);
  const highRiskOxailis = detectedOxailis / (1 - inputs.oxailisFalsePositiveRate);
  const midwifeToConsultantDiff = inputs.consultantAppointmentCost - inputs.midwifeAppointmentCost;
  const costPerHighRisk = (3 * inputs.growthScanCost) + (2 * inputs.consultantAppointmentCost) + (1 * midwifeToConsultantDiff);
  const screeningCostIncrease = (highRiskOxailis - highRiskCurrent) * costPerHighRisk;
  const oxailisScreeningCost = inputs.annualBirths * inputs.combinedTestRate * inputs.oxailisScanCost;
  const totalScreeningCost = screeningCostIncrease + oxailisScreeningCost;

  // Clinical outcomes
  const avoidedCSections = avoidedUndiagnosed * 0.15;
  const cSectionSavings = avoidedCSections * inputs.cSectionCost;
  const avoidedHypoxicEvents = avoidedUndiagnosed * 0.004;
  const avoidedNICUDays = avoidedHypoxicEvents * 7;
  const nicuSavings = avoidedNICUDays * inputs.nicuDailyCost;
  const mumExtraStaySavings = avoidedHypoxicEvents * (2537 + 1/3);
  const avoidedStillbirths = avoidedUndiagnosed * 0.0168;
  const stillbirthSavings = avoidedStillbirths * inputs.stillbirthLitigationCost;
  const avoidedCPCases = avoidedHypoxicEvents * inputs.cerebralPalsyRisk;
  const cpSavings = avoidedCPCases * inputs.malpracticeClaimCost;
  const avoidedNND = avoidedHypoxicEvents * 0.09;
  const nndSavings = avoidedNND * inputs.neonatalDeathLitigationCost;
  const nndTrustCost = avoidedNND * inputs.stillbirthLitigationCost;
  const nndTotalCostSaving = nndSavings + nndTrustCost;

  const totalClinicalSavings = cSectionSavings + nicuSavings + mumExtraStaySavings + stillbirthSavings + cpSavings + nndSavings + nndTotalCostSaving;
  const netBenefit = totalClinicalSavings - totalScreeningCost;

  return {
    demographics: { totalFGR, undiagnosedCurrent, undiagnosedOxailis, avoidedUndiagnosed },
    clinicalOutcomes: { avoidedCSections, avoidedNICUDays, avoidedHypoxicEvents, avoidedCPCases, avoidedStillbirths, avoidedNeonatalDeaths: avoidedNND },
    financials: {
      revenueGenerated: 0,
      cSectionSavings,
      nicuSavings: nicuSavings + mumExtraStaySavings,
      litigationSavings: cpSavings + nndSavings + nndTotalCostSaving + stillbirthSavings,
      totalSavings: totalClinicalSavings,
      totalEconomicImpact: netBenefit,
      growthScanCosts: totalScreeningCost,
      netBenefit
    }
  };
};

export const calculateImpact = (inputs: SimulationInputs): SimulationResults => {
  if (inputs.region === 'UK' || inputs.region === 'Global') {
    return calculateUKImpact(inputs);
  }
  return calculateUSImpact(inputs);
};

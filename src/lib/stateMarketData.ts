import { ProviderType } from './providerProfiles';

export interface StateMarketData {
  state: string;
  abbr: string;
  totalBirths: number;
  largestSystem: string;
  systemType: ProviderType;
  estPctControlled: number;
  top3PctCombined: number;
}

export const STATE_MARKET_DATA: StateMarketData[] = [
  { state: 'Alabama', abbr: 'AL', totalBirths: 58149, largestSystem: 'UAB Medicine', systemType: 'idn', estPctControlled: 0.145, top3PctCombined: 0.38 },
  { state: 'Alaska', abbr: 'AK', totalBirths: 9359, largestSystem: 'Providence', systemType: 'idn', estPctControlled: 0.35, top3PctCombined: 0.65 },
  { state: 'Arizona', abbr: 'AZ', totalBirths: 78547, largestSystem: 'Banner Health', systemType: 'ipp', estPctControlled: 0.22, top3PctCombined: 0.515 },
  { state: 'Arkansas', abbr: 'AR', totalBirths: 35471, largestSystem: 'Baptist Health', systemType: 'idn', estPctControlled: 0.18, top3PctCombined: 0.46 },
  { state: 'California', abbr: 'CA', totalBirths: 419104, largestSystem: 'Kaiser Permanente', systemType: 'ipp', estPctControlled: 0.21, top3PctCombined: 0.48 },
  { state: 'Colorado', abbr: 'CO', totalBirths: 62383, largestSystem: 'UCHealth', systemType: 'idn', estPctControlled: 0.25, top3PctCombined: 0.62 },
  { state: 'Connecticut', abbr: 'CT', totalBirths: 35332, largestSystem: 'Yale New Haven Health', systemType: 'idn', estPctControlled: 0.28, top3PctCombined: 0.68 },
  { state: 'Delaware', abbr: 'DE', totalBirths: 10816, largestSystem: 'ChristianaCare', systemType: 'idn', estPctControlled: 0.55, top3PctCombined: 0.85 },
  { state: 'District of Columbia', abbr: 'DC', totalBirths: 8075, largestSystem: 'MedStar Health', systemType: 'ipp', estPctControlled: 0.40, top3PctCombined: 0.88 },
  { state: 'Florida', abbr: 'FL', totalBirths: 224433, largestSystem: 'AdventHealth', systemType: 'idn', estPctControlled: 0.18, top3PctCombined: 0.47 },
  { state: 'Georgia', abbr: 'GA', totalBirths: 126130, largestSystem: 'Northside Hospital', systemType: 'idn', estPctControlled: 0.22, top3PctCombined: 0.49 },
  { state: 'Hawaii', abbr: 'HI', totalBirths: 15535, largestSystem: 'Hawaii Pacific Health', systemType: 'idn', estPctControlled: 0.38, top3PctCombined: 0.75 },
  { state: 'Idaho', abbr: 'ID', totalBirths: 22391, largestSystem: "St. Luke's Health System", systemType: 'ipp', estPctControlled: 0.42, top3PctCombined: 0.78 },
  { state: 'Illinois', abbr: 'IL', totalBirths: 128350, largestSystem: 'Advocate Health', systemType: 'ipp', estPctControlled: 0.24, top3PctCombined: 0.53 },
  { state: 'Indiana', abbr: 'IN', totalBirths: 79649, largestSystem: 'Indiana University Health', systemType: 'idn', estPctControlled: 0.21, top3PctCombined: 0.52 },
  { state: 'Iowa', abbr: 'IA', totalBirths: 36506, largestSystem: 'UnityPoint Health', systemType: 'ipp', estPctControlled: 0.26, top3PctCombined: 0.61 },
  { state: 'Kansas', abbr: 'KS', totalBirths: 34401, largestSystem: 'AdventHealth', systemType: 'idn', estPctControlled: 0.16, top3PctCombined: 0.42 },
  { state: 'Kentucky', abbr: 'KY', totalBirths: 52315, largestSystem: 'Baptist Health', systemType: 'idn', estPctControlled: 0.22, top3PctCombined: 0.54 },
  { state: 'Louisiana', abbr: 'LA', totalBirths: 56479, largestSystem: 'Ochsner Health', systemType: 'idn', estPctControlled: 0.30, top3PctCombined: 0.58 },
  { state: 'Maine', abbr: 'ME', totalBirths: 12093, largestSystem: 'MaineHealth', systemType: 'ipp', estPctControlled: 0.45, top3PctCombined: 0.80 },
  { state: 'Maryland', abbr: 'MD', totalBirths: 68782, largestSystem: 'Johns Hopkins Medicine', systemType: 'ipp', estPctControlled: 0.24, top3PctCombined: 0.60 },
  { state: 'Massachusetts', abbr: 'MA', totalBirths: 68584, largestSystem: 'Mass General Brigham', systemType: 'ipp', estPctControlled: 0.32, top3PctCombined: 0.68 },
  { state: 'Michigan', abbr: 'MI', totalBirths: 102321, largestSystem: 'Corewell Health', systemType: 'idn', estPctControlled: 0.28, top3PctCombined: 0.65 },
  { state: 'Minnesota', abbr: 'MN', totalBirths: 64015, largestSystem: 'Allina Health', systemType: 'ipp', estPctControlled: 0.24, top3PctCombined: 0.62 },
  { state: 'Mississippi', abbr: 'MS', totalBirths: 34675, largestSystem: 'Baptist Memorial Health', systemType: 'idn', estPctControlled: 0.18, top3PctCombined: 0.48 },
  { state: 'Missouri', abbr: 'MO', totalBirths: 68985, largestSystem: 'BJC HealthCare', systemType: 'idn', estPctControlled: 0.26, top3PctCombined: 0.64 },
  { state: 'Montana', abbr: 'MT', totalBirths: 11175, largestSystem: 'Billings Clinic', systemType: 'idn', estPctControlled: 0.22, top3PctCombined: 0.55 },
  { state: 'Nebraska', abbr: 'NE', totalBirths: 24345, largestSystem: 'CHI Health (CommonSpirit)', systemType: 'ipp', estPctControlled: 0.35, top3PctCombined: 0.72 },
  { state: 'Nevada', abbr: 'NV', totalBirths: 33193, largestSystem: 'HCA Healthcare', systemType: 'idn', estPctControlled: 0.26, top3PctCombined: 0.63 },
  { state: 'New Hampshire', abbr: 'NH', totalBirths: 12077, largestSystem: 'Dartmouth Health', systemType: 'idn', estPctControlled: 0.38, top3PctCombined: 0.76 },
  { state: 'New Jersey', abbr: 'NJ', totalBirths: 102893, largestSystem: 'RWJBarnabas Health', systemType: 'idn', estPctControlled: 0.29, top3PctCombined: 0.66 },
  { state: 'New Mexico', abbr: 'NM', totalBirths: 21614, largestSystem: 'Presbyterian Healthcare', systemType: 'ipp', estPctControlled: 0.40, top3PctCombined: 0.78 },
  { state: 'New York', abbr: 'NY', totalBirths: 207774, largestSystem: 'Northwell Health', systemType: 'idn', estPctControlled: 0.15, top3PctCombined: 0.42 },
  { state: 'North Carolina', abbr: 'NC', totalBirths: 120082, largestSystem: 'Advocate Health (Atrium)', systemType: 'idn', estPctControlled: 0.28, top3PctCombined: 0.67 },
  { state: 'North Dakota', abbr: 'ND', totalBirths: 10000, largestSystem: 'Sanford Health', systemType: 'ipp', estPctControlled: 0.52, top3PctCombined: 0.88 },
  { state: 'Ohio', abbr: 'OH', totalBirths: 126896, largestSystem: 'Cleveland Clinic', systemType: 'idn', estPctControlled: 0.18, top3PctCombined: 0.48 },
  { state: 'Oklahoma', abbr: 'OK', totalBirths: 47000, largestSystem: 'Integris Health', systemType: 'idn', estPctControlled: 0.22, top3PctCombined: 0.56 },
  { state: 'Oregon', abbr: 'OR', totalBirths: 39634, largestSystem: 'Providence', systemType: 'idn', estPctControlled: 0.32, top3PctCombined: 0.71 },
  { state: 'Pennsylvania', abbr: 'PA', totalBirths: 126951, largestSystem: 'UPMC', systemType: 'ipp', estPctControlled: 0.24, top3PctCombined: 0.58 },
  { state: 'Rhode Island', abbr: 'RI', totalBirths: 10000, largestSystem: 'Lifespan', systemType: 'idn', estPctControlled: 0.58, top3PctCombined: 0.92 },
  { state: 'South Carolina', abbr: 'SC', totalBirths: 56000, largestSystem: 'Prisma Health', systemType: 'idn', estPctControlled: 0.31, top3PctCombined: 0.64 },
  { state: 'South Dakota', abbr: 'SD', totalBirths: 11000, largestSystem: 'Sanford Health', systemType: 'ipp', estPctControlled: 0.48, top3PctCombined: 0.86 },
  { state: 'Tennessee', abbr: 'TN', totalBirths: 78000, largestSystem: 'HCA Healthcare', systemType: 'idn', estPctControlled: 0.25, top3PctCombined: 0.59 },
  { state: 'Texas', abbr: 'TX', totalBirths: 387945, largestSystem: 'HCA Healthcare', systemType: 'idn', estPctControlled: 0.16, top3PctCombined: 0.41 },
  { state: 'Utah', abbr: 'UT', totalBirths: 45000, largestSystem: 'Intermountain Health', systemType: 'ipp', estPctControlled: 0.55, top3PctCombined: 0.84 },
  { state: 'Vermont', abbr: 'VT', totalBirths: 5000, largestSystem: 'UVM Health Network', systemType: 'idn', estPctControlled: 0.65, top3PctCombined: 0.90 },
  { state: 'Virginia', abbr: 'VA', totalBirths: 92649, largestSystem: 'Inova Health System', systemType: 'idn', estPctControlled: 0.20, top3PctCombined: 0.52 },
  { state: 'Washington', abbr: 'WA', totalBirths: 80932, largestSystem: 'Providence', systemType: 'idn', estPctControlled: 0.28, top3PctCombined: 0.63 },
  { state: 'West Virginia', abbr: 'WV', totalBirths: 17000, largestSystem: 'WVU Medicine', systemType: 'ipp', estPctControlled: 0.38, top3PctCombined: 0.74 },
  { state: 'Wisconsin', abbr: 'WI', totalBirths: 60000, largestSystem: 'Advocate Health (Aurora)', systemType: 'ipp', estPctControlled: 0.26, top3PctCombined: 0.61 },
  { state: 'Wyoming', abbr: 'WY', totalBirths: 6000, largestSystem: 'Banner Health', systemType: 'ipp', estPctControlled: 0.35, top3PctCombined: 0.75 },
];

export const getStateMarketByAbbr = (abbr: string): StateMarketData | undefined =>
  STATE_MARKET_DATA.find((s) => s.abbr === abbr);

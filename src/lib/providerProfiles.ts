export type ProviderType = 'idn' | 'ipp';

export interface ProviderProfile {
  id: string;
  name: string;
  type: ProviderType;
  annualBirths: number;
  states: string[];
  source: string;
}

export const US_PROVIDERS: ProviderProfile[] = [
  {
    id: 'hca',
    name: 'HCA Healthcare',
    type: 'idn',
    annualBirths: 212000,
    states: ['TX', 'FL', 'TN', 'VA', 'CO', 'GA', 'SC', 'KS', 'IN', 'NV', 'NH', 'UT', 'ID', 'AK', 'NC', 'MO', 'LA', 'KY', 'MS'],
    source: 'HCA 2024 Annual Report; AHA Hospital Statistics 2024',
  },
  {
    id: 'kaiser',
    name: 'Kaiser Permanente',
    type: 'ipp',
    annualBirths: 116000,
    states: ['CA', 'OR', 'WA', 'CO', 'HI', 'GA', 'VA', 'MD', 'DC'],
    source: 'Kaiser Permanente Community Health Data 2024',
  },
  {
    id: 'commonspirit',
    name: 'CommonSpirit Health',
    type: 'idn',
    annualBirths: 85000,
    states: ['CA', 'TX', 'AZ', 'CO', 'NE', 'OH', 'WA', 'KY', 'NV', 'IA', 'TN'],
    source: 'CommonSpirit Health FY2024 Community Benefit Report',
  },
  {
    id: 'ascension',
    name: 'Ascension',
    type: 'idn',
    annualBirths: 75753,
    states: ['TX', 'FL', 'MI', 'WI', 'IN', 'TN', 'AL', 'OK', 'KS', 'NY', 'MD'],
    source: 'Ascension Health System Annual Report 2024',
  },
  {
    id: 'advocate',
    name: 'Advocate Health',
    type: 'idn',
    annualBirths: 65000,
    states: ['IL', 'WI', 'NC', 'GA'],
    source: 'Advocate Health (Atrium + Advocate Aurora) 2024 Data',
  },
  {
    id: 'providence',
    name: 'Providence',
    type: 'idn',
    annualBirths: 60000,
    states: ['WA', 'OR', 'CA', 'AK', 'MT', 'TX'],
    source: 'Providence Health System 2024 Annual Report',
  },
  {
    id: 'trinity',
    name: 'Trinity Health',
    type: 'idn',
    annualBirths: 50000,
    states: ['MI', 'OH', 'IN', 'IA', 'IL', 'ID', 'CA', 'NJ', 'NY', 'PA', 'MA', 'CT', 'GA', 'FL'],
    source: 'Trinity Health FY2024 Statistics',
  },
  {
    id: 'tenet',
    name: 'Tenet Healthcare',
    type: 'idn',
    annualBirths: 45000,
    states: ['TX', 'FL', 'CA', 'AZ', 'SC', 'AL'],
    source: 'Tenet Healthcare 2024 Annual Report',
  },
  {
    id: 'baylor',
    name: 'Baylor Scott & White',
    type: 'idn',
    annualBirths: 40000,
    states: ['TX'],
    source: 'BSWH Community Benefit Report 2024',
  },
  {
    id: 'adventhealth',
    name: 'AdventHealth',
    type: 'idn',
    annualBirths: 40000,
    states: ['FL', 'CO', 'TX', 'GA', 'NC', 'WI', 'IL', 'KS'],
    source: 'AdventHealth 2024 Annual Report',
  },
  {
    id: 'intermountain',
    name: 'Intermountain Health',
    type: 'ipp',
    annualBirths: 37477,
    states: ['UT', 'ID', 'NV', 'CO', 'WY', 'MT', 'KS'],
    source: 'Intermountain Health 2024 Statistical Report',
  },
  {
    id: 'uhs',
    name: 'Universal Health Services',
    type: 'idn',
    annualBirths: 34900,
    states: ['TX', 'NV', 'DC', 'VA', 'PA', 'SC', 'FL'],
    source: 'UHS 2024 Annual Report',
  },
  {
    id: 'northwell',
    name: 'Northwell Health',
    type: 'idn',
    annualBirths: 30500,
    states: ['NY'],
    source: 'Northwell Health 2024 Community Health Data',
  },
  {
    id: 'corewell',
    name: 'Corewell Health',
    type: 'idn',
    annualBirths: 28000,
    states: ['MI'],
    source: 'Corewell Health (Beaumont + Spectrum) 2024 Data',
  },
  {
    id: 'sutter',
    name: 'Sutter Health',
    type: 'idn',
    annualBirths: 26000,
    states: ['CA'],
    source: 'Sutter Health 2024 Annual Report',
  },
  {
    id: 'upmc',
    name: 'UPMC',
    type: 'ipp',
    annualBirths: 25000,
    states: ['PA', 'NY', 'MD'],
    source: 'UPMC Health System 2024 Data',
  },
  {
    id: 'massgenbrigham',
    name: 'Mass General Brigham',
    type: 'idn',
    annualBirths: 22000,
    states: ['MA', 'NH'],
    source: 'MGB Annual Report 2024',
  },
  {
    id: 'uchealth',
    name: 'UC Health',
    type: 'idn',
    annualBirths: 20000,
    states: ['CA'],
    source: 'University of California Health 2024 Data',
  },
  {
    id: 'clevelandclinic',
    name: 'Cleveland Clinic',
    type: 'idn',
    annualBirths: 15000,
    states: ['OH', 'FL'],
    source: 'Cleveland Clinic 2024 Facts & Figures',
  },
  {
    id: 'mayo',
    name: 'Mayo Clinic',
    type: 'idn',
    annualBirths: 15000,
    states: ['MN', 'AZ', 'FL'],
    source: 'Mayo Clinic 2024 Annual Report',
  },
];

export const US_TOTAL_BIRTHS = 3628934;

export const getProvidersByType = (type: ProviderType): ProviderProfile[] =>
  US_PROVIDERS.filter((p) => p.type === type);

export const getProviderById = (id: string): ProviderProfile | undefined =>
  US_PROVIDERS.find((p) => p.id === id);

export const getAggregateBirths = (type: ProviderType): number =>
  getProvidersByType(type).reduce((sum, p) => sum + p.annualBirths, 0);

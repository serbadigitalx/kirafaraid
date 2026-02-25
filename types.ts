export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface HeirsCount {
  spouse: number; // 0 or 1 for husband, 0-4 for wives
  sons: number;
  daughters: number;
  father: boolean;
  mother: boolean;
}

export interface AssetDetails {
  grossAssets: number;
  funeralExpenses: number;
  debts: number;
  hartaSepencarian: number; // Matrimonial property claim (Malaysia specific)
  wasiat: number; // Max 1/3 of net estate
}

export interface HeirShare {
  type: string;
  count: number;
  shareFraction: string; // e.g., "1/8", "2/3"
  sharePercentage: number;
  amount: number;
  note?: string;
}

export interface CalculationResult {
  netEstate: number;
  distribution: HeirShare[];
  totalShares: number; // For checking Aul/Radd
  residueAmount: number;
  isAul: boolean; // Total shares > 1
}

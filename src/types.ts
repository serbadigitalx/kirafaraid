export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export type HeirId =
  | 'spouse'
  | 'father'
  | 'mother'
  | 'paternalGrandfather'
  | 'maternalGrandmother'
  | 'paternalGrandmother'
  | 'sons'
  | 'daughters'
  | 'grandsons'
  | 'granddaughters'
  | 'greatGrandsons'
  | 'greatGranddaughters'
  | 'fullBrothers'
  | 'fullSisters'
  | 'paternalBrothers'
  | 'paternalSisters'
  | 'maternalBrothers'
  | 'maternalSisters'
  | 'fullNephews'
  | 'paternalNephews'
  | 'fullPaternalUncles'
  | 'paternalUncles'
  | 'fullCousins'
  | 'paternalCousins';

export interface HeirsCount {
  spouse: number; // 0-1 husband, 0-4 wives
  sons: number;
  daughters: number;
  father: boolean;
  mother: boolean;
  paternalGrandfather: boolean;
  maternalGrandmother: boolean;
  paternalGrandmother: boolean;
  grandsons: number; // Through a son only
  granddaughters: number; // Through a son only
  greatGrandsons: number; // Through a son's son only
  greatGranddaughters: number; // Through a son's son only
  fullBrothers: number;
  fullSisters: number;
  paternalBrothers: number;
  paternalSisters: number;
  maternalBrothers: number;
  maternalSisters: number;
  fullNephews: number; // Sons of full brothers
  paternalNephews: number; // Sons of paternal half-brothers
  fullPaternalUncles: number;
  paternalUncles: number;
  fullCousins: number; // Sons of full paternal uncles
  paternalCousins: number; // Sons of paternal half-uncles
}

export interface CaseFlags {
  unbornHeir: boolean;
  missingHeir: boolean;
  intersexHeir: boolean;
  layeredOrSimultaneousDeaths: boolean;
  unresolvedDisqualification: boolean;
  hasUnlistedHeirs: boolean;
  confirmedNoOtherHeirs: boolean;
}

export interface AssetDetails {
  grossAssets: number;
  funeralExpenses: number;
  debts: number;
  hartaSepencarian: number;
  wasiat: number;
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export type ShareStatus = 'fardu' | 'asabah' | 'fardu_asabah' | 'baitulmal' | 'radd';

export interface HeirShare {
  id: HeirId | 'baitulmal';
  type: string;
  count: number;
  status: ShareStatus;
  share: Fraction;
  shareFraction: string;
  sharePercentage: number;
  amount: number;
  note?: string;
}

export interface BlockedHeir {
  id: HeirId;
  type: string;
  count: number;
  reason: string;
}

export interface CalculationResult {
  netEstate: number;
  distribution: HeirShare[];
  alternativeRaddDistribution?: HeirShare[];
  blockedHeirs: BlockedHeir[];
  warnings: string[];
  totalShares: number;
  residueAmount: number;
  asalMasalah: number;
  eligibleHeirCount: number;
  isAul: boolean;
  requiresExpertReview: boolean;
}

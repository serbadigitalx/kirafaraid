import { Gender } from '../types';
import type {
  AssetDetails,
  BlockedHeir,
  CaseFlags,
  CalculationResult,
  Fraction,
  HeirId,
  HeirsCount,
  HeirShare,
  ShareStatus
} from '../types';

const ZERO: Fraction = { numerator: 0, denominator: 1 };
const ONE: Fraction = { numerator: 1, denominator: 1 };

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
};

const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);

const fraction = (numerator: number, denominator = 1): Fraction => {
  if (denominator === 0) throw new Error('Penyebut pecahan tidak boleh sifar.');
  if (numerator === 0) return { ...ZERO };
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: sign * (numerator / divisor),
    denominator: Math.abs(denominator / divisor)
  };
};

const add = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);

const subtract = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);

const multiply = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.numerator * b.numerator, a.denominator * b.denominator);

const divide = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.numerator * b.denominator, a.denominator * b.numerator);

const compare = (a: Fraction, b: Fraction): number =>
  a.numerator * b.denominator - b.numerator * a.denominator;

const maxFraction = (...values: Fraction[]): Fraction =>
  values.reduce((best, value) => (compare(value, best) > 0 ? value : best));

const toNumber = (value: Fraction): number => value.numerator / value.denominator;

export const formatFraction = (value: Fraction): string =>
  `${value.numerator}/${value.denominator}`;

const HEIR_LABELS: Record<HeirId, string> = {
  spouse: 'Pasangan',
  father: 'Bapa',
  mother: 'Ibu',
  paternalGrandfather: 'Datuk sebelah bapa',
  maternalGrandmother: 'Nenek sebelah ibu',
  paternalGrandmother: 'Nenek sebelah bapa',
  sons: 'Anak lelaki',
  daughters: 'Anak perempuan',
  grandsons: 'Cucu lelaki daripada anak lelaki',
  granddaughters: 'Cucu perempuan daripada anak lelaki',
  greatGrandsons: 'Cicit lelaki daripada cucu lelaki',
  greatGranddaughters: 'Cicit perempuan daripada cucu lelaki',
  fullBrothers: 'Saudara lelaki seibu-sebapa',
  fullSisters: 'Saudara perempuan seibu-sebapa',
  paternalBrothers: 'Saudara lelaki sebapa',
  paternalSisters: 'Saudara perempuan sebapa',
  maternalBrothers: 'Saudara lelaki seibu',
  maternalSisters: 'Saudara perempuan seibu',
  fullNephews: 'Anak lelaki saudara lelaki seibu-sebapa',
  paternalNephews: 'Anak lelaki saudara lelaki sebapa',
  fullPaternalUncles: 'Bapa saudara seibu-sebapa sebelah bapa',
  paternalUncles: 'Bapa saudara sebapa sebelah bapa',
  fullCousins: 'Sepupu lelaki daripada bapa saudara seibu-sebapa',
  paternalCousins: 'Sepupu lelaki daripada bapa saudara sebapa'
};

const getCount = (heirs: HeirsCount, id: HeirId): number => {
  const value = heirs[id];
  return typeof value === 'boolean' ? Number(value) : Math.max(0, Math.floor(value || 0));
};

const normaliseHeirs = (heirs: HeirsCount, gender: Gender): HeirsCount => ({
  spouse: Math.min(gender === Gender.MALE ? 4 : 1, getCount(heirs, 'spouse')),
  sons: getCount(heirs, 'sons'),
  daughters: getCount(heirs, 'daughters'),
  father: Boolean(heirs.father),
  mother: Boolean(heirs.mother),
  paternalGrandfather: Boolean(heirs.paternalGrandfather),
  maternalGrandmother: Boolean(heirs.maternalGrandmother),
  paternalGrandmother: Boolean(heirs.paternalGrandmother),
  grandsons: getCount(heirs, 'grandsons'),
  granddaughters: getCount(heirs, 'granddaughters'),
  greatGrandsons: getCount(heirs, 'greatGrandsons'),
  greatGranddaughters: getCount(heirs, 'greatGranddaughters'),
  fullBrothers: getCount(heirs, 'fullBrothers'),
  fullSisters: getCount(heirs, 'fullSisters'),
  paternalBrothers: getCount(heirs, 'paternalBrothers'),
  paternalSisters: getCount(heirs, 'paternalSisters'),
  maternalBrothers: getCount(heirs, 'maternalBrothers'),
  maternalSisters: getCount(heirs, 'maternalSisters'),
  fullNephews: getCount(heirs, 'fullNephews'),
  paternalNephews: getCount(heirs, 'paternalNephews'),
  fullPaternalUncles: getCount(heirs, 'fullPaternalUncles'),
  paternalUncles: getCount(heirs, 'paternalUncles'),
  fullCousins: getCount(heirs, 'fullCousins'),
  paternalCousins: getCount(heirs, 'paternalCousins')
});

const DEFAULT_CASE_FLAGS: CaseFlags = {
  unbornHeir: false,
  missingHeir: false,
  intersexHeir: false,
  layeredOrSimultaneousDeaths: false,
  unresolvedDisqualification: false,
  hasUnlistedHeirs: false,
  confirmedNoOtherHeirs: false
};

interface MutableShare {
  id: HeirId | 'baitulmal';
  type: string;
  count: number;
  status: ShareStatus;
  share: Fraction;
  note: string;
}

const makeShare = (
  id: HeirId | 'baitulmal',
  type: string,
  count: number,
  status: ShareStatus,
  share: Fraction,
  note: string
): MutableShare => ({ id, type, count, status, share, note });

const sumShares = (shares: MutableShare[]): Fraction =>
  shares.reduce((total, item) => add(total, item.share), ZERO);

const addOrMergeShare = (
  shares: MutableShare[],
  id: HeirId,
  type: string,
  count: number,
  status: ShareStatus,
  value: Fraction,
  note: string
) => {
  if (count <= 0 || compare(value, ZERO) <= 0) return;
  const existing = shares.find(item => item.id === id);
  if (!existing) {
    shares.push(makeShare(id, type, count, status, value, note));
    return;
  }
  existing.share = add(existing.share, value);
  existing.status = existing.status === status ? status : 'fardu_asabah';
  existing.note = `${existing.note}; ${note}`;
};

const applyAmounts = (shares: MutableShare[], netEstate: number): HeirShare[] =>
  shares.map(item => ({
    ...item,
    shareFraction: formatFraction(item.share),
    sharePercentage: toNumber(item.share),
    amount: toNumber(item.share) * netEstate
  }));

const asalMasalahFor = (shares: MutableShare[]): number =>
  shares.reduce((denominator, item) => lcm(denominator, item.share.denominator), 1);

const blockHeir = (
  active: Record<HeirId, number>,
  blocked: BlockedHeir[],
  id: HeirId,
  reason: string
) => {
  if (active[id] <= 0) return;
  blocked.push({ id, type: HEIR_LABELS[id], count: active[id], reason });
  active[id] = 0;
};

const blockHeirs = (
  active: Record<HeirId, number>,
  blocked: BlockedHeir[],
  ids: HeirId[],
  reason: string
) => ids.forEach(id => blockHeir(active, blocked, id, reason));

const makeRaddAlternative = (shares: MutableShare[]): MutableShare[] | undefined => {
  const spouseShares = shares.filter(item => item.id === 'spouse');
  const raddEligible = shares.filter(item => item.id !== 'spouse' && item.id !== 'baitulmal');
  if (raddEligible.length === 0) return undefined;

  const spouseTotal = sumShares(spouseShares);
  const availableForRadd = subtract(ONE, spouseTotal);
  const eligibleOriginalTotal = sumShares(raddEligible);
  if (compare(eligibleOriginalTotal, ZERO) <= 0) return undefined;

  return [
    ...spouseShares.map(item => ({ ...item })),
    ...raddEligible.map(item => ({
      ...item,
      status: 'radd' as const,
      share: multiply(divide(item.share, eligibleOriginalTotal), availableForRadd),
      note: 'Bahagian alternatif selepas radd'
    }))
  ];
};

const distributeTwoToOne = (
  shares: MutableShare[],
  maleId: HeirId,
  femaleId: HeirId,
  active: Record<HeirId, number>,
  residue: Fraction,
  note: string
) => {
  const maleCount = active[maleId];
  const femaleCount = active[femaleId];
  const units = maleCount * 2 + femaleCount;
  if (units === 0) return;
  if (maleCount > 0) {
    addOrMergeShare(
      shares,
      maleId,
      HEIR_LABELS[maleId],
      maleCount,
      'asabah',
      multiply(residue, fraction(maleCount * 2, units)),
      note
    );
  }
  if (femaleCount > 0) {
    addOrMergeShare(
      shares,
      femaleId,
      HEIR_LABELS[femaleId],
      femaleCount,
      'asabah',
      multiply(residue, fraction(femaleCount, units)),
      note
    );
  }
};

/**
 * V2 educational calculator for the common Syafi'i heir set.
 * It preserves exact fractions and exposes blocked heirs and review-only cases.
 */
export const calculateFaraid = (
  deceasedGender: Gender,
  inputHeirs: HeirsCount,
  assets: AssetDetails,
  inputFlags: Partial<CaseFlags> = {}
): CalculationResult => {
  const heirs = normaliseHeirs(inputHeirs, deceasedGender);
  const caseFlags: CaseFlags = { ...DEFAULT_CASE_FLAGS, ...inputFlags };
  const grossAssets = Math.max(0, assets.grossAssets || 0);
  const preWasiatEstate = Math.max(
    0,
    grossAssets
      - Math.max(0, assets.funeralExpenses || 0)
      - Math.max(0, assets.debts || 0)
      - Math.max(0, assets.hartaSepencarian || 0)
  );
  const actualWasiat = Math.min(Math.max(0, assets.wasiat || 0), preWasiatEstate / 3);
  const netEstate = preWasiatEstate - actualWasiat;

  const active = Object.fromEntries(
    (Object.keys(HEIR_LABELS) as HeirId[]).map(id => [id, getCount(heirs, id)])
  ) as Record<HeirId, number>;
  const blockedHeirs: BlockedHeir[] = [];
  const warnings: string[] = [];
  let requiresExpertReview = false;

  const specialCaseWarnings: Array<[keyof CaseFlags, string]> = [
    ['unbornHeir', 'Terdapat kandungan atau waris belum lahir yang boleh mengubah kelayakan dan bahagian.'],
    ['missingHeir', 'Terdapat waris hilang (mafqud) atau status hidupnya belum dipastikan.'],
    ['intersexHeir', 'Terdapat waris khunsa atau jantina pewaris memerlukan penentuan khusus.'],
    ['layeredOrSimultaneousDeaths', 'Terdapat kematian berlapis atau urutan kematian yang belum dipastikan.'],
    ['unresolvedDisqualification', 'Terdapat isu kelayakan seperti perbezaan agama, pembunuhan atau nasab yang belum disahkan.'],
    ['hasUnlistedHeirs', 'Terdapat waris lain atau hubungan keluarga yang tidak disenaraikan dalam borang ini.']
  ];
  specialCaseWarnings.forEach(([key, message]) => {
    if (caseFlags[key]) {
      requiresExpertReview = true;
      warnings.push(message);
    }
  });

  const rawSiblingCount =
    active.fullBrothers + active.fullSisters
    + active.paternalBrothers + active.paternalSisters
    + active.maternalBrothers + active.maternalSisters;

  if (active.sons > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['grandsons', 'granddaughters', 'greatGrandsons', 'greatGranddaughters'],
      'Didinding oleh anak lelaki yang lebih hampir.'
    );
  } else if (active.grandsons > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['greatGrandsons', 'greatGranddaughters'],
      'Didinding oleh cucu lelaki yang lebih hampir.'
    );
  }

  if (active.father > 0) {
    blockHeir(active, blockedHeirs, 'paternalGrandfather', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'paternalGrandmother', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'fullBrothers', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'fullSisters', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'paternalBrothers', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'paternalSisters', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'maternalBrothers', 'Didinding oleh bapa.');
    blockHeir(active, blockedHeirs, 'maternalSisters', 'Didinding oleh bapa.');
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh bapa.'
    );
  }

  if (active.mother > 0) {
    blockHeir(active, blockedHeirs, 'maternalGrandmother', 'Didinding oleh ibu.');
    blockHeir(active, blockedHeirs, 'paternalGrandmother', 'Didinding oleh ibu.');
  }

  const hasMaleDescendant = active.sons > 0 || active.grandsons > 0 || active.greatGrandsons > 0;
  const hasFemaleDescendant = active.daughters > 0 || active.granddaughters > 0 || active.greatGranddaughters > 0;
  const hasDescendant = hasMaleDescendant || hasFemaleDescendant;

  if (hasMaleDescendant) {
    blockHeirs(
      active,
      blockedHeirs,
      [
        'fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters',
        'fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'
      ],
      'Didinding oleh keturunan lelaki ke bawah.'
    );
  }

  if (hasDescendant || active.father > 0 || active.paternalGrandfather > 0) {
    const blocker = hasDescendant ? 'keturunan ke bawah' : active.father > 0 ? 'bapa' : 'datuk sebelah bapa';
    blockHeir(active, blockedHeirs, 'maternalBrothers', `Didinding oleh ${blocker}.`);
    blockHeir(active, blockedHeirs, 'maternalSisters', `Didinding oleh ${blocker}.`);
  }

  if (active.paternalGrandfather > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh datuk sebelah bapa.'
    );
  }

  if (active.fullBrothers > 0 && active.paternalGrandfather === 0) {
    blockHeir(active, blockedHeirs, 'paternalBrothers', 'Didinding oleh saudara lelaki seibu-sebapa.');
    blockHeir(active, blockedHeirs, 'paternalSisters', 'Didinding oleh saudara lelaki seibu-sebapa.');
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh saudara lelaki seibu-sebapa.'
    );
  } else if (active.paternalBrothers > 0 && active.paternalGrandfather === 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh saudara lelaki sebapa.'
    );
  }

  const fullSisterAsabahWithFemaleDescendant =
    hasFemaleDescendant && !hasMaleDescendant && active.fullBrothers === 0 && active.fullSisters > 0;
  if (fullSisterAsabahWithFemaleDescendant) {
    blockHeir(active, blockedHeirs, 'paternalBrothers', 'Didinding oleh saudara perempuan seibu-sebapa yang menjadi asabah bersama keturunan perempuan.');
    blockHeir(active, blockedHeirs, 'paternalSisters', 'Didinding oleh saudara perempuan seibu-sebapa yang menjadi asabah bersama keturunan perempuan.');
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh saudara perempuan seibu-sebapa yang menjadi asabah bersama keturunan perempuan.'
    );
  } else if (active.fullSisters >= 2 && active.paternalBrothers === 0) {
    blockHeir(active, blockedHeirs, 'paternalSisters', 'Didinding oleh dua atau lebih saudara perempuan seibu-sebapa.');
  }

  if (active.daughters >= 2 && active.grandsons === 0) {
    blockHeir(active, blockedHeirs, 'granddaughters', 'Didinding oleh dua atau lebih anak perempuan tanpa cucu lelaki sederajat.');
  }

  const nearerFemaleDescendantShareIsComplete =
    active.daughters >= 2
    || (active.daughters === 1 && active.granddaughters > 0 && active.grandsons === 0)
    || (active.daughters === 0 && active.granddaughters >= 2 && active.grandsons === 0);
  if (nearerFemaleDescendantShareIsComplete && active.greatGrandsons === 0) {
    blockHeir(
      active,
      blockedHeirs,
      'greatGranddaughters',
      'Didinding kerana waris perempuan keturunan lebih hampir telah melengkapkan bahagian 2/3.'
    );
  }

  const paternalSisterAsabahWithFemaleDescendant =
    hasFemaleDescendant
    && !hasMaleDescendant
    && active.fullBrothers === 0
    && active.fullSisters === 0
    && active.paternalBrothers === 0
    && active.paternalSisters > 0;
  if (paternalSisterAsabahWithFemaleDescendant) {
    blockHeirs(
      active,
      blockedHeirs,
      ['fullNephews', 'paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh saudara perempuan sebapa yang menjadi asabah bersama keturunan perempuan.'
    );
  }

  if (active.fullNephews > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['paternalNephews', 'fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh anak lelaki saudara seibu-sebapa yang lebih hampir.'
    );
  } else if (active.paternalNephews > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['fullPaternalUncles', 'paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh anak lelaki saudara sebapa yang lebih hampir.'
    );
  } else if (active.fullPaternalUncles > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['paternalUncles', 'fullCousins', 'paternalCousins'],
      'Didinding oleh bapa saudara seibu-sebapa sebelah bapa.'
    );
  } else if (active.paternalUncles > 0) {
    blockHeirs(
      active,
      blockedHeirs,
      ['fullCousins', 'paternalCousins'],
      'Didinding oleh bapa saudara sebapa sebelah bapa.'
    );
  } else if (active.fullCousins > 0) {
    blockHeir(active, blockedHeirs, 'paternalCousins', 'Didinding oleh sepupu lelaki seibu-sebapa yang lebih kuat.');
  }

  const grandfatherSiblingCount =
    active.fullBrothers + active.fullSisters + active.paternalBrothers + active.paternalSisters;
  const mixedSiblingClassesWithGrandfather =
    active.paternalGrandfather > 0
    && (active.fullBrothers + active.fullSisters > 0)
    && (active.paternalBrothers + active.paternalSisters > 0);
  if (active.paternalGrandfather > 0 && grandfatherSiblingCount > 0) {
    requiresExpertReview = true;
    warnings.push('Kes datuk bersama saudara seibu-sebapa atau saudara sebapa memerlukan kaedah muqasamah dan, bagi sesetengah gabungan, mu\'addah atau Akdariyyah. Sila dapatkan semakan pakar.');
  }

  const isMusytarikah =
    deceasedGender === Gender.FEMALE
    && active.spouse > 0
    && !hasDescendant
    && active.father === 0
    && active.paternalGrandfather === 0
    && (active.mother > 0 || active.maternalGrandmother > 0 || active.paternalGrandmother > 0)
    && active.maternalBrothers + active.maternalSisters >= 2
    && active.fullBrothers > 0;
  if (isMusytarikah) {
    requiresExpertReview = true;
    warnings.push('Gabungan ini menyerupai masalah Musytarikah, yang memerlukan perkongsian khas antara saudara seibu dan saudara seibu-sebapa. Sila dapatkan semakan pakar.');
  }

  const shares: MutableShare[] = [];

  if (active.spouse > 0) {
    if (deceasedGender === Gender.MALE) {
      addOrMergeShare(
        shares,
        'spouse',
        'Isteri',
        active.spouse,
        'fardu',
        hasDescendant ? fraction(1, 8) : fraction(1, 4),
        hasDescendant ? 'Bahagian bersama keturunan ke bawah' : 'Bahagian tanpa keturunan ke bawah'
      );
    } else {
      addOrMergeShare(
        shares,
        'spouse',
        'Suami',
        1,
        'fardu',
        hasDescendant ? fraction(1, 4) : fraction(1, 2),
        hasDescendant ? 'Bahagian bersama keturunan ke bawah' : 'Bahagian tanpa keturunan ke bawah'
      );
    }
  }

  const isUmariyyatain =
    active.mother > 0
    && active.father > 0
    && active.spouse > 0
    && !hasDescendant
    && rawSiblingCount < 2;

  if (active.mother > 0) {
    if (isUmariyyatain) {
      const spouseShare = shares.find(item => item.id === 'spouse')?.share ?? ZERO;
      addOrMergeShare(
        shares,
        'mother',
        HEIR_LABELS.mother,
        1,
        'fardu',
        multiply(subtract(ONE, spouseShare), fraction(1, 3)),
        "1/3 baki dalam masalah 'Umariyyatain"
      );
    } else {
      const getsSixth = hasDescendant || rawSiblingCount >= 2;
      addOrMergeShare(
        shares,
        'mother',
        HEIR_LABELS.mother,
        1,
        'fardu',
        getsSixth ? fraction(1, 6) : fraction(1, 3),
        getsSixth ? 'Ada keturunan ke bawah atau berbilang saudara' : 'Tiada keturunan ke bawah dan kurang dua saudara'
      );
    }
  } else {
    const grandmotherCount = active.maternalGrandmother + active.paternalGrandmother;
    if (grandmotherCount > 0) {
      if (active.maternalGrandmother > 0) {
        addOrMergeShare(
          shares,
          'maternalGrandmother',
          HEIR_LABELS.maternalGrandmother,
          1,
          'fardu',
          fraction(1, 6 * grandmotherCount),
          grandmotherCount > 1 ? 'Berkongsi 1/6 bersama nenek sebelah bapa' : 'Bahagian nenek yang layak'
        );
      }
      if (active.paternalGrandmother > 0) {
        addOrMergeShare(
          shares,
          'paternalGrandmother',
          HEIR_LABELS.paternalGrandmother,
          1,
          'fardu',
          fraction(1, 6 * grandmotherCount),
          grandmotherCount > 1 ? 'Berkongsi 1/6 bersama nenek sebelah ibu' : 'Bahagian nenek yang layak'
        );
      }
    }
  }

  if (active.daughters > 0 && active.sons === 0) {
    addOrMergeShare(
      shares,
      'daughters',
      HEIR_LABELS.daughters,
      active.daughters,
      'fardu',
      active.daughters === 1 ? fraction(1, 2) : fraction(2, 3),
      active.daughters === 1 ? 'Seorang tanpa anak lelaki' : 'Dua atau lebih tanpa anak lelaki'
    );
  }

  if (active.granddaughters > 0 && active.grandsons === 0) {
    let granddaughterShare: Fraction | undefined;
    let note = '';
    if (active.daughters === 0) {
      granddaughterShare = active.granddaughters === 1 ? fraction(1, 2) : fraction(2, 3);
      note = active.granddaughters === 1 ? 'Seorang tanpa anak dan cucu lelaki' : 'Dua atau lebih tanpa anak dan cucu lelaki';
    } else if (active.daughters === 1) {
      granddaughterShare = fraction(1, 6);
      note = 'Melengkapkan 2/3 bersama seorang anak perempuan';
    }
    if (granddaughterShare) {
      addOrMergeShare(
        shares,
        'granddaughters',
        HEIR_LABELS.granddaughters,
        active.granddaughters,
        'fardu',
        granddaughterShare,
        note
      );
    }
  }

  if (active.greatGranddaughters > 0 && active.greatGrandsons === 0) {
    let greatGranddaughterShare: Fraction | undefined;
    let note = '';
    const noNearerFemaleDescendant = active.daughters === 0 && active.granddaughters === 0;
    const oneNearerFemaleShare =
      (active.daughters === 1 && active.granddaughters === 0)
      || (active.daughters === 0 && active.granddaughters === 1);
    if (noNearerFemaleDescendant) {
      greatGranddaughterShare = active.greatGranddaughters === 1 ? fraction(1, 2) : fraction(2, 3);
      note = active.greatGranddaughters === 1
        ? 'Seorang tanpa keturunan perempuan lebih hampir atau cicit lelaki'
        : 'Dua atau lebih tanpa keturunan perempuan lebih hampir atau cicit lelaki';
    } else if (oneNearerFemaleShare) {
      greatGranddaughterShare = fraction(1, 6);
      note = 'Melengkapkan 2/3 bersama seorang waris perempuan keturunan lebih hampir';
    }
    if (greatGranddaughterShare) {
      addOrMergeShare(
        shares,
        'greatGranddaughters',
        HEIR_LABELS.greatGranddaughters,
        active.greatGranddaughters,
        'fardu',
        greatGranddaughterShare,
        note
      );
    }
  }

  if (active.maternalBrothers + active.maternalSisters > 0) {
    const maternalCount = active.maternalBrothers + active.maternalSisters;
    const collective = maternalCount === 1 ? fraction(1, 6) : fraction(1, 3);
    if (active.maternalBrothers > 0) {
      addOrMergeShare(
        shares,
        'maternalBrothers',
        HEIR_LABELS.maternalBrothers,
        active.maternalBrothers,
        'fardu',
        multiply(collective, fraction(active.maternalBrothers, maternalCount)),
        maternalCount === 1 ? 'Seorang saudara seibu' : 'Berkongsi sama rata dalam 1/3'
      );
    }
    if (active.maternalSisters > 0) {
      addOrMergeShare(
        shares,
        'maternalSisters',
        HEIR_LABELS.maternalSisters,
        active.maternalSisters,
        'fardu',
        multiply(collective, fraction(active.maternalSisters, maternalCount)),
        maternalCount === 1 ? 'Seorang saudara seibu' : 'Berkongsi sama rata dalam 1/3'
      );
    }
  }

  const siblingsCompeteWithGrandfather = active.paternalGrandfather > 0 && grandfatherSiblingCount > 0;

  if (!hasDescendant && active.fullBrothers === 0 && active.fullSisters > 0 && !siblingsCompeteWithGrandfather) {
    addOrMergeShare(
      shares,
      'fullSisters',
      HEIR_LABELS.fullSisters,
      active.fullSisters,
      'fardu',
      active.fullSisters === 1 ? fraction(1, 2) : fraction(2, 3),
      active.fullSisters === 1 ? 'Seorang tanpa saudara lelaki sederajat' : 'Dua atau lebih tanpa saudara lelaki sederajat'
    );
  }

  if (
    !hasDescendant
    && active.paternalBrothers === 0
    && active.paternalSisters > 0
    && !siblingsCompeteWithGrandfather
  ) {
    let paternalSisterShare: Fraction | undefined;
    let note = '';
    if (active.fullSisters === 0) {
      paternalSisterShare = active.paternalSisters === 1 ? fraction(1, 2) : fraction(2, 3);
      note = active.paternalSisters === 1 ? 'Seorang tanpa saudara lelaki sederajat' : 'Dua atau lebih tanpa saudara lelaki sederajat';
    } else if (active.fullSisters === 1) {
      paternalSisterShare = fraction(1, 6);
      note = 'Melengkapkan 2/3 bersama seorang saudara perempuan seibu-sebapa';
    }
    if (paternalSisterShare) {
      addOrMergeShare(
        shares,
        'paternalSisters',
        HEIR_LABELS.paternalSisters,
        active.paternalSisters,
        'fardu',
        paternalSisterShare,
        note
      );
    }
  }

  const hasMaleDescendantForFather =
    active.sons > 0 || active.grandsons > 0 || active.greatGrandsons > 0;
  if (active.father > 0 && hasDescendant) {
    addOrMergeShare(
      shares,
      'father',
      HEIR_LABELS.father,
      1,
      'fardu',
      fraction(1, 6),
      hasMaleDescendantForFather ? 'Bahagian bersama keturunan lelaki' : '1/6 dan berhak kepada baki jika ada'
    );
  }

  if (active.paternalGrandfather > 0 && hasDescendant && !siblingsCompeteWithGrandfather) {
    addOrMergeShare(
      shares,
      'paternalGrandfather',
      HEIR_LABELS.paternalGrandfather,
      1,
      'fardu',
      fraction(1, 6),
      hasMaleDescendantForFather ? 'Menggantikan bapa bersama keturunan lelaki' : '1/6 dan berhak kepada baki jika ada'
    );
  }

  let totalFixed = sumShares(shares);
  let isAul = compare(totalFixed, ONE) > 0;

  if (isAul) {
    shares.forEach(item => {
      item.share = divide(item.share, totalFixed);
      item.note = `${item.note}; diselaraskan melalui 'aul`;
    });
    totalFixed = ONE;
  }

  let residue = subtract(ONE, totalFixed);
  let usedAsabah = false;

  if (!isAul && compare(residue, ZERO) > 0) {
    if (active.sons > 0) {
      distributeTwoToOne(shares, 'sons', 'daughters', active, residue, 'Asabah pada nisbah lelaki 2:1 perempuan');
      usedAsabah = true;
    } else if (active.grandsons > 0) {
      distributeTwoToOne(shares, 'grandsons', 'granddaughters', active, residue, 'Asabah cucu pada nisbah lelaki 2:1 perempuan');
      usedAsabah = true;
    } else if (active.greatGrandsons > 0) {
      distributeTwoToOne(shares, 'greatGrandsons', 'greatGranddaughters', active, residue, 'Asabah cicit pada nisbah lelaki 2:1 perempuan');
      usedAsabah = true;
    } else if (active.father > 0) {
      addOrMergeShare(shares, 'father', HEIR_LABELS.father, 1, 'asabah', residue, 'Mengambil baki sebagai asabah');
      usedAsabah = true;
    } else if (siblingsCompeteWithGrandfather && !mixedSiblingClassesWithGrandfather) {
      const siblingMaleId: HeirId = active.fullBrothers + active.fullSisters > 0 ? 'fullBrothers' : 'paternalBrothers';
      const siblingFemaleId: HeirId = siblingMaleId === 'fullBrothers' ? 'fullSisters' : 'paternalSisters';
      const siblingUnits = active[siblingMaleId] * 2 + active[siblingFemaleId];
      const muqasamah = multiply(residue, fraction(2, siblingUnits + 2));
      const oneThirdResidue = multiply(residue, fraction(1, 3));
      const grandfatherShare = maxFraction(fraction(1, 6), oneThirdResidue, muqasamah);
      const cappedGrandfatherShare = compare(grandfatherShare, residue) > 0 ? residue : grandfatherShare;
      addOrMergeShare(
        shares,
        'paternalGrandfather',
        HEIR_LABELS.paternalGrandfather,
        1,
        'asabah',
        cappedGrandfatherShare,
        'Bahagian terbaik antara 1/6, 1/3 baki atau muqasamah'
      );
      const siblingResidue = subtract(residue, cappedGrandfatherShare);
      distributeTwoToOne(shares, siblingMaleId, siblingFemaleId, active, siblingResidue, 'Baki selepas bahagian datuk, nisbah 2:1');
      usedAsabah = true;
    } else if (active.paternalGrandfather > 0) {
      addOrMergeShare(
        shares,
        'paternalGrandfather',
        HEIR_LABELS.paternalGrandfather,
        1,
        'asabah',
        residue,
        'Mengambil baki sebagai asabah menggantikan bapa'
      );
      usedAsabah = true;
    } else if (active.fullBrothers > 0) {
      distributeTwoToOne(shares, 'fullBrothers', 'fullSisters', active, residue, 'Asabah pada nisbah lelaki 2:1 perempuan');
      usedAsabah = true;
    } else if (fullSisterAsabahWithFemaleDescendant) {
      addOrMergeShare(
        shares,
        'fullSisters',
        HEIR_LABELS.fullSisters,
        active.fullSisters,
        'asabah',
        residue,
        'Asabah ma\'a al-ghairi bersama keturunan perempuan'
      );
      usedAsabah = true;
    } else if (active.paternalBrothers > 0) {
      distributeTwoToOne(shares, 'paternalBrothers', 'paternalSisters', active, residue, 'Asabah pada nisbah lelaki 2:1 perempuan');
      usedAsabah = true;
    } else if (paternalSisterAsabahWithFemaleDescendant) {
      addOrMergeShare(
        shares,
        'paternalSisters',
        HEIR_LABELS.paternalSisters,
        active.paternalSisters,
        'asabah',
        residue,
        'Asabah ma\'a al-ghairi bersama keturunan perempuan'
      );
      usedAsabah = true;
    } else if (active.fullNephews > 0) {
      addOrMergeShare(shares, 'fullNephews', HEIR_LABELS.fullNephews, active.fullNephews, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    } else if (active.paternalNephews > 0) {
      addOrMergeShare(shares, 'paternalNephews', HEIR_LABELS.paternalNephews, active.paternalNephews, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    } else if (active.fullPaternalUncles > 0) {
      addOrMergeShare(shares, 'fullPaternalUncles', HEIR_LABELS.fullPaternalUncles, active.fullPaternalUncles, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    } else if (active.paternalUncles > 0) {
      addOrMergeShare(shares, 'paternalUncles', HEIR_LABELS.paternalUncles, active.paternalUncles, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    } else if (active.fullCousins > 0) {
      addOrMergeShare(shares, 'fullCousins', HEIR_LABELS.fullCousins, active.fullCousins, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    } else if (active.paternalCousins > 0) {
      addOrMergeShare(shares, 'paternalCousins', HEIR_LABELS.paternalCousins, active.paternalCousins, 'asabah', residue, 'Mengambil baki sebagai asabah terdekat');
      usedAsabah = true;
    }
  }

  let alternativeRadd: MutableShare[] | undefined;
  if (!isAul && !usedAsabah && compare(residue, ZERO) > 0) {
    if (!caseFlags.confirmedNoOtherHeirs) {
      requiresExpertReview = true;
      warnings.push(
        'Baki tidak boleh ditetapkan kepada Baitulmal sehingga anda mengesahkan bahawa tiada waris lain, termasuk waris lelaki asabah yang lebih jauh.'
      );
    } else {
      alternativeRadd = makeRaddAlternative(shares);
      shares.push(makeShare('baitulmal', 'Baitulmal', 0, 'baitulmal', residue, 'Baki kerana tiada waris asabah yang dikesan selepas pengesahan pengguna'));
      warnings.push('Baki dipaparkan kepada Baitulmal selepas pengesahan bahawa tiada waris lain. Jika pihak berkuasa membenarkan radd, lihat jadual alternatif yang tidak menambah bahagian pasangan.');
      residue = ZERO;
    }
  }

  if (actualWasiat < Math.max(0, assets.wasiat || 0)) {
    warnings.push('Nilai wasiat dihadkan kepada 1/3 daripada baki selepas potongan terdahulu.');
  }

  if (requiresExpertReview) {
    return {
      netEstate,
      distribution: [],
      alternativeRaddDistribution: undefined,
      blockedHeirs,
      warnings,
      totalShares: 0,
      residueAmount: 0,
      asalMasalah: 0,
      eligibleHeirCount: 0,
      isAul: false,
      requiresExpertReview: true
    };
  }

  const distribution = applyAmounts(shares, netEstate);
  const alternativeRaddDistribution = alternativeRadd
    ? applyAmounts(alternativeRadd, netEstate)
    : undefined;
  const eligibleHeirCount = distribution
    .filter(item => item.id !== 'baitulmal')
    .reduce((total, item) => total + item.count, 0);

  return {
    netEstate,
    distribution,
    alternativeRaddDistribution,
    blockedHeirs,
    warnings,
    totalShares: toNumber(sumShares(shares)),
    residueAmount: toNumber(residue) * netEstate,
    asalMasalah: asalMasalahFor(shares),
    eligibleHeirCount,
    isAul,
    requiresExpertReview
  };
};

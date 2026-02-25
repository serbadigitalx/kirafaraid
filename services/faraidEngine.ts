import { Gender, HeirsCount, AssetDetails, CalculationResult, HeirShare } from '../types';

/**
 * Simplified Faraid Calculation Engine for Primary Heirs.
 * Covers: Spouse, Parents, Children.
 * Does not currently cover: Grandparents, Siblings (Kalalah), etc. for simplicity of the UI demo.
 */
export const calculateFaraid = (
  deceasedGender: Gender,
  heirs: HeirsCount,
  assets: AssetDetails
): CalculationResult => {
  // 1. Calculate Net Estate
  let netEstate = assets.grossAssets - assets.funeralExpenses - assets.debts - assets.hartaSepencarian;
  
  // Wasiat is max 1/3 of the remaining after debts/funeral/sepencarian
  const maxWasiat = netEstate / 3;
  const actualWasiat = Math.min(assets.wasiat, maxWasiat);
  netEstate = netEstate - actualWasiat;

  if (netEstate < 0) netEstate = 0;

  const distribution: HeirShare[] = [];
  
  // Helper to add share
  const addShare = (type: string, count: number, num: number, den: number, note: string = '') => {
    if (count > 0) {
      distribution.push({
        type,
        count,
        shareFraction: `${num}/${den}`,
        sharePercentage: (num / den),
        amount: 0, // Calculated later
        note
      });
    }
  };

  const hasChildren = heirs.sons > 0 || heirs.daughters > 0;
  const hasMaleIssue = heirs.sons > 0;

  // --- 2. Determine Fixed Shares (Ashab al-Furud) ---

  // Spouse
  if (deceasedGender === Gender.MALE) {
    // Wife/Wives
    if (heirs.spouse > 0) {
      const den = hasChildren ? 8 : 4;
      addShare('Isteri', heirs.spouse, 1, den, hasChildren ? 'Ada anak (1/8)' : 'Tiada anak (1/4)');
    }
  } else {
    // Husband
    if (heirs.spouse > 0) {
      const den = hasChildren ? 4 : 2;
      addShare('Suami', 1, 1, den, hasChildren ? 'Ada anak (1/4)' : 'Tiada anak (1/2)');
    }
  }

  // Parents
  if (heirs.father) {
    if (hasMaleIssue) {
       addShare('Bapa', 1, 1, 6, 'Ada anak lelaki (1/6)');
    } else if (hasChildren) {
       // With daughter(s) only: 1/6 + Residue (handled later)
       addShare('Bapa', 1, 1, 6, 'Ada anak perempuan (1/6 + Asabah)');
    } else {
       // No children: Residue only (handled later, usually gets remainder)
       // Technically Father is Asabah here, but we might assign a placeholder or handle in residue step
       // For calculation structure, we treat him as Asabah primarily.
    }
  }

  if (heirs.mother) {
    // Mother gets 1/6 if there are children OR (strictly speaking) multiple siblings. 
    // Assuming simplified model without sibling input, we check children.
    const getSixth = hasChildren; 
    const den = getSixth ? 6 : 3;
    addShare('Ibu', 1, 1, den, getSixth ? 'Ada anak (1/6)' : 'Tiada anak (1/3)');
  }

  // Daughters (if no Sons) - Fixed Share
  if (heirs.daughters > 0 && !heirs.sons) {
    if (heirs.daughters === 1) {
      addShare('Anak Perempuan', 1, 1, 2, 'Tunggal (1/2)');
    } else {
      addShare('Anak Perempuan', heirs.daughters, 2, 3, 'Ramai (2/3)');
    }
  }

  // --- 3. Calculate Total Fixed Portions ---
  let totalFixedPortion = 0;
  distribution.forEach(d => {
    totalFixedPortion += d.sharePercentage;
  });

  // --- 4. Handle Asabah (Residue) ---
  let residue = 1 - totalFixedPortion;
  let isAul = false;

  // AUL Scenario: Total shares > 1
  if (residue < -0.0001) { // Floating point tolerance
    isAul = true;
    // In Aul, we normalize everyone's share.
    // Base denominator (common multiple) logic is complex to code generically without a library.
    // Simplified Aul: Normalize percentages to sum to 100%.
    const totalCurrent = totalFixedPortion;
    distribution.forEach(d => {
      d.sharePercentage = d.sharePercentage / totalCurrent;
      d.shareFraction = `${d.shareFraction} (Aul)`;
    });
    totalFixedPortion = 1;
    residue = 0;
  }

  // Distribute Residue
  if (residue > 0.0001) {
    // Priority for Residue:
    // 1. Son(s) + Daughter(s) (2:1 ratio)
    // 2. Father (if no male issue) - *Correction*: If Father exists and no children, he takes residue. If Father exists and only daughters, he takes 1/6 + residue.
    
    if (heirs.sons > 0) {
      // Asabah bil Ghayr (Sons and Daughters together)
      const malePortion = 2;
      const femalePortion = 1;
      const totalParts = (heirs.sons * malePortion) + (heirs.daughters * femalePortion);
      
      const sonShareTotal = (heirs.sons * malePortion) / totalParts * residue;
      const daughterShareTotal = (heirs.daughters * femalePortion) / totalParts * residue;

      if (heirs.sons > 0) {
        distribution.push({
            type: 'Anak Lelaki',
            count: heirs.sons,
            shareFraction: 'Baki (Asabah)',
            sharePercentage: sonShareTotal,
            amount: 0,
            note: 'Asabah (Nisbah 2:1)'
        });
      }
      if (heirs.daughters > 0) {
        distribution.push({
            type: 'Anak Perempuan',
            count: heirs.daughters,
            shareFraction: 'Baki (Asabah)',
            sharePercentage: daughterShareTotal,
            amount: 0,
            note: 'Asabah bersama Anak Lelaki'
        });
      }
      residue = 0;
    } else if (heirs.father && !hasMaleIssue) {
        // Father takes remaining residue
        // Check if Father is already in list (he might be there with 1/6 if there are daughters)
        const existingFather = distribution.find(d => d.type === 'Bapa');
        if (existingFather) {
            existingFather.sharePercentage += residue;
            existingFather.note += ' + Baki (Asabah)';
            existingFather.shareFraction += ' + Baki';
        } else {
            distribution.push({
                type: 'Bapa',
                count: 1,
                shareFraction: 'Baki (Asabah)',
                sharePercentage: residue,
                amount: 0,
                note: 'Asabah (Tiada Anak Lelaki)'
            });
        }
        residue = 0;
    }
  }

  // --- 5. Radd (Return) Scenario ---
  // If residue remains and there are no Asabah (no father, no sons), 
  // the residue returns to Ashab al-Furud (except Spouse usually, but dependent on Mazhab. In Malaysia (Shafi'i), usually Baitulmal takes residue if no Asabah, OR it is returned. 
  // For this simplified calculator, we will mark remaining residue as "Baitulmal / Unclaimed Residue" if no Asabah found.
  if (residue > 0.0001) {
      distribution.push({
          type: 'Baitulmal',
          count: 1,
          shareFraction: 'Baki',
          sharePercentage: residue,
          amount: 0,
          note: 'Tiada waris Asabah'
      });
  }

  // --- 6. Calculate Final Amounts ---
  distribution.forEach(d => {
    d.amount = d.sharePercentage * netEstate;
  });

  return {
    netEstate,
    distribution,
    totalShares: totalFixedPortion,
    residueAmount: residue * netEstate,
    isAul
  };
};
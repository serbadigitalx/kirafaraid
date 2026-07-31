import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  root: process.cwd(),
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true }
});

try {
  const { calculateFaraid } = await server.ssrLoadModule('/src/services/faraidEngine.ts');
  const { Gender } = await server.ssrLoadModule('/src/types.ts');

  const emptyHeirs = () => ({
    spouse: 0,
    sons: 0,
    daughters: 0,
    father: false,
    mother: false,
    paternalGrandfather: false,
    maternalGrandmother: false,
    paternalGrandmother: false,
    grandsons: 0,
    granddaughters: 0,
    greatGrandsons: 0,
    greatGranddaughters: 0,
    fullBrothers: 0,
    fullSisters: 0,
    paternalBrothers: 0,
    paternalSisters: 0,
    maternalBrothers: 0,
    maternalSisters: 0,
    fullNephews: 0,
    paternalNephews: 0,
    fullPaternalUncles: 0,
    paternalUncles: 0,
    fullCousins: 0,
    paternalCousins: 0
  });

  const assets = (grossAssets = 120_000) => ({
    grossAssets,
    funeralExpenses: 0,
    debts: 0,
    hartaSepencarian: 0,
    wasiat: 0
  });

  const calculate = (
    gender,
    heirOverrides,
    assetOverrides = {},
    caseFlags = { confirmedNoOtherHeirs: true }
  ) =>
    calculateFaraid(
      gender,
      { ...emptyHeirs(), ...heirOverrides },
      { ...assets(), ...assetOverrides },
      caseFlags
    );

  const share = (result, id) => {
    const found = result.distribution.find(item => item.id === id);
    assert.ok(found, `Expected a distribution row for ${id}`);
    return found;
  };

  const alternativeShare = (result, id) => {
    const found = result.alternativeRaddDistribution?.find(item => item.id === id);
    assert.ok(found, `Expected an alternative radd row for ${id}`);
    return found;
  };

  {
    const result = calculate(Gender.MALE, { spouse: 1, mother: true, father: true });
    assert.equal(share(result, 'spouse').shareFraction, '1/4');
    assert.equal(share(result, 'mother').shareFraction, '1/4');
    assert.equal(share(result, 'father').shareFraction, '1/2');
  }

  {
    const result = calculate(Gender.FEMALE, { spouse: 1, mother: true, father: true });
    assert.equal(share(result, 'spouse').shareFraction, '1/2');
    assert.equal(share(result, 'mother').shareFraction, '1/6');
    assert.equal(share(result, 'father').shareFraction, '1/3');
  }

  {
    const result = calculate(Gender.FEMALE, { spouse: 1, fullSisters: 2 });
    assert.equal(result.isAul, true);
    assert.equal(result.asalMasalah, 7);
    assert.equal(share(result, 'spouse').shareFraction, '3/7');
    assert.equal(share(result, 'fullSisters').shareFraction, '4/7');
  }

  {
    const result = calculate(Gender.MALE, { mother: true, daughters: 1 });
    assert.equal(share(result, 'mother').shareFraction, '1/6');
    assert.equal(share(result, 'daughters').shareFraction, '1/2');
    assert.equal(share(result, 'baitulmal').shareFraction, '1/3');
    assert.equal(alternativeShare(result, 'mother').shareFraction, '1/4');
    assert.equal(alternativeShare(result, 'daughters').shareFraction, '3/4');
  }

  {
    const result = calculate(Gender.MALE, { daughters: 1, fullSisters: 1 });
    assert.equal(share(result, 'daughters').shareFraction, '1/2');
    assert.equal(share(result, 'fullSisters').shareFraction, '1/2');
    assert.equal(share(result, 'fullSisters').status, 'asabah');
  }

  {
    const result = calculate(Gender.MALE, { sons: 1, grandsons: 2 });
    assert.equal(share(result, 'sons').shareFraction, '1/1');
    assert.equal(result.blockedHeirs.find(item => item.id === 'grandsons')?.count, 2);
  }

  {
    const result = calculate(Gender.MALE, { father: true, mother: true, fullSisters: 2 });
    assert.equal(share(result, 'mother').shareFraction, '1/6');
    assert.equal(share(result, 'father').shareFraction, '5/6');
    assert.equal(result.blockedHeirs.find(item => item.id === 'fullSisters')?.count, 2);
  }

  {
    const result = calculate(Gender.MALE, { daughters: 1, granddaughters: 2 });
    assert.equal(share(result, 'daughters').shareFraction, '1/2');
    assert.equal(share(result, 'granddaughters').shareFraction, '1/6');
  }

  {
    const result = calculate(Gender.MALE, { maternalBrothers: 1, maternalSisters: 1 });
    assert.equal(share(result, 'maternalBrothers').shareFraction, '1/6');
    assert.equal(share(result, 'maternalSisters').shareFraction, '1/6');
    assert.equal(share(result, 'maternalBrothers').amount, share(result, 'maternalSisters').amount);
  }

  {
    const result = calculate(Gender.MALE, { paternalGrandfather: true, fullSisters: 1 });
    assert.equal(result.requiresExpertReview, true);
    assert.equal(result.distribution.length, 0);
  }

  {
    const result = calculate(Gender.FEMALE, {
      spouse: 1,
      mother: true,
      maternalSisters: 2,
      fullBrothers: 1
    });
    assert.equal(result.requiresExpertReview, true);
    assert.equal(result.distribution.length, 0);
  }

  {
    const result = calculate(
      Gender.MALE,
      { sons: 1 },
      { grossAssets: 90_000, debts: 30_000, wasiat: 50_000 }
    );
    assert.equal(result.netEstate, 40_000);
    assert.ok(result.warnings.some(item => item.includes('1/3')));
  }

  {
    const result = calculate(Gender.MALE, { spouse: 1, fullNephews: 1 });
    assert.equal(share(result, 'spouse').shareFraction, '1/4');
    assert.equal(share(result, 'fullNephews').shareFraction, '3/4');
    assert.equal(result.distribution.some(item => item.id === 'baitulmal'), false);
  }

  {
    const result = calculate(Gender.MALE, { fullNephews: 1, paternalNephews: 2, fullPaternalUncles: 1 });
    assert.equal(share(result, 'fullNephews').shareFraction, '1/1');
    assert.equal(result.blockedHeirs.find(item => item.id === 'paternalNephews')?.count, 2);
    assert.equal(result.blockedHeirs.find(item => item.id === 'fullPaternalUncles')?.count, 1);
  }

  {
    const result = calculate(Gender.MALE, { spouse: 1, greatGrandsons: 1 });
    assert.equal(share(result, 'spouse').shareFraction, '1/8');
    assert.equal(share(result, 'greatGrandsons').shareFraction, '7/8');
  }

  {
    const result = calculate(Gender.MALE, { mother: true, daughters: 1 }, {}, {});
    assert.equal(result.requiresExpertReview, true);
    assert.equal(result.distribution.length, 0);
    assert.ok(result.warnings.some(item => item.includes('Baitulmal')));
  }

  {
    const result = calculate(Gender.MALE, {}, {}, { confirmedNoOtherHeirs: true });
    assert.equal(result.requiresExpertReview, false);
    assert.equal(share(result, 'baitulmal').shareFraction, '1/1');
  }

  {
    const result = calculate(
      Gender.MALE,
      { sons: 1 },
      {},
      { confirmedNoOtherHeirs: true, unbornHeir: true }
    );
    assert.equal(result.requiresExpertReview, true);
    assert.equal(result.distribution.length, 0);
    assert.ok(result.warnings.some(item => item.includes('belum lahir')));
  }

  {
    const result = calculate(Gender.MALE, { maternalGrandmother: true, paternalGrandmother: true });
    assert.equal(share(result, 'maternalGrandmother').shareFraction, '1/12');
    assert.equal(share(result, 'paternalGrandmother').shareFraction, '1/12');
  }

  {
    const result = calculate(Gender.MALE, { father: true, paternalGrandmother: true });
    assert.equal(share(result, 'father').shareFraction, '1/1');
    assert.equal(result.blockedHeirs.find(item => item.id === 'paternalGrandmother')?.count, 1);
  }

  {
    const result = calculate(Gender.MALE, { grandsons: 1, granddaughters: 1 });
    assert.equal(share(result, 'grandsons').shareFraction, '2/3');
    assert.equal(share(result, 'granddaughters').shareFraction, '1/3');
  }

  {
    const result = calculate(Gender.MALE, { greatGranddaughters: 1 });
    assert.equal(share(result, 'greatGranddaughters').shareFraction, '1/2');
  }

  {
    const result = calculate(Gender.MALE, { daughters: 1, greatGranddaughters: 1 });
    assert.equal(share(result, 'daughters').shareFraction, '1/2');
    assert.equal(share(result, 'greatGranddaughters').shareFraction, '1/6');
  }

  {
    const result = calculate(Gender.MALE, { fullBrothers: 1, fullSisters: 1 });
    assert.equal(share(result, 'fullBrothers').shareFraction, '2/3');
    assert.equal(share(result, 'fullSisters').shareFraction, '1/3');
  }

  {
    const result = calculate(Gender.MALE, { paternalBrothers: 1, paternalSisters: 1 });
    assert.equal(share(result, 'paternalBrothers').shareFraction, '2/3');
    assert.equal(share(result, 'paternalSisters').shareFraction, '1/3');
  }

  {
    const result = calculate(Gender.MALE, { paternalSisters: 1 });
    assert.equal(share(result, 'paternalSisters').shareFraction, '1/2');
  }

  {
    const result = calculate(Gender.MALE, { fullSisters: 1, paternalSisters: 1 });
    assert.equal(share(result, 'fullSisters').shareFraction, '1/2');
    assert.equal(share(result, 'paternalSisters').shareFraction, '1/6');
  }

  {
    const result = calculate(Gender.MALE, { daughters: 1, maternalBrothers: 1 });
    assert.equal(result.blockedHeirs.find(item => item.id === 'maternalBrothers')?.count, 1);
    assert.equal(result.distribution.some(item => item.id === 'maternalBrothers'), false);
  }

  for (const id of [
    'paternalNephews',
    'fullPaternalUncles',
    'paternalUncles',
    'fullCousins',
    'paternalCousins'
  ]) {
    const result = calculate(Gender.MALE, { [id]: 2 });
    assert.equal(share(result, id).shareFraction, '1/1');
    assert.equal(share(result, id).count, 2);
  }

  let seed = 20260731;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randomCount = (maximum = 3) => Math.floor(random() * (maximum + 1));

  for (let index = 0; index < 500; index += 1) {
    const gender = random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const result = calculate(gender, {
      spouse: randomCount(gender === Gender.MALE ? 4 : 1),
      sons: randomCount(),
      daughters: randomCount(),
      father: random() > 0.5,
      mother: random() > 0.5,
      paternalGrandfather: random() > 0.5,
      maternalGrandmother: random() > 0.5,
      paternalGrandmother: random() > 0.5,
      grandsons: randomCount(),
      granddaughters: randomCount(),
      greatGrandsons: randomCount(),
      greatGranddaughters: randomCount(),
      fullBrothers: randomCount(),
      fullSisters: randomCount(),
      paternalBrothers: randomCount(),
      paternalSisters: randomCount(),
      maternalBrothers: randomCount(),
      maternalSisters: randomCount(),
      fullNephews: randomCount(),
      paternalNephews: randomCount(),
      fullPaternalUncles: randomCount(),
      paternalUncles: randomCount(),
      fullCousins: randomCount(),
      paternalCousins: randomCount()
    });

    if (result.requiresExpertReview) {
      assert.equal(result.distribution.length, 0, `Review case ${index} must not expose numerical shares`);
      assert.equal(result.totalShares, 0, `Review case ${index} must not expose a numerical total`);
      continue;
    }

    const distributedAmount = result.distribution.reduce((total, item) => total + item.amount, 0);
    assert.ok(Math.abs(distributedAmount - result.netEstate) < 0.001, `Case ${index} must distribute the complete estate`);
    assert.ok(Math.abs(result.totalShares - 1) < 1e-10, `Case ${index} shares must total one`);
    assert.ok(result.distribution.every(item => item.share.numerator >= 0 && item.share.denominator > 0));
    assert.equal(new Set(result.distribution.map(item => item.id)).size, result.distribution.length);
  }

  console.log('Faraid V2.1: 33 golden scenarios and 500 invariant cases passed.');
} finally {
  await server.close();
}

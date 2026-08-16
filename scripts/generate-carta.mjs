// Generates the "Carta Pembahagian Faraid" reference images.
//
// These exist to be indexed by Google Images: `carta pembahagian faraid` and its
// scenario variants show an image pack at the top of the SERP, and the site had
// no <img> anywhere, so it could not appear in one.
//
// Form: the data is 13 heir rows each carrying a *condition*, which cannot be
// encoded positionally — so this is a reference table, not a chart. Each row
// carries a meter showing the share as a ratio of the whole estate. That is a
// magnitude job, so the meter is sequential single-hue; there is no categorical
// palette here and no color-coded series.
//
// Shares are taken from the table already published on /jadual-pembahagian-faraid/
// so the image and the page can never disagree.
//
// Usage: node scripts/generate-carta.mjs

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/carta';

// Site tokens (src/styles/global.css)
const C = {
  ink: '#1C1917',        // warm-900
  inkSoft: '#57534E',    // warm-700
  inkMuted: '#78716C',   // warm-600
  rule: '#E8E2D9',       // warm-200
  surface: '#FAF8F5',    // warm-50
  card: '#FFFFFF',
  teal: '#0D4F4F',       // teal-800
  meterFill: '#1A7A7A',  // teal-600
  meterTrack: '#D9F2F2', // teal-100
  gold: '#C8A951',       // gold-500
};

// --- contrast + lightness assertions (the checks that apply to this form) ---
const srgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = srgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const checks = [
  ['body text on card', C.ink, C.card, 4.5],
  ['secondary text on card', C.inkSoft, C.card, 4.5],
  ['muted text on surface', C.inkMuted, C.surface, 4.5],
  ['section head on surface', C.teal, C.surface, 4.5],
  ['meter fill vs track', C.meterFill, C.meterTrack, 3],
  ['meter fill vs card', C.meterFill, C.card, 3],
];
let failed = 0;
for (const [name, fg, bg, min] of checks) {
  const r = contrast(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(26)} ${r.toFixed(2)}:1 (min ${min})`);
}
// Sequential ramp must be monotonic in lightness: track lighter than fill.
const mono = lum(C.meterTrack) > lum(C.meterFill);
console.log(`  ${mono ? 'PASS' : 'FAIL'}  ${'sequential monotonicity'.padEnd(26)} track lighter than fill`);
if (!mono) failed++;
if (failed) {
  console.error(`\n${failed} check(s) failed — fix tokens before shipping.`);
  process.exit(1);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FONT = "'Plus Jakarta Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

// rows: [waris, bahagian, ratio | null for residue, syarat]
const MASTER = {
  slug: 'carta-pembahagian-faraid',
  title: 'Carta Pembahagian Faraid',
  subtitle: "Kadar bahagian waris mengikut Mazhab Syafi'i di Malaysia",
  sections: [
    ['Pasangan', [
      ['Suami', '1/2', 1 / 2, 'Si mati tiada anak'],
      ['Suami', '1/4', 1 / 4, 'Si mati ada anak'],
      ['Isteri', '1/4', 1 / 4, 'Si mati tiada anak'],
      ['Isteri', '1/8', 1 / 8, 'Ada anak (dikongsi jika >1 isteri)'],
    ]],
    ['Ibu Bapa', [
      ['Bapa', '1/6', 1 / 6, 'Ada anak / cucu lelaki'],
      ['Bapa', '1/6 + Baki', null, 'Ada anak perempuan sahaja'],
      ['Bapa', 'Baki (Asabah)', null, 'Tiada anak'],
      ['Ibu', '1/6', 1 / 6, 'Ada anak / 2+ adik-beradik'],
      ['Ibu', '1/3', 1 / 3, 'Tiada anak & kurang 2 adik-beradik'],
    ]],
    ['Anak-anak', [
      ['Anak Perempuan (1)', '1/2', 1 / 2, 'Tiada anak lelaki'],
      ['Anak Perempuan (2+)', '2/3', 2 / 3, 'Tiada anak lelaki'],
      ['Anak Lelaki', 'Baki (Asabah)', null, 'Mengambil semua baki'],
      ['Anak Lelaki + Perempuan', 'Baki (2:1)', null, 'Lelaki 2x perempuan'],
    ]],
  ],
};

const SUAMI = {
  slug: 'carta-pembahagian-faraid-suami-meninggal',
  title: 'Carta Pembahagian Faraid: Suami Meninggal',
  subtitle: 'Bahagian waris apabila si mati seorang suami',
  sections: [
    ['Isteri', [
      ['Isteri', '1/4', 1 / 4, 'Tiada anak / cucu'],
      ['Isteri', '1/8', 1 / 8, 'Ada anak / cucu (dikongsi)'],
    ]],
    ['Ibu Bapa Si Mati', [
      ['Ibu', '1/6', 1 / 6, 'Ada anak / 2+ adik-beradik'],
      ['Ibu', '1/3', 1 / 3, 'Tiada anak & kurang 2 adik-beradik'],
      ['Bapa', '1/6', 1 / 6, 'Ada anak lelaki'],
      ['Bapa', 'Baki (Asabah)', null, 'Tiada anak'],
    ]],
    ['Anak-anak', [
      ['Anak Perempuan (1)', '1/2', 1 / 2, 'Tiada anak lelaki'],
      ['Anak Perempuan (2+)', '2/3', 2 / 3, 'Tiada anak lelaki'],
      ['Anak Lelaki', 'Baki (Asabah)', null, 'Mengambil semua baki'],
      ['Anak Lelaki + Perempuan', 'Baki (2:1)', null, 'Lelaki 2x perempuan'],
    ]],
  ],
};

const ISTERI = {
  slug: 'carta-pembahagian-faraid-isteri-meninggal',
  title: 'Carta Pembahagian Faraid: Isteri Meninggal',
  subtitle: 'Bahagian waris apabila si mati seorang isteri',
  sections: [
    ['Suami', [
      ['Suami', '1/2', 1 / 2, 'Tiada anak / cucu'],
      ['Suami', '1/4', 1 / 4, 'Ada anak / cucu'],
    ]],
    ['Ibu Bapa Si Mati', [
      ['Ibu', '1/6', 1 / 6, 'Ada anak / 2+ adik-beradik'],
      ['Ibu', '1/3', 1 / 3, 'Tiada anak & kurang 2 adik-beradik'],
      ['Bapa', '1/6', 1 / 6, 'Ada anak lelaki'],
      ['Bapa', 'Baki (Asabah)', null, 'Tiada anak'],
    ]],
    ['Anak-anak', [
      ['Anak Perempuan (1)', '1/2', 1 / 2, 'Tiada anak lelaki'],
      ['Anak Perempuan (2+)', '2/3', 2 / 3, 'Tiada anak lelaki'],
      ['Anak Lelaki', 'Baki (Asabah)', null, 'Mengambil semua baki'],
      ['Anak Lelaki + Perempuan', 'Baki (2:1)', null, 'Lelaki 2x perempuan'],
    ]],
  ],
};

const W = 1200;
const M = 56;             // page margin
const ROW_H = 74;
const SEC_H = 58;
const HEAD_TOP = 196;     // below title block
const COL_HEAD_H = 46;

// columns
const X_WARIS = M + 24;
const X_SHARE = 400;
// "Baki (Asabah)" is the widest BAHAGIAN label; the meter starts far enough
// right that it clears without shrinking the type.
const METER_X = 620;
const METER_W = 190;
const X_SYARAT = 852;

function build(spec) {
  const rowCount = spec.sections.reduce((n, [, r]) => n + r.length, 0);
  const bodyH = spec.sections.length * SEC_H + rowCount * ROW_H;
  const H = HEAD_TOP + COL_HEAD_H + bodyH + 108;

  const p = [];
  p.push(`<rect width="${W}" height="${H}" fill="${C.surface}"/>`);

  // --- title block ---
  p.push(`<rect x="0" y="0" width="${W}" height="${HEAD_TOP - 28}" fill="${C.teal}"/>`);
  p.push(`<rect x="0" y="${HEAD_TOP - 28}" width="${W}" height="5" fill="${C.gold}"/>`);
  p.push(
    `<text x="${M}" y="86" font-family="${FONT}" font-size="46" font-weight="700" fill="#FFFFFF">${esc(spec.title)}</text>`
  );
  p.push(
    `<text x="${M}" y="128" font-family="${FONT}" font-size="22" fill="#B0E2E2">${esc(spec.subtitle)}</text>`
  );

  // --- column headers ---
  let y = HEAD_TOP + 10;
  const H_ = (x, t) =>
    `<text x="${x}" y="${y + 26}" font-family="${FONT}" font-size="15" font-weight="700" fill="${C.inkMuted}" letter-spacing="1.4">${esc(t)}</text>`;
  p.push(H_(X_WARIS, 'WARIS'), H_(X_SHARE, 'BAHAGIAN'), H_(METER_X, 'KADAR'), H_(X_SYARAT, 'SYARAT'));
  y += COL_HEAD_H;
  p.push(`<rect x="${M}" y="${y}" width="${W - M * 2}" height="2" fill="${C.rule}"/>`);

  // --- sections + rows ---
  for (const [name, rows] of spec.sections) {
    p.push(
      `<text x="${X_WARIS}" y="${y + 40}" font-family="${FONT}" font-size="21" font-weight="700" fill="${C.teal}">${esc(name)}</text>`
    );
    y += SEC_H;

    for (const [waris, bahagian, ratio, syarat] of rows) {
      p.push(
        `<rect x="${M}" y="${y}" width="${W - M * 2}" height="${ROW_H - 8}" rx="10" fill="${C.card}"/>`
      );
      const ty = y + (ROW_H - 8) / 2 + 8;

      p.push(
        `<text x="${X_WARIS}" y="${ty}" font-family="${FONT}" font-size="22" font-weight="600" fill="${C.ink}">${esc(waris)}</text>`
      );
      p.push(
        `<text x="${X_SHARE}" y="${ty}" font-family="${FONT}" font-size="24" font-weight="700" fill="${C.ink}">${esc(bahagian)}</text>`
      );

      // meter — length encodes the share of the whole estate
      const my = y + (ROW_H - 8) / 2 - 7;
      p.push(
        `<rect x="${METER_X}" y="${my}" width="${METER_W}" height="14" rx="7" fill="${C.meterTrack}"/>`
      );
      if (ratio != null) {
        p.push(
          `<rect x="${METER_X}" y="${my}" width="${Math.max(14, METER_W * ratio).toFixed(1)}" height="14" rx="7" fill="${C.meterFill}"/>`
        );
      } else {
        // Residue has no fixed magnitude — never fake a bar length for it.
        // Dashed outline reads as "whatever remains", not as zero.
        p.push(
          `<rect x="${METER_X}" y="${my}" width="${METER_W}" height="14" rx="7" fill="${C.meterTrack}" stroke="${C.meterFill}" stroke-width="2" stroke-dasharray="5 4"/>`
        );
      }

      p.push(
        `<text x="${X_SYARAT}" y="${ty}" font-family="${FONT}" font-size="18" fill="${C.inkSoft}">${esc(syarat)}</text>`
      );
      y += ROW_H;
    }
  }

  // --- footer ---
  p.push(`<rect x="${M}" y="${y + 8}" width="${W - M * 2}" height="2" fill="${C.rule}"/>`);
  p.push(
    `<text x="${M}" y="${y + 52}" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.teal}">kirafaraid.my</text>`
  );
  p.push(
    `<text x="${W - M}" y="${y + 52}" text-anchor="end" font-family="${FONT}" font-size="16" fill="${C.inkMuted}">Anggaran pendidikan · rujuk Peguam Syarie untuk pengesahan</text>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p.join('')}</svg>`;
}

mkdirSync(OUT, { recursive: true });

for (const spec of [MASTER, SUAMI, ISTERI]) {
  const svg = build(spec);
  const buf = Buffer.from(svg);
  // The SVG is an intermediate only — it is not written to public/, so the
  // served asset is unambiguously the PNG that Google Images indexes.
  // Flat-colour graphic: a quantised palette PNG beats lossy WebP on both size
  // and fidelity here, so PNG is the only raster we ship.
  const info = await sharp(buf, { density: 144 })
    .png({ palette: true, quality: 90, effort: 9 })
    .toFile(`${OUT}/${spec.slug}.png`);
  console.log(
    `  wrote ${spec.slug}.png  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`
  );
}

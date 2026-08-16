// Centralized SEO / schema helpers for KiraFaraid.
// Keeps Article JSON-LD complete and consistent across all content pages.

export const SITE = {
  name: 'KiraFaraid',
  url: 'https://www.kirafaraid.my',
  logo: 'https://www.kirafaraid.my/og-image.png',
  tagline: 'Kalkulator Warisan Islam Malaysia',
} as const;

// Date the content was last reviewed / modified (dateModified + "Dikemas kini").
export const REVIEWED_DATE = '2026-07-22';

// Named Syariah reviewer, shown in the byline and Article schema `reviewedBy`.
// Leave EMPTY to omit — no placeholder/fabricated name is ever published.
// Set to e.g. 'Ahmad bin Ali, Peguam Syarie' to activate.
export const REVIEWER = '';

// Stable node identifiers. Every schema below is declared ONCE and referenced
// everywhere else by @id — without these the site emitted four unlinked
// Organization nodes per page, which a parser reads as four separate
// organizations rather than one entity referenced four times.
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const CALCULATOR_ID = `${SITE.url}/#calculator`;

/** Reference to the one Organization node, for `publisher` / `author` slots. */
export const PUBLISHER = { '@id': ORG_ID };
export const AUTHOR = { '@id': ORG_ID };

// Site-wide entity schemas injected on every page via SEOHead.
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: SITE.logo,
  },
  description: 'Kalkulator dan panduan Faraid (pembahagian harta pusaka Islam) mengikut Mazhab Syafi\'i di Malaysia.',
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE.name,
  url: SITE.url,
  inLanguage: 'ms',
  publisher: PUBLISHER,
};

// The calculator itself, as a distinct entity from the pages that host it.
// Emitted on every page that embeds the tool; because each carries the same
// @id, they resolve to one entity rather than a dozen competing ones.
export const CALCULATOR_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': CALCULATOR_ID,
  name: 'Kalkulator Faraid KiraFaraid',
  url: SITE.url,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Memerlukan JavaScript',
  inLanguage: 'ms',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'MYR',
  },
  description: 'Kalkulator pendidikan Faraid berasaskan kaedah Mazhab Syafi\'i. Anggarkan pembahagian bagi kes yang disokong dan kenal pasti kes yang memerlukan semakan pakar.',
  featureList: [
    'Pengiraan bahagian pasangan, ibu bapa dan anak-anak',
    'Tolakan harta sepencarian sebelum pembahagian',
    'Wasiat dihadkan kepada 1/3 harta bersih',
    'Pelarasan Aul apabila jumlah pecahan melebihi satu',
  ],
  publisher: PUBLISHER,
};

interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  image?: string;
  /** Set on pages that embed the calculator, so the article points at the tool. */
  hasCalculator?: boolean;
}

export function buildArticle({
  headline,
  description,
  path,
  datePublished,
  image,
  hasCalculator = false,
}: ArticleInput) {
  const article: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE.url}${path}#article`,
    headline,
    description,
    inLanguage: 'ms',
    author: AUTHOR,
    publisher: PUBLISHER,
    isPartOf: { '@id': WEBSITE_ID },
    datePublished,
    dateModified: REVIEWED_DATE,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE.url + path,
    },
    image: image || SITE.logo,
  };
  if (hasCalculator) {
    article.mentions = { '@id': CALCULATOR_ID };
  }
  if (REVIEWER) {
    article.reviewedBy = { '@type': 'Person', name: REVIEWER };
  }
  return article;
}

const MS_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
];

// Format an ISO date (YYYY-MM-DD) to Malay display, e.g. "22 Julai 2026".
export function formatDateMs(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MS_MONTHS[m - 1]} ${y}`;
}

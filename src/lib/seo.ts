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

export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: SITE.logo,
  },
};

export const AUTHOR = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
};

// Site-wide entity schemas injected on every page via SEOHead.
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: SITE.logo,
  description: 'Kalkulator dan panduan Faraid (pembahagian harta pusaka Islam) mengikut Mazhab Syafi\'i di Malaysia.',
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  inLanguage: 'ms',
  publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
};

interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  image?: string;
}

export function buildArticle({ headline, description, path, datePublished, image }: ArticleInput) {
  const article: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    inLanguage: 'ms',
    author: AUTHOR,
    publisher: PUBLISHER,
    datePublished,
    dateModified: REVIEWED_DATE,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE.url + path,
    },
    image: image || SITE.logo,
  };
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

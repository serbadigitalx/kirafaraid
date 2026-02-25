# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KiraFaraid is a Malaysian Islamic inheritance (Faraid) calculator web app. It calculates estate distribution according to Shafi'i school of Islamic law as practiced in Malaysia. The UI is entirely in Bahasa Malaysia.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server
- `npm run build` — typecheck with `tsc` then build with Vite
- `npm run preview` — preview production build

## Architecture

Single-page React + TypeScript app built with Vite. No router — navigation is managed via `currentView` state in `App.tsx` with a switch/case renderer.

### Key layers

- **`types.ts`** — Core domain types: `Gender`, `HeirsCount`, `AssetDetails`, `HeirShare`, `CalculationResult`
- **`services/faraidEngine.ts`** — Pure calculation engine. Implements Faraid rules: fixed shares (Ashab al-Furud), Asabah residue distribution, Aul (normalization when shares exceed 1), and Baitulmal fallback. Currently covers primary heirs only (spouse, parents, children — no grandparents/siblings).
- **`components/`** — React UI components (InputForm, ResultsView, DistributionChart with Recharts, FaraidGuide, Header, LegalPages).

### Layout pattern

`App.tsx` has two layout states: centered single-column form (before calculation), and a 5/7 grid split (input left, results right) after calculation. Mobile stacks vertically.

## Tech Stack

- React 18, TypeScript (strict mode), Vite, Tailwind CSS (via CDN in index.html)
- `recharts` for charts, `lucide-react` for icons
- Font: Plus Jakarta Sans (loaded via Google Fonts CDN)

## Domain Notes

- **Harta Sepencarian** — Malaysian matrimonial property claim, deducted before Faraid distribution
- **Wasiat** — Bequest, capped at 1/3 of net estate
- **Aul** — When total fixed shares exceed 1, all shares are proportionally reduced
- **Asabah** — Residuary heirs (sons get residue; father gets residue if no sons)
- Spouse share depends on deceased's gender: wife gets 1/8 or 1/4; husband gets 1/4 or 1/2 (based on whether children exist)
- Sons and daughters inherit residue together at 2:1 ratio

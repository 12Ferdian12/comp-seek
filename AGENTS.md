# Instructions for AI Coding Agent

Build a personal competition tracker website using Next.js (App Router), Tailwind CSS, and Lucide React.
Data source is a public Google Spreadsheet via CSV export.

## 1. Tech Stack & Architecture

- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Styling:** Tailwind CSS (configured for dark-architectural aesthetic).
- **Icons:** `lucide-react`.
- **CSV Parser:** `papaparse` (or zero-dep lightweight RFC 4180 CSV parser).
- **State Management:** React `useState` + `useMemo` for client-side filtering/search.

## 2. Core File Structure

├── app/
│ ├── api/
│ │ └── revalidate/route.ts # On-demand ISR trigger
│ ├── layout.tsx # Root layout with dark background
│ └── page.tsx # Server component fetching Google Sheet CSV
├── components/
│ ├── CompetitionDashboard.tsx # Client container (Search, Filter, Grid)
│ ├── CompetitionCard.tsx # Architectural style competition card
│ ├── CompetitionModal.tsx # Detail modal view
│ ├── DeadlineCountdown.tsx # Days-left badge
│ └── StatSummary.tsx # Top stats counter
├── lib/
│ ├── sheet.ts # Fetch + parse Google Sheet CSV
│ └── types.ts # TypeScript interface for competition
└── tailwind.config.ts # Custom colors (#040506, #A4FF01)

## 3. Data Ingestion Spec (`lib/sheet.ts`)

- Target URL:
  `https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/export?format=csv&gid=2117962469`
- Fetch inside Next.js with:
  `fetch(CSV_URL, { next: { revalidate: 3600, tags: ['sheet-data'] } })`
- Mapping: Strip extra spaces, normalize status (`Open`, `Upcoming`, `Closed`), parse ISO dates or fallbacks.
- Filter out empty rows (where `Competition Name` is missing).

## 4. UI/UX Rules (Architecture Aesthetic)

- Main canvas background: `#040506`.
- Accent color `#A4FF01`: Use sparingly for badges, active states, CTA hover, key deadline alert.
- Card styling:
  - Background `bg-[#0B0F14]`, border `border border-white/10 hover:border-[#A4FF01]/60 transition-colors`.
  - Geometric, high-contrast, no generic rounded fluffy SaaS styling.
  - Monospace dates (`font-mono text-xs uppercase`).
- Modal/Drawer:
  - Clean layout showing `Submission Requirements`, `Location / Format`, `Prize / Awards`, and links (`Official Website`, `Registration Link`).

## 5. Implementation Priority

1. `lib/types.ts` & `lib/sheet.ts`: Get CSV parser and data mapper working reliably first.
2. `app/page.tsx`: Fetch and verify data loads server-side.
3. `components/CompetitionDashboard.tsx`: Add search, field tabs (All, Elektro, Informatika), status filters.
4. `components/CompetitionCard.tsx`: Build card with status pill, deadline countdown, and fields.
5. `components/CompetitionModal.tsx`: Complete detail viewer.
6. Responsive check: 1 column mobile, 2-3 columns desktop.
